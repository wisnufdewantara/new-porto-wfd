import { createClient } from "@supabase/supabase-js";

// Client publik (publishable key) — hanya untuk BACA data ber-RLS.
// Operasi tulis (Fase 2) akan pakai client server terpisah + secret key.
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export const supabase =
  url && key ? createClient(url, key) : null;
