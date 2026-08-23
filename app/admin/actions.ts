"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getSession, createSession, destroySession, verifyPassword, authConfigured } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { MAX_ITEMS } from "@/lib/schema";

const SLUG = "wisnu";

function refresh() {
  revalidatePath("/");
  revalidatePath("/admin");
}

async function requireAuth() {
  const s = await getSession();
  if (!s) redirect("/admin/login");
}

async function siteId(): Promise<string> {
  const { data } = await supabaseAdmin!.from("sites").select("id").eq("slug", SLUG).single();
  return data!.id as string;
}

// ---- Auth ----
export async function login(formData: FormData) {
  const pw = String(formData.get("password") || "");
  if (!supabaseAdmin || !authConfigured()) redirect("/admin/login?error=config");
  const { data: site } = await supabaseAdmin!
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
  if (!supabaseAdmin) return;
  await supabaseAdmin
    .from("sites")
    .update({
      name: String(formData.get("name") || ""),
      role: { id: String(formData.get("role_id") || ""), en: String(formData.get("role_en") || "") },
      hint: { id: String(formData.get("hint_id") || ""), en: String(formData.get("hint_en") || "") },
      theme: String(formData.get("theme") || "light"),
      default_lang: String(formData.get("default_lang") || "id"),
      accent: String(formData.get("accent") || "#0ea5e9"),
      center_image: String(formData.get("center_image") || ""),
      updated_at: new Date().toISOString(),
    })
    .eq("slug", SLUG);
  refresh();
}

// ---- Item ----
export async function addItem() {
  await requireAuth();
  if (!supabaseAdmin) return;
  const id = await siteId();
  const { count } = await supabaseAdmin
    .from("items")
    .select("*", { count: "exact", head: true })
    .eq("site_id", id);
  if ((count ?? 0) >= MAX_ITEMS) return;
  await supabaseAdmin.from("items").insert({
    site_id: id,
    position: (count ?? 0) + 1,
    kind: "icon",
    icon_name: "star",
    label: { id: "Baru", en: "New" },
    layout: "blank",
    content: { kind: "blank", title: { id: "Judul", en: "Title" }, body: { id: "", en: "" } },
  });
  refresh();
}

export async function updateItem(formData: FormData) {
  await requireAuth();
  if (!supabaseAdmin) return;
  const id = String(formData.get("id"));
  await supabaseAdmin
    .from("items")
    .update({
      kind: String(formData.get("kind") || "icon"),
      icon_name: String(formData.get("icon_name") || "") || null,
      image_url: String(formData.get("image_url") || "") || null,
      label: { id: String(formData.get("label_id") || ""), en: String(formData.get("label_en") || "") },
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
  refresh();
}

export async function deleteItem(formData: FormData) {
  await requireAuth();
  if (!supabaseAdmin) return;
  await supabaseAdmin.from("items").delete().eq("id", String(formData.get("id")));
  refresh();
}

export async function moveItem(formData: FormData) {
  await requireAuth();
  if (!supabaseAdmin) return;
  const id = String(formData.get("id"));
  const dir = String(formData.get("dir"));
  const { data: items } = await supabaseAdmin
    .from("items")
    .select("id, position")
    .eq("site_id", await siteId())
    .order("position", { ascending: true });
  if (!items) return;
  const idx = items.findIndex((i) => i.id === id);
  const swap = dir === "up" ? idx - 1 : idx + 1;
  if (idx < 0 || swap < 0 || swap >= items.length) return;
  const a = items[idx];
  const b = items[swap];
  await supabaseAdmin.from("items").update({ position: b.position }).eq("id", a.id);
  await supabaseAdmin.from("items").update({ position: a.position }).eq("id", b.id);
  refresh();
}
