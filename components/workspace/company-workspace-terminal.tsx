import Link from "next/link";
import type { CompanyWorkspaceTerminalViewModel } from "@/types/workspace";

interface CompanyWorkspaceTerminalProps {
  data: CompanyWorkspaceTerminalViewModel;
}

function formatCurrency(value: number | null, currency: string): string {
  if (value === null || Number.isNaN(value)) {
    return "—";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatPercent(value: number | null): string {
  if (value === null || Number.isNaN(value)) {
    return "—";
  }

  return `${value.toFixed(1)}%`;
}

function formatDateTime(value: string | null): string {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function formatDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
  }).format(date);
}

function Card({
  title,
  description,
  action,
  children,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-white/10 bg-[#0f172a]/90 shadow-[0_8px_30px_rgba(0,0,0,0.22)] backdrop-blur">
      <div className="flex items-start justify-between gap-4 border-b border-white/10 px-5 py-4">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-200">
            {title}
          </h2>
          {description ? (
            <p className="mt-1 text-sm text-slate-400">{description}</p>
          ) : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

function EmptyState({
  title,
  body,
}: {
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.02] px-4 py-6">
      <p className="text-sm font-medium text-slate-200">{title}</p>
      <p className="mt-1 text-sm text-slate-400">{body}</p>
    </div>
  );
}

export function CompanyWorkspaceTerminal({
  data,
}: CompanyWorkspaceTerminalProps) {
  const latestValuation = data.valuations[0];
  const latestReport = data.reports[0];

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.14),_transparent_30%),linear-gradient(180deg,#020617_0%,#0b1120_100%)] text-white">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <header className="rounded-3xl border border-white/10 bg-white/[0.04] px-6 py-6 shadow-[0_10px_40px_rgba(0,0,0,0.28)] backdrop-blur">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-3">
              <div className="inline-flex items-center rounded-full border border-cyan-400/25 bg-cyan-400/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-cyan-200">
                Company Workspace Terminal
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                    {data.workspace.symbol}
                  </h1>
                  {data.workspace.exchange ? (
                    <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-medium uppercase tracking-[0.16em] text-slate-300">
                      {data.workspace.exchange}
                    </span>
                  ) : null}
                  <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.16em] text-emerald-200">
                    {data.workspace.coverageStatus}
                  </span>
                </div>
                <p className="mt-2 text-base text-slate-300">
                  {data.workspace.companyName ?? "Coverage workspace"}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-2xl border border-white/10 bg-[#111827] px-4 py-3">
                <div className="text-[11px] uppercase tracking-[0.16em] text-slate-400">
                  Last Price
                </div>
                <div className="mt-2 text-lg font-semibold text-white">
                  {formatCurrency(
                    data.workspace.lastPrice,
                    data.workspace.primaryCurrency
                  )}
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-[#111827] px-4 py-3">
                <div className="text-[11px] uppercase tracking-[0.16em] text-slate-400">
                  Rating
                </div>
                <div className="mt-2 text-lg font-semibold text-white">
                  {data.workspace.latestRating ?? "—"}
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-[#111827] px-4 py-3">
                <div className="text-[11px] uppercase tracking-[0.16em] text-slate-400">
                  Target Price
                </div>
                <div className="mt-2 text-lg font-semibold text-white">
                  {formatCurrency(
                    data.workspace.latestTargetPrice,
                    data.workspace.primaryCurrency
                  )}
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-[#111827] px-4 py-3">
                <div className="text-[11px] uppercase tracking-[0.16em] text-slate-400">
                  Updated
                </div>
                <div className="mt-2 text-sm font-medium text-white">
                  {formatDateTime(data.workspace.updatedAt)}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href={`/reports/new?symbol=${encodeURIComponent(data.workspace.symbol)}`}
              className="inline-flex items-center rounded-xl bg-cyan-500 px-4 py-2 text-sm font-medium text-slate-950 transition hover:bg-cyan-400"
            >
              Generate Report
            </Link>
            <Link
              href={`/valuation?symbol=${encodeURIComponent(data.workspace.symbol)}`}
              className="inline-flex items-center rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-white transition hover:bg-white/[0.08]"
            >
              Open Valuation
            </Link>
            <Link
              href={`/ai-analyst?symbol=${encodeURIComponent(data.workspace.symbol)}`}
              className="inline-flex items-center rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-white transition hover:bg-white/[0.08]"
            >
              AI Analyst
            </Link>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <Card
            title="Research Pipeline"
            description="Core research status for this coverage name."
          >
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <div className="text-[11px] uppercase tracking-[0.16em] text-slate-400">
                  Latest Valuation
                </div>
                <div className="mt-2 text-xl font-semibold text-white">
                  {latestValuation
                    ? formatCurrency(
                        latestValuation.fairValue,
                        data.workspace.primaryCurrency
                      )
                    : "—"}
                </div>
                <div className="mt-1 text-sm text-slate-400">
                  {latestValuation ? latestValuation.modelName : "No snapshot saved"}
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <div className="text-[11px] uppercase tracking-[0.16em] text-slate-400">
                  Upside / Downside
                </div>
                <div className="mt-2 text-xl font-semibold text-white">
                  {latestValuation
                    ? formatPercent(latestValuation.upsideDownsidePct)
                    : "—"}
                </div>
                <div className="mt-1 text-sm text-slate-400">
                  Relative to latest market price
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <div className="text-[11px] uppercase tracking-[0.16em] text-slate-400">
                  Latest Report Run
                </div>
                <div className="mt-2 text-xl font-semibold capitalize text-white">
                  {latestReport?.status ?? "—"}
                </div>
                <div className="mt-1 text-sm text-slate-400">
                  {latestReport ? formatDateTime(latestReport.createdAt) : "No report runs yet"}
                </div>
              </div>
            </div>
          </Card>

          <Card
            title="Terminal Actions"
            description="Fast launch points for the existing platform modules."
          >
            <div className="grid gap-3">
              <Link
                href={`/reports/new?symbol=${encodeURIComponent(data.workspace.symbol)}`}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition hover:bg-white/[0.06]"
              >
                <div className="text-sm font-medium text-white">New Institutional Report</div>
                <div className="mt-1 text-sm text-slate-400">
                  Launch report generation with the current symbol preloaded.
                </div>
              </Link>

              <Link
                href={`/reports?symbol=${encodeURIComponent(data.workspace.symbol)}`}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition hover:bg-white/[0.06]"
              >
                <div className="text-sm font-medium text-white">Report History</div>
                <div className="mt-1 text-sm text-slate-400">
                  Review previous report runs and exported PDFs.
                </div>
              </Link>

              <Link
                href={`/ai-analyst?symbol=${encodeURIComponent(data.workspace.symbol)}`}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition hover:bg-white/[0.06]"
              >
                <div className="text-sm font-medium text-white">AI Analyst Session</div>
                <div className="mt-1 text-sm text-slate-400">
                  Open analyst Q&A and research drafting for this company.
                </div>
              </Link>
            </div>
          </Card>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr_0.85fr]">
          <Card
            title="Research Notes"
            description="Pinned and recent internal note coverage."
            action={
              <button
                type="button"
                className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-sm font-medium text-slate-200"
              >
                New Note
              </button>
            }
          >
            {data.notes.length === 0 ? (
              <EmptyState
                title="No notes yet"
                body="Use this workspace to centralize thesis updates, risks, catalysts, and management observations."
              />
            ) : (
              <div className="space-y-3">
                {data.notes.slice(0, 5).map((note) => (
                  <div
                    key={note.id}
                    className="rounded-xl border border-white/10 bg-white/[0.03] p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-sm font-medium text-white">{note.title}</h3>
                        <p className="mt-1 text-xs text-slate-400">
                          Updated {formatDateTime(note.updatedAt)}
                        </p>
                      </div>
                      {note.isPinned ? (
                        <span className="rounded-full border border-amber-400/20 bg-amber-400/10 px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-amber-200">
                          Pinned
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-3 line-clamp-3 whitespace-pre-wrap text-sm text-slate-300">
                      {note.bodyMd || "Empty note"}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card
            title="Documents"
            description="Source materials linked to this workspace."
            action={
              <button
                type="button"
                className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-sm font-medium text-slate-200"
              >
                Add Document
              </button>
            }
          >
            {data.documents.length === 0 ? (
              <EmptyState
                title="No documents linked"
                body="Reports, transcripts, decks, and filings will appear here once attached to the workspace."
              />
            ) : (
              <div className="space-y-3">
                {data.documents.slice(0, 6).map((document) => (
                  <div
                    key={document.id}
                    className="rounded-xl border border-white/10 bg-white/[0.03] p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <h3 className="text-sm font-medium text-white">{document.title}</h3>
                        <p className="mt-1 text-xs uppercase tracking-[0.16em] text-slate-400">
                          {document.kind}
                        </p>
                      </div>
                      <span className="text-xs text-slate-400">
                        {formatDate(document.createdAt)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card
            title="Activity"
            description="Recent workspace events and model updates."
          >
            {data.activity.length === 0 ? (
              <EmptyState
                title="No activity yet"
                body="Workspace activity will populate as reports are generated, valuations are saved, and notes are added."
              />
            ) : (
              <div className="space-y-3">
                {data.activity.slice(0, 8).map((event) => (
                  <div
                    key={event.id}
                    className="rounded-xl border border-white/10 bg-white/[0.03] p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-sm font-medium text-white">{event.label}</h3>
                        {event.detail ? (
                          <p className="mt-1 text-sm text-slate-300">{event.detail}</p>
                        ) : null}
                      </div>
                      <span className="whitespace-nowrap text-xs text-slate-400">
                        {formatDateTime(event.createdAt)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
