import type { Metadata } from "next";
import "@/styles/dial.css";

// Fallback saja. Halaman publik menimpanya lewat generateMetadata() yang baca
// DB; /admin punya judulnya sendiri.
export const metadata: Metadata = {
  title: "Portofolio",
  description: "Portofolio & CV interaktif.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      <body>
        {/* React 19 meng-hoist link ber-precedence ini ke <head> */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          precedence="default"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
        />
        <link
          rel="stylesheet"
          precedence="default"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0"
        />
        {children}
      </body>
    </html>
  );
}
