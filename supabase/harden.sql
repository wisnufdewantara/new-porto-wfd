-- ============================================================
--  Wisnu CMS — HARDENING (jalankan sekali di Supabase SQL Editor)
--  Menutup celah: kolom password_hash tidak boleh terbaca publik.
--  Caranya: cabut SELECT tabel dari role publik, lalu beri SELECT
--  hanya untuk kolom yang aman. Secret key (service role) tak terpengaruh.
-- ============================================================

revoke select on sites from anon, authenticated;

grant select
  (id, slug, name, center_image, role, hint, about, theme, default_lang, accent, created_at, updated_at)
  on sites to anon, authenticated;

-- items aman dibaca semua kolomnya (tidak ada rahasia di sana)
-- (tidak perlu diubah)
