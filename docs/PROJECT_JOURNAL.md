# Project Journal — Wisnu CMS

Catatan perjalanan project, biar gampang lanjut kapan pun (oleh kamu atau Claude).
Detail teknis lengkap ada di [`../PLAN.md`](../PLAN.md).

---

## Ringkasan

Portofolio "dial" interaktif (foto tengah + lingkaran ikon seksi, popup, animasi
intro/floating/parallax, dwibahasa ID/EN, tema terang/gelap) yang **bisa diedit lewat CMS**
(login password). Tujuan: situs pribadi dulu, dirancang biar bisa jadi **produk multi-tenant**
(mis. dijual ke restoran).

## Dua folder (jangan tertukar)
- **`~/projects/wisnu-web`** — prototype statis (HTML/CSS/JS). Cuma "cetakan desain". Arsip, tidak dikembangkan lagi.
- **`~/projects/wisnu-cms`** — project asli (Next.js). **Semua kerja di sini.**

## Stack
Next.js 16 (App Router) · React 19 · **TypeScript** · Supabase (Postgres + Storage + Auth-nanti)
· Vercel. Login = password saja (untuk sekarang).

## Keputusan yang dikunci
Material Symbols (varian Outlined) + picker · HTML custom disanitasi **DOMPurify** ·
preview live ditunda ke Fase 4 · TypeScript ya · Vercel subdomain dulu.

---

## Progress per fase

| Fase | Isi | Status |
|------|-----|--------|
| 0 | Renderer data-driven (schema, data, komponen dial, CSS) | ✅ commit + push |
| 1 | Baca data dari Supabase (fallback ke hardcoded) | ✅ commit + push + **live di Vercel** |
| 2 | Login password + panel admin (edit situs & item) | ✅ commit (belum push) + terverifikasi lokal, sisa 1 langkah DB |
| 3 | Editor konten per-layout (blank/foto/menu/HTML) + upload gambar | ⬜ berikutnya |
| 4 | Poles: drag-reorder, preview live, validasi | ⬜ |
| 5 | Multi-tenant (produk): subdomain per klien, Supabase Auth, RLS | ⬜ |

## Yang sudah live / tersimpan
- **Live:** https://porto-wfd.vercel.app (versi Fase 1)
- **GitHub:** https://github.com/wisnufdewantara/new-porto-wfd (sampai Fase 1)
- **Supabase:** `https://yfjwrqpvvuaqmfdoudct.supabase.co` (tabel `sites` + `items` sudah di-seed)

---

## Struktur kode penting (`wisnu-cms`)
```
app/
  page.tsx              # halaman publik (baca DB, fallback hardcoded)
  layout.tsx            # font Inter + Material Symbols
  admin/
    login/page.tsx      # halaman login
    page.tsx            # panel editor (dilindungi)
    actions.ts          # server actions: login/logout, updateSite, CRUD item
    layout.tsx
components/dial/         # DialApp, LayoutRenderer (renderer tampilan)
lib/
  schema.ts             # tipe data (SiteData, Item, 4 layout)
  supabase.ts           # client baca publik (publishable key)
  supabaseAdmin.ts      # client tulis server-only (secret key)
  getSite.ts            # ambil situs+item dari DB
  auth.ts               # sesi login (cookie HMAC) + bcrypt
data/site.ts            # data contoh (sumber seed)
supabase/               # schema.sql, seed.sql, setup.sql
scripts/                # gen-seed.ts, set-password.ts
styles/                 # dial.css, admin.css
```

---

## Cara menjalankan (lokal)
```bash
cd ~/projects/wisnu-cms
npm run dev            # -> http://localhost:3000
```

## Verifikasi Fase 2 (18 Agustus 2026)

Sudah dites dan LULUS, lokal:

| Cek | Hasil |
|-----|-------|
| `npx tsc --noEmit` + `next build` | ✅ bersih |
| `.env.local` (4 var) | ✅ lengkap terisi |
| Password admin di DB | ✅ sudah bcrypt (bukan `PENDING`) |
| `/` baca 11 item dari Supabase | ✅ |
| `/admin` tanpa cookie | ✅ 307 → `/admin/login` |
| `/admin` dengan cookie tanda tangan ngawur | ✅ 307 → `/admin/login` |
| `/admin` dengan cookie HMAC sah | ✅ 200, field terisi dari DB, 11 baris item |
| Server action `updateSite` (nilai identik) | ✅ 200, cuma `updated_at` bergerak |
| Login password salah | ✅ 303 → `?error=1`, tanpa cookie sesi |
| Tulis pakai publishable key (update/insert/delete) | ✅ diblokir RLS (0 baris / 401) |

Belum dites: login lewat browser pakai password asli (cuma Wisnu yang tahu passwordnya —
jalur bcrypt-nya sendiri sudah terbukti lewat kasus password salah).

## Loose ends buat menutup Fase 2 (langkah berikutnya)
1. **PENTING — jalankan `supabase/harden.sql`** di Supabase → SQL Editor. Sekarang kolom
   `password_hash` MASIH bisa dibaca publik pakai publishable key (kunci itu ikut terkirim
   ke browser), jadi hash-nya bisa diambil orang lalu di-brute-force offline. Setelah
   di-run, `select password_hash` dari publik harus gagal `42501`.
2. Tes login di browser: `npm run dev` → http://localhost:3000/admin/login → edit → Simpan → cek `/`.
3. `git push` Fase 2 (2 commit: panel admin + widget chat AI).
4. Set 4 env var di Vercel biar live jadi full-CMS:
   `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`,
   `SUPABASE_SECRET_KEY`, `SESSION_SECRET`.

## Catatan keamanan
- `.env.local` di-gitignore — secret TIDAK ke-push. Di Vercel diisi manual.
- Kredensial (secret key, password, token GitHub) diisi sendiri oleh Wisnu, tidak lewat chat.
  Yang sempat ter-paste di chat sudah/di-rotate.

---

## Soal chat history (update 18 Agustus 2026)
- **Transcript sesi Fase 0-2 (12-13 Juli) SUDAH HILANG.** Kehapus auto-cleanup Claude Code
  yang default-nya buang sesi >30 hari (cleanup terakhir jalan 18 Agustus 08:34). Salinan di
  history-folder `wisnu-cms` ikut kehapus, jadi tidak bisa di-`/resume` lagi.
- Pencegahan: `cleanupPeriodDays: 365` sudah diset di `~/.claude/settings.json`.
- Karena itu **file ini + `PLAN.md` adalah sumber kebenaran project**. Kalau ada keputusan
  penting, tulis di sini — jangan andalkan chat.
- Buka Claude Code **dari dalam** `~/projects/wisnu-cms` supaya sesi-sesi berikutnya
  ngumpul di satu history-folder project ini.
```
