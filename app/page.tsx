import DialApp from "@/components/dial/DialApp";
import { siteData } from "@/data/site";

// FASE 0: data dari file hardcoded.
// FASE 1: ganti `siteData` dengan hasil query Supabase (server component,
// bisa async: `const site = await getSite(slug)`).
export default function Home() {
  return <DialApp site={siteData} />;
}
