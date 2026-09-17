import type { LayoutContent, Localized, SiteData } from "./schema";

// Sanitasi HTML custom (layout "html"). Keputusan yang dikunci di PLAN §12.
// Dipakai DUA kali dengan sengaja:
//  1) saat menyimpan  → yang tersimpan di DB sudah bersih;
//  2) saat merender   → data lama / hasil edit manual di DB tetap aman.
// LayoutRenderer jalan di komponen klien, jadi sanitasi HARUS sudah beres
// di server sebelum datanya dikirim ke sana.
//
// DOMPurify dimuat MALAS dan dibungkus try/catch. Alasannya mahal: versi
// pertama mengimpornya di level modul, dan ketika pemuatannya gagal di
// runtime Vercel (lokal aman), setiap route yang menyentuh modul ini balas
// 500 — termasuk /admin/login yang tidak menyanitasi apa pun. Sanitasi yang
// bermasalah harus menurunkan kualitas tampilan, bukan menjatuhkan situs.

const CONFIG = {
  ALLOWED_TAGS: [
    "p", "br", "hr", "b", "strong", "i", "em", "u", "s", "code", "pre",
    "blockquote", "h1", "h2", "h3", "h4", "ul", "ol", "li",
    "a", "img", "table", "thead", "tbody", "tr", "th", "td", "span", "div",
  ],
  ALLOWED_ATTR: ["href", "title", "alt", "src", "target", "rel", "class"],
  // Cegah javascript:/data: di href & src — hanya skema aman yang lolos.
  ALLOWED_URI_REGEXP: /^(?:https?:|mailto:|tel:|#|\/)/i,
  // Memasang ALLOWED_URI_REGEXP bikin DOMPurify menguji SEMUA nilai atribut
  // terhadap regex itu, kecuali yang dianggap URI-safe. `target` bukan URL,
  // jadi tanpa baris ini `target="_blank"` ikut terbuang.
  ADD_URI_SAFE_ATTR: ["target"],
};

type Purifier = { sanitize: (dirty: string, cfg: typeof CONFIG) => string };
let purifier: Purifier | null | undefined;

async function getPurifier(): Promise<Purifier | null> {
  if (purifier !== undefined) return purifier;
  try {
    const mod = await import("isomorphic-dompurify");
    const DOMPurify = (mod.default ?? mod) as unknown as Purifier & {
      addHook: (n: string, cb: (node: Element) => void) => void;
    };
    // Link yang membuka tab baru wajib punya rel anti tabnabbing.
    DOMPurify.addHook("afterSanitizeAttributes", (node: Element) => {
      if (node.tagName === "A" && node.getAttribute("target") === "_blank") {
        node.setAttribute("rel", "noopener noreferrer");
      }
    });
    purifier = DOMPurify;
  } catch (err) {
    console.error("[sanitize] DOMPurify gagal dimuat, jatuh ke mode buang-tag:", err);
    purifier = null;
  }
  return purifier;
}

/** Cadangan kalau DOMPurify tidak tersedia: buang SEMUA tag, sisakan teksnya. */
function stripTags(dirty: string): string {
  return dirty
    .replace(/<(script|style)[\s\S]*?<\/\1>/gi, "")
    .replace(/<[^>]*>/g, "")
    .trim();
}

export async function sanitizeHtml(dirty: string): Promise<string> {
  const p = await getPurifier();
  if (!p) return stripTags(dirty ?? "");
  return String(p.sanitize(dirty ?? "", CONFIG));
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
