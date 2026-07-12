-- ============================================================
--  Wisnu CMS — skema database (Fase 1)
--  Tempel & Run di Supabase → SQL Editor.
--  Aman dijalankan ulang (pakai IF NOT EXISTS / drop policy).
-- ============================================================

-- ---- Tabel situs (nanti: satu baris = satu klien) ----
create table if not exists sites (
  id             uuid primary key default gen_random_uuid(),
  slug           text unique not null,
  name           text not null,
  password_hash  text not null default 'PENDING',  -- diisi di Fase 2 (login)
  center_image   text,
  role           jsonb not null default '{"id":"","en":""}',
  hint           jsonb not null default '{"id":"","en":""}',
  about          jsonb not null default '{}',       -- LayoutContent (popup foto tengah)
  theme          text not null default 'light',
  default_lang   text not null default 'id',
  accent         text not null default '#0ea5e9',
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- ---- Tabel item melingkar (maks 20 per situs) ----
create table if not exists items (
  id           uuid primary key default gen_random_uuid(),
  site_id      uuid not null references sites(id) on delete cascade,
  position     int  not null,
  kind         text not null,           -- 'icon' | 'photo'
  icon_name    text,
  image_url    text,
  label        jsonb not null,          -- {"id":"","en":""}
  layout       text not null,           -- 'blank' | 'photo' | 'menu' | 'html'
  content      jsonb not null default '{}',
  is_published boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists items_site_pos_idx on items (site_id, position);

-- ---- Row Level Security: siapa pun boleh BACA (halaman publik) ----
--     Tulis/ubah baru dibuka untuk admin di Fase 2 (lewat server + secret key).
alter table sites enable row level security;
alter table items enable row level security;

drop policy if exists "public read sites" on sites;
create policy "public read sites" on sites for select using (true);

drop policy if exists "public read items" on items;
create policy "public read items" on items for select using (true);
