// Set password admin untuk situs 'wisnu'.
// Jalankan: npx tsx scripts/set-password.ts
// Butuh SUPABASE_SECRET_KEY & NEXT_PUBLIC_SUPABASE_URL di .env.local.
// Pakai REST API (fetch) langsung — hindari supabase-js yang butuh
// WebSocket native (tak tersedia di Node < 22 untuk skрип mandiri).
import { readFileSync } from "node:fs";
import { createInterface } from "node:readline";
import bcrypt from "bcryptjs";

function env(key: string): string | undefined {
  if (process.env[key]) return process.env[key];
  try {
    const txt = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
    for (const line of txt.split("\n")) {
      const m = line.match(/^\s*([A-Z_]+)\s*=\s*(.*)\s*$/);
      if (m && m[1] === key) return m[2].replace(/^["']|["']$/g, "");
    }
  } catch {
    /* noop */
  }
  return undefined;
}

const url = env("NEXT_PUBLIC_SUPABASE_URL");
const secret = env("SUPABASE_SECRET_KEY");

if (!url || !secret) {
  console.error("❌ Butuh NEXT_PUBLIC_SUPABASE_URL & SUPABASE_SECRET_KEY di .env.local");
  process.exit(1);
}

const rl = createInterface({ input: process.stdin, output: process.stdout });
rl.question("Password admin baru (min 6 karakter): ", async (pw) => {
  rl.close();
  if (!pw || pw.length < 6) {
    console.error("❌ Password minimal 6 karakter.");
    process.exit(1);
  }
  const hash = bcrypt.hashSync(pw, 10);
  const res = await fetch(`${url}/rest/v1/sites?slug=eq.wisnu`, {
    method: "PATCH",
    headers: {
      apikey: secret,
      Authorization: `Bearer ${secret}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify({ password_hash: hash }),
  });
  if (!res.ok) {
    console.error("❌ Gagal:", res.status, await res.text());
    process.exit(1);
  }
  console.log("✅ Password admin diset. Login di http://localhost:3000/admin/login");
  process.exit(0);
});
