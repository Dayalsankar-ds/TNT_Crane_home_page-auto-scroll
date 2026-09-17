/**
 * ABOUT THE FLEET (2026-09-13, on request) — replaces the "Rigging &
 * Attachments" card-grid + compare-modal section entirely, with content
 * matching tntcrane.com's own "About the Fleet" homepage section, restyled
 * in this site's own type/color system rather than copied verbatim:
 *   - Eyebrow "About the Fleet" + heading "A Modern Fleet of More Than 700
 *     Cranes" (their exact copy)
 *   - Their 6-item crane-type list (All-Terrain, Crawler, Hydraulic Truck,
 *     Rough-Terrain, Carry Deck, Tower)
 *   - Their two closing paragraphs (specialized rigging equipment, then
 *     Machinery Moving / Industrial Storage) as descriptive copy.
 *
 * NO CTA BUTTON — a "Talk to an engineer" button briefly lived here, added
 * on the assumption every section should close with one (the pattern
 * elsewhere on this site). Checked the live section directly: it has no CTA
 * at all — just the two paragraphs, plus inline links on "Machinery
 * Moving"/"Industrial Storage" within the second one pointing at those
 * service pages. Removed to match the actual source rather than an
 * invented convention.
 *
 * SCROLLING PHOTO GALLERY (2026-09-13, on request: "add that images... I
 * prefer scrolling type"): the plain bulleted list is now a horizontal,
 * snap-scrolling gallery of the same 6 crane types — real photography where
 * it exists, a plain gradient+icon tile where it doesn't (see below). Native
 * CSS scroll-snap (`overflow-x-auto snap-x`), no carousel library or client
 * state needed. Text content moved above the gallery (was beside the list
 * in a 2-column grid) since a full-bleed-width gallery and a side column
 * don't coexist — the copy now reads as an intro, the gallery as what it's
 * introducing.
 *
 * SINGLE-PHOTO SLIDESHOW (2026-09-17, on request: "one single image
 * placeholder need to change one by one" — didn't like the 6-card scroll
 * gallery's image placement): replaced the horizontal gallery with one
 * large photo beside a clickable list of the same 6 crane types. The photo
 * crossfades to match whichever type is active; active state both
 * auto-advances (every 4s, on request — "auto-rotate + labels") and can be
 * jumped to directly by clicking a label, same interaction shape as
 * StorySlideshow.tsx's own autoplaying card grid (4s cadence,
 * reduced-motion opt-out, gated on the section being in view — copied
 * rather than reinvented, so the two autoplay features on this page behave
 * identically). Each label keeps the slugified `id` the old cards carried,
 * so navigation.ts's Fleet panel deep links still land on something real.
 *
 * 3 REAL + 3 STOCK, ALL 6 WITH A PHOTO (2026-09-13, same day — a bare
 * gradient tile for 3 of 6 cards read as "missing photos" sitting next to
 * ones that had them, in a gallery where all 6 are visible side by side —
 * on request, made consistent instead): all-terrain, crawler, and hydraulic
 * truck cranes are real TNT photography, downloaded and inspected from
 * tntcrane.com's own homepage (FLEET_PHOTOS in photos.ts has the full
 * sourcing note and file provenance). Rough-Terrain, Carry Deck, and Tower
 * Cranes use verified Unsplash stock instead (PHOTOS.roughTerrainCrane /
 * carryDeckCrane / towerCrane) — genuine photos of that equipment class,
 * just not TNT's own fleet, and not claimed to be. A set of same-named PNGs
 * already existed on disk for exactly these 3 categories; opened and
 * inspected, they turned out to be synthetic/AI-generated (see
 * FLEET_PHOTOS's own docblock) and were left unused rather than reached
 * for — a genuine stock photo beats a fabricated "real" one.
 *
 * Each card keeps its own `id` (slugified) and `scroll-mt-32` so
 * navigation.ts's Fleet panel sub-items still have something real to deep-
 * link to, same pattern the old card grid used.
 *
 * Section keeps `id="fleet-guide"` — navigation.ts's "Fleet" group href
 * still points at it; renaming the anchor would mean touching every place
 * that links to the group, not just this file.
 *
 * LIGHT GREY THEME: shell is `bg-tnt-gray` (#eeeeee — this token's own
 * globals.css comment literally calls it out for "alternating section
 * backgrounds"), not plain white, so this section reads as its own tinted
 * band between the white Full-Scope Capability section above and whatever
 * follows, rather than blending into either.
 */

