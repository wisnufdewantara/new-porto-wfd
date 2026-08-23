import { z } from "zod";
import type { LayoutContent, LayoutKind } from "./schema";
import { MAX_ITEMS } from "./schema";

// Validasi semua input tulis (PLAN §9). Server action TIDAK boleh percaya
// FormData — form bisa dipalsukan meski UI-nya sudah membatasi.

const TEXT = 4000;
const HTML = 20000;

export const localized = z.object({
  id: z.string().max(TEXT),
  en: z.string().max(TEXT),
});

/** URL gambar: boleh kosong, kalau diisi harus URL http(s) yang wajar. */
export const imageUrl = z.union([z.literal(""), z.url().max(1000)]);

const blankContent = z.object({
  kind: z.literal("blank"),
  title: localized,
  body: localized,
});

const photoContent = z.object({
  kind: z.literal("photo"),
  title: localized,
  image: imageUrl,
  body: localized,
});

const menuEntry = z.object({
  name: localized,
  price: z.string().max(40),
  desc: localized,
  image: imageUrl.optional(),
});

const menuContent = z.object({
  kind: z.literal("menu"),
  title: localized,
  headerImage: imageUrl.optional(),
  groups: z
    .array(z.object({ name: localized, items: z.array(menuEntry).max(50) }))
    .max(20),
});

const htmlContent = z.object({
  kind: z.literal("html"),
  title: localized,
  html: z.object({ id: z.string().max(HTML), en: z.string().max(HTML) }),
});

export const layoutContent = z.discriminatedUnion("kind", [
  blankContent,
  photoContent,
  menuContent,
  htmlContent,
]);

export const LAYOUT_KINDS = ["blank", "photo", "menu", "html"] as const;
export const layoutKind = z.enum(LAYOUT_KINDS);

export const siteForm = z.object({
  name: z.string().min(1).max(120),
  role: localized,
  hint: localized,
  theme: z.enum(["light", "dark"]),
  default_lang: z.enum(["id", "en"]),
  accent: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Warna harus format #rrggbb"),
  center_image: imageUrl,
});

export const itemForm = z.object({
  kind: z.enum(["icon", "photo"]),
  icon_name: z.string().max(60),
  image_url: imageUrl,
  label: localized,
});

export const uuid = z.uuid();

/** Target editor konten: popup foto tengah, atau satu item. */
export const contentTarget = z.union([z.literal("about"), uuid]);

export const UPLOAD_MAX_BYTES = 5 * 1024 * 1024;
export const UPLOAD_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

export const upload = z.object({
  type: z.enum(UPLOAD_TYPES, { message: "Format harus JPG, PNG, atau WebP" }),
  size: z
    .number()
    .positive("File kosong")
    .max(UPLOAD_MAX_BYTES, "Ukuran maksimal 5 MB"),
});

export { MAX_ITEMS };
export type ValidatedContent = LayoutContent;
export type ValidatedKind = LayoutKind;
