"use client";

import { useState, useRef, useEffect } from "react";

// Widget chat AI — MOCKUP. Tidak memanggil AI sungguhan: setelah kirim,
// pura-pura loading 2 detik lalu membalas pesan tetap.
// Bentuknya bubble mengapung di pojok kanan bawah; panel baru muncul
// setelah bubble diklik, supaya tidak menutupi dial.

type Msg = { role: "user" | "ai"; text: string };

const REPLY =
  "Sorry about that! I've run out of AI tokens. Hire me first and I can top them up — then we can chat properly. 🙏";

export default function AiChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const logRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Selalu gulir ke pesan terbaru.
  useEffect(() => {
    if (open) logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading, open]);

  // Fokuskan input begitu panel dibuka.
  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  // Esc menutup panel.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // Jangan tinggalkan timer menggantung kalau komponen dilepas.
  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  function send(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;
    setMessages((m) => [...m, { role: "user", text }]);
    setInput("");
    setLoading(true);
    timer.current = setTimeout(() => {
      setLoading(false);
      setMessages((m) => [...m, { role: "ai", text: REPLY }]);
    }, 2000);
  }

  return (
    <div className="ai-widget">
      {open && (
        <div className="ai-panel" role="dialog" aria-label="Chat with my AI">
          <div className="ai-panel-head">
            <span className="material-symbols-outlined ai-head-icon">smart_toy</span>
            <span className="ai-title">Ask my AI</span>
            <button
              type="button"
              className="ai-close"
              onClick={() => setOpen(false)}
              aria-label="Close chat"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          <div className="ai-log" ref={logRef}>
            {messages.length === 0 && !loading && (
              <p className="ai-empty">Ask me anything about my work.</p>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`ai-msg ${m.role}`}>
                {m.role === "ai" && (
                  <span className="material-symbols-outlined ai-ava">smart_toy</span>
                )}
                <div className="ai-bubble">{m.text}</div>
              </div>
            ))}
            {loading && (
              <div className="ai-msg ai">
                <span className="material-symbols-outlined ai-ava">smart_toy</span>
                <div className="ai-bubble ai-typing">
                  <span></span><span></span><span></span>
                </div>
              </div>
            )}
          </div>

          <form className="ai-input" onSubmit={send}>
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask my AI anything…"
              aria-label="Ask my AI anything"
            />
            <button type="submit" aria-label="Send" disabled={loading || !input.trim()}>
              <span className="material-symbols-outlined">
                {loading ? "hourglass_empty" : "send"}
              </span>
            </button>
          </form>
        </div>
      )}

      <button
        type="button"
        className="ai-fab"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label={open ? "Close AI chat" : "Open AI chat"}
      >
        <span className="material-symbols-outlined">{open ? "close" : "smart_toy"}</span>
      </button>
    </div>
  );
}
