import type { LayoutContent } from "@/lib/schema";
import {
  setLayout,
  updateContent,
  addMenuGroup,
  updateMenuGroup,
  deleteMenuGroup,
  addMenuEntry,
  updateMenuEntry,
  deleteMenuEntry,
  uploadImage,
} from "./actions";

// Editor isi popup. Dipakai untuk dua hal dengan bentuk data yang sama:
// popup foto tengah (target="about") dan tiap item (target=<uuid item>).
// Semuanya form biasa + server action, tanpa state di klien.

const LAYOUTS = [
  { value: "blank", label: "Teks saja" },
  { value: "photo", label: "Foto + teks" },
  { value: "menu", label: "Menu / daftar" },
  { value: "html", label: "HTML custom" },
];

function Upload({
  slot,
  target,
  id,
  gi,
  ii,
  label = "Unggah gambar",
}: {
  slot: string;
  target?: string;
  id?: string;
  gi?: number;
  ii?: number;
  label?: string;
}) {
  return (
    <form action={uploadImage} className="upload">
      <input type="hidden" name="slot" value={slot} />
      {target !== undefined && <input type="hidden" name="target" value={target} />}
      {id !== undefined && <input type="hidden" name="id" value={id} />}
      {gi !== undefined && <input type="hidden" name="gi" value={gi} />}
      {ii !== undefined && <input type="hidden" name="ii" value={ii} />}
      <label className="sm">
        {label}
        <input type="file" name="file" accept="image/jpeg,image/png,image/webp" required />
      </label>
      <button className="btn tiny">Unggah</button>
    </form>
  );
}

function Thumb({ url }: { url?: string }) {
  if (!url) return null;
  // eslint-disable-next-line @next/next/no-img-element
  return <img className="thumb" src={url} alt="" />;
}

export function ContentEditor({
  target,
  content,
}: {
  target: string;
  content: LayoutContent;
}) {
  return (
    <div className="content-editor">
      <form action={setLayout} className="layout-picker">
        <input type="hidden" name="target" value={target} />
        <label className="sm">
          Layout popup
          <select name="layout" defaultValue={content.kind}>
            {LAYOUTS.map((l) => (
              <option key={l.value} value={l.value}>
                {l.label}
              </option>
            ))}
          </select>
        </label>
        <button className="btn tiny ghost">Ganti layout</button>
      </form>

      <form action={updateContent} className="grid">
        <input type="hidden" name="target" value={target} />
        <label className="sm">
          Judul (ID)
          <input name="title_id" defaultValue={content.title.id} />
        </label>
        <label className="sm">
          Judul (EN)
          <input name="title_en" defaultValue={content.title.en} />
        </label>

        {(content.kind === "blank" || content.kind === "photo") && (
          <>
            <label className="sm wide">
              Isi (ID)
              <textarea name="body_id" rows={5} defaultValue={content.body.id} />
            </label>
            <label className="sm wide">
              Isi (EN)
              <textarea name="body_en" rows={5} defaultValue={content.body.en} />
            </label>
            <p className="hint-text wide">Baris kosong ganda memisahkan paragraf.</p>
          </>
        )}

        {content.kind === "photo" && (
          <label className="sm wide">
            Gambar (URL)
            <input name="image" defaultValue={content.image} placeholder="https://…" />
          </label>
        )}

        {content.kind === "menu" && (
          <label className="sm wide">
            Gambar header (URL)
            <input name="headerImage" defaultValue={content.headerImage ?? ""} placeholder="https://…" />
          </label>
        )}

        {content.kind === "html" && (
          <>
            <label className="sm wide">
              HTML (ID)
              <textarea name="html_id" rows={6} defaultValue={content.html.id} />
            </label>
            <label className="sm wide">
              HTML (EN)
              <textarea name="html_en" rows={6} defaultValue={content.html.en} />
            </label>
            <p className="hint-text wide">
              HTML disanitasi DOMPurify saat disimpan <b>dan</b> saat ditampilkan. Tag seperti
              <code> &lt;script&gt;</code>, atribut <code>on…</code>, dan <code>javascript:</code>{" "}
              akan dibuang otomatis.
            </p>
          </>
        )}

        <div className="actions">
          <button className="btn">Simpan isi</button>
        </div>
      </form>

      {content.kind === "photo" && (
        <div className="upload-row">
          <Thumb url={content.image} />
          <Upload slot="content_image" target={target} label="Ganti gambar" />
        </div>
      )}

      {content.kind === "menu" && (
        <>
          <div className="upload-row">
            <Thumb url={content.headerImage} />
            <Upload slot="content_header" target={target} label="Ganti gambar header" />
          </div>

          <div className="menu-editor">
            {content.groups.map((g, gi) => (
              <div className="menu-group-edit" key={gi}>
                <div className="group-head">
                  <form action={updateMenuGroup} className="inline">
                    <input type="hidden" name="target" value={target} />
                    <input type="hidden" name="gi" value={gi} />
                    <input name="name_id" defaultValue={g.name.id} placeholder="Nama grup (ID)" />
                    <input name="name_en" defaultValue={g.name.en} placeholder="Nama grup (EN)" />
                    <button className="btn tiny">Simpan grup</button>
                  </form>
                  <form action={deleteMenuGroup}>
                    <input type="hidden" name="target" value={target} />
                    <input type="hidden" name="gi" value={gi} />
                    <button className="btn tiny danger" title="Hapus grup">✕</button>
                  </form>
                </div>

                {g.items.map((entry, ii) => (
                  <div className="menu-entry-edit" key={ii}>
                    <Thumb url={entry.image} />
                    <form action={updateMenuEntry} className="entry-form">
                      <input type="hidden" name="target" value={target} />
                      <input type="hidden" name="gi" value={gi} />
                      <input type="hidden" name="ii" value={ii} />
                      <input name="name_id" defaultValue={entry.name.id} placeholder="Nama (ID)" />
                      <input name="name_en" defaultValue={entry.name.en} placeholder="Nama (EN)" />
                      <input name="price" defaultValue={entry.price} placeholder="Harga" />
                      <input name="image" defaultValue={entry.image ?? ""} placeholder="Gambar (URL)" />
                      <input name="desc_id" defaultValue={entry.desc.id} placeholder="Keterangan (ID)" />
                      <input name="desc_en" defaultValue={entry.desc.en} placeholder="Keterangan (EN)" />
                      <button className="btn tiny">Simpan</button>
                    </form>
                    <div className="entry-side">
                      <Upload slot="menu_entry" target={target} gi={gi} ii={ii} label="Foto" />
                      <form action={deleteMenuEntry}>
                        <input type="hidden" name="target" value={target} />
                        <input type="hidden" name="gi" value={gi} />
                        <input type="hidden" name="ii" value={ii} />
                        <button className="btn tiny danger" title="Hapus entri">✕</button>
                      </form>
                    </div>
                  </div>
                ))}

                <form action={addMenuEntry}>
                  <input type="hidden" name="target" value={target} />
                  <input type="hidden" name="gi" value={gi} />
                  <button className="btn tiny ghost">+ Entri</button>
                </form>
              </div>
            ))}

            <form action={addMenuGroup}>
              <input type="hidden" name="target" value={target} />
              <button className="btn tiny ghost">+ Grup</button>
            </form>
          </div>
        </>
      )}
    </div>
  );
}

export { Upload };
