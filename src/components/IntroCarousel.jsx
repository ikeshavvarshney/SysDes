"use client";

import { useEffect, useState, useRef } from "react";

export default function IntroCarousel({
  storageKey,
  heading = "Introduction",
  slides = [],
  autoSlideInterval = 5000,
}) {
  // ✅ Correct initial visibility (NO FLASH)
  const [visible, setVisible] = useState(() => {
    if (typeof window === "undefined") return false;
    if (!storageKey) return true;
    return localStorage.getItem(storageKey) !== "true";
  });

  const [index, setIndex] = useState(0);
  const [fade, setFade] = useState(true);
  const timeoutRef = useRef(null);
  const intervalRef = useRef(null);

  // Cleanup helpers
  const clearTimers = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  // Auto slide (safe + stable)
  useEffect(() => {
    if (!visible || slides.length <= 1) return;

    intervalRef.current = setInterval(() => {
      setFade(false);

      timeoutRef.current = setTimeout(() => {
        setIndex((i) => (i + 1) % slides.length);
        setFade(true);
      }, 150);
    }, autoSlideInterval);

    return clearTimers;
  }, [visible, slides, autoSlideInterval]);

  // Close modal
  const close = () => {
    if (storageKey) {
      localStorage.setItem(storageKey, "true");
    }
    clearTimers();
    setVisible(false);
  };

  const goTo = (nextIndex) => {
    setFade(false);
    timeoutRef.current = setTimeout(() => {
      setIndex(nextIndex);
      setFade(true);
    }, 150);
  };

  const prev = () =>
    goTo(index === 0 ? slides.length - 1 : index - 1);

  const next = () =>
    goTo((index + 1) % slides.length);

  if (!visible || slides.length === 0) return null;

  const current = slides[index];

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm" />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
        <div
          className="
            relative w-full max-w-4xl h-[60vh]
            bg-[#050B1E] border border-white/10 rounded-xl shadow-2xl
            flex flex-col overflow-hidden
          "
        >
          {/* Close */}
          <button
            onClick={close}
            className="absolute top-4 right-4 text-slate-400 hover:text-white transition"
            aria-label="Close"
          >
            ✕
          </button>

          {/* Header */}
          <div className="h-16 border-b border-white/10 flex items-center justify-center px-6">
            <h2 className="text-xl md:text-2xl font-semibold text-slate-200">
              {heading}
            </h2>
          </div>

          {/* Content */}
          <div className="flex-1 flex items-center justify-center px-10 text-center">
            <div
              className={`max-w-2xl transition-opacity duration-200 ${
                fade ? "opacity-100" : "opacity-0"
              }`}
            >
              {current.heading && (
                <h3 className="text-2xl font-semibold text-emerald-400 mb-3">
                  {current.heading}
                </h3>
              )}

              {current.title && (
                <p className="text-sm uppercase tracking-wide text-slate-400 mb-4">
                  {current.title}
                </p>
              )}

              {current.description && (
                <p className="text-slate-300 leading-relaxed">
                  {current.description}
                </p>
              )}
            </div>
          </div>

          {/* Controls */}
          {slides.length > 1 && (
            <>
              <button
                onClick={prev}
                className="
                  absolute left-4 top-1/2 -translate-y-1/2
                  text-slate-400 hover:text-white text-2xl
                  transition-transform hover:-translate-x-1
                "
              >
                ‹
              </button>

              <button
                onClick={next}
                className="
                  absolute right-4 top-1/2 -translate-y-1/2
                  text-slate-400 hover:text-white text-2xl
                  transition-transform hover:translate-x-1
                "
              >
                ›
              </button>
            </>
          )}

          {/* Dots */}
          <div className="h-12 flex items-center justify-center gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={`h-2 w-2 rounded-full transition-all duration-200 ${
                  i === index
                    ? "bg-emerald-400 scale-125"
                    : "bg-white/20"
                }`}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