"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Eyebrow, Icon, type IconName } from "./primitives";
import Button from "./Button";
import CraneCapacityChart from "./CraneCapacityChart";
import { slugify } from "./navigation";
import { FLEET_PHOTOS, PHOTOS, IMG, GRADIENTS } from "./photos";
import { useColorScheme } from "./colorSchemeStore";
import { useCapacityChartOpen } from "./capacityChartStore";

type FleetType = {
  name: string;
  icon: IconName;
  photo: string;
  /** True only for FLEET_PHOTOS's real, locally-hosted set — drives the
   *  "Stock photo" corner tag below, so a genuine TNT photo and a stand-in
   *  Unsplash one are never presented as if they were the same kind of
   *  claim. */
  isRealFleetPhoto: boolean;
  gradient: string;
};

const FLEET_TYPES: FleetType[] = [
  { name: "All-Terrain Cranes", icon: "allterrain", photo: FLEET_PHOTOS.allTerrainCrane, isRealFleetPhoto: true, gradient: GRADIENTS.navy },
  { name: "Crawler Cranes", icon: "crawler", photo: FLEET_PHOTOS.crawlerCrane, isRealFleetPhoto: true, gradient: GRADIENTS.slate },
  { name: "Hydraulic Truck Cranes", icon: "boom", photo: FLEET_PHOTOS.hydraulicTruckCrane, isRealFleetPhoto: true, gradient: GRADIENTS.maroon },
  { name: "Rough-Terrain Cranes", icon: "transport", photo: IMG(PHOTOS.roughTerrainCrane, 800), isRealFleetPhoto: false, gradient: GRADIENTS.navy },
  { name: "Carry Deck Cranes", icon: "carrydeck", photo: IMG(PHOTOS.carryDeckCrane, 800), isRealFleetPhoto: false, gradient: GRADIENTS.slate },
  { name: "Tower Cranes", icon: "tower", photo: IMG(PHOTOS.towerCrane, 800), isRealFleetPhoto: false, gradient: GRADIENTS.maroon },
];

