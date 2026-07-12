import DialApp from "@/components/dial/DialApp";
import { getSite } from "@/lib/getSite";
import { siteData } from "@/data/site";

// Baca dari Supabase. Selama DB belum di-seed (atau env belum diisi),
// otomatis fallback ke data hardcoded supaya halaman tetap tampil.
export default async function Home() {
  const site = (await getSite("wisnu")) ?? siteData;
  return <DialApp site={site} />;
}

// Selalu render terbaru dari DB (jangan cache statis) — biar edit di CMS
// langsung kelihatan. Nanti bisa dioptimasi dengan revalidate.
export const dynamic = "force-dynamic";
