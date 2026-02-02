"use client";

import { useState } from "react";
import { AlertCircle, Loader2 } from "lucide-react";
// import Navbar from "@/components/Navbar"; // Uncomment if you have this component
import Navbar from "@/components/Navbar";
export default function AuthPage() {
  // const router = useRouter(); // Removed Next.js dependency
  const [mode, setMode] = useState("signup"); // signup | login
  const isSignup = mode === "signup";
  const [isSignIn,setIsSignIn]=useState(false)
  // Form State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Handle Input Changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear error when user types
    if (error) setError("");
  };

  // Handle Form Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Define Endpoints (Ensure your backend is running on this port)
    // Note: In a real app, use environment variables like process.env.NEXT_PUBLIC_API_URL
    const BASE_URL = "http://localhost:5001/api/users";
    const endpoint = isSignup ? `${BASE_URL}/register` : `${BASE_URL}/login`;

    try {
      // Prepare payload (Login doesn't need 'name')
      const payload = isSignup 
        ? formData 
        : { email: formData.email, password: formData.password };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Authentication failed");
      }

      // Success: Store token & user
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setIsSignIn(true);      // Redirect (using standard window.location for compatibility)
      // In a Next.js app, you would use router.push("/dashboard")
      window.location.href = "/"; 

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-200 selection:bg-emerald-500/30">
      
      {/* Background Gradients (Standardized Tailwind) */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#050B1E] via-[#081A2F] to-[#120A2A]" />

      {/* Animated background strokes */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute -top-40 left-1/4 h-150 w-0.5 bg-emerald-400/20 rotate-12 animate-pulse" />
        <div className="absolute top-0 left-2/3 h-125 w-px bg-pink-400/20 -rotate-12 animate-pulse delay-300" />
        <div className="absolute top-1/3 left-1/2 h-175 w-px bg-blue-400/20 rotate-6 animate-pulse delay-700" />
      </div>

      {/* <Navbar /> */}
      <Navbar isSignedIn={isSignIn} setIsSignedIn={setIsSignIn} py={2}></Navbar>
      <section className="relative z-10 flex items-center justify-center min-h-screen px-6 py-20">
        <div className="w-full max-w-md bg-white/5 border border-white/10 rounded-xl p-8 backdrop-blur shadow-2xl">

          {/* Header */}
          <h2 className="text-2xl font-semibold text-white">
            {isSignup ? "Create your account" : "Welcome back"}
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            {isSignup
              ? "Start breaking systems safely."
              : "Log in to continue your simulations."}
          </p>

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center gap-2 text-red-400 text-sm animate-in slide-in-from-top-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-6 space-y-5">

            {/* Username (signup only) */}
            {isSignup && (
              <div>
                <label className="block text-sm mb-1 text-slate-400">
                  Username
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="keshav_dev"
                  required
                  className="w-full rounded-lg bg-black/40 border border-white/10 px-4 py-3 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/50 transition"
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
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                required
                className="w-full rounded-lg bg-black/40 border border-white/10 px-4 py-3 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/50 transition"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm mb-1 text-slate-400">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
                className="w-full rounded-lg bg-black/40 border border-white/10 px-4 py-3 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/50 transition"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/30 hover:border-emerald-500/40 transition font-medium flex justify-center items-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                isSignup ? "Sign Up" : "Log In"
              )}
            </button>
          </form>

          {/* Toggle */}
          <p className="mt-6 text-xs text-center text-slate-500">
            {isSignup ? "Already have an account?" : "New here?"}{" "}
            <button
              type="button"
              onClick={() => {
                setMode(isSignup ? "login" : "signup");
                setError("");
                setFormData({ name: "", email: "", password: "" });
              }}
              className="text-emerald-400 cursor-pointer hover:underline hover:text-emerald-300 transition-colors focus:outline-none"
            >
              {isSignup ? "Log in" : "Create one"}
            </button>
          </p>

        </div>
      </section>

    </main>
  );
}