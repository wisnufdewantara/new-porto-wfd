import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { MAX_ITEMS } from "@/lib/schema";
import { logout, updateSite, addItem, updateItem, deleteItem, moveItem } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  if (!(await getSession())) redirect("/admin/login");

  if (!supabaseAdmin) {
    return (
      <div className="admin-wrap">
        <p className="notice">
          <b>SUPABASE_SECRET_KEY</b> belum diisi di <code>.env.local</code>. Isi dulu lalu
          restart <code>npm run dev</code>.
        </p>
      </div>
    );
  }

  const { data: site } = await supabaseAdmin.from("sites").select("*").eq("slug", "wisnu").single();
  const { data: items } = await supabaseAdmin
    .from("items")
    .select("*")
    .eq("site_id", site!.id)
    .order("position", { ascending: true });

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

      {/* ---- Pengaturan situs ---- */}
      <section className="panel">
        <h2>Pengaturan Situs</h2>
        <form action={updateSite} className="grid">
          <label>Nama<input name="name" defaultValue={site!.name} /></label>
          <label>Warna aksen<input name="accent" type="color" defaultValue={site!.accent} /></label>
          <label>Role (ID)<input name="role_id" defaultValue={site!.role?.id} /></label>
          <label>Role (EN)<input name="role_en" defaultValue={site!.role?.en} /></label>
          <label>Hint (ID)<input name="hint_id" defaultValue={site!.hint?.id} /></label>
          <label>Hint (EN)<input name="hint_en" defaultValue={site!.hint?.en} /></label>
          <label>Foto tengah (URL)<input name="center_image" defaultValue={site!.center_image} /></label>
          <label>Tema
            <select name="theme" defaultValue={site!.theme}>
              <option value="light">Terang</option>
              <option value="dark">Gelap</option>
            </select>
          </label>
          <label>Bahasa default
            <select name="default_lang" defaultValue={site!.default_lang}>
              <option value="id">Indonesia</option>
              <option value="en">English</option>
            </select>
          </label>
          <div className="actions"><button className="btn">Simpan</button></div>
        </form>
      </section>

      {/* ---- Item ---- */}
      <section className="panel">
        <div className="panel-head">
          <h2>Item ({items?.length ?? 0}/{MAX_ITEMS})</h2>
          <form action={addItem}>
            <button className="btn" disabled={(items?.length ?? 0) >= MAX_ITEMS}>+ Tambah item</button>
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
                  <button className="btn tiny" disabled={idx === (items?.length ?? 0) - 1}>▼</button>
                </form>
              </div>

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

              <form action={deleteItem} className="del">
                <input type="hidden" name="id" value={it.id} />
                <button className="btn danger tiny" title="Hapus">✕</button>
              </form>
            </div>
          ))}
        </div>
        <p className="hint-text">
          Isi popup tiap item (layout blank/foto/menu/HTML) akan bisa diedit di Fase 3.
        </p>
      </section>
    </div>
  );
}
