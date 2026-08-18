"use client";

/**
 * SECTION 2 — EQUIPMENT & CAPACITY FINDER
 *
 * The "Find Your Machine" intro band: tall photo with the CAD axis readout on
 * the left, headline + Operated/Bare rental-model cards on the right.
 *
 * The 01–04 sticky equipment stack that used to follow was removed 2026-07-27:
 * its classes duplicated EquipmentGuide (now the single fleet catalog), and
 * the sticky-stack mechanism moved to CaseStudies.tsx with proof content.
 *
 * The full capacity chart (CraneCapacityChart) opens from a button here as a
 * modal (2026-08-18) rather than rendering inline in the section — on
 * request, to keep the chart off the main page by default. `"use client"`
 * is needed on this file for that toggle's state; every other piece of the
 * section was already effectively client-rendered via CursorReadout /
 * RevealText.
 */

import { useEffect, useRef, useState } from "react";
import { Eyebrow } from "./primitives";
import Button from "./Button";
import CraneCapacityChart from "./CraneCapacityChart";
import CursorReadout from "./CursorReadout";
import RevealText from "./RevealText";
import { GRADIENTS } from "./photos";

/**
 * Intro-block rental-model split (Operated vs. Bare). A DIFFERENT kind of
 * distinction from the 01–04 equipment classes below — it's the rental model,
 * not the machine class — which is why it lives in its own block above the list
 * rather than being merged into it.
 */
const RENTAL_MODELS = [
  {
    label: "Operated Rental",
    body: "Crane and certified operator, dispatched together. Our default model across every branch — the operator is part of the rental, not an add-on.",
  },
  {
    label: "Bare Rental",
    body: "Equipment only, self-operated. Available where your crew holds the required certifications — ask your branch to confirm eligibility.",
  },
];

export default function EquipmentFinder() {
  const [chartOpen, setChartOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  // Escape closes; body scroll is locked behind the sheet the same way the
  // mobile nav sheet locks it (see SiteNav.tsx) — Lenis leaves touch to
  // native momentum, so an overflow lock on <body> is all this needs.
  useEffect(() => {
    if (!chartOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setChartOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      triggerRef.current?.focus();
    };
  }, [chartOpen]);

  return (
    <section id="equipment" className="scroll-mt-32 bg-white">
      {/* ── INTRO BAND — exact recreation of Enerblock's "Industrialized vision
         and digital control…" split: a tall sharp-cornered photo with the CAD
         axis readout on the left, and a headline + short subline + two
         hairline cards on the right. Kept in TNT colors (amber accent) with
         the Anton display headline. White background (2026-07-30, was
         tnt-sand off-white) — the numbered 01–04 list below stays on white
         too. */}
      <div className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
          <div className="grid items-stretch gap-10 lg:grid-cols-2 lg:gap-16">
            {/* LEFT — tall photo, full column height, sharp corners. Demo stock
               (a fleet of cranes, matching the "which machine" question) with a
               gradient behind it, so a dead image degrades to tone rather than a
               broken icon. Swap the PHOTOS id for owned fleet photography. */}
            <div className="order-1">
              <CursorReadout variant="coords" className="h-full">
                <div
                  className="h-full"
                  style={{ backgroundImage: GRADIENTS.slate }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/photos/find-your-machine.jpg"
                    alt="TNT crawler crane at a job site at sunset"
                    className="aspect-4/5 h-full w-full object-cover sm:aspect-3/4 lg:aspect-auto"
                  />
                </div>
              </CursorReadout>
            </div>

            {/* RIGHT — eyebrow / headline / short subline, then the two cards */}
            <div className="order-2">
              <Eyebrow>Find Your Machine</Eyebrow>
              <RevealText
                as="h2"
                text="Equipment & Capacity Finder"
                className="mt-3 font-display text-5xl tracking-wide text-black uppercase sm:text-6xl"
              />
              <p className="mt-4 max-w-md font-body text-base text-tnt-body sm:text-lg">
                Every class, with rated capacity up front.
              </p>

              {/* Two rental-model cards — Enerblock's Approach/Company rhythm:
                 flat-caps label pinned to the top, body + welded arrow button
                 dropped to the bottom of a tall cell, hairline top rule with a
                 vertical divider between. */}
              <div className="mt-12 grid border-t border-[#E2E1DD] sm:grid-cols-2 sm:divide-x sm:divide-[#E2E1DD]">
                {RENTAL_MODELS.map((m, i) => (
                  <div
                    key={m.label}
                    className={`flex min-h-[13rem] flex-col justify-between py-6 sm:min-h-[16rem] ${
                      i === 1
                        ? "border-t border-[#E2E1DD] sm:border-t-0 sm:pl-8"
                        : "sm:pr-8"
                    }`}
                  >
                    <h3 className="font-body text-[13px] font-bold tracking-[0.16em] text-black uppercase">
                      {m.label}
                    </h3>
                    <div className="mt-8">
                      <p className="font-body text-[15px] leading-relaxed text-tnt-body">
                        {m.body}
                      </p>
                      <Button href="#coverage" variant="secondary" className="mt-6">
                        Learn more
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Opens the full capacity chart — every model TNT operates,
                 filterable by class and searchable by make/model, each
                 linking its real manufacturer load-chart PDF — in a modal
                 rather than the section itself. */}
              <Button
                ref={triggerRef}
                type="button"
                variant="primary"
                onClick={() => setChartOpen(true)}
                className="mt-10"
              >
                View Full Capacity Chart
              </Button>
            </div>
          </div>
        </div>
      </div>

      {chartOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="capacity-chart-heading"
          className="fixed inset-0 z-[60] overflow-y-auto bg-black/70 p-4 py-10 sm:p-8"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setChartOpen(false);
          }}
        >
          <div className="relative mx-auto w-full max-w-5xl">
            <button
              ref={closeRef}
              type="button"
              onClick={() => setChartOpen(false)}
              aria-label="Close capacity chart"
              className="absolute -top-3 -right-3 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-tnt-navy text-white hover:border-tnt-amber hover:text-tnt-amber focus-visible:ring-2 focus-visible:ring-tnt-amber focus-visible:outline-none"
            >
              <svg
                viewBox="0 0 20 20"
                aria-hidden="true"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
              >
                <path d="m5 5 10 10M15 5 5 15" />
              </svg>
            </button>
            <CraneCapacityChart />
          </div>
        </div>
      )}
    </section>
  );
}
