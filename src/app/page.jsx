export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-[#050B1E] via-[#081A2F] to-[#120A2A] text-slate-200">

      {/* Navbar */}
      <header className="flex items-center justify-between px-6 md:px-16 py-5 border-b border-white/10">
        <h1 className="text-lg font-semibold tracking-wide">
          SYSTEM <span className="text-emerald-400">SKETCH</span>
        </h1>

        <nav className="hidden md:flex gap-10 text-sm text-slate-400">
          <span className="cursor-pointer hover:text-emerald-400 transition">
            Design
          </span>
          <span className="cursor-pointer hover:text-emerald-400 transition">
            Security
          </span>
          <span className="cursor-pointer hover:text-emerald-400 transition">
            Automation
          </span>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="px-6 md:px-16 pt-20 pb-24 max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-5xl font-semibold leading-tight">
          System design <br />
          <span className="text-emerald-400">under pressure</span>
        </h2>

        <p className="mt-6 max-w-2xl text-slate-400 text-base md:text-lg">
          SYSTEM SKETCH is an interactive system design simulator where
          architectures break under load, adapt imperfectly, and accumulate
          design debt through automation, security, and scaling decisions.
        </p>

        <div className="mt-10 flex flex-wrap gap-4">
          <button className="px-6 py-3 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition">
            Get Started
          </button>
          <button className="px-6 py-3 rounded-lg border border-white/15 text-slate-300 hover:border-emerald-400 transition">
            View Demo
          </button>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 md:px-16 pb-24 max-w-6xl mx-auto grid gap-10 md:grid-cols-3">
        
        {/* System Design */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 hover:border-emerald-400/40 transition">
          <h3 className="text-lg font-semibold text-emerald-400">
            System Design
          </h3>
          <p className="mt-4 text-sm text-slate-400 leading-relaxed">
            Visually design distributed systems using real infrastructure
            components. Control traffic, inspect metrics, and trace request flow
            across your architecture.
          </p>
        </div>

        {/* Security */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 hover:border-purple-400/40 transition">
          <h3 className="text-lg font-semibold text-purple-400">
            Security Tradeoffs
          </h3>
          <p className="mt-4 text-sm text-slate-400 leading-relaxed">
            Add rate limits, encryption, and firewalls. Observe how security
            changes failure modes, increases latency, and accelerates collapse.
          </p>
        </div>

        {/* Automation */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 hover:border-blue-400/40 transition">
          <h3 className="text-lg font-semibold text-blue-400">
            AI Automation
          </h3>
          <p className="mt-4 text-sm text-slate-400 leading-relaxed">
            Simulate real-world automation workflows inspired by production
            AIOps systems. Watch automated decisions misfire and cascade.
          </p>
        </div>

      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 px-6 md:px-16 py-6 text-xs text-slate-500 flex flex-col md:flex-row justify-between gap-4 max-w-6xl mx-auto">
        <span>© 2026 SYSTEM SKETCH</span>
        <span>Architecture under pressure</span>
      </footer>

    </main>
  );
}
