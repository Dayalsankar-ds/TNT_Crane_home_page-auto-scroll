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
      <div className="flex flex-col gap-5 border-b border-white/10 p-6 sm:p-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h3
              id="capacity-chart-heading"
              className="font-display text-2xl tracking-wide text-white uppercase sm:text-3xl"
            >
              Full Capacity Chart
            </h3>
            <p className="mt-1 font-body text-sm text-white/60">
              {CRANE_MODELS.length} machines, every rated capacity and
              manufacturer load chart on file.
            </p>
          </div>
          <p className="font-mono text-xs tracking-[0.14em] text-tnt-amber tabular-nums uppercase">
            Showing {rows.length} of {CRANE_MODELS.length}
          </p>
        </div>

        {/* Controls: type filter tabs + search */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setActiveType("all")}
              className={`rounded-full border px-3.5 py-1.5 font-body text-xs font-semibold tracking-wide uppercase transition-colors ${
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
                className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 font-body text-xs font-semibold tracking-wide uppercase transition-colors ${
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

      {/* Table — `data-lenis-prevent` so a wheel over this nested scroll
         region moves the table, not the (also-scrollable) modal behind it or
         the locked page. Same reasoning as the dialog wrapper in
         EquipmentFinder.tsx. */}
      <div data-lenis-prevent className="max-h-[32rem] overflow-y-auto overscroll-contain">
        <table className="w-full border-collapse font-body text-sm">
          <thead className="sticky top-0 z-10 bg-tnt-navy">
            <tr className="border-b border-white/10 text-left text-[11px] tracking-[0.14em] text-white/50 uppercase">
              <th className="px-6 py-3 font-semibold sm:px-8">Class</th>
              <th className="px-3 py-3 font-semibold">Make</th>
              <th className="px-3 py-3 font-semibold">Model</th>
              <th className="px-3 py-3 font-semibold">
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
              <th className="px-3 py-3 pr-6 font-semibold sm:pr-8">
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
                <td className="px-6 py-2.5 text-white/70 sm:px-8">
                  <Icon
                    name={TYPE_ICON[m.type]}
                    className="h-4 w-4 text-tnt-amber"
                    strokeWidth={1.8}
                  />
                  <span className="sr-only">{CRANE_TYPE_LABELS[m.type]}</span>
                </td>
                <td className="px-3 py-2.5 text-white/80">{m.make}</td>
                <td className="px-3 py-2.5 font-semibold text-white">
                  {m.model}
                </td>
                <td className="px-3 py-2.5 tabular-nums text-white/80">
                  {m.capacityTons} Ton
                </td>
                <td className="px-3 py-2.5 pr-6 sm:pr-8">
                  <a
                    href={m.chartHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 font-body text-xs font-semibold tracking-wide text-tnt-amber uppercase hover:text-tnt-amber-vivid"
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
