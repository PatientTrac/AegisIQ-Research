"use client";

import { useEffect, useMemo, useState } from "react";

import { ScreenerResults } from "@/components/screener/screener-results";
import {
  EMPTY_SCREENER_FILTERS,
  type ScreenerFilters,
  type ScreenerPresetRecord,
  type ScreenerRunResponse,
  type WatchlistOption,
} from "@/types/screener";

function toInputValue(value: number | null): string {
  return value === null ? "" : String(value);
}

function parseNumberInput(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizePresetRecord(input: unknown): ScreenerPresetRecord | null {
  if (!input || typeof input !== "object") {
    return null;
  }

  const raw = input as Record<string, unknown>;
  const filtersCandidate =
    raw.filters && typeof raw.filters === "object"
      ? raw.filters
      : raw.payload && typeof raw.payload === "object"
        ? raw.payload
        : raw.criteria && typeof raw.criteria === "object"
          ? raw.criteria
          : EMPTY_SCREENER_FILTERS;

  const filtersRaw = filtersCandidate as Record<string, unknown>;

  const filters: ScreenerFilters = {
    queryText: typeof filtersRaw.queryText === "string" ? filtersRaw.queryText : "",
    sector: typeof filtersRaw.sector === "string" ? filtersRaw.sector : null,
    industry: typeof filtersRaw.industry === "string" ? filtersRaw.industry : null,
    country: typeof filtersRaw.country === "string" ? filtersRaw.country : null,
    exchange: typeof filtersRaw.exchange === "string" ? filtersRaw.exchange : null,
    marketCap:
      filtersRaw.marketCap && typeof filtersRaw.marketCap === "object"
        ? {
            min:
              typeof (filtersRaw.marketCap as Record<string, unknown>).min === "number"
                ? ((filtersRaw.marketCap as Record<string, unknown>).min as number)
                : null,
            max:
              typeof (filtersRaw.marketCap as Record<string, unknown>).max === "number"
                ? ((filtersRaw.marketCap as Record<string, unknown>).max as number)
                : null,
          }
        : { min: null, max: null },
    price:
      filtersRaw.price && typeof filtersRaw.price === "object"
        ? {
            min:
              typeof (filtersRaw.price as Record<string, unknown>).min === "number"
                ? ((filtersRaw.price as Record<string, unknown>).min as number)
                : null,
            max:
              typeof (filtersRaw.price as Record<string, unknown>).max === "number"
                ? ((filtersRaw.price as Record<string, unknown>).max as number)
                : null,
          }
        : { min: null, max: null },
    peRatio:
      filtersRaw.peRatio && typeof filtersRaw.peRatio === "object"
        ? {
            min:
              typeof (filtersRaw.peRatio as Record<string, unknown>).min === "number"
                ? ((filtersRaw.peRatio as Record<string, unknown>).min as number)
                : null,
            max:
              typeof (filtersRaw.peRatio as Record<string, unknown>).max === "number"
                ? ((filtersRaw.peRatio as Record<string, unknown>).max as number)
                : null,
          }
        : { min: null, max: null },
  };

  const id =
    typeof raw.id === "string"
      ? raw.id
      : typeof raw.presetId === "string"
        ? raw.presetId
        : null;

  const name =
    typeof raw.name === "string"
      ? raw.name
      : typeof raw.title === "string"
        ? raw.title
        : null;

  if (!id || !name) {
    return null;
  }

  return {
    id,
    name,
    filters,
    createdAt: typeof raw.createdAt === "string" ? raw.createdAt : null,
    updatedAt: typeof raw.updatedAt === "string" ? raw.updatedAt : null,
  };
}

function normalizeWatchlist(input: unknown): WatchlistOption | null {
  if (!input || typeof input !== "object") {
    return null;
  }

  const raw = input as Record<string, unknown>;
  const id =
    typeof raw.id === "string"
      ? raw.id
      : typeof raw.watchlistId === "string"
        ? raw.watchlistId
        : null;
  const name =
    typeof raw.name === "string"
      ? raw.name
      : typeof raw.title === "string"
        ? raw.title
        : null;

  if (!id || !name) {
    return null;
  }

  return { id, name };
}

export function ScreenerBuilder() {
  const [filters, setFilters] = useState<ScreenerFilters>(EMPTY_SCREENER_FILTERS);
  const [presets, setPresets] = useState<ScreenerPresetRecord[]>([]);
  const [selectedPresetId, setSelectedPresetId] = useState<string>("");
  const [watchlists, setWatchlists] = useState<WatchlistOption[]>([]);
  const [presetName, setPresetName] = useState("");
  const [response, setResponse] = useState<ScreenerRunResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [presetLoading, setPresetLoading] = useState(true);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [addState, setAddState] = useState<Record<string, string>>({});

  useEffect(() => {
    void loadInitialData();
  }, []);

  const supportedFieldMap = useMemo(() => {
    const entries = response?.metadata.fields ?? [];
    return new Map(entries.map((field) => [field.key, field]));
  }, [response]);

  async function loadInitialData() {
    setPresetLoading(true);

    try {
      const [presetRes, watchlistRes] = await Promise.all([
        fetch("/api/workspaces/screener-presets", { method: "GET", cache: "no-store" }),
        fetch("/api/workspaces/watchlists", { method: "GET", cache: "no-store" }),
      ]);

      if (presetRes.ok) {
        const presetJson = (await presetRes.json()) as unknown;
        const presetList = Array.isArray(presetJson)
          ? presetJson
          : presetJson && typeof presetJson === "object" && "presets" in presetJson
            ? (((presetJson as Record<string, unknown>).presets as unknown[]) ?? [])
            : [];

        setPresets(
          presetList
            .map((item) => normalizePresetRecord(item))
            .filter((item): item is ScreenerPresetRecord => item !== null),
        );
      }

      if (watchlistRes.ok) {
        const watchlistJson = (await watchlistRes.json()) as unknown;
        const watchlistList = Array.isArray(watchlistJson)
          ? watchlistJson
          : watchlistJson && typeof watchlistJson === "object" && "watchlists" in watchlistJson
            ? (((watchlistJson as Record<string, unknown>).watchlists as unknown[]) ?? [])
            : [];

        setWatchlists(
          watchlistList
            .map((item) => normalizeWatchlist(item))
            .filter((item): item is WatchlistOption => item !== null),
        );
      }
    } catch (error) {
      console.error("screener.initial-load.failed", error);
    } finally {
      setPresetLoading(false);
    }
  }

  async function runScreener() {
    setLoading(true);

    try {
      const res = await fetch("/api/workspaces/screener/run", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          filters,
          limit: 100,
        }),
      });

      const json = (await res.json()) as ScreenerRunResponse;

      if (!res.ok || !json.ok) {
        throw new Error(json.error || "Failed to run screener.");
      }

      setResponse(json);
    } catch (error) {
      console.error("screener.run.failed", error);
      setResponse({
        ok: false,
        error: "Failed to run screener.",
        filters,
        results: [],
        total: 0,
        limit: 100,
        metadata: {
          dataSource: "internal_watchlist_symbols",
          supportsCompanyName: false,
          supportsSector: false,
          supportsIndustry: false,
          supportsCountry: false,
          supportsExchange: false,
          supportsMarketCap: false,
          supportsPrice: false,
          supportsPeRatio: false,
          fields: [],
          appliedFilters: [],
          unsupportedRequestedFilters: [],
          message: "The screener request could not be completed.",
        },
      });
    } finally {
      setLoading(false);
    }
  }

  async function savePreset() {
    const trimmedName = presetName.trim();
    if (!trimmedName) {
      return;
    }

    setSaveState("saving");

    try {
      const res = await fetch("/api/workspaces/screener-presets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: trimmedName,
          filters,
          payload: filters,
          criteria: filters,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to save preset.");
      }

      setPresetName("");
      setSaveState("saved");
      await loadInitialData();
    } catch (error) {
      console.error("screener.save-preset.failed", error);
      setSaveState("error");
    }
  }

  async function addToWatchlist(symbol: string, watchlistId: string) {
    setAddState((current) => ({ ...current, [symbol]: "saving" }));

    try {
      const res = await fetch(`/api/workspaces/watchlists/${watchlistId}/items`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ symbol }),
      });

      if (!res.ok) {
        throw new Error("Failed to add symbol.");
      }

      setAddState((current) => ({ ...current, [symbol]: "added" }));
    } catch (error) {
      console.error("screener.add-to-watchlist.failed", error);
      setAddState((current) => ({ ...current, [symbol]: "error" }));
    }
  }

  function loadPresetById(id: string) {
    setSelectedPresetId(id);

    const preset = presets.find((item) => item.id === id);
    if (!preset) {
      return;
    }

    setFilters(preset.filters);
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-white">Institutional Screener</h1>
        <p className="mt-2 max-w-3xl text-sm text-slate-300">
          This screener uses only internal symbols currently available in the platform dataset.
          Unsupported market-data filters are preserved in the state model for forward compatibility
          but are not enforced until internal coverage exists.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
        <div className="space-y-6">
          <section className="rounded-2xl border border-white/10 bg-slate-900/60 p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Presets</h2>
              {presetLoading ? <span className="text-xs text-slate-400">Loading…</span> : null}
            </div>

            <div className="mt-4 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Load saved preset
                </label>
                <select
                  value={selectedPresetId}
                  onChange={(event) => loadPresetById(event.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2.5 text-sm text-slate-100"
                >
                  <option value="">Select preset</option>
                  {presets.map((preset) => (
                    <option key={preset.id} value={preset.id}>
                      {preset.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Save current filter set
                </label>
                <div className="flex gap-2">
                  <input
                    value={presetName}
                    onChange={(event) => {
                      setPresetName(event.target.value);
                      if (saveState !== "idle") {
                        setSaveState("idle");
                      }
                    }}
                    placeholder="Preset name"
                    className="flex-1 rounded-xl border border-white/10 bg-slate-950 px-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-500"
                  />
                  <button
                    type="button"
                    onClick={() => void savePreset()}
                    className="rounded-xl bg-white px-4 py-2.5 text-sm font-medium text-slate-950 transition hover:bg-slate-200"
                  >
                    Save
                  </button>
                </div>
                {saveState !== "idle" ? (
                  <div
                    className={
                      saveState === "saved"
                        ? "mt-2 text-xs text-emerald-300"
                        : saveState === "error"
                          ? "mt-2 text-xs text-rose-300"
                          : "mt-2 text-xs text-slate-400"
                    }
                  >
                    {saveState === "saved"
                      ? "Preset saved."
                      : saveState === "error"
                        ? "Preset save failed."
                        : "Saving preset…"}
                  </div>
                ) : null}
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-white/10 bg-slate-900/60 p-6">
            <h2 className="text-lg font-semibold text-white">Filters</h2>

            <div className="mt-4 space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Symbol / company search
                </label>
                <input
                  value={filters.queryText}
                  onChange={(event) =>
                    setFilters((current) => ({
                      ...current,
                      queryText: event.target.value,
                    }))
                  }
                  placeholder="AAPL, MSFT, Nvidia…"
                  className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-500"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">Sector</label>
                  <input
                    value={filters.sector ?? ""}
                    onChange={(event) =>
                      setFilters((current) => ({
                        ...current,
                        sector: event.target.value.trim() || null,
                      }))
                    }
                    placeholder="Unavailable"
                    className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2.5 text-sm text-slate-500"
                  />
                  <p className="mt-2 text-xs text-amber-300">
                    {supportedFieldMap.get("sector")?.reason ??
                      "Not enforced until internal sector coverage exists."}
                  </p>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    Industry
                  </label>
                  <input
                    value={filters.industry ?? ""}
                    onChange={(event) =>
                      setFilters((current) => ({
                        ...current,
                        industry: event.target.value.trim() || null,
                      }))
                    }
                    placeholder="Unavailable"
                    className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2.5 text-sm text-slate-500"
                  />
                  <p className="mt-2 text-xs text-amber-300">
                    {supportedFieldMap.get("industry")?.reason ??
                      "Not enforced until internal industry coverage exists."}
                  </p>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    Country
                  </label>
                  <input
                    value={filters.country ?? ""}
                    onChange={(event) =>
                      setFilters((current) => ({
                        ...current,
                        country: event.target.value.trim() || null,
                      }))
                    }
                    placeholder="Unavailable"
                    className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2.5 text-sm text-slate-500"
                  />
                  <p className="mt-2 text-xs text-amber-300">
                    {supportedFieldMap.get("country")?.reason ??
                      "Not enforced until internal country coverage exists."}
                  </p>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    Exchange
                  </label>
                  <input
                    value={filters.exchange ?? ""}
                    onChange={(event) =>
                      setFilters((current) => ({
                        ...current,
                        exchange: event.target.value.trim() || null,
                      }))
                    }
                    placeholder="Unavailable"
                    className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2.5 text-sm text-slate-500"
                  />
                  <p className="mt-2 text-xs text-amber-300">
                    {supportedFieldMap.get("exchange")?.reason ??
                      "Not enforced until internal exchange coverage exists."}
                  </p>
                </div>
              </div>

              <div className="space-y-4 rounded-xl border border-white/10 bg-slate-950/60 p-4">
                <div>
                  <div className="text-sm font-medium text-slate-300">Market cap</div>
                  <div className="mt-2 grid gap-3 sm:grid-cols-2">
                    <input
                      value={toInputValue(filters.marketCap.min)}
                      onChange={(event) =>
                        setFilters((current) => ({
                          ...current,
                          marketCap: {
                            ...current.marketCap,
                            min: parseNumberInput(event.target.value),
                          },
                        }))
                      }
                      placeholder="Min"
                      className="rounded-xl border border-white/10 bg-slate-900 px-3 py-2.5 text-sm text-slate-500"
                    />
                    <input
                      value={toInputValue(filters.marketCap.max)}
                      onChange={(event) =>
                        setFilters((current) => ({
                          ...current,
                          marketCap: {
                            ...current.marketCap,
                            max: parseNumberInput(event.target.value),
                          },
                        }))
                      }
                      placeholder="Max"
                      className="rounded-xl border border-white/10 bg-slate-900 px-3 py-2.5 text-sm text-slate-500"
                    />
                  </div>
                </div>

                <div>
                  <div className="text-sm font-medium text-slate-300">Price</div>
                  <div className="mt-2 grid gap-3 sm:grid-cols-2">
                    <input
                      value={toInputValue(filters.price.min)}
                      onChange={(event) =>
                        setFilters((current) => ({
                          ...current,
                          price: {
                            ...current.price,
                            min: parseNumberInput(event.target.value),
                          },
                        }))
                      }
                      placeholder="Min"
                      className="rounded-xl border border-white/10 bg-slate-900 px-3 py-2.5 text-sm text-slate-500"
                    />
                    <input
                      value={toInputValue(filters.price.max)}
                      onChange={(event) =>
                        setFilters((current) => ({
                          ...current,
                          price: {
                            ...current.price,
                            max: parseNumberInput(event.target.value),
                          },
                        }))
                      }
                      placeholder="Max"
                      className="rounded-xl border border-white/10 bg-slate-900 px-3 py-2.5 text-sm text-slate-500"
                    />
                  </div>
                </div>

                <div>
                  <div className="text-sm font-medium text-slate-300">P/E ratio</div>
                  <div className="mt-2 grid gap-3 sm:grid-cols-2">
                    <input
                      value={toInputValue(filters.peRatio.min)}
                      onChange={(event) =>
                        setFilters((current) => ({
                          ...current,
                          peRatio: {
                            ...current.peRatio,
                            min: parseNumberInput(event.target.value),
                          },
                        }))
                      }
                      placeholder="Min"
                      className="rounded-xl border border-white/10 bg-slate-900 px-3 py-2.5 text-sm text-slate-500"
                    />
                    <input
                      value={toInputValue(filters.peRatio.max)}
                      onChange={(event) =>
                        setFilters((current) => ({
                          ...current,
                          peRatio: {
                            ...current.peRatio,
                            max: parseNumberInput(event.target.value),
                          },
                        }))
                      }
                      placeholder="Max"
                      className="rounded-xl border border-white/10 bg-slate-900 px-3 py-2.5 text-sm text-slate-500"
                    />
                  </div>
                </div>

                <p className="text-xs text-amber-300">
                  Numeric valuation filters are preserved in the contract, but are not currently
                  enforceable until internal metric coverage is available.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => void runScreener()}
                  className="rounded-xl bg-white px-4 py-2.5 text-sm font-medium text-slate-950 transition hover:bg-slate-200"
                >
                  Run screener
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFilters(EMPTY_SCREENER_FILTERS);
                    setSelectedPresetId("");
                  }}
                  className="rounded-xl border border-white/10 px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:bg-white/5"
                >
                  Reset
                </button>
              </div>
            </div>
          </section>
        </div>

        <ScreenerResults
          response={response}
          loading={loading}
          watchlists={watchlists}
          addState={addState}
          onAddToWatchlist={addToWatchlist}
        />
      </div>
    </div>
  );
}
