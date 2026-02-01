"use client";

import { useState } from "react";

export default function Chatbot() {
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: "bot", text: "Hey. Ask me anything about your system." },
    ]);
    const [input, setInput] = useState("");

    const sendMessage = () => {
        if (!input.trim()) return;

        setMessages((prev) => [
            ...prev,
            { role: "user", text: input },
            { role: "bot", text: "Processing… (AI not wired yet)" },
        ]);
        setInput("");
    };

    return (
        <>
            {/* CHAT WINDOW */}
            {open && (
                <div className="fixed bottom-24 right-6 z-100 w-[90vw] max-w-sm h-105 bg-[#050B1E] border border-white/10 rounded-xl shadow-xl flex flex-col overflow-hidden">

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
                    <div className="flex-1 px-4 py-3 space-y-3 overflow-y-auto text-sm">
                        {messages.map((msg, i) => (
                            <div
                                key={i}
                                className={`max-w-[80%] px-3 py-2 rounded-lg ${msg.role === "user"
                                        ? "ml-auto bg-emerald-500/20 text-emerald-300"
                                        : "bg-white/5 text-slate-300"
                                    }`}
                            >
                                {msg.text}
                            </div>
                        ))}
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
            )}

            {/* FLOATING BUTTON */}
            {!open ? (
                <button
                    onClick={() => setOpen((prev) => !prev)}
                    className="fixed bottom-6 right-6 z-100 w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 hover:bg-emerald-500/30 transition shadow-lg"
                >💬</button>) : (
                <button
                    onClick={() => setOpen((prev) => !prev)}
                    className="fixed bottom-6 right-6 z-100 w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 hover:bg-emerald-500/30 transition shadow-lg"
                >
                    ✕
                </button>)
            }
        </>
    );
}
