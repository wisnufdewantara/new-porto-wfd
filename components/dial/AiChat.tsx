"use client";

import { useState, useRef, useEffect } from "react";

// Widget chat AI — MOCKUP. Tidak memanggil AI sungguhan: setelah kirim,
// pura-pura loading 2 detik lalu membalas pesan Singlish.

type Msg = { role: "user" | "ai"; text: string };

const REPLY =
  "Aiyo, paiseh ah! 😅 My AI tokens all habis liao. Hire me first, then confirm can refill, and we chat properly, can? 🙏";

export default function AiChat() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  function send(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;
    setMessages((m) => [...m, { role: "user", text }]);
    setInput("");
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setMessages((m) => [...m, { role: "ai", text: REPLY }]);
    }, 2000);
  }

  const hasConvo = messages.length > 0 || loading;

  return (
    <div className="ai-chat">
      {hasConvo && (
        <div className="ai-log" ref={logRef}>
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
      )}

      <form className="ai-input" onSubmit={send}>
        <span className="material-symbols-outlined ai-hint-icon">smart_toy</span>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask my AI anything…"
          aria-label="Ask my AI anything"
        />
        <button type="submit" aria-label="Kirim" disabled={loading || !input.trim()}>
          <span className="material-symbols-outlined">
            {loading ? "hourglass_empty" : "send"}
          </span>
        </button>
      </form>
    </div>
  );
}
