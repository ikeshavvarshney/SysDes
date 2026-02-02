"use client";

import { useEffect, useState } from "react";

export default function IntroCarousel({
  storageKey,
  slides = [],
  autoSlideInterval = 5000,
}) {
  const [visible, setVisible] = useState(true);
  const [index, setIndex] = useState(0);

  // Check first visit
  // useEffect(() => {
  //   const seen = localStorage.getItem(storageKey);
  //   if (!seen) setVisible(true);
  // }, [storageKey]);

  // Auto slide
  useEffect(() => {
    if (!visible) return;

    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length);
    }, autoSlideInterval);

    return () => clearInterval(timer);
  }, [visible, slides.length, autoSlideInterval]);

  if (!visible || slides.length === 0) return null;

  const close = () => {
    localStorage.setItem(storageKey, "true");
    setVisible(false);
  };

  const prev = () =>
    setIndex((i) => (i === 0 ? slides.length - 1 : i - 1));
  const next = () =>
    setIndex((i) => (i + 1) % slides.length);

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm" />

      {/* Carousel */}
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
        <div className="relative w-full max-w-4xl h-[60vh] bg-[#050B1E] border border-white/10 rounded-xl shadow-2xl overflow-hidden">

          {/* Close */}
          <button
            onClick={close}
            className="absolute top-4 right-4 text-slate-400 hover:text-white text-lg"
          >
            ✕
          </button>

          {/* Content */}
          <div className="h-full flex items-center justify-center px-10 text-center">
            <div>
              <h3 className="text-2xl font-semibold mb-4">
                {slides[index].title}
              </h3>
              <p className="text-slate-400 max-w-xl mx-auto">
                {slides[index].description}
              </p>
            </div>
          </div>

          {/* Controls */}
          <button
            onClick={prev}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-2xl"
          >
            ‹
          </button>
          <button
            onClick={next}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-2xl"
          >
            ›
          </button>

          {/* Dots */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {slides.map((_, i) => (
              <div
                key={i}
                className={`h-2 w-2 rounded-full ${
                  i === index ? "bg-emerald-400" : "bg-white/20"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
