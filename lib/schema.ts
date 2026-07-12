// ============================================================
//  Skema data — dipakai bersama oleh renderer & (nanti) CMS/DB.
//  Bentuk ini SENGAJA sama dengan kolom di tabel Postgres nanti
//  supaya migrasi dari "data hardcoded" ke "baca DB" mulus.
// ============================================================

export type Lang = "id" | "en";

/** Teks dwibahasa. */
export type Localized = { id: string; en: string };

// ---- Isi popup per layout (discriminated union lewat `kind`) ----

export type BlankContent = {
  kind: "blank";
  title: Localized;
  body: Localized;
};

export type PhotoContent = {
  kind: "photo";
  title: Localized;
  image: string;
  body: Localized;
};

export type MenuItem = {
  name: Localized;
  price: string;
  desc: Localized;
  image?: string;
};
export type MenuGroup = { name: Localized; items: MenuItem[] };
export type MenuContent = {
  kind: "menu";
  title: Localized;
  headerImage?: string;
  groups: MenuGroup[];
};

export type HtmlContent = {
  kind: "html";
  title: Localized;
  /** HTML mentah — WAJIB disanitasi (DOMPurify) sebelum render. */
  html: Localized;
};

export type LayoutContent =
  | BlankContent
  | PhotoContent
  | MenuContent
  | HtmlContent;

export type LayoutKind = LayoutContent["kind"];

// ---- Item melingkar ----

export type Item = {
  id: string;
  /** ikon (Material Symbol) atau foto */
  kind: "icon" | "photo";
  icon?: string; // nama Material Symbol jika kind === "icon"
  image?: string; // URL foto jika kind === "photo"
  label: Localized; // tooltip di bawah ikon
  content: LayoutContent; // isi popup
};

// ---- Satu situs (nanti = satu baris tabel `sites`) ----

export type SiteData = {
  name: string;
  role: Localized;
  hint: Localized;
  centerImage: string;
  /** popup yang muncul saat foto tengah diklik */
  about: LayoutContent;
  theme: "light" | "dark";
  defaultLang: Lang;
  accent: string;
  /** maksimal 20 */
  items: Item[];
};

/** Batas keras jumlah item (dijaga juga di server nanti). */
export const MAX_ITEMS = 20;
