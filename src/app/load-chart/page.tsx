/**
 * LOAD CHART — dedicated page for the 6 crane types + full capacity chart
 * (2026-09-29, on request: "I want to have dedicated page for all list of 6
 * cranes"). The nav's "Load Chart" group used to be seven same-page anchors
 * into the homepage's EquipmentGuide.tsx ("About the Fleet") — six crane
 * types plus a "View Full Capacity Chart" CTA that popped a modal. That
 * section is unchanged; navigation.ts's seven links now land here instead
 * (see that file's own note on the group).
 *
 * Crane-type data is fleetTypes.ts's FLEET_TYPES, shared with
 * EquipmentGuide.tsx — one source, so this page and the homepage section
 * can't drift apart on names/photos/icons. That data lives in its own
 * plain (non-"use client") module rather than inside EquipmentGuide.tsx
 * itself: a Server Component importing a named data export from a Client
 * Component module doesn't get the real value at runtime in the App
 * Router — it resolves to a client reference instead, which broke with
 * `FLEET_TYPES.map is not a function` the first time this page tried it.
 *
 * The capacity chart (CraneCapacityChart.tsx, the real 157-model dataset)
 * renders inline here now instead of only in EquipmentGuide.tsx's modal —
 * a full filterable table suits a dedicated page better than an overlay.
 * That modal still exists and still works from the homepage section's own
 * button (untouched); this page just gives the nav a second, non-modal way
 * to reach the same data.
 *
 * Server component, no client state — same reasoning as the fact that
 * every button here either follows a plain `href` or sits on the solid
 * amber closing panel (which, like crane-rental's, wants its on-light skin
 * regardless of the site's Light/Dark toggle, so none of them need
 * `onDark`).
 */

import Link from "next/link";
import { Eyebrow, Icon } from "@/components/site/primitives";
import Button from "@/components/site/Button";
import { FLEET_TYPES } from "@/components/site/fleetTypes";
import CraneCapacityChart from "@/components/site/CraneCapacityChart";
import { slugify } from "@/components/site/navigation";

export default function LoadChartPage() {
  return (
    <div className="bg-white text-black dark:bg-black dark:text-white">
      {/* ── Header ────────────────────────────────────────────────────── */}
      <section className="border-b border-black/10 dark:border-white/10">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <Link
            href="/#fleet-guide"
            className="inline-flex items-center gap-2 font-body text-sm font-semibold text-tnt-amber hover:text-black dark:hover:text-white"
          >
            <Icon name="arrow" className="h-4 w-4 rotate-180" />
            Back to About the Fleet
          </Link>

          <Eyebrow className="mt-8">Load Chart</Eyebrow>
          <h1 className="mt-4 font-display text-5xl leading-[0.95] tracking-tight uppercase sm:text-6xl">
            Six Crane Classes, One Fleet
          </h1>
          <p className="mt-6 max-w-2xl font-body text-base leading-relaxed text-tnt-body sm:text-lg">
            700+ cranes across six classes, dispatched from 45+ branches
            across the US and Canada. Browse the fleet below, then check the
            full capacity chart for exact rated loads by make and model.
          </p>
        </div>
      </section>

      {/* ── Six crane types ───────────────────────────────────────────── */}
      <section className="bg-tnt-gray dark:bg-tnt-slate">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FLEET_TYPES.map((t) => (
              <div
                key={t.name}
                id={slugify(t.name)}
                className="scroll-mt-32 overflow-hidden rounded-2xl border border-black/10 bg-white dark:border-white/10 dark:bg-black"
              >
                <div
                  className="relative aspect-4/3 overflow-hidden"
                  style={{ backgroundImage: t.gradient }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={t.photo}
                    alt={t.name}
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                  {!t.isRealFleetPhoto && (
                    <span className="absolute top-3 right-3 rounded-full bg-black/60 px-2.5 py-1 font-mono text-[10px] tracking-[0.1em] text-white/80 uppercase backdrop-blur-sm">
                      Stock photo
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 p-5">
                  <Icon
                    name={t.icon}
                    className="h-6 w-6 shrink-0 text-tnt-amber"
                    strokeWidth={1.5}
                  />
                  <span className="font-display text-lg tracking-wide uppercase">
                    {t.name}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Full capacity chart ───────────────────────────────────────── */}
      <section id="capacity-chart" className="scroll-mt-32">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <CraneCapacityChart />
        </div>
      </section>

      {/* ── Closing CTA ───────────────────────────────────────────────── */}
      <section className="bg-tnt-amber">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
          <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
            <p className="font-display text-2xl leading-tight tracking-wide text-black uppercase sm:text-3xl">
              Need help picking the right crane?
              <br />
              Tell us the load, the site, and the window.
            </p>
            <div className="flex shrink-0 gap-4">
              <Button href="/#quote" variant="primary">
                Request a Quote
              </Button>
              <Button href="tel:+18007992505" variant="secondary">
                Call 1-800-799-2505
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
