// SEMENTARA — dipakai untuk menangkap alasan DOMPurify gagal dimuat di runtime
// Vercel, yang di lokal tidak pernah terjadi. Hapus setelah penyebabnya ketahuan.
// Tidak membocorkan rahasia: hanya versi Node dan pesan error pemuatan modul.

export const dynamic = "force-dynamic";

type Diag = Record<string, unknown>;

function describe(err: unknown): Diag {
  const e = err as { name?: string; message?: string; code?: string; stack?: string };
  return {
    name: e?.name ?? null,
    message: e?.message ?? String(err),
    code: e?.code ?? null,
    stack: e?.stack?.split("\n").slice(0, 8) ?? null,
  };
}

export async function GET() {
  const out: Diag = {
    node: process.version,
    platform: process.platform,
    arch: process.arch,
  };

  // Wrapper-nya
  try {
    const mod = await import("isomorphic-dompurify");
    const DP = (mod.default ?? mod) as { sanitize?: (s: string, c?: unknown) => string };
    out.isomorphicDompurify = "ok";
    out.sanitizeType = typeof DP.sanitize;
    try {
      out.sample = DP.sanitize?.('<a href="https://x.test" target="_blank">x</a>');
    } catch (err) {
      out.sanitizeError = describe(err);
    }
  } catch (err) {
    out.isomorphicDompurify = "GAGAL";
    out.isomorphicDompurifyError = describe(err);
  }

  // jsdom langsung — untuk memisahkan: yang bermasalah jsdom-nya atau wrappernya?
  try {
    // @ts-expect-error jsdom tidak punya berkas tipe; di sini kita cuma menguji
    // apakah modulnya bisa dimuat, bukan memakai API-nya.
    await import("jsdom");
    out.jsdom = "ok";
  } catch (err) {
    out.jsdom = "GAGAL";
    out.jsdomError = describe(err);
  }

  return Response.json(out);
}
