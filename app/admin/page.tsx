import { redirect } from "next/navigation";
import { getSession, authConfigured } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { MAX_ITEMS } from "@/lib/schema";
import type { LayoutContent } from "@/lib/schema";
import { logout, updateSite, addItem, updateItem, deleteItem, moveItem } from "./actions";
import { ContentEditor, Upload } from "./ContentEditor";

export const dynamic = "force-dynamic";

// Pesan untuk tiap kode kegagalan yang dikirim server action lewat ?err=
const ERRORS: Record<string, string> = {
  site: "Pengaturan situs gagal disimpan — cek warna aksen (harus #rrggbb) dan URL gambar.",
  item: "Item gagal disimpan — cek URL gambarnya.",
  content: "Isi popup gagal disimpan — ada kolom yang tidak valid atau terlalu panjang.",
  "max-items": `Sudah mentok ${MAX_ITEMS} item.`,
  "upload-type": "Format gambar harus JPG, PNG, atau WebP.",
  "upload-size": "Ukuran gambar maksimal 5 MB.",
  "upload-empty": "Tidak ada file yang dipilih.",
  "upload-failed": "Upload ke Supabase Storage gagal.",
  "upload-slot": "Tujuan upload tidak dikenal.",
  "site-missing": "Baris situs tidak ditemukan di database.",
  config: "Server belum dikonfigurasi.",
};

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ err?: string }>;
}) {
  if (!(await getSession())) redirect("/admin/login");

  if (!supabaseAdmin || !authConfigured()) {
    return (
      <div className="admin-wrap">
        <p className="notice">
          <b>SUPABASE_SECRET_KEY</b> dan/atau <b>SESSION_SECRET</b> belum diisi
          (<code>.env.local</code> lokal, Environment Variables di Vercel). Isi dulu lalu
          restart <code>npm run dev</code> / redeploy.
        </p>
      </div>
    );
  }

  const { err } = await searchParams;
  const { data: site } = await supabaseAdmin.from("sites").select("*").eq("slug", "wisnu").single();
  if (!site) {
    return (
      <div className="admin-wrap">
        <p className="notice">Baris situs <code>wisnu</code> belum ada di tabel <code>sites</code>.</p>
      </div>
    );
  }
  const { data: items } = await supabaseAdmin
    .from("items")
    .select("*")
    .eq("site_id", site.id)
    .order("position", { ascending: true });

  const count = items?.length ?? 0;

  return (
    <div className="admin-wrap">
      <header className="admin-header">
        <div>
          <h1>Panel Admin</h1>
          <a href="/" target="_blank" className="link">Lihat situs ↗</a>
        </div>
        <form action={logout}>
          <button className="btn ghost">Keluar</button>
        </form>
      </header>

      {err && <p className="notice err-notice">{ERRORS[err] ?? "Ada yang gagal disimpan."}</p>}

      {/* ---- Pengaturan situs ---- */}
      <section className="panel">
        <h2>Pengaturan Situs</h2>
        <form action={updateSite} className="grid">
          <label>Nama<input name="name" defaultValue={site.name} /></label>
          <label>Warna aksen<input name="accent" type="color" defaultValue={site.accent} /></label>
          <label>Role (ID)<input name="role_id" defaultValue={site.role?.id} /></label>
          <label>Role (EN)<input name="role_en" defaultValue={site.role?.en} /></label>
          <label>Hint (ID)<input name="hint_id" defaultValue={site.hint?.id} /></label>
          <label>Hint (EN)<input name="hint_en" defaultValue={site.hint?.en} /></label>
          <label>Foto tengah (URL)<input name="center_image" defaultValue={site.center_image} /></label>
          <label>Tema
            <select name="theme" defaultValue={site.theme}>
              <option value="light">Terang</option>
              <option value="dark">Gelap</option>
            </select>
          </label>
          <label>Bahasa default
            <select name="default_lang" defaultValue={site.default_lang}>
              <option value="id">Indonesia</option>
              <option value="en">English</option>
            </select>
          </label>
          <div className="actions"><button className="btn">Simpan</button></div>
        </form>
        <div className="upload-row">
          {site.center_image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img className="thumb" src={site.center_image} alt="" />
          )}
          <Upload slot="center_image" label="Ganti foto tengah" />
        </div>
      </section>

      {/* ---- Popup foto tengah ---- */}
      <section className="panel">
        <h2>Popup Foto Tengah</h2>
        <ContentEditor target="about" content={site.about as LayoutContent} />
      </section>

      {/* ---- Item ---- */}
      <section className="panel">
        <div className="panel-head">
          <h2>Item ({count}/{MAX_ITEMS})</h2>
          <form action={addItem}>
            <button className="btn" disabled={count >= MAX_ITEMS}>+ Tambah item</button>
          </form>
        </div>

        <div className="items">
          {(items ?? []).map((it, idx) => (
            <div className="item-row" key={it.id}>
              <div className="order">
                <form action={moveItem}>
                  <input type="hidden" name="id" value={it.id} />
                  <input type="hidden" name="dir" value="up" />
                  <button className="btn tiny" disabled={idx === 0}>▲</button>
                </form>
                <span>{idx + 1}</span>
                <form action={moveItem}>
                  <input type="hidden" name="id" value={it.id} />
                  <input type="hidden" name="dir" value="down" />
                  <button className="btn tiny" disabled={idx === count - 1}>▼</button>
                </form>
              </div>

              <div className="item-body">
                <form action={updateItem} className="item-edit">
                  <input type="hidden" name="id" value={it.id} />
                  <label className="sm">Tipe
                    <select name="kind" defaultValue={it.kind}>
                      <option value="icon">Ikon</option>
                      <option value="photo">Foto</option>
                    </select>
                  </label>
                  <label className="sm">Ikon (Material Symbol)<input name="icon_name" defaultValue={it.icon_name ?? ""} placeholder="mis. school" /></label>
                  <label className="sm">Foto (URL)<input name="image_url" defaultValue={it.image_url ?? ""} placeholder="https://…" /></label>
                  <label className="sm">Label (ID)<input name="label_id" defaultValue={it.label?.id} /></label>
                  <label className="sm">Label (EN)<input name="label_en" defaultValue={it.label?.en} /></label>
                  <div className="item-actions">
                    <span className="badge">{it.layout}</span>
                    <button className="btn tiny">Simpan</button>
                  </div>
                </form>

                <div className="upload-row">
                  {it.image_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img className="thumb" src={it.image_url} alt="" />
                  )}
                  <Upload slot="item_image" id={it.id} label="Unggah foto item" />
                </div>

                <details className="content-details">
                  <summary>Isi popup</summary>
                  <ContentEditor target={it.id} content={it.content as LayoutContent} />
                </details>
              </div>

              <form action={deleteItem} className="del">
                <input type="hidden" name="id" value={it.id} />
                <button className="btn danger tiny" title="Hapus">✕</button>
              </form>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
