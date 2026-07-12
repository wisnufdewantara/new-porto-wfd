// Generator seed.sql dari data/site.ts.
// Jalankan: npx tsx scripts/gen-seed.ts > supabase/seed.sql
import { siteData } from "../data/site";

const SITE_ID = "11111111-1111-1111-1111-111111111111";

const t = (s: string) => `'${s.replace(/'/g, "''")}'`;
const j = (o: unknown) => `'${JSON.stringify(o).replace(/'/g, "''")}'::jsonb`;

let sql = `-- ============================================================\n`;
sql += `--  Wisnu CMS — SEED (auto-generated dari data/site.ts)\n`;
sql += `--  Jalankan SETELAH schema.sql. Aman diulang (hapus dulu lalu isi).\n`;
sql += `-- ============================================================\n\n`;

sql += `delete from items where site_id = '${SITE_ID}';\n`;
sql += `delete from sites where id = '${SITE_ID}';\n\n`;

sql += `insert into sites (id, slug, name, password_hash, center_image, role, hint, about, theme, default_lang, accent) values (\n`;
sql += `  '${SITE_ID}', 'wisnu', ${t(siteData.name)}, 'PENDING', ${t(siteData.centerImage)},\n`;
sql += `  ${j(siteData.role)}, ${j(siteData.hint)}, ${j(siteData.about)},\n`;
sql += `  ${t(siteData.theme)}, ${t(siteData.defaultLang)}, ${t(siteData.accent)}\n);\n\n`;

sql += `insert into items (site_id, position, kind, icon_name, image_url, label, layout, content) values\n`;
const rows = siteData.items.map((it, i) => {
  const icon = it.icon ? t(it.icon) : "null";
  const image = it.image ? t(it.image) : "null";
  return `  ('${SITE_ID}', ${i + 1}, ${t(it.kind)}, ${icon}, ${image}, ${j(it.label)}, ${t(it.content.kind)}, ${j(it.content)})`;
});
sql += rows.join(",\n") + ";\n";

process.stdout.write(sql);
