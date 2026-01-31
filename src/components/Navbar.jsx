export default function Navbar({ isSignedIn = false }) {
  return (
    <header className="sticky top-0 z-50 flex items-center justify-between px-6 md:px-16 py-4 border-b border-white/10 bg-[#050B1E]/80 backdrop-blur">
      
      {/* Logo */}
      <h1 className="text-lg font-semibold tracking-wide">
        SYSTEM <span className="text-emerald-400">SKETCH</span>
      </h1>

      {/* Center Nav (only if signed in) */}
      {isSignedIn && (
        <nav className="hidden md:flex gap-10 text-sm text-slate-400">
          <Link href="/design"><span className="cursor-pointer hover:text-blue-400 transition">
            Design
          </span></Link>
          <Link href="/security"><span className="cursor-pointer hover:text-emerald-400 transition">
            Security
          </span></Link>
          <Link href="/automation"><span className="cursor-pointer hover:text-pink-400 transition">
            Automation
          </span></Link>
        </nav>
      )}

      {/* Auth Actions */}
      <div className="flex items-center gap-3">
        {!isSignedIn ? (
          <>
            <Link href="/auth">
              <button className="px-4 py-2 text-sm rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition">
                Login
              </button>
            </Link>
            <Link href="/auth">
              <button className="px-4 py-2 text-sm rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition">
                Sign Up
              </button>
            </Link>
          </>
        ) : (<Link href="/profile">
            <div className="w-9 h-9 rounded-full border border-white/20 flex items-center justify-center text-sm font-medium text-slate-300 hover:border-emerald-400 hover:text-emerald-400 transition cursor-pointer">
              K
            </div>
          </Link>)}
      </div>

    </header>
  );
}
