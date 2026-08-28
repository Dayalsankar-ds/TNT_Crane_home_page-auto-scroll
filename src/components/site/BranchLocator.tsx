"use client";

/**
 * BRANCH LOCATOR — the interactive "Find Your Nearest Branch" section.
 *
 * Replaces the hand-drawn Natural Earth coastline map. Heading, description and
 * the All / United States / Canada filter are carried over unchanged; the
 * search, marker selection and branch panel are rebuilt around a three-region
 * layout (search · map · detail) that stacks on smaller screens.
 *
 * State lives here rather than in <WorldMap> so the list, the markers and the
 * detail panel can never disagree about what is selected.
 *
 * The map itself is lazy-loaded: maplibre-gl is ~200KB gzipped and touches
 * `window` at import time, and none of it is needed to paint the header, the
 * search panel or the detail card.
 */

import dynamic from "next/dynamic";
import { useCallback, useMemo, useState } from "react";
import { Search, Phone, ArrowRight, Building2 } from "lucide-react";
import RevealText from "./RevealText";
import Button from "./Button";
import type { BranchLocatorData } from "./branchLocatorData";

// Lazy-loaded, ssr:false: maplibre-gl is ~200KB gzipped and touches `window`
// at import time. The section header, search panel and detail card all render
// without it.
const BranchMap = dynamic(
  () => import("@/components/ui/mapcn-map-route").then((m) => m.BranchMap),
  {
    ssr: false,
    loading: () => (
      <div className="aspect-[4/3] w-full animate-pulse rounded-2xl border border-white/10 bg-[#0B0B0B] lg:aspect-[5/4]" />
    ),
  },
);

// TNT operates in exactly two countries. "all" is the reset state, not a country.
const COUNTRIES = [
  { id: "all", label: "All" },
  { id: "US", label: "United States" },
  { id: "CA", label: "Canada" },
] as const;

type CountryId = (typeof COUNTRIES)[number]["id"];

