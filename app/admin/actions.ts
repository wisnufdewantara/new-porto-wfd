"use server";

import { randomUUID } from "node:crypto";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  getSession,
  createSession,
  destroySession,
  verifyPassword,
  authConfigured,
} from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { MAX_ITEMS } from "@/lib/schema";
import type { LayoutContent, LayoutKind, Localized, MenuContent } from "@/lib/schema";
import { emptyContent, convertContent } from "@/lib/content";
import { sanitizeContent } from "@/lib/sanitize";
import * as V from "@/lib/validate";

const SLUG = "wisnu";
const BUCKET = "public-images";

function refresh() {
  revalidatePath("/");
  revalidatePath("/admin");
}

/** Semua kegagalan validasi mendarat sebagai notice di panel, bukan crash. */
function fail(code: string): never {
  redirect(`/admin?err=${encodeURIComponent(code)}`);
}

async function requireAuth() {
  const s = await getSession();
  if (!s) redirect("/admin/login");
}

function db() {
  if (!supabaseAdmin) fail("config");
  return supabaseAdmin;
}

async function siteId(): Promise<string> {
  const { data } = await db().from("sites").select("id").eq("slug", SLUG).single();
  if (!data) fail("site-missing");
  return data.id as string;
}

function localizedFrom(fd: FormData, prefix: string): Localized {
  return {
    id: String(fd.get(`${prefix}_id`) ?? ""),
    en: String(fd.get(`${prefix}_en`) ?? ""),
  };
}

// ---- Auth ----
export async function login(formData: FormData) {
  const pw = String(formData.get("password") || "");
  if (!supabaseAdmin || !authConfigured()) redirect("/admin/login?error=config");
  const { data: site } = await supabaseAdmin
    .from("sites")
    .select("password_hash")
    .eq("slug", SLUG)
    .single();
  if (!site || site.password_hash === "PENDING" || !verifyPassword(pw, site.password_hash)) {
    redirect("/admin/login?error=1");
  }
  await createSession(SLUG);
  redirect("/admin");
}

export async function logout() {
  await destroySession();
  redirect("/admin/login");
}

// ---- Pengaturan situs ----
export async function updateSite(formData: FormData) {
  await requireAuth();
  const parsed = V.siteForm.safeParse({
    name: String(formData.get("name") ?? ""),
    role: localizedFrom(formData, "role"),
    hint: localizedFrom(formData, "hint"),
    theme: String(formData.get("theme") ?? ""),
    default_lang: String(formData.get("default_lang") ?? ""),
    accent: String(formData.get("accent") ?? ""),
    center_image: String(formData.get("center_image") ?? ""),
  });
  if (!parsed.success) fail("site");

  await db().from("sites").update({ ...parsed.data, updated_at: new Date().toISOString() }).eq("slug", SLUG);
  refresh();
}

// ---- Item ----
export async function addItem() {
  await requireAuth();
  const id = await siteId();
  const { count } = await db()
    .from("items")
    .select("*", { count: "exact", head: true })
    .eq("site_id", id);
  if ((count ?? 0) >= MAX_ITEMS) fail("max-items");

  await db().from("items").insert({
    site_id: id,
    position: (count ?? 0) + 1,
    kind: "icon",
    icon_name: "star",
    label: { id: "Baru", en: "New" },
    layout: "blank",
    content: emptyContent("blank", { id: "Judul", en: "Title" }),
  });
  refresh();
}

