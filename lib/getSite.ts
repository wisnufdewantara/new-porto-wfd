import { cache } from "react";
import { supabase } from "./supabase";
import type { SiteData, Item, LayoutContent, Lang } from "./schema";

// Ambil satu situs + item-nya dari Supabase, lalu petakan ke bentuk SiteData
// yang dipakai renderer. Mengembalikan null jika belum ada / gagal
// (mis. tabel belum dibuat) → pemanggil bisa fallback ke data hardcoded.
//
// Dibungkus cache() dari React: satu request memanggil ini dua kali
// (generateMetadata + komponen halaman), dan cache() bikin query ke Supabase
// tetap sekali saja.
export const getSite = cache(async function getSite(slug: string): Promise<SiteData | null> {
  if (!supabase) return null;

  try {
    const { data: site, error: siteErr } = await supabase
      .from("sites")
      // hanya kolom publik — JANGAN ambil password_hash
      .select("id, name, center_image, role, hint, about, theme, default_lang, accent")
      .eq("slug", slug)
      .single();

    if (siteErr || !site) return null;

    const { data: items } = await supabase
      .from("items")
      .select("*")
      .eq("site_id", site.id)
      .eq("is_published", true)
      .order("position", { ascending: true });

    return {
      name: site.name,
      role: site.role,
      hint: site.hint,
      centerImage: site.center_image,
      about: site.about as LayoutContent,
      theme: site.theme as "light" | "dark",
      defaultLang: site.default_lang as Lang,
      accent: site.accent,
      items: (items ?? []).map(
        (r): Item => ({
          id: r.id,
          kind: r.kind,
          icon: r.icon_name ?? undefined,
          image: r.image_url ?? undefined,
          label: r.label,
          content: r.content as LayoutContent,
        })
      ),
    };
  } catch {
    return null;
  }
});
