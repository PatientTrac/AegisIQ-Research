import Link from "next/link";

const starterSymbols = ["AAPL", "MSFT", "NVDA", "AMZN", "GOOGL", "META"];

export default function WorkspaceIndexPage() {
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#020617_0%,#0b1120_100%)] text-white">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8 shadow-[0_10px_40px_rgba(0,0,0,0.28)]">
          <div className="inline-flex items-center rounded-full border border-cyan-400/25 bg-cyan-400/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-cyan-200">
            AegisIQ Workspace
          </div>

          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Company Workspace Terminal
          </h1>

          <p className="mt-3 max-w-2xl text-base text-slate-300">
            Open a symbol-specific terminal to manage research notes, linked documents,
            valuation snapshots, and report generation from a single workspace.
          </p>

          <div className="mt-8">
            <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-300">
              Quick Start
            </h2>

            <div className="mt-4 flex flex-wrap gap-3">
              {starterSymbols.map((symbol) => (
                <Link
                  key={symbol}
                  href={`/workspace/${symbol}`}
                  className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 text-sm font-medium text-white transition hover:bg-white/[0.08]"
                >
                  {symbol}
                </Link>
              ))}
            </div>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <h3 className="text-sm font-medium text-white">Workspace Core</h3>
              <p className="mt-2 text-sm text-slate-400">
                One terminal per coverage name with room for notes, documents, and activity.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <h3 className="text-sm font-medium text-white">Report Integration</h3>
              <p className="mt-2 text-sm text-slate-400">
                Launch existing report generation, valuation, and AI analyst flows with symbol context.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <h3 className="text-sm font-medium text-white">Schema Ready</h3>
              <p className="mt-2 text-sm text-slate-400">
                Database tables are prepared for live persistence in the next phase.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
