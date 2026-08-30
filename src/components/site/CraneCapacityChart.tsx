"use client";

/**
 * CRANE CAPACITY CHART — filterable table of the real fleet data in
 * craneChartData.ts, embedded in EquipmentFinder ("Find Your Machine").
 *
 * TNT's own live equivalent (tntcrane.com/crane-charts/) is a generic
 * WordPress/JetEngine table plugin — unbranded styling, and it never got past
 * its own loading spinner in testing. This is the "better view" version: same
 * data and same per-model PDF load-chart links, in the site's own dark/amber
 * system, filterable by class and searchable by make/model without a page
 * reload.
 *
 * Opens in a modal (2026-08-18) rather than rendering inline — see the
 * trigger + dialog in EquipmentFinder.tsx. No top margin here as a result;
 * that spacing is the page layout's job, not this component's, and a modal
 * sheet shouldn't carry it.
 */

import { useMemo, useState } from "react";
import { Icon, type IconName } from "./primitives";
import {
  CRANE_MODELS,
  CRANE_TYPE_LABELS,
  type CraneType,
} from "./craneChartData";

const TYPE_ICON: Record<CraneType, IconName> = {
  mobile: "allterrain",
  "rough-terrain": "carrydeck",
  crawler: "crawler",
  rigging: "rigging",
};

const TYPE_ORDER: CraneType[] = ["mobile", "rough-terrain", "crawler", "rigging"];

type SortDir = "asc" | "desc";

