import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // isomorphic-dompurify menarik jsdom. Kalau paketnya ikut di-bundle, require
  // jsdom-nya jadi external yang tidak selalu ikut ter-trace ke serverless —
  // hasilnya modul gagal saat import dan SEMUA route balas 500 di Vercel,
  // padahal `next start` lokal aman. Dijadikan external biar di-require asli
  // dari node_modules dan ikut ter-trace utuh.
  serverExternalPackages: ["isomorphic-dompurify", "jsdom"],
  experimental: {
    serverActions: {
      // Upload gambar lewat server action; default Next cuma 1 MB, padahal
      // batas produk kita 5 MB. Dilebihkan sedikit untuk overhead multipart
      // (boundary + header part), sesuai catatan dokumen Next.
      bodySizeLimit: "6mb",
    },
  },
  /* config options here */
};

export default nextConfig;
