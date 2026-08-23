import DOMPurify from "isomorphic-dompurify";
import type { LayoutContent, Localized, SiteData } from "./schema";

// Sanitasi HTML custom (layout "html"). Keputusan yang dikunci di PLAN §12.
// Dipakai DUA kali dengan sengaja:
//  1) saat menyimpan  → yang tersimpan di DB sudah bersih;
//  2) saat merender   → data lama / hasil edit manual di DB tetap aman.
// LayoutRenderer jalan di komponen klien, jadi sanitasi HARUS sudah beres
// di server sebelum datanya dikirim ke sana.

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

// Link yang membuka tab baru wajib punya rel anti tabnabbing.
DOMPurify.addHook("afterSanitizeAttributes", (node) => {
  if (node.tagName === "A" && node.getAttribute("target") === "_blank") {
    node.setAttribute("rel", "noopener noreferrer");
  }
});

export function sanitizeHtml(dirty: string): string {
  return String(DOMPurify.sanitize(dirty ?? "", CONFIG));
}

function sanitizeLocalizedHtml(v: Localized): Localized {
  return { id: sanitizeHtml(v.id), en: sanitizeHtml(v.en) };
}

/** Hanya layout "html" yang perlu disanitasi; sisanya dirender sebagai teks. */
export function sanitizeContent(content: LayoutContent): LayoutContent {
  if (content.kind !== "html") return content;
  return { ...content, html: sanitizeLocalizedHtml(content.html) };
}

/** Bersihkan seluruh isi situs sebelum dikirim ke renderer klien. */
export function sanitizeSite(site: SiteData): SiteData {
  return {
    ...site,
    about: sanitizeContent(site.about),
    items: site.items.map((it) => ({ ...it, content: sanitizeContent(it.content) })),
  };
}
