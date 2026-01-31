"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";

export default function AuthPage() {
  const [mode, setMode] = useState("signup"); // signup | login
  const isSignup = mode === "signup";

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#050B1E] via-[#081A2F] to-[#120A2A] text-slate-200">

      {/* Animated background strokes */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 left-1/4 h-[600px] w-[2px] bg-emerald-400/20 rotate-12 animate-pulse" />
        <div className="absolute top-0 left-2/3 h-[500px] w-[1px] bg-pink-400/20 -rotate-12 animate-pulse delay-300" />
        <div className="absolute top-1/3 left-1/2 h-[700px] w-[1px] bg-blue-400/20 rotate-6 animate-pulse delay-700" />
      </div>

      <Navbar />

      <section className="relative z-10 flex items-center justify-center px-6 py-20">
        <div className="w-full max-w-md bg-white/5 border border-white/10 rounded-xl p-8 backdrop-blur">

          {/* Header */}
          <h2 className="text-2xl font-semibold">
            {isSignup ? "Create your account" : "Welcome back"}
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            {isSignup
              ? "Start breaking systems safely."
              : "Log in to continue your simulations."}
          </p>

          {/* Form */}
          <form className="mt-8 space-y-5">

            {/* Username (signup only) */}
            {isSignup && (
              <div>
                <label className="block text-sm mb-1 text-slate-400">
                  Username
                </label>
                <input
                  type="text"
                  placeholder="keshav_dev"
                  className="w-full rounded-lg bg-black/40 border border-white/10 px-4 py-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-400 transition"
                />
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-sm mb-1 text-slate-400">
                Email
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                className="w-full rounded-lg bg-black/40 border border-white/10 px-4 py-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-400 transition"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm mb-1 text-slate-400">
                Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full rounded-lg bg-black/40 border border-white/10 px-4 py-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-400 transition"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full mt-2 py-3 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition font-medium"
            >
              {isSignup ? "Sign Up" : "Log In"}
            </button>
          </form>

          {/* Toggle */}
          <p className="mt-6 text-xs text-center text-slate-500">
            {isSignup ? "Already have an account?" : "New here?"}{" "}
            <span
              onClick={() => setMode(isSignup ? "login" : "signup")}
              className="text-emerald-400 cursor-pointer hover:underline"
            >
              {isSignup ? "Log in" : "Create one"}
            </span>
          </p>

        </div>
      </section>

    </main>
  );
}
