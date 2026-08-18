import { createClient } from "@supabase/supabase-js";

// Client SERVER-ONLY dengan secret key — bypass RLS untuk operasi tulis.
// JANGAN pernah diimpor dari komponen client. Null jika secret belum diisi.
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const secret = process.env.SUPABASE_SECRET_KEY;

export const supabaseAdmin =
  url && secret
    ? createClient(url, secret, { auth: { persistSession: false } })
    : null;