export async function updateItem(formData: FormData) {
  await requireAuth();
  const id = V.uuid.safeParse(String(formData.get("id") ?? ""));
  if (!id.success) fail("item");

  const parsed = V.itemForm.safeParse({
    kind: String(formData.get("kind") ?? ""),
    icon_name: String(formData.get("icon_name") ?? ""),
    image_url: String(formData.get("image_url") ?? ""),
    label: localizedFrom(formData, "label"),
  });
  if (!parsed.success) fail("item");

  await db()
    .from("items")
    .update({
      kind: parsed.data.kind,
      icon_name: parsed.data.icon_name || null,
      image_url: parsed.data.image_url || null,
      label: parsed.data.label,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id.data);
  refresh();
}

export async function deleteItem(formData: FormData) {
  await requireAuth();
  const id = V.uuid.safeParse(String(formData.get("id") ?? ""));
  if (!id.success) fail("item");
  await db().from("items").delete().eq("id", id.data);
  refresh();
}

export async function moveItem(formData: FormData) {
  await requireAuth();
  const id = V.uuid.safeParse(String(formData.get("id") ?? ""));
  const dir = String(formData.get("dir") ?? "");
  if (!id.success || (dir !== "up" && dir !== "down")) fail("item");

  const { data: items } = await db()
    .from("items")
    .select("id, position")
    .eq("site_id", await siteId())
    .order("position", { ascending: true });
  if (!items) return;

  const idx = items.findIndex((i) => i.id === id.data);
  const swap = dir === "up" ? idx - 1 : idx + 1;
  if (idx < 0 || swap < 0 || swap >= items.length) return;
  const a = items[idx];
  const b = items[swap];
  await db().from("items").update({ position: b.position }).eq("id", a.id);
  await db().from("items").update({ position: a.position }).eq("id", b.id);
  refresh();
}

// ---- Konten popup (about = foto tengah, atau satu item) ----
async function readContent(target: string): Promise<LayoutContent> {
  if (target === "about") {
    const { data } = await db().from("sites").select("about").eq("slug", SLUG).single();
    if (!data) fail("site-missing");
    return data.about as LayoutContent;
  }
  const { data } = await db().from("items").select("content").eq("id", target).single();
  if (!data) fail("item");
  return data.content as LayoutContent;
}

async function writeContent(target: string, content: LayoutContent) {
  const parsed = V.layoutContent.safeParse(content);
  if (!parsed.success) fail("content");
  const clean = await sanitizeContent(parsed.data as LayoutContent);
  const now = new Date().toISOString();

  if (target === "about") {
    await db().from("sites").update({ about: clean, updated_at: now }).eq("slug", SLUG);
  } else {
    await db()
      .from("items")
      .update({ content: clean, layout: clean.kind, updated_at: now })
      .eq("id", target);
  }
  refresh();
}

function requireTarget(formData: FormData): string {
  const t = V.contentTarget.safeParse(String(formData.get("target") ?? ""));
  if (!t.success) fail("content");
  return t.data;
}

/** Ganti layout popup; isi yang masih cocok dibawa. */
export async function setLayout(formData: FormData) {
  await requireAuth();
  const target = requireTarget(formData);
  const kind = V.layoutKind.safeParse(String(formData.get("layout") ?? ""));
  if (!kind.success) fail("content");

  const prev = await readContent(target);
  await writeContent(target, convertContent(prev, kind.data as LayoutKind));
}

/** Simpan isi popup untuk layout blank / photo / html, dan judul+header menu. */
export async function updateContent(formData: FormData) {
  await requireAuth();
  const target = requireTarget(formData);
  const prev = await readContent(target);
  const title = localizedFrom(formData, "title");

  let next: LayoutContent;
  switch (prev.kind) {
    case "blank":
      next = { kind: "blank", title, body: localizedFrom(formData, "body") };
      break;
    case "photo":
      next = {
        kind: "photo",
        title,
        image: String(formData.get("image") ?? ""),
        body: localizedFrom(formData, "body"),
      };
      break;
    case "html":
      next = { kind: "html", title, html: localizedFrom(formData, "html") };
      break;
    case "menu":
      next = {
        ...prev,
        title,
        headerImage: String(formData.get("headerImage") ?? ""),
      };
      break;
  }
  await writeContent(target, next);
}

// ---- Menu: grup & entri ----
async function mutateMenu(target: string, fn: (menu: MenuContent) => void) {
  const prev = await readContent(target);
  if (prev.kind !== "menu") fail("content");
  const menu: MenuContent = JSON.parse(JSON.stringify(prev));
  fn(menu);
  await writeContent(target, menu);
}

function indexFrom(formData: FormData, key: string): number {
  const n = Number(formData.get(key));
  if (!Number.isInteger(n) || n < 0) fail("content");
  return n;
}

export async function addMenuGroup(formData: FormData) {
  await requireAuth();
  const target = requireTarget(formData);
  await mutateMenu(target, (m) => {
    m.groups.push({ name: { id: "Grup baru", en: "New group" }, items: [] });
  });
}

export async function updateMenuGroup(formData: FormData) {
  await requireAuth();
  const target = requireTarget(formData);
  const gi = indexFrom(formData, "gi");
  await mutateMenu(target, (m) => {
    if (!m.groups[gi]) fail("content");
    m.groups[gi].name = localizedFrom(formData, "name");
  });
}

export async function deleteMenuGroup(formData: FormData) {
  await requireAuth();
  const target = requireTarget(formData);
  const gi = indexFrom(formData, "gi");
  await mutateMenu(target, (m) => {
    m.groups.splice(gi, 1);
  });
}

export async function addMenuEntry(formData: FormData) {
  await requireAuth();
  const target = requireTarget(formData);
  const gi = indexFrom(formData, "gi");
  await mutateMenu(target, (m) => {
    if (!m.groups[gi]) fail("content");
    m.groups[gi].items.push({
      name: { id: "Item baru", en: "New item" },
      price: "",
      desc: { id: "", en: "" },
      image: "",
    });
  });
}

export async function updateMenuEntry(formData: FormData) {
  await requireAuth();
  const target = requireTarget(formData);
  const gi = indexFrom(formData, "gi");
  const ii = indexFrom(formData, "ii");
  await mutateMenu(target, (m) => {
    const entry = m.groups[gi]?.items[ii];
    if (!entry) fail("content");
    entry.name = localizedFrom(formData, "name");
    entry.price = String(formData.get("price") ?? "");
    entry.desc = localizedFrom(formData, "desc");
    entry.image = String(formData.get("image") ?? "");
  });
}

export async function deleteMenuEntry(formData: FormData) {
  await requireAuth();
  const target = requireTarget(formData);
  const gi = indexFrom(formData, "gi");
  const ii = indexFrom(formData, "ii");
  await mutateMenu(target, (m) => {
    m.groups[gi]?.items.splice(ii, 1);
  });
}

// ---- Upload gambar ----
// Satu action untuk semua tempat gambar; `slot` menentukan URL hasil upload
// ditulis ke mana. Tanpa JS di klien: unggah → simpan → halaman ter-refresh.
export async function uploadImage(formData: FormData) {
  await requireAuth();

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) fail("upload-empty");

  const checked = V.upload.safeParse({ type: file.type, size: file.size });
  if (!checked.success) {
    fail(checked.error.issues[0]?.path[0] === "size" ? "upload-size" : "upload-type");
  }

  // Slot diperiksa SEBELUM upload — kalau tidak, slot ngawur tetap menulis
  // file ke Storage lalu gagal, dan file itu jadi yatim.
  const SLOTS = ["center_image", "item_image", "content_image", "content_header", "menu_entry"];
  const slot = String(formData.get("slot") ?? "");
  if (!SLOTS.includes(slot)) fail("upload-slot");

  const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const path = `${SLUG}/${slot}-${randomUUID()}.${ext}`;

  const { error } = await db()
    .storage.from(BUCKET)
    .upload(path, file, { contentType: file.type, upsert: false });
  if (error) fail("upload-failed");

  const { data: pub } = db().storage.from(BUCKET).getPublicUrl(path);
  const url = pub.publicUrl;

  switch (slot) {
    case "center_image":
      await db().from("sites").update({ center_image: url }).eq("slug", SLUG);
      refresh();
      return;
    case "item_image": {
      const id = V.uuid.safeParse(String(formData.get("id") ?? ""));
      if (!id.success) fail("item");
      await db().from("items").update({ image_url: url, kind: "photo" }).eq("id", id.data);
      refresh();
      return;
    }
    case "content_image": {
      const target = requireTarget(formData);
      const prev = await readContent(target);
      if (prev.kind !== "photo") fail("content");
      await writeContent(target, { ...prev, image: url });
      return;
    }
    case "content_header": {
      const target = requireTarget(formData);
      const prev = await readContent(target);
      if (prev.kind !== "menu") fail("content");
      await writeContent(target, { ...prev, headerImage: url });
      return;
    }
    case "menu_entry": {
      const target = requireTarget(formData);
      const gi = indexFrom(formData, "gi");
      const ii = indexFrom(formData, "ii");
      await mutateMenu(target, (m) => {
        const entry = m.groups[gi]?.items[ii];
        if (!entry) fail("content");
        entry.image = url;
      });
      return;
    }
    default:
      fail("upload-slot"); // tak terjangkau; SLOTS sudah disaring di atas
  }
}