export default function CraneCapacityChart() {
  const [activeType, setActiveType] = useState<CraneType | "all">("all");
  const [query, setQuery] = useState("");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = CRANE_MODELS.filter((m) => {
      if (activeType !== "all" && m.type !== activeType) return false;
      if (!q) return true;
      return (
        m.make.toLowerCase().includes(q) || m.model.toLowerCase().includes(q)
      );
    });
    return filtered.sort((a, b) =>
      sortDir === "asc"
        ? a.capacityTons - b.capacityTons
        : b.capacityTons - a.capacityTons,
    );
  }, [activeType, query, sortDir]);

  return (
    <div className="overflow-hidden rounded-2xl border border-black/10 bg-tnt-navy text-white">
      {/* Header — title, count, and controls */}
      <div className="flex flex-col gap-4 border-b border-white/10 p-4 sm:gap-5 sm:p-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h3
              id="capacity-chart-heading"
              className="font-display text-2xl tracking-wide text-white uppercase sm:text-3xl"
            >
              Full Capacity Chart
            </h3>
            <p className="mt-1 font-body text-xs text-white/60 sm:text-sm">
              {CRANE_MODELS.length} machines, every rated capacity and
              manufacturer load chart on file.
            </p>
          </div>
          <p className="font-mono text-[10px] tracking-[0.12em] text-tnt-amber tabular-nums uppercase sm:text-xs sm:tracking-[0.14em]">
            Showing {rows.length} of {CRANE_MODELS.length}
          </p>
        </div>

        {/* Controls: type filter tabs + search */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="-mx-1 overflow-x-auto px-1 pb-1 sm:mx-0 sm:overflow-visible sm:p-0">
            <div className="flex min-w-max gap-2">
              <button
                type="button"
                onClick={() => setActiveType("all")}
                className={`rounded-full border px-3.5 py-1.5 font-body text-[10px] font-semibold tracking-wide uppercase transition-colors sm:text-xs ${
                  activeType === "all"
                    ? "border-tnt-amber bg-tnt-amber text-black"
                    : "border-white/20 text-white/70 hover:border-white/50 hover:text-white"
                }`}
              >
                All Classes
              </button>
              {TYPE_ORDER.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setActiveType(t)}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 font-body text-[10px] font-semibold tracking-wide uppercase transition-colors sm:text-xs ${
                    activeType === t
                      ? "border-tnt-amber bg-tnt-amber text-black"
                      : "border-white/20 text-white/70 hover:border-white/50 hover:text-white"
                  }`}
                >
                  <Icon name={TYPE_ICON[t]} className="h-3.5 w-3.5" strokeWidth={2} />
                  {CRANE_TYPE_LABELS[t]}
                </button>
              ))}
            </div>
          </div>

          <label className="relative w-full sm:w-64">
            <span className="sr-only">Search by make or model</span>
            <Icon
              name="search"
              className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-white/40"
              strokeWidth={2}
            />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search make or model…"
              className="w-full rounded-md border border-white/20 bg-white/5 py-2 pr-3 pl-9 font-body text-sm text-white placeholder:text-white/40 focus-visible:border-tnt-amber focus-visible:ring-2 focus-visible:ring-tnt-amber focus-visible:outline-none"
            />
          </label>
        </div>
      </div>

      {/* Table / card list — mobile gets stacked cards, desktop keeps the table */}
      <div className="sm:hidden">
        {rows.length > 0 ? (
          <div className="divide-y divide-white/10">
            {rows.map((m) => (
              <article
                key={`${m.make}-${m.model}-${m.chartHref}`}
                className="p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 grid h-10 w-10 place-items-center rounded-full bg-white/5 ring-1 ring-white/10">
                      <Icon
                        name={TYPE_ICON[m.type]}
                        className="h-4 w-4 text-tnt-amber"
                        strokeWidth={1.8}
                      />
                    </div>
                    <div>
                      <p className="font-body text-[10px] tracking-[0.14em] text-white/50 uppercase">
                        {CRANE_TYPE_LABELS[m.type]}
                      </p>
                      <h4 className="mt-1 font-display text-xl tracking-wide text-white uppercase">
                        {m.model}
                      </h4>
                    </div>
                  </div>
                  <div className="font-mono text-xs tracking-[0.12em] text-tnt-amber tabular-nums uppercase">
                    {m.capacityTons}T
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-3 text-xs text-white/75">
                  <div>
                    <p className="font-body text-[10px] tracking-[0.12em] text-white/45 uppercase">
                      Make
                    </p>
                    <p className="mt-1 text-sm text-white/90">{m.make}</p>
                  </div>
                  <div>
                    <p className="font-body text-[10px] tracking-[0.12em] text-white/45 uppercase">
                      Capacity
                    </p>
                    <p className="mt-1 text-sm text-white/90">{m.capacityTons} Ton</p>
                  </div>
                </div>

                <a
                  href={m.chartHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-1.5 font-body text-[10px] font-semibold tracking-[0.12em] text-tnt-amber uppercase"
                >
                  View PDF
                  <Icon name="arrow" className="h-3 w-3" strokeWidth={2.5} />
                </a>
              </article>
            ))}
          </div>
        ) : (
          <div className="px-4 py-12 text-center text-sm text-white/50">
            No machines match that search.
          </div>
        )}
      </div>

      <div data-lenis-prevent className="hidden max-h-[60vh] overflow-auto overscroll-contain sm:block sm:max-h-[32rem]">
        <table className="w-full border-collapse font-body text-sm">
          <thead className="sticky top-0 z-10 bg-tnt-navy">
            <tr className="border-b border-white/10 text-left text-[10px] tracking-[0.12em] text-white/50 uppercase sm:text-[11px] sm:tracking-[0.14em]">
              <th className="px-4 py-3 font-semibold sm:px-8">Class</th>
              <th className="px-2 py-3 font-semibold sm:px-3">Make</th>
              <th className="px-2 py-3 font-semibold sm:px-3">Model</th>
              <th className="px-2 py-3 font-semibold sm:px-3">
                <button
                  type="button"
                  onClick={() =>
                    setSortDir((d) => (d === "asc" ? "desc" : "asc"))
                  }
                  className="inline-flex items-center gap-1 hover:text-white"
                >
                  Capacity
                  <Icon
                    name="arrow"
                    className={`h-3 w-3 rotate-90 transition-transform ${
                      sortDir === "asc" ? "" : "-rotate-90"
                    }`}
                    strokeWidth={2.5}
                  />
                </button>
              </th>
              <th className="px-2 py-3 pr-4 font-semibold sm:px-3 sm:pr-8">
                Load Chart
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((m) => (
              <tr
                key={`${m.make}-${m.model}-${m.chartHref}`}
                className="border-b border-white/5 hover:bg-white/[0.04]"
              >
                <td className="px-4 py-2.5 text-white/70 sm:px-8">
                  <Icon
                    name={TYPE_ICON[m.type]}
                    className="h-4 w-4 text-tnt-amber"
                    strokeWidth={1.8}
                  />
                  <span className="sr-only">{CRANE_TYPE_LABELS[m.type]}</span>
                </td>
                <td className="px-2 py-2.5 text-xs text-white/80 sm:px-3 sm:text-sm">{m.make}</td>
                <td className="px-2 py-2.5 font-semibold text-xs text-white sm:px-3 sm:text-sm">
                  {m.model}
                </td>
                <td className="px-2 py-2.5 tabular-nums text-xs text-white/80 sm:px-3 sm:text-sm">
                  {m.capacityTons} Ton
                </td>
                <td className="px-2 py-2.5 pr-4 sm:px-3 sm:pr-8">
                  <a
                    href={m.chartHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 font-body text-[10px] font-semibold tracking-wide text-tnt-amber uppercase hover:text-tnt-amber-vivid sm:text-xs"
                  >
                    View PDF
                    <Icon name="arrow" className="h-3 w-3" strokeWidth={2.5} />
                  </a>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-8 py-12 text-center text-white/50"
                >
                  No machines match that search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Disclaimer — matches TNT's own load-chart disclaimer language */}
      <p className="border-t border-white/10 px-6 py-4 font-body text-xs text-white/40 sm:px-8">
        Weights and measurements shown in load charts are a guide provided by
        the manufacturer for preliminary calculations only, and may vary due
        to site-specific conditions.
      </p>
    </div>
  );
}
