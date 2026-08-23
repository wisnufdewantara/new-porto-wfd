import type { LayoutContent, LayoutKind, Localized } from "./schema";

const EMPTY: Localized = { id: "", en: "" };
const clone = (v: Localized): Localized => ({ id: v.id, en: v.en });

/** Konten kosong untuk sebuah layout. */
export function emptyContent(
  kind: LayoutKind,
  title: Localized = { id: "Judul", en: "Title" }
): LayoutContent {
  switch (kind) {
    case "blank":
      return { kind, title: clone(title), body: { ...EMPTY } };
    case "photo":
      return { kind, title: clone(title), image: "", body: { ...EMPTY } };
    case "menu":
      return { kind, title: clone(title), headerImage: "", groups: [] };
    case "html":
      return { kind, title: clone(title), html: { ...EMPTY } };
  }
}

/**
 * Pindah layout tanpa membuang yang masih bisa dipakai: judul selalu ikut,
 * teks body dan gambar dibawa kalau layout tujuannya punya tempat untuk itu.
 * Yang tidak punya padanan (mis. grup menu → blank) memang hilang.
 */
export function convertContent(prev: LayoutContent, kind: LayoutKind): LayoutContent {
  if (prev.kind === kind) return prev;

  const title = clone(prev.title);
  const body =
    prev.kind === "blank" || prev.kind === "photo"
      ? clone(prev.body)
      : prev.kind === "html"
        ? clone(prev.html)
        : { ...EMPTY };
  const image =
    prev.kind === "photo" ? prev.image : prev.kind === "menu" ? prev.headerImage ?? "" : "";

  switch (kind) {
    case "blank":
      return { kind, title, body };
    case "photo":
      return { kind, title, image, body };
    case "menu":
      return { kind, title, headerImage: image, groups: [] };
    case "html":
      return { kind, title, html: body };
  }
}
