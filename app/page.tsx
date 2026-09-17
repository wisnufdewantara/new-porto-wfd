import type { Metadata } from "next";
import DialApp from "@/components/dial/DialApp";
import { getSite } from "@/lib/getSite";
import { siteData } from "@/data/site";
import { sanitizeSite } from "@/lib/sanitize";

// Judul & deskripsi ikut data situs, bukan hardcoded — kalau nama diubah di
// panel admin, tab browser ikut berubah. Sumber datanya sama dengan halaman
// (getSite ber-cache), jadi tidak nambah query.
export async function generateMetadata(): Promise<Metadata> {
  const site = (await getSite("wisnu")) ?? siteData;
  const role = site.role[site.defaultLang] || site.role.id;
  return {
    title: `${site.name} — Portofolio`,
    description: role
      ? `Portofolio & CV interaktif ${site.name} — ${role}.`
      : `Portofolio & CV interaktif ${site.name}.`,
  };
}

// Baca dari Supabase. Selama DB belum di-seed (atau env belum diisi),
// otomatis fallback ke data hardcoded supaya halaman tetap tampil.
export default async function Home() {
  // Sanitasi di server sebelum data menyeberang ke DialApp (komponen klien):
  // layout "html" dirender lewat dangerouslySetInnerHTML di sana.
  const site = await sanitizeSite((await getSite("wisnu")) ?? siteData);
  return <DialApp site={site} />;
}

// Selalu render terbaru dari DB (jangan cache statis) — biar edit di CMS
// langsung kelihatan. Nanti bisa dioptimasi dengan revalidate.
export const dynamic = "force-dynamic";
