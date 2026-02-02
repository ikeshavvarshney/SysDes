"use client";

import { useState, useRef, useEffect } from "react";

// -------------------------------
// Utility: format bot text to bullets
// -------------------------------
const formatBotText = (text) => {
  if (!text) return [];

  const points = text
    .replace(/\n/g, " ")
    .split(/[*•-]\s+/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);

  return points.length <= 1 ? [text] : points;
};

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "bot", text: "Hey. Ask me anything about your system." },
  ]);
  const [input, setInput] = useState("");

  const messagesEndRef = useRef(null);

  // -------------------------------
  // Auto scroll to bottom
  // -------------------------------
  // dep
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, open]);

  // -------------------------------
  // Send message
  // -------------------------------
  const sendMessage = async () => {
    if (!input.trim()) return;

    const userText = input;
    setInput("");

    setMessages((prev) => [...prev, { role: "user", text: userText }]);

    // --- UPDATED SECTION ---
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";
    // -----------------------

    try {
      const res = await fetch(
        `${API_URL}/api/chatbot/suggest`, // Uses dynamic URL
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userMessage: userText }),
        }
      );

      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          text: data.reply,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: "Server not responding." },
      ]);
    }
  };

  return (
    <>
      {/* ============================= */}
      {/* CHAT WINDOW (Animated) */}
      {/* ============================= */}
      <div
        className={`
          fixed bottom-24 right-6 z-100
          w-[90vw] max-w-sm h-105
          bg-[#050B1E] border border-white/10
          rounded-xl shadow-xl
          flex flex-col overflow-hidden
          transition-all duration-300 ease-out
          ${open
            ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
            : "opacity-0 scale-95 translate-y-4 pointer-events-none"}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
          <h3 className="text-sm font-semibold text-slate-200">
            SYSTEM ASSIST
          </h3>
          <button
            onClick={() => setOpen(false)}
            className="text-slate-400 hover:text-white transition"
          >
            ✕
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 px-4 py-3 space-y-4 overflow-y-auto text-sm">
          {messages.map((msg, i) => (
            <div key={i} className="space-y-2">
              {/* User */}
              {msg.role === "user" && (
                <div className="ml-auto max-w-[80%] px-3 py-2 rounded-lg bg-emerald-500/20 text-emerald-300">
                  {msg.text}
                </div>
              )}

              {/* Bot */}
              {msg.role === "bot" && (
                <div className="max-w-[80%] px-3 py-2 rounded-lg bg-white/5 text-slate-300 space-y-2">
                  {formatBotText(msg.text).map((point, idx) => (
                    <div key={idx} className="flex gap-2">
                      <span className="text-emerald-400">•</span>
                      <span>{point}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Auto-scroll anchor */}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-white/10 p-3 flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Ask something…"
            className="flex-1 rounded-lg bg-black/40 border border-white/10 px-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-400"
          />
          <button
            onClick={sendMessage}
            className="px-4 py-2 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition text-sm"
          >
            Send
          </button>
        </div>
      </div>

      {/* ============================= */}
      {/* FLOATING TOGGLE BUTTON */}
      {/* ============================= */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        className={`
          fixed bottom-6 right-6 z-100
          w-14 h-14 rounded-full
          bg-emerald-500/20 border border-emerald-400/40
          flex items-center justify-center text-emerald-400
          shadow-lg
          transition-all duration-300 ease-out
          hover:bg-emerald-500/30
          ${open ? "rotate-90 scale-90" : "rotate-0 scale-100"}
        `}
      >
        {open ? "✕" : "💬"}
      </button>
    </>
  );
}