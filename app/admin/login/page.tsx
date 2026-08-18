import { login } from "../actions";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  if (await getSession()) redirect("/admin");
  const sp = await searchParams;

  return (
    <div className="admin-login">
      <form action={login} className="card">
        <h1>Panel Admin</h1>
        <p className="sub">Masuk untuk mengedit portofolio</p>
        {sp.error === "1" && <p className="err">Password salah.</p>}
        {sp.error === "config" && (
          <p className="err">Server belum dikonfigurasi (SUPABASE_SECRET_KEY belum diisi).</p>
        )}
        <input type="password" name="password" placeholder="Password" autoFocus required />
        <button type="submit" className="btn">Masuk</button>
      </form>
    </div>
  );
}
