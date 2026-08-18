"use client";

import { useEffect, useRef, useState } from "react";
import type { SiteData, Lang, LayoutContent } from "@/lib/schema";
import { LayoutRenderer } from "./LayoutRenderer";
import AiChat from "./AiChat";

// Komponen interaktif utama — memegang state bahasa, tema, item terpilih,
// dan efek parallax. Data datang dari props (Fase 1: dari Supabase).

export default function DialApp({ site }: { site: SiteData }) {
  const [lang, setLang] = useState<Lang>(site.defaultLang);
  const [theme, setTheme] = useState<"light" | "dark">(site.theme);
  const [switching, setSwitching] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null); // "about" | item.id | null

  const dialRef = useRef<HTMLDivElement>(null);
  const openIdRef = useRef<string | null>(null);

  // ---- Ganti bahasa dengan crossfade blur ----
  function changeLang(next: Lang) {
    if (next === lang) return;
    setSwitching(true);
    setTimeout(() => {
      setLang(next);
      setSwitching(false);
    }, 260);
  }

  function toggle(id: string) {
    setOpenId((cur) => (cur === id ? null : id));
  }

  // ---- Simpan openId ke ref + reset kemiringan saat popup dibuka ----
  useEffect(() => {
    openIdRef.current = openId;
    if (openId && dialRef.current) dialRef.current.style.transform = "";
  }, [openId]);

  // ---- Tutup dengan Escape ----
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenId(null);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  // ---- Parallax 3D (listener dipasang sekali) ----
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let ready = false;
    const t = setTimeout(() => (ready = true), 2200);
    const onMove = (e: MouseEvent) => {
      if (!ready || openIdRef.current || !dialRef.current) return;
      const dx = (e.clientX - window.innerWidth / 2) / (window.innerWidth / 2);
      const dy = (e.clientY - window.innerHeight / 2) / (window.innerHeight / 2);
      dialRef.current.style.transform =
        `rotateX(${(-dy * 7).toFixed(2)}deg) rotateY(${(dx * 7).toFixed(2)}deg) ` +
        `translate(${(dx * 8).toFixed(1)}px, ${(dy * 8).toFixed(1)}px)`;
    };
    const onLeave = () => {
      if (dialRef.current) dialRef.current.style.transform = "";
    };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseleave", onLeave);
    return () => {
      clearTimeout(t);
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  // ---- Konten & ikon popup yang sedang terbuka ----
  const openItem = openId && openId !== "about" ? site.items.find((i) => i.id === openId) : null;
  const openContent: LayoutContent | null =
    openId === "about" ? site.about : openItem?.content ?? null;
  const openIcon = openId === "about" ? "person" : openItem?.icon;

  return (
    <div className={`app ${switching ? "lang-switching" : ""}`} data-theme={theme}>
      {/* Theme switch */}
      <div className="theme-switch">
        <button
          type="button"
          className="switch"
          onClick={() => setTheme((t) => (t === "light" ? "dark" : "light"))}
          aria-label="Ganti tema terang/gelap"
        >
          <span className="material-symbols-outlined">light_mode</span>
          <span className="material-symbols-outlined">dark_mode</span>
        </button>
      </div>

      {/* Language switch */}
      <div className="lang-switch">
        <button className={lang === "id" ? "active" : ""} onClick={() => changeLang("id")}>ID</button>
        <button className={lang === "en" ? "active" : ""} onClick={() => changeLang("en")}>EN</button>
      </div>

      {/* Dial */}
      <main className="stage i18n-fade">
        <div
          className="dial"
          ref={dialRef}
          style={{ ["--total"]: site.items.length } as React.CSSProperties}
        >
          <button
            type="button"
            className={`center ${openId === "about" ? "selected" : ""}`}
            onClick={() => toggle("about")}
            aria-label={site.about.title[lang]}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={site.centerImage} alt={site.name} />
            <span className="tip">{site.about.title[lang]}</span>
          </button>

          {site.items.map((item, idx) => (
            <button
              type="button"
              key={item.id}
              className={`avatar ${openId === item.id ? "selected" : ""}`}
              style={{ ["--i"]: idx + 1 } as React.CSSProperties}
              onClick={() => toggle(item.id)}
              aria-label={item.label[lang]}
            >
              {item.kind === "photo" && item.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.image} alt="" />
              ) : (
                <span className="material-symbols-outlined icon">{item.icon}</span>
              )}
              <span className="tip">{item.label[lang]}</span>
            </button>
          ))}
        </div>

        <div className="identity">
          <h1>{site.name}</h1>
          <p className="role i18n-fade">{site.role[lang]}</p>
          <p className="hint i18n-fade">{site.hint[lang]}</p>
        </div>
      </main>

      {/* Popup / dialog */}
      <div
        className={`modal-overlay ${openId ? "open" : ""}`}
        onClick={(e) => {
          if (e.target === e.currentTarget) setOpenId(null);
        }}
      >
        <div className="modal i18n-fade" role="dialog" aria-modal="true">
          <button className="panel-close" onClick={() => setOpenId(null)} aria-label="Tutup">
            <span className="material-symbols-outlined">close</span>
          </button>
          {openContent && <LayoutRenderer content={openContent} lang={lang} icon={openIcon} />}
        </div>
      </div>

      <p className="credit">Wisnu CMS</p>

      {/* Widget chat AI (mockup) */}
      <AiChat />
    </div>
  );
}
