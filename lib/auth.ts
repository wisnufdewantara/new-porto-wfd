import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

// Auth password-only sederhana untuk 1 admin per situs.
// Sesi = cookie httpOnly bertanda-tangan HMAC (tanpa dependency berat).

const COOKIE = "wcms_admin";
const MAX_AGE = 7 * 24 * 3600; // 7 hari (detik)

// Di produksi WAJIB ada SESSION_SECRET. Kalau tidak, kita fail-closed:
// nilai fallback di bawah ada di repo publik, jadi cookie sesi bisa dipalsukan
// siapa pun kalau env-nya kelupaan diisi di Vercel.
function secret(): string | null {
  const s = process.env.SESSION_SECRET;
  if (s) return s;
  return process.env.NODE_ENV === "production" ? null : "dev-insecure-secret-change-me";
}

// Dipakai halaman/action admin untuk menampilkan pesan "belum dikonfigurasi"
// alih-alih diam-diam menerima sesi palsu.
export function authConfigured(): boolean {
  return secret() !== null;
}

export function hashPassword(pw: string): string {
  return bcrypt.hashSync(pw, 10);
}
export function verifyPassword(pw: string, hash: string): boolean {
  try {
    return bcrypt.compareSync(pw, hash);
  } catch {
    return false;
  }
}

type Payload = { slug: string; exp: number };

function sign(payload: Payload): string {
  const k = secret();
  if (!k) throw new Error("SESSION_SECRET belum diset");
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = crypto.createHmac("sha256", k).update(body).digest("base64url");
  return `${body}.${sig}`;
}

function verify(token: string | undefined): Payload | null {
  const k = secret();
  if (!k || !token) return null;
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  const expect = crypto.createHmac("sha256", k).update(body).digest("base64url");
  const a = Buffer.from(sig);
  const b = Buffer.from(expect);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    const p = JSON.parse(Buffer.from(body, "base64url").toString()) as Payload;
    if (!p.exp || p.exp < Date.now()) return null;
    return p;
  } catch {
    return null;
  }
}

export async function createSession(slug: string): Promise<void> {
  const token = sign({ slug, exp: Date.now() + MAX_AGE * 1000 });
  const c = await cookies();
  c.set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function destroySession(): Promise<void> {
  const c = await cookies();
  c.delete(COOKIE);
}

export async function getSession(): Promise<Payload | null> {
  const c = await cookies();
  return verify(c.get(COOKIE)?.value);
}
