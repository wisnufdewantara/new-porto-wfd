# Rencana Teknis — Wisnu CMS

Portfolio "dial" interaktif yang **bisa diedit lewat CMS** (login password),
dirancang untuk situs pribadi dulu, **tapi siap tumbuh jadi produk multi-tenant**
(dijual ke restoran, dll).

> Status: **RENCANA — belum ada kode.** Dokumen ini untuk di-review dulu.

---

## 1. Tujuan

- Admin bisa: pilih **foto tengah**, tambah **maksimal 20 item** melingkar (tiap item
  **ikon atau foto**), dan atur isi popup tiap item.
- Tiap popup punya pilihan **layout**: `blank`, `dengan foto`, `menu bersusun`
  (untuk restoran), atau `HTML custom`.
- Tetap dwibahasa (ID/EN) + tema terang/gelap + animasi intro/floating/parallax
  yang sudah ada.
- Login cukup **password** (untuk sekarang).

---

## 2. Stack & alasan

| Kebutuhan | Teknologi | Alasan |
|-----------|-----------|--------|
| Framework (frontend + admin + API) | **Next.js (App Router) + TypeScript** | Satu codebase untuk halaman publik, panel admin, dan API. Deploy mulus ke Vercel. TypeScript penting untuk produk. |
| Database | **Supabase (Postgres)** | Gratis untuk mulai, relasional, siap multi-tenant lewat RLS. |
| Penyimpanan gambar | **Supabase Storage** | Satu ekosistem dengan DB. |
| Login | Password hashed (sekarang) → **Supabase Auth** (nanti) | Mulai simpel, upgrade tanpa bongkar. |
| Validasi data | **Zod** | Menjaga bentuk `content` JSON tiap layout tetap benar. |
| Sanitasi HTML | **DOMPurify** (server-side) | Cegah XSS dari layout HTML custom. |
| Styling dial & animasi | **CSS murni** (port dari `wisnu-web`) | Pertahankan animasi kompleks yang sudah jalan; jangan ditulis ulang. |
| Styling form admin | **Tailwind** (opsional) | Cepat untuk UI editor. |
| Hosting | **Vercel** | Sesuai rencana awal. |

**Biaya MVP: Rp0** (free tier Vercel + Supabase).

---

## 3. Arsitektur (gambaran)

```
                 ┌──────────────────────────── Vercel (Next.js) ───────────────────────────┐
  Pengunjung ──▶ │  Halaman publik  /            → SSR: ambil data situs+item dari Supabase │
                 │                               → render <Dial/> (desain sekarang)          │
                 │                                                                           │
  Admin      ──▶ │  /admin/login  (password)     → cookie sesi (httpOnly, signed)           │
                 │  /admin        (editor)        → Server Actions / API                     │
                 └───────────────┬───────────────────────────────┬───────────────────────────┘
                                 │                                │
                          ┌──────▼──────┐                  ┌──────▼───────┐
                          │  Postgres   │                  │   Storage    │
                          │ sites,items │                  │  gambar2     │
                          └─────────────┘                  └──────────────┘
```

---

## 4. Data model (skema DB)

Semua digantung ke `site_id` → itu kunci "siap multi-tenant". Sekarang cuma 1 baris
`sites` (punyamu); jadi produk = tambah baris + auth, **bukan tulis ulang**.

