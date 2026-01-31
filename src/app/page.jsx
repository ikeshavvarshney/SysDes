import Navbar from "@/components/Navbar";

export default function Home() {
  return (
    <main className="min-h-screen text-slate-200 bg-black">

      {/* Navbar */}
      <Navbar />

      {/* HERO */}
      <section className="bg-linear-to-br from-[#050B1E] via-[#081A2F] to-[#120A2A] px-6 md:px-16 pt-28 pb-24">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-semibold leading-tight">
            Systems don’t fail.
            <br />
            <span className="text-slate-400">Bad decisions do.</span>
          </h2>

          <p className="mt-6 max-w-2xl text-slate-400 text-base md:text-lg">
            SYSTEM SKETCH is an interactive system-design simulator.
            You design architectures, introduce security and automation,
            then watch them crack under real-world pressure.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <button className="px-6 py-3 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition">
              Start Building
            </button>
            <button className="px-6 py-3 rounded-lg border border-white/15 hover:border-white/40 transition">
              See How It Breaks
            </button>
          </div>
        </div>
      </section>

      {/* TRUST / INSPIRATION STRIP */}
      <section className="px-6 md:px-16 py-14 border-b border-white/10 bg-[#020617]">
        <div className="max-w-6xl mx-auto">
          <p className="text-xs uppercase tracking-wider text-slate-500 mb-6">
            Inspired by real-world systems
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-slate-400 text-sm">
            <div className="opacity-70">Cloud Infrastructure</div>
            <div className="opacity-70">Distributed Databases</div>
            <div className="opacity-70">DevOps Pipelines</div>
            <div className="opacity-70">AIOps Systems</div>
          </div>
        </div>
      </section>

      {/* WHAT THIS ACTUALLY IS */}
      <section className="px-6 md:px-16 py-24 bg-black">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12">
          <div>
            <h3 className="text-2xl font-semibold">
              This is not a tutorial.
            </h3>
            <p className="mt-4 text-slate-400">
              There are no step-by-step guides.
              No “best architecture” templates.
              You experiment, you choose, you suffer consequences.
            </p>
          </div>

          <div>
            <h3 className="text-2xl font-semibold">
              This is a pressure test.
            </h3>
            <p className="mt-4 text-slate-400">
              Traffic spikes.
              Dependencies fail.
              Automation misfires.
              The system degrades exactly like production does.
            </p>
          </div>
        </div>
      </section>

      {/* DESIGN */}
      <section className="bg-linear-to-br from-[#07142E] to-[#020617] px-6 md:px-16 py-24">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-2xl font-semibold text-blue-400">
            System Design
          </h3>
          <p className="mt-4 max-w-3xl text-slate-400">
            Compose services, databases, queues, and caches.
            Trace request paths.
            Observe bottlenecks instead of guessing.
          </p>
        </div>
      </section>

      {/* SECURITY */}
      <section className="bg-linear-to-br from-[#02140C] to-[#020A06] px-6 md:px-16 py-24">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-2xl font-semibold text-emerald-400">
            Security & Hacking
          </h3>
          <p className="mt-4 max-w-3xl text-slate-400">
            Introduce auth, rate limits, encryption, firewalls.
            Watch how attackers exploit tradeoffs you ignored.
            Security is never free.
          </p>
        </div>
      </section>

      {/* AUTOMATION */}
      <section className="bg-linear-to-br from-[#1A0622] to-[#0B0210] px-6 md:px-16 py-24">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-2xl font-semibold text-pink-400">
            Automation
          </h3>
          <p className="mt-4 max-w-3xl text-slate-400">
            Autoscaling, alerting, and AI-driven responses.
            Automation fixes problems fast —
            and multiplies mistakes even faster.
          </p>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="px-6 md:px-16 py-24 bg-black">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-2xl md:text-3xl font-semibold">
            Build it wrong here.
          </h3>
          <p className="mt-4 text-slate-400">
            So you don’t destroy production later.
          </p>

          <Link href="/auth">
            <button className="mt-8 px-8 py-3 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition">
              Enter Simulator
            </button>
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/10 px-6 md:px-16 py-6 text-xs text-slate-500">
        <div className="max-w-6xl mx-auto flex justify-between">
          <span>© 2026 SYSTEM SKETCH</span>
          <span>Failure is a feature</span>
        </div>
      </footer>

    </main>
  );
}