export default function BranchLocator({ branches }: BranchLocatorData) {
  const [query, setQuery] = useState("");
  const [country, setCountry] = useState<CountryId>("all");
  const [selectedId, setSelectedId] = useState<string | null>("hou");
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // Matches city, state (code or full name), region, and operating brand.
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return branches.filter((b) => {
      if (country !== "all" && b.country !== country) return false;
      if (!q) return true;
      return (
        b.city.toLowerCase().includes(q) ||
        b.state.toLowerCase().includes(q) ||
        b.region.toLowerCase().includes(q) ||
        b.brand.toLowerCase().includes(q)
      );
    });
  }, [branches, query, country]);

  const visibleIds = useMemo(() => new Set(filtered.map((b) => b.id)), [filtered]);

  // Switching country keeps the current selection if it still fits the new
  // scope, otherwise jumps to the first branch in that country.
  const selectCountry = (next: CountryId) => {
    setCountry(next);
    setSelectedId((cur) => {
      const curBranch = branches.find((b) => b.id === cur);
      if (curBranch && (next === "all" || curBranch.country === next)) return cur;
      return branches.find((b) => next === "all" || b.country === next)?.id ?? null;
    });
  };

  const onSelect = useCallback((id: string) => setSelectedId(id), []);
  const onHover = useCallback((id: string | null) => setHoveredId(id), []);

  const selected = branches.find((b) => b.id === selectedId) ?? null;

  return (
    <section id="coverage" className="scroll-mt-32 bg-black">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
        <div className="max-w-2xl">
          <p className="font-body text-[13px] font-bold tracking-[0.18em] text-tnt-amber uppercase">
            North American Coverage
          </p>
          <RevealText
            as="h2"
            barClassName="bg-tnt-amber"
            text="Find Your Nearest Branch"
            className="mt-3 font-display text-4xl tracking-wide text-white uppercase sm:text-5xl"
          />
          <p className="mt-4 font-body text-base text-white/70 sm:text-lg">
            One fleet across the US and Canada. Pick a country or search a city
            or region to see the branch that mobilizes to your site.
          </p>
        </div>

        {/* Country filter */}
        <div className="mt-8 flex flex-wrap gap-2">
          {COUNTRIES.map((c) => {
            const on = country === c.id;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => selectCountry(c.id)}
                aria-pressed={on}
                className={`rounded-full border px-4 py-2 font-body text-sm font-semibold transition-colors ${
                  on
                    ? "border-tnt-amber bg-tnt-amber text-black"
                    : "border-white/20 text-white/80 hover:border-white/40 hover:text-white"
                }`}
              >
                {c.label}
              </button>
            );
          })}
        </div>

        {/* Desktop: search · map · detail. Tablet/mobile: stacked in that order,
            which is also the DOM order — no visual/reading-order mismatch. */}
        <div className="mt-10 grid gap-6 xl:grid-cols-[17rem_1fr_19rem] xl:items-start">
          {/* ── Search + results ───────────────────────────────────────── */}
          <div className="glass rounded-2xl p-4">
            <label htmlFor="branch-search" className="sr-only">
              Search by city, state, or branch
            </label>
            <div className="flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2 ring-1 ring-white/20 focus-within:ring-tnt-amber">
              <Search aria-hidden="true" className="h-4 w-4 shrink-0 text-white/70" />
              <input
                id="branch-search"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="City, state, or branch…"
                className="w-full bg-transparent font-body text-sm text-white placeholder:text-white/50 focus:outline-none"
              />
            </div>

            <p aria-live="polite" className="sr-only">
              {filtered.length} branches match.
            </p>

            {/* `data-lenis-prevent`: Lenis owns the wheel globally, so without
                it a wheel over this list smooth-scrolls the PAGE and the list
                never moves — measured at 583px of unreachable content. The
                matching `overscroll-behavior` rule is in globals.css. */}
            <ul
              data-lenis-prevent
              className="mt-3 max-h-64 space-y-1 overflow-y-auto overscroll-contain pr-1 lg:max-h-[26rem]"
            >
              {filtered.length === 0 && (
                <li className="px-2 py-2 font-body text-sm text-white/60">
                  No branches match “{query}”.
                </li>
              )}
              {filtered.map((b) => (
                <li key={b.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(b.id)}
                    onMouseEnter={() => setHoveredId(b.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    aria-current={selectedId === b.id ? "true" : undefined}
                    className={`flex w-full items-start gap-2 rounded-md px-2 py-2 text-left font-body text-sm transition-colors focus-visible:ring-2 focus-visible:ring-tnt-amber focus-visible:outline-none ${
                      selectedId === b.id
                        ? "bg-white/20 text-white"
                        : "text-white/80 hover:bg-white/10"
                    }`}
                  >
                    <Building2
                      aria-hidden="true"
                      className="mt-0.5 h-4 w-4 shrink-0 text-tnt-amber"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block">{b.city}</span>
                      <span className="block truncate font-mono text-[11px] text-white/45">
                        {b.brand}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Map ────────────────────────────────────────────────────── */}
          <BranchMap
            branches={branches}
            visibleIds={visibleIds}
            selectedId={selectedId}
            hoveredId={hoveredId}
            onSelect={onSelect}
            onHover={onHover}
            className="aspect-[4/3] w-full lg:aspect-[5/4]"
          />

          {/* ── Branch detail ──────────────────────────────────────────── */}
          {selected ? (
            <div className="glass rounded-2xl p-5">
              <p className="font-body text-[11px] font-bold tracking-[0.18em] text-tnt-amber uppercase">
                {selected.region}
              </p>
              <p className="mt-1 font-display text-2xl tracking-wide text-white uppercase">
                {selected.city}
              </p>
              <p className="mt-1.5 font-body text-[12px] font-semibold tracking-wide text-tnt-amber">
                Operated by {selected.brand}
              </p>

              <p className="mt-5 font-mono text-[11px] tracking-[0.14em] text-white/45 uppercase">
                Available Services
              </p>
              <ul className="mt-2 space-y-1.5">
                {selected.services.map((s) => (
                  <li
                    key={s}
                    className="flex items-start gap-2 font-body text-[13px] text-white/80"
                  >
                    <span
                      aria-hidden="true"
                      className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-tnt-amber"
                    />
                    {s}
                  </li>
                ))}
              </ul>

              <div className="mt-6 flex flex-col gap-2">
                <Button href="#coverage" variant="primary" onDark arrow={false}>
                  View branch
                </Button>
                <Button href="#quote" variant="secondary" onDark arrow={false}>
                  Request quote
                </Button>
                <a
                  href="tel:+18007992505"
                  className="flex items-center justify-center gap-2 rounded-md px-5 py-2.5 font-mono text-sm font-semibold text-tnt-amber transition-colors hover:text-white focus-visible:ring-2 focus-visible:ring-tnt-amber focus-visible:outline-none"
                >
                  <Phone aria-hidden="true" className="h-4 w-4" />
                  Call branch
                  <ArrowRight aria-hidden="true" className="h-4 w-4" />
                </a>
              </div>
            </div>
          ) : (
            <div className="glass rounded-2xl p-5">
              <p className="font-body text-sm text-white/60">
                Select a branch to see its services and contact options.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