```sql
-- Satu baris = satu situs (nanti: satu klien)
create table sites (
  id             uuid primary key default gen_random_uuid(),
  slug           text unique not null,          -- 'wisnu' (untuk subdomain/path nanti)
  name           text not null,
  password_hash  text not null,                 -- bcrypt
  center_image   text,                          -- URL foto tengah (Supabase Storage)
  theme          text default 'light',          -- 'light' | 'dark'
  default_lang   text default 'id',             -- 'id' | 'en'
  accent_color   text default '#0ea5e9',
  created_at     timestamptz default now(),
  updated_at     timestamptz default now()
);

-- Item melingkar (maks 20 per situs, dijaga di app + trigger opsional)
create table items (
  id           uuid primary key default gen_random_uuid(),
  site_id      uuid not null references sites(id) on delete cascade,
  position     int  not null,                   -- urutan di lingkaran (1..20)
  kind         text not null,                   -- 'icon' | 'photo'
  icon_name    text,                            -- nama Material Symbol (jika kind='icon')
  image_url    text,                            -- URL foto (jika kind='photo')
  label        jsonb not null,                  -- {"id":"Menu","en":"Menu"} → tooltip
  layout       text not null,                   -- 'blank' | 'photo' | 'menu' | 'html'
  content      jsonb not null default '{}',     -- isi popup (bentuk sesuai layout, lihat §5)
  is_published boolean default true,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

create index on items (site_id, position);

-- (FASE MULTI-TENANT NANTI) akun & keanggotaan
-- create table users (...);         -- via Supabase Auth
-- create table memberships (user_id, site_id, role);
-- + Row Level Security per site_id
```

---

## 5. Bentuk `content` per layout (divalidasi Zod)

Field bilingual selalu `{"id": "...", "en": "..."}`.

```jsonc
// layout: "blank"
{ "title": {"id":"","en":""}, "body": {"id":"","en":""} }

// layout: "photo"
{ "title": {...}, "image_url": "https://...", "body": {...} }

// layout: "menu"  (untuk restoran)
{
  "title": {...},
  "header_image": "https://...",          // opsional
  "groups": [
    {
      "name": {"id":"Makanan","en":"Food"},
      "items": [
        { "name":{...}, "price":"25.000", "desc":{...}, "image_url":"https://..." }
      ]
    }
  ]
}

// layout: "html"  (disanitasi DOMPurify saat render)
{ "title": {...}, "html": {"id":"<div>...</div>","en":"<div>...</div>"} }
```

Nambah layout baru di masa depan = tambah satu tipe Zod + satu komponen renderer.
Tidak perlu migrasi DB (karena `content` fleksibel JSONB).

---

## 6. Auth

**Sekarang (password-only, 1 admin per situs):**
1. `/admin/login` → kirim password → server bandingkan dengan `password_hash` (bcrypt).
2. Kalau cocok → set cookie sesi **httpOnly + signed** (JWT/iron-session), masa berlaku mis. 7 hari.
3. Semua route `/admin/*` & API tulis dicek cookie-nya (middleware).
4. **Rate-limit** percobaan login (cegah brute force).

**Nanti (produk multi-tenant):** ganti ke **Supabase Auth** (email+password / magic link),
tabel `memberships` + **RLS** supaya tiap klien hanya lihat datanya sendiri.
Data model sudah siap → migrasi mulus.

---

## 7. Gambar / Storage

- Upload lewat API → simpan ke **Supabase Storage** bucket `public-images/`.
- Validasi: tipe (`jpg/png/webp`), ukuran maks (mis. 5 MB), auto-resize opsional.
- DB simpan **URL**-nya saja, bukan file.

---

## 8. i18n

- Pertahankan pendekatan sekarang: field bilingual `{id, en}`.
- Toggle bahasa di sisi klien (crossfade blur seperti sekarang) — datanya sudah dua bahasa.
- Bahasa default per situs disimpan di `sites.default_lang`.

---

## 9. Keamanan (checklist)

- [ ] Password di-hash **bcrypt**, tidak pernah dikirim ke klien.
- [ ] Sesi via cookie **httpOnly, Secure, SameSite**.
- [ ] **Rate-limit** login.
- [ ] Layout HTML custom **disanitasi DOMPurify** (server-side) — atau render dalam `<iframe sandbox>`.
- [ ] Validasi semua input tulis dengan **Zod**.
- [ ] Validasi upload gambar (tipe & ukuran).
- [ ] (Multi-tenant) **RLS** Postgres per `site_id`.
- [ ] Batas keras **20 item** dijaga di server, bukan cuma UI.

---

## 10. Struktur folder (Next.js App Router)

