// Maneki neko digambar tangan sebagai SVG, bukan dipasang sebagai gambar.
// Alasannya dua, dan keduanya tidak bisa dicapai oleh berkas PNG:
//   1. garisnya memakai `currentColor`, jadi ikut warna aksen situs dan
//      berubah putih sendiri di mode gelap, persis seperti ikon lainnya;
//   2. tangannya berdiri sendiri sebagai <g class="neko-arm">, sehingga yang
//      melambai benar-benar tangannya — bukan seluruh badan ikut miring.
//
// Ditahan sengaja sederhana: pada 52px (dan 34px di layar kecil) kumis, mulut,
// dan kaki menggumpal jadi noda gelap, jadi yang disisakan hanya ciri yang
// membuat maneki neko dikenali — telinga, mata menyipit, lonceng, tangan naik.

export default function ManekiNeko() {
  return (
    <svg
      className="neko"
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {/* badan, muncul dari balik kepala */}
      <path d="M14.6 22.6c-3.4 2.9-5.2 7.4-4.6 11.9.3 2 2 3.5 4 3.5h14c2 0 3.7-1.5 4-3.5.6-4.5-1.2-9-4.6-11.9" />
      {/* telinga */}
      <path d="M14.9 10 12.6 5.4 18.3 7.4" />
      <path d="M27.1 10 29.4 5.4 23.7 7.4" />
      {/* kepala */}
      <circle cx="21" cy="15.6" r="7.8" />
      {/* mata menyipit senang */}
      <path d="M17.6 15c.6-.8 1.6-.8 2.2 0" />
      <path d="M22.2 15c.6-.8 1.6-.8 2.2 0" />
      {/* lonceng */}
      <circle cx="21" cy="27.6" r="2.1" />
      {/* tangan yang melambai */}
      <g className="neko-arm">
        <path d="M29.8 25c4.2-.7 6.9-4.3 6.1-8.1" />
        <circle cx="36.8" cy="14.2" r="2.8" />
      </g>
    </svg>
  );
}