export default function EquipmentGuide() {
  // Opens the full capacity chart (restored 2026-09-17, on request — it
  // previously lived on the now-removed EquipmentFinder section, deleted
  // 2026-09-10 along with its "Find Your Machine" section; the button and
  // modal wiring here are that same mechanism, just triggered from About
  // the Fleet instead) in a modal rather than inline, same reasoning as
  // before: keep the full filterable table off the page by default.
  //
  // Backed by capacityChartStore.ts (2026-09-18, on request), not local
  // state: the Fleet nav dropdown's "View Full Capacity Chart" CTA
  // (SiteNav.tsx) needs to open this exact same modal, and that's a
  // completely separate component tree — a shared store is what lets a
  // click there flip the same boolean this component reads.
  const [chartOpen, setChartOpen] = useCapacityChartOpen();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  // Drives the button's own dark-mode skin below (2026-09-18, on request:
  // "change the button color in dark mode") — Button.tsx's colors are
  // controlled by its `onDark` prop, not a Tailwind `dark:` class, so this
  // section (which otherwise flips color purely via `dark:` utilities) has
  // to read the toggle directly for just this one component.
  const [colorScheme] = useColorScheme();

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

  // Single-photo slideshow — same shape as StorySlideshow.tsx's autoplay:
  // 4s cadence, off while the section is out of view or reduced-motion is
  // on, and any manual pick (clicking a label) restarts the 4s window
  // rather than getting immediately overridden by an in-flight timer.
  const [activeType, setActiveType] = useState(0);
  const galleryRef = useRef<HTMLDivElement>(null);
  const inViewRef = useRef(false);
  const reducedMotionRef = useRef(false);

  useEffect(() => {
    reducedMotionRef.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
  }, []);

  useEffect(() => {
    const el = galleryRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        inViewRef.current = entry.isIntersecting;
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (reducedMotionRef.current) return;
    const id = setInterval(() => {
      if (inViewRef.current) {
        setActiveType((i) => (i + 1) % FLEET_TYPES.length);
      }
    }, 4000);
    return () => clearInterval(id);
  }, [activeType]);

  const selectType = useCallback((i: number) => setActiveType(i), []);

  return (
    <section id="fleet-guide" className="bg-tnt-gray text-black dark:bg-tnt-slate dark:text-white">
      <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
        {/* TWO-SIDE LAYOUT (2026-09-18, on request: "divide that section in
            two, A side and B side — A side is left side which needs to
            have content, B side needs to have image"): the whole section
            is now one lg:grid-cols-2 row — side A (heading, paragraphs,
            the label list, and the capacity-chart button) on the left,
            side B (just the photo) on the right. Replaces the previous
            stacked layout (full-width text block, then a separate
            list+photo row below it). DOM order is content-then-photo, so
            mobile stacks the same way (content first, image below) rather
            than needing `order-*` utilities to reorder anything. */}
        <div ref={galleryRef} className="grid gap-10 lg:grid-cols-2 lg:items-stretch lg:gap-16">
          {/* ── SIDE A — content ─────────────────────────────────────── */}
          <div className="flex flex-col">
            <Eyebrow>About the Fleet</Eyebrow>
            <h2 className="mt-4 font-display text-5xl leading-[0.95] tracking-tight text-black uppercase sm:text-6xl dark:text-white">
              A modern fleet of
              <br />
              more than 700 cranes
            </h2>

            {/* The two closing paragraphs from the live site. Its own copy
                links "Specialized Rigging"/"Machinery Moving"/"Industrial
                Storage" out to those service pages — reproduced here as
                same-page anchors to CoreServices.tsx's own stage cards
                (identical slugs: `slugify("Specialized Rigging")` etc.),
                since those are the real equivalent sections on THIS site. */}
            <p className="mt-6 font-body text-base leading-relaxed text-tnt-body">
              TNT Crane &amp; Rigging is also proud to provide an extended
              fleet of{" "}
              <a
                href="#specialized-rigging"
                className="font-semibold text-tnt-amber underline-offset-2 hover:underline"
              >
                Specialized Rigging
              </a>{" "}
              equipment including Hydraulic Gantry Lift Systems, Jack &amp;
              Slide Systems, Machinery Skates, Specialized Forklifts,
              Cantilever Bars, Self-Propelled Modular Transporters, and other
              Specialized Rigging Equipment.
            </p>
            <p className="mt-4 font-body text-base leading-relaxed text-tnt-body">
              Need expert{" "}
              <a
                href="#machinery-moving"
                className="font-semibold text-tnt-amber underline-offset-2 hover:underline"
              >
                Machinery Moving
              </a>{" "}
              or secure{" "}
              <a
                href="#industrial-storage"
                className="font-semibold text-tnt-amber underline-offset-2 hover:underline"
              >
                Industrial Storage
              </a>
              ? TNT Crane &amp; Rigging has you covered — from precision
              equipment relocation to complex rigging in tight spaces and
              safe storage solutions, we handle it all with efficiency and
              care.
            </p>

            {/* Label list — click to jump, active state also driven by the
                4s autoplay above. Keeps each type's slugified `id` so
                navigation.ts's Fleet panel deep links still land on
                something real. */}
            <ul className="mt-8 flex flex-col gap-1">
              {FLEET_TYPES.map((t, i) => (
                <li key={t.name} id={slugify(t.name)} className="scroll-mt-32">
                  <button
                    type="button"
                    onClick={() => selectType(i)}
                    aria-current={i === activeType ? "true" : undefined}
                    className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3.5 text-left transition-colors ${
                      i === activeType
                        ? "border-tnt-amber bg-tnt-amber/10"
                        : "border-transparent hover:border-black/10 dark:hover:border-white/10"
                    }`}
                  >
                    <Icon
                      name={t.icon}
                      className={`h-6 w-6 shrink-0 ${
                        i === activeType ? "text-tnt-amber" : "text-black/40 dark:text-white/40"
                      }`}
                      strokeWidth={1.5}
                    />
                    <span
                      className={`font-body text-sm font-semibold ${
                        i === activeType ? "text-black dark:text-white" : "text-black/60 dark:text-white/60"
                      }`}
                    >
                      {t.name}
                    </span>
                  </button>
                </li>
              ))}
            </ul>

            {/* Opens the full capacity chart — every model TNT operates,
                filterable by class and searchable by make/model, each
                linking its real manufacturer load-chart PDF — in a modal. */}
            <Button
              ref={triggerRef}
              type="button"
              variant="primary"
              onDark={colorScheme === "dark"}
              onClick={() => setChartOpen(true)}
              className="mt-8"
            >
              View Full Capacity Chart
            </Button>
          </div>

          {/* ── SIDE B — photo ───────────────────────────────────────── */}
          {/* Every type's <img> stacked in the same box, crossfading via
              opacity so there's no layout shift between them.
              `lg:aspect-3/4`: a real portrait aspect ratio (on request,
              "a true tall/portrait shape"), not a height borrowed from
              `items-stretch`. `object-cover` on the <img>s below crops
              each (landscape-sourced) photo to fill it. Below `lg` (where
              side A stacks above this instead of sitting beside it) it
              keeps the original 4:3 / 16:10 landscape aspect ratios —
              portrait only reads as intentional next to a column beside
              it, not stacked full-width under one. */}
          <div className="relative aspect-4/3 overflow-hidden rounded-2xl border border-black/10 bg-white sm:aspect-16/10 lg:aspect-3/4 lg:self-start dark:border-white/10 dark:bg-black">
            {FLEET_TYPES.map((t, i) => (
              <div
                key={t.name}
                aria-hidden={i !== activeType}
                className={`absolute inset-0 transition-opacity duration-700 ease-out ${
                  i === activeType ? "opacity-100" : "opacity-0"
                }`}
                style={{ backgroundImage: t.gradient }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={t.photo}
                  alt={t.name}
                  loading={i === 0 ? "eager" : "lazy"}
                  className="absolute inset-0 h-full w-full object-cover"
                />
                {/* Honesty tag, not a design flourish — see the docblock's
                    "3 REAL + 3 STOCK" note. A generic Unsplash photo and an
                    actual TNT jobsite photo are different claims; this is
                    the one place on the card that says which is which. */}
                {!t.isRealFleetPhoto && (
                  <span className="absolute top-3 right-3 rounded-full bg-black/60 px-2.5 py-1 font-mono text-[10px] tracking-[0.1em] text-white/80 uppercase backdrop-blur-sm">
                    Stock photo
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {chartOpen && (
        // `data-lenis-prevent`: Lenis owns the wheel globally, so without it
        // a wheel over this overlay smooth-scrolls the (locked, overflow:
        // hidden) page behind it instead of this dialog's own content.
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="capacity-chart-heading"
          data-lenis-prevent
          className="fixed inset-0 z-[60] overflow-y-auto overscroll-contain bg-black/70 p-4 py-10 sm:p-8"
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