```
wisnu-cms/
├─ app/
│  ├─ page.tsx                 # halaman dial publik (SSR)
│  ├─ layout.tsx
│  ├─ admin/
│  │  ├─ login/page.tsx
│  │  ├─ page.tsx              # dashboard editor
│  │  └─ items/[id]/page.tsx   # edit satu item
│  └─ api/
│     ├─ login/route.ts
│     ├─ items/route.ts        # CRUD item
│     ├─ site/route.ts         # setting situs (foto tengah, tema)
│     └─ upload/route.ts       # upload gambar
├─ components/
│  ├─ dial/                    # Dial, Avatar, Modal (port dari wisnu-web)
│  ├─ layouts/                 # BlankLayout, PhotoLayout, MenuLayout, HtmlLayout
│  └─ admin/                   # widget editor (ItemForm, IconPicker, ImageUploader, …)
├─ lib/
│  ├─ supabase.ts              # client DB/Storage
│  ├─ auth.ts                  # sesi & guard
│  ├─ sanitize.ts              # DOMPurify
│  └─ schema.ts                # tipe & Zod (site, item, tiap content layout)
├─ styles/
│  └─ dial.css                 # CSS animasi dari wisnu-web (dipertahankan)
├─ public/
├─ .env.local                  # kunci Supabase (tidak di-commit)
├─ package.json
└─ next.config.js
```

---

## 11. Rencana bertahap (tiap fase ada hasil yang bisa dilihat)

| Fase | Isi | "Selesai" kalau… |
|------|-----|------------------|
| **0. Renderer** | Scaffold Next.js + TS. Port desain `wisnu-web` jadi `<Dial/>` yang baca **JSON hardcoded** (belum DB). | Halaman publik tampil identik dg sekarang, tapi digerakkan data JSON. |
| **1. Baca dari DB** | Pasang Supabase, buat tabel, isi 1 situs contoh. Halaman publik ambil dari DB. | Ubah data di Supabase → halaman ikut berubah. |
| **2. Login + editor dasar** | Login password + `/admin`: atur foto tengah, tambah/hapus/urutkan item (maks 20), pilih ikon atau upload foto, label ID/EN. | Bisa kelola item tanpa sentuh DB manual. |
| **3. Sistem layout** | 4 layout popup + editor kontennya + upload gambar per layout. | Tiap item bisa dipilih layout & diisi; popup publik menampilkannya. |
| **4. Poles** | Drag-reorder, **preview live** di editor, validasi, empty-state, loading. | Nyaman dipakai orang non-teknis. |
| **5. (Opsional) Produk** | Subdomain/slug per klien, Supabase Auth, RLS, billing. | Bisa onboarding klien baru mandiri. |

**Perkiraan ukuran:** Fase 0–4 ≈ **5–7×** dari situs statis sekarang, terpecah rapi.
Tiap fase aman untuk berhenti & lihat hasil.

---

## 12. Keputusan (SUDAH DIKUNCI ✔)

1. **Ikon** → ✔ Material Symbols, **satu varian saja** (Outlined) + picker dengan search.
2. **HTML custom** → ✔ **DOMPurify** (sanitasi server-side).
3. **Preview live** di editor → ✔ **Fase 4** (belum di fase awal).
4. **Bahasa** → ✔ **TypeScript**.
5. **Domain** → ✔ **Subdomain Vercel dulu** (akun Vercel belum dibuat — baru diperlukan saat deploy di akhir sebuah fase, jadi belum mendesak).

Kredensial Supabase (sudah ada):
- Project URL: `https://yfjwrqpvvuaqmfdoudct.supabase.co`
- Publishable key: dipakai di client (aman publik, RLS wajib on).
- **Secret key**: diisi sendiri oleh Wisnu ke `.env.local` (tidak di-commit, tidak dibagikan). **Rotate** karena sempat ter-paste di chat.

---

## 13. Yang TIDAK berubah

Seluruh "rasa" visual — dial, animasi intro/floating/parallax, tema, i18n, popup —
**dipertahankan**. CMS ini membungkusnya dengan data + editor, bukan menggantinya.
```
