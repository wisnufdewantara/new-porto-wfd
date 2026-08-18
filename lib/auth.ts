import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

// Auth password-only sederhana untuk 1 admin per situs.
// Sesi = cookie httpOnly bertanda-tangan HMAC (tanpa dependency berat).

const COOKIE = "wcms_admin";
const MAX_AGE = 7 * 24 * 3600; // 7 hari (detik)

function secret() {
  return process.env.SESSION_SECRET || "dev-insecure-secret-change-me";
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
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = crypto.createHmac("sha256", secret()).update(body).digest("base64url");
  return `${body}.${sig}`;
}

function verify(token: string | undefined): Payload | null {
  if (!token) return null;
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  const expect = crypto.createHmac("sha256", secret()).update(body).digest("base64url");
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
