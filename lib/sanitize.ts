import type { LayoutContent, Localized, SiteData } from "./schema";

// Sanitasi HTML custom (layout "html"). Keputusan yang dikunci di PLAN §12
// menyebut DOMPurify; mesinnya diganti ke sanitize-html karena DOMPurify butuh
// DOM tiruan (jsdom), dan jsdom GAGAL DIMUAT di runtime Vercel:
//
//   ERR_REQUIRE_ESM: require() of ES Module @exodus/bytes/encoding-lite.js
//   from html-encoding-sniffer/lib/html-encoding-sniffer.js
//
// Paket eksternal dimuat lewat shim require milik Turbopack, dan shim itu tidak
// bisa memuat dependensi ESM. Lokal lolos hanya karena pohon dependensinya lebih
// tua. sanitize-html memarsir HTML sendiri — tanpa DOM, tanpa jsdom — jadi
// seluruh kelas masalah ini hilang. Tujuannya tetap sama: HTML dari CMS tidak
// pernah sampai ke pengguna dalam keadaan mentah.
//
// Sanitasi dijalankan DUA kali dengan sengaja:
//  1) saat menyimpan  → yang tersimpan di DB sudah bersih;
//  2) saat merender   → data lama / hasil edit manual di DB tetap aman.
// LayoutRenderer jalan di komponen klien lewat dangerouslySetInnerHTML, jadi
// pembersihannya harus sudah selesai di server.
//
// Modul dimuat malas di dalam try/catch. Versi pertama mengimpornya di level
// modul, dan ketika pemuatannya gagal di produksi, SETIAP route yang menyentuh
// berkas ini balas 500 — termasuk /admin/login yang tidak menyanitasi apa pun.
// Sanitasi yang bermasalah harus menurunkan kualitas tampilan, bukan
// menjatuhkan situs.

const ALLOWED_TAGS = [
  "p", "br", "hr", "b", "strong", "i", "em", "u", "s", "code", "pre",
  "blockquote", "h1", "h2", "h3", "h4", "ul", "ol", "li",
  "a", "img", "table", "thead", "tbody", "tr", "th", "td", "span", "div",
];

type SanitizeFn = (dirty: string, opts: Record<string, unknown>) => string;

let engine: SanitizeFn | null | undefined;

async function getEngine(): Promise<SanitizeFn | null> {
  if (engine !== undefined) return engine;
  try {
    const mod = await import("sanitize-html");
    engine = (mod.default ?? mod) as unknown as SanitizeFn;
  } catch (err) {
    console.error("[sanitize] mesin sanitasi gagal dimuat, jatuh ke mode buang-tag:", err);
    engine = null;
  }
  return engine;
}

const OPTIONS: Record<string, unknown> = {
  allowedTags: ALLOWED_TAGS,
  allowedAttributes: {
    "*": ["class", "title"],
    a: ["href", "target", "rel"],
    img: ["src", "alt"],
  },
  // Hanya skema aman. javascript: dan data: tidak ada di daftar, jadi ditolak.
  allowedSchemes: ["http", "https", "mailto", "tel"],
  allowedSchemesAppliedToAttributes: ["href", "src"],
  transformTags: {
    // Link yang membuka tab baru wajib punya rel anti tabnabbing.
    a: (tagName: string, attribs: Record<string, string>) => {
      if (attribs.target === "_blank") {
        attribs.rel = "noopener noreferrer";
      }
      return { tagName, attribs };
    },
  },
};

/** Cadangan kalau mesinnya tidak tersedia: buang SEMUA tag, sisakan teksnya. */
function stripTags(dirty: string): string {
  return dirty
    .replace(/<(script|style)[\s\S]*?<\/\1>/gi, "")
    .replace(/<[^>]*>/g, "")
    .trim();
}

export async function sanitizeHtml(dirty: string): Promise<string> {
  const run = await getEngine();
  if (!run) return stripTags(dirty ?? "");
  return run(dirty ?? "", OPTIONS);
}

async function sanitizeLocalizedHtml(v: Localized): Promise<Localized> {
  return { id: await sanitizeHtml(v.id), en: await sanitizeHtml(v.en) };
}

/** Hanya layout "html" yang perlu disanitasi; sisanya dirender sebagai teks. */
export async function sanitizeContent(content: LayoutContent): Promise<LayoutContent> {
  if (content.kind !== "html") return content;
  return { ...content, html: await sanitizeLocalizedHtml(content.html) };
}

/** Bersihkan seluruh isi situs sebelum dikirim ke renderer klien. */
export async function sanitizeSite(site: SiteData): Promise<SiteData> {
  return {
    ...site,
    about: await sanitizeContent(site.about),
    items: await Promise.all(
      site.items.map(async (it) => ({ ...it, content: await sanitizeContent(it.content) }))
    ),
  };
}
