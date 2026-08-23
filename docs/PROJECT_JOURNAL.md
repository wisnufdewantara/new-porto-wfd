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
| 1 | Baca data dari Supabase (fallback ke hardcoded) | ✅ commit + push + **live baca DB** |
| 2 | Login password + panel admin (edit situs & item) | ✅ **SELESAI** — commit + push + live, `harden.sql` sudah jalan |
| 3 | Editor konten per-layout (blank/foto/menu/HTML) + upload gambar | ✅ commit + push, terverifikasi lokal |
| 4 | Poles: drag-reorder, preview live, validasi | ⬜ |
| 5 | Multi-tenant (produk): subdomain per klien, Supabase Auth, RLS | ⬜ |

## Yang sudah live / tersimpan
- **Live:** https://porto-wfd.vercel.app — sudah **Fase 2 penuh dan baca DB**. Diverifikasi
  22 Agustus 2026: `<h1>` = "Wisnu F Dewantara" (dari DB) dan accent `#e1dfe1` (dari DB),
  bukan lagi fallback hardcoded. `POST /admin/login` balas `?error=1` untuk password salah,
  artinya keempat env var sudah kebaca runtime.
- **GitHub:** https://github.com/wisnufdewantara/new-porto-wfd — `origin/main` sinkron.
- **Repo ini PUBLIK** — jangan pernah menaruh secret di kode, termasuk sebagai nilai default.
- **Pelajaran soal env Vercel:** nyimpen env var TIDAK mengubah situs yang sudah jalan.
  Harus ada deployment baru — entah klik Redeploy, atau `git push` (push otomatis ikut
  membawa env var terbaru). `NEXT_PUBLIC_*` ditanam saat build, jadi wajib build ulang.
- **Supabase:** `https://yfjwrqpvvuaqmfdoudct.supabase.co` (tabel `sites` + `items` sudah di-seed)

---

## Fase 3 — apa yang ditambahkan (22 Agustus 2026)

**Storage:** bucket Supabase `public-images` — publik, batas 5 MB, mime dibatasi
`image/jpeg|png|webp`. Dibuat lewat API, tidak menyentuh tabel yang sudah ada.

**File baru:** `lib/validate.ts` (skema Zod semua input tulis), `lib/sanitize.ts`
(DOMPurify), `lib/content.ts` (konten kosong + konversi antar layout),
`app/admin/ContentEditor.tsx` (editor isi popup, dipakai untuk `about` dan tiap item).

**Catatan penting yang mahal kalau lupa:**
- `next.config.ts` menaikkan `experimental.serverActions.bodySizeLimit` ke `6mb`.
  Default Next **1 MB** — tanpa ini, upload foto ukuran wajar pun putus di tengah
  (broken pipe), bukan pesan error yang rapi.
- Di `lib/sanitize.ts` ada `ADD_URI_SAFE_ATTR: ["target"]`. Begitu `ALLOWED_URI_REGEXP`
  custom dipasang, DOMPurify menguji **semua** nilai atribut terhadap regex itu, jadi
  `target="_blank"` ikut terbuang tanpa baris tersebut. Ini sempat merusak link "View →"
  dan Kontak sebelum ketahuan.
- Sanitasi jalan **dua kali** (saat simpan & saat render). Yang saat render itu bukan
  mubazir: `LayoutRenderer` komponen klien dengan `dangerouslySetInnerHTML`, dan baris DB
  bisa diedit langsung dari dashboard Supabase.

**Hasil tes lokal (semua lulus, dikerjakan di item scratch yang lalu dihapus):**

| Cek | Hasil |
|-----|-------|
| Sanitasi 22 blok HTML asli di DB | ✅ nol perubahan isi (cuma `rel` tambahan + `&`→`&amp;`) |
| Payload XSS (`<script>`, `onerror`, `javascript:`, `<iframe>`, `<svg onload>`) disimpan | ✅ semua dibuang, `<b>`/`target="_blank"` selamat |
| HTML kotor disuntik LANGSUNG ke DB (melewati aplikasi) | ✅ halaman publik tetap bersih |
| Zod: accent ngawur / URL item ngawur / target palsu / layout palsu / index menu di luar jangkauan | ✅ ditolak, DB tidak berubah |
| Editor menu: tambah/edit/hapus grup & entri | ✅ |
| Upload PNG 2 MB | ✅ masuk Storage, URL tersimpan, file kebuka publik |
| Upload 5,5 MB / `.txt` / slot ngawur | ✅ ditolak rapi, tidak ada file yatim |
| `tsc`, `eslint`, `next build` | ✅ bersih (3 warning font lama, bukan dari Fase 3) |

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
| Fail-closed: `next start` produksi TANPA `SESSION_SECRET` | ✅ cookie palsu (pakai secret fallback yang ada di repo publik) ditolak 307, login balas `?error=config` |
| Produksi DENGAN `SESSION_SECRET`: cookie sah | ✅ 200 panel jalan; cookie fallback tetap ditolak |

Belum dites: login lewat browser pakai password asli (cuma Wisnu yang tahu passwordnya —
jalur bcrypt-nya sendiri sudah terbukti lewat kasus password salah).

## Sisa kecil yang belum ditutup
- ~~`<title>` hardcoded~~ ✅ selesai 22 Agustus 2026: `app/page.tsx` pakai
  `generateMetadata()` yang baca `getSite()`, jadi judul tab ikut nama di DB. `getSite`
  dibungkus `cache()` dari React supaya metadata + body halaman tetap 1 query (dites: 2
  request = 2 query, bukan 4). `/admin` punya judul sendiri. Catatan: judul dirender di
  server, jadi tidak berubah saat toggle bahasa di klien — itu wajar, bukan bug.
- Dari checklist keamanan PLAN §9: **rate-limit login** masih kosong (satu-satunya sisa).
  Validasi Zod, validasi upload, dan DOMPurify sudah beres di Fase 3.
- **File gambar lama tidak ikut terhapus** saat diganti — menumpuk di bucket. Beresin di
  Fase 4 (hapus objek lama setelah URL baru tersimpan).
- `npm audit` melaporkan 6 kerentanan high di `sharp`/libvips, bawaan `next@16.2.10`.
  Perbaikannya menaikkan Next ke 16.3.2 — belum dilakukan, biar tidak bercampur dengan Fase 3.

## Loose ends Fase 2 — SUDAH SELESAI SEMUA (arsip)
1. **PENTING — jalankan `supabase/harden.sql`** di Supabase → SQL Editor. Sekarang kolom
   `password_hash` MASIH bisa dibaca publik pakai publishable key (kunci itu ikut terkirim
   ke browser), jadi hash-nya bisa diambil orang lalu di-brute-force offline. Setelah
   di-run, `select password_hash` dari publik harus gagal `42501`.
2. Tes login di browser: `npm run dev` → http://localhost:3000/admin/login → edit → Simpan → cek `/`.
3. `git push` (5 commit: Fase 1 + panel admin + widget chat AI + docs + fail-closed auth).
4. Set 4 env var di Vercel — **wajib keempatnya, jangan sebagian**:
   `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`,
   `SUPABASE_SECRET_KEY`, `SESSION_SECRET` (yang terakhir bikin sendiri, mis.
   `openssl rand -base64 32`). Tanpa `SESSION_SECRET` panel admin sengaja mati total
   (fail-closed), bukan diam-diam bisa dimasuki.
5. Habis deploy, cek live: nama harusnya berubah jadi "Wisnu F Dewantara" dan accent
   `#e1dfe1` — itu bukti sudah baca DB, bukan fallback hardcoded lagi.

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
