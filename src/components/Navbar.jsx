"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Navbar({ py=4 }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const [isSignedIn, setIsSignedIn] = useState(false);
//sd
  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsSignedIn(!!token);
  }, []);
  return (
    <>
      {/* NAVBAR */}
      <header className={`sticky top-0 z-50 flex items-center justify-between px-6 md:px-16 py-${py} border-b border-white/10 bg-[#050B1E]/80 backdrop-blur`}>

        {/* Logo */}
        <div className="flex items-center gap-3">
          <img src="/favicon.svg" width={32} alt="" />
          <h1 className="text-lg font-semibold tracking-wide">
            SYSTEM <span className="text-emerald-400">SKETCH</span>
          </h1>
        </div>

        {/* Center nav */}
        {isSignedIn && (
          <nav className="hidden md:flex gap-10 text-sm text-slate-400">
            <Link href="/design"><span className="hover:text-blue-400 cursor-pointer">Design</span></Link>
            <Link href="/security"><span className="hover:text-emerald-400 cursor-pointer">Security</span></Link>
            <Link href="/automation"><span className="hover:text-pink-400 cursor-pointer">Automation</span></Link>
          </nav>
        )}

        {/* Right side */}
        <div className="flex items-center gap-3">
          {!isSignedIn ? (
            <>
              <Link href="/auth?mode=login"><button className="text-sm text-slate-400 hover:text-white">
                Login
              </button></Link>
              <Link href="/auth?mode=signup"><button className="px-4 py-2 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30">
                Sign Up
              </button></Link>
            </>
          ) : (
            <div
              onClick={() => setOpen(true)}
              className="w-9 h-9 rounded-full border border-white/20 flex items-center justify-center text-sm font-medium text-slate-300 hover:border-emerald-400 hover:text-emerald-400 cursor-pointer"
            >
              K
            </div>
          )}
        </div>
      </header>

      {/* OVERLAY */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 bg-black/60 z-40"
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`fixed top-0 right-0 z-50 h-full w-72 bg-[#050B1E] border-l border-white/10 transform transition-transform duration-300 ${open ? "translate-x-0" : "translate-x-full"
          }`}
      >
        <div className="flex flex-col h-full p-6">

          {/* Logo */}
          <h2 className="text-lg font-semibold mb-10">
            SYSTEM <span className="text-emerald-400">SKETCH</span>
          </h2>

          {/* Nav links */}
          <nav className="flex flex-col gap-4 text-sm text-slate-400">
            <Link href="/"><span className="hover:text-white cursor-pointer">Home</span></Link>
            <Link href="/design"><span className="hover:text-blue-400 cursor-pointer">Design</span></Link>
            <Link href="/security"><span className="hover:text-emerald-400 cursor-pointer">Security</span></Link>
            <Link href="/automation"><span className="hover:text-pink-400 cursor-pointer">Automation</span></Link>
          </nav>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Logout */}
          <button
            onClick={() => {
              setIsSignedIn(false);
              setOpen(false);
              router.push("/");
            }}
            className="flex items-center gap-3 px-4 py-3 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 transition"
          >
            {/* Logout SVG */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1"
              />
            </svg>
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
