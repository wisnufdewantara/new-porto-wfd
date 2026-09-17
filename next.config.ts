import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
