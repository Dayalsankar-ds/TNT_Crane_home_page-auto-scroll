"use client";

/**
 * RIGGING & ATTACHMENTS — the mid-page DARK BAND of the Technical Paper
 * rhythm. Formerly "Fleet Guide": a 7-card catalog of crane CLASSES
 * (Crawler, All-Terrain, Tower, …). Replaced entirely (2026-08-26, on
 * request) with a catalog of rigging equipment/attachments instead — same
 * card UI, same checkbox-compare mechanic, different subject.
 *
 * 6 CARDS, UP FROM AN INITIAL 3 (2026-08-26, later same day) — the first
 * pass concluded "only 3 categories have a real photo" from Unsplash search
 * results alone, which was too hasty: tntcrane.com and rmscranes.com's own
 * service pages (RMS Cranes is "A TNT Company") turned out to have real,
 * verified photography for several more categories, found on a asked-for
 * cross-check. Each card ties to a real service CoreServices.tsx already
 * claims, still nothing invented — see photos.ts's RIGGING_PHOTOS docblock
 * for exactly which real job backs each card:
 *   - Hydraulic Gantry Systems → "Hydraulic gantries… where a crane can't
 *     reach" (Specialized Rigging blurb)
 *   - Cantilever & Spreader Bar Rigging → the same Specialized Rigging
 *     service's below-the-hook/custom-fixture side (this replaces the
 *     original "Below-the-Hook Lifting Devices" card: a cantilever bar IS a
 *     below-the-hook device, and now has a real photo of one instead of a
 *     generic Unsplash hook-block standing in for the category)
 *   - In-Plant Overhead Rigging → machinery moves inside facilities that
 *     already run their own bridge cranes (Machinery Moving blurb) — still
 *     the one category without a found real photo; kept on its Unsplash
 *     fallback rather than dropped
 *   - SPMT & Modular Transport → self-propelled modular transporters, the
 *     heavy-haul side of Machinery Moving
 *   - Jack-and-Slide Systems → named explicitly in the Specialized Rigging
 *     blurb ("jack-and-slide, and precision skidding")
 *   - Versa-Lift Machinery Moving → the Machinery Moving service's toe-jack/
 *     rigging-dolly equipment, TNT-branded in the photo itself
 * A sixth candidate (a photo filed under "…Personnel…") was left out on
 * inspection — it showed a forklift loading HVAC units, not a man-basket/
 * personnel platform the filename implied. Mislabeling real footage is worse
 * than not having the category, so it's absent rather than force-fit.
 *
 * No machine counts or capacity ranges here — unlike the old crane-class
 * cards (which had navigation.ts's real "80–750 T" figures to draw on),
 * there is no equivalent honest numeric figure for these categories, so the
 * footer carries a description instead and the compare view shows
 * descriptions side by side rather than fabricating numbers to fill the
 * old dl layout.
 *
 * NAV IMPACT: navigation.ts's Equipment mega panel "Fleet Classes" column
 * pointed at 7 old class anchors, then 3 rigging ones; it was updated again
 * alongside this file to list all 6 current categories, so the panel
 * doesn't link to stale ids. The section itself keeps `id="fleet-guide"` —
 * the nav group's own `href` target — since renaming that anchor would need
 * touching every place that links to the group, not just its sub-items.
 *
 * Card UI/compare mechanic docs below are otherwise unchanged from Fleet
 * Guide's own history — see git log for the checkbox-vs-decorative-arrow
 * background if that ever needs re-litigating.
 */

import { useEffect, useRef, useState } from "react";
import { Eyebrow, Icon, type IconName } from "./primitives";
import RevealText from "./RevealText";
import { IMG, PHOTOS, RIGGING_PHOTOS, GRADIENTS } from "./photos";
import { slugify } from "./navigation";

type RiggingCategory = {
  index: string;
  title: string;
  description: string;
  icon: IconName;
  /** Unsplash fallback id — only set where no real photo has been found. */
  photo?: string;
  /** Real, locally-hosted photo (RIGGING_PHOTOS) — used over `photo` when present. */
  localPhoto?: string;
  gradient: string;
};

const RIGGING: RiggingCategory[] = [
  {
    index: "01",
    title: "Hydraulic Gantry Systems",
    description:
      "Rail-mounted and hydraulic gantries for repeat heavy lifts in one fixed working area — ports, yards, and fabrication shops.",
    icon: "heavylift",
    localPhoto: RIGGING_PHOTOS.hydraulicGantry,
    gradient: GRADIENTS.navy,
  },
  {
    index: "02",
    title: "Cantilever & Spreader Bar Rigging",
    description:
      "Custom cantilever bars and spreader beams for loads a standard hook can't rig safely — set flush against structure where clearance is tight.",
    icon: "rigging",
    localPhoto: RIGGING_PHOTOS.cantileverSpreaderBar,
    gradient: GRADIENTS.slate,
  },
  {
    index: "03",
    title: "In-Plant Overhead Rigging",
    description:
      "Machinery moves and precision positioning inside facilities already running their own overhead bridge cranes.",
    icon: "engineering",
    photo: PHOTOS.overheadBridgeCraneReal,
    gradient: GRADIENTS.maroon,
  },
  {
    index: "04",
    title: "SPMT & Modular Transport",
    description:
      "Self-propelled modular transporters for the heaviest, most awkward loads — hydraulic axles that steer independently for millimetre placement.",
    icon: "transport",
    localPhoto: RIGGING_PHOTOS.spmtModularTransport,
    gradient: GRADIENTS.navy,
  },
  {
    index: "05",
    title: "Jack-and-Slide Systems",
    description:
      "Hydraulic jacking and skid rails for loads too heavy or awkward to crane — set down, levelled, and walked into final position.",
    icon: "heavylift",
    localPhoto: RIGGING_PHOTOS.jackAndSlide,
    gradient: GRADIENTS.slate,
  },
  {
    index: "06",
    title: "Versa-Lift Machinery Moving",
    description:
      "Toe-jack rigging dollies for plant relocation — transformers, switchgear, and process equipment moved without a crane pick.",
    icon: "rental",
    localPhoto: RIGGING_PHOTOS.versaLiftMachineryMoving,
    gradient: GRADIENTS.maroon,
  },
];

const TOTAL = String(RIGGING.length).padStart(2, "0");

/** Inline, not the shared Icon set — same call EquipmentFinder's modal close
 *  button already made for a one-off glyph nothing else in the site needs. */
function CheckGlyph({ checked }: { checked: boolean }) {
  return checked ? (
    <svg viewBox="0 0 20 20" aria-hidden="true" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="m4 10 4 4 8-8" />
    </svg>
  ) : (
    <svg viewBox="0 0 20 20" aria-hidden="true" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}>
      <rect x="3" y="3" width="14" height="14" rx="3" />
    </svg>
  );
}

export default function EquipmentGuide() {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [compareOpen, setCompareOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  const toggle = (index: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const selectedCategories = RIGGING.filter((r) => selected.has(r.index));

  // Same lock/focus/Escape pattern as EquipmentFinder's capacity-chart modal.
  useEffect(() => {
    if (!compareOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setCompareOpen(false);
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
  }, [compareOpen]);

  return (
    <section id="fleet-guide" className="bg-tnt-navy text-white">
      <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
        <div className="max-w-3xl">
          <Eyebrow>Rigging &amp; Attachments</Eyebrow>
          <RevealText
            as="h2"
            barClassName="bg-tnt-amber"
            text="The Gear Behind Every Lift."
            className="mt-4 font-display text-5xl leading-[0.95] tracking-tight text-white uppercase sm:text-7xl"
          />
          <p className="mt-4 font-body text-sm text-white/60 sm:text-base">
            Check any categories you need and compare them side by side.
          </p>
        </div>

        {/* FLEX, not grid (2026-08-04, carried over from Fleet Guide). At 3
            cards this never wraps to a short leftover row the way 7 did, but
            the basis math is kept identical so a 4th category can drop in
            later without redoing the layout. */}
        <div className="mt-16 flex flex-wrap justify-start gap-6">
          {RIGGING.map((r) => {
            const isChecked = selected.has(r.index);
            return (
              <div
                key={r.index}
                // Deep-link target for the nav's Equipment panel — see
                // docblock. A plain element with an id and scroll-mt is
                // exactly as valid an anchor target as the old <Link> was.
                id={slugify(r.title)}
                className={`group flex basis-full flex-col scroll-mt-32 overflow-hidden rounded-2xl border bg-black transition-[transform,border-color] duration-300 ease-out hover:-translate-y-1 sm:basis-[calc(50%-0.75rem)] lg:basis-[calc(25%-1.125rem)] ${
                  isChecked
                    ? "border-tnt-amber"
                    : "border-white/10 hover:border-tnt-amber/60"
                }`}
              >
                {/* Photo */}
                <div
                  className="relative aspect-4/3 shrink-0 overflow-hidden"
                  style={{ backgroundImage: r.gradient }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={r.localPhoto ?? IMG(r.photo ?? "", 800)}
                    alt=""
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  <span className="absolute top-4 left-4 rounded-full bg-black/60 px-3 py-1 font-mono text-[11px] tracking-[0.14em] text-white/80 tabular-nums backdrop-blur-sm">
                    <span className="text-tnt-amber">{r.index}</span> / {TOTAL}
                  </span>
                </div>

                {/* Footer bar — icon + title/description on the left, compare
                   checkbox tile right. `flex-1` makes it eat the card's
                   leftover height so the tile always lands flush on the
                   bottom edge, whatever the title/description wrapped to. */}
                <div className="flex flex-1 items-stretch justify-between gap-3 bg-black">
                  <div className="flex min-w-0 items-center gap-3 px-4 py-5">
                    <Icon
                      name={r.icon}
                      className="h-8 w-8 shrink-0 text-tnt-amber"
                      strokeWidth={1.5}
                    />
                    <div>
                      <h3 className="font-display text-sm leading-tight tracking-wide text-white uppercase">
                        {r.title}
                      </h3>
                      <p className="mt-1.5 font-body text-[12px] leading-snug text-white/50">
                        {r.description}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggle(r.index)}
                    aria-pressed={isChecked}
                    aria-label={
                      isChecked
                        ? `Remove ${r.title} from comparison`
                        : `Add ${r.title} to comparison`
                    }
                    className={`flex w-14 shrink-0 items-center justify-center transition-colors duration-300 focus-visible:ring-2 focus-visible:ring-tnt-amber focus-visible:outline-none ${
                      isChecked
                        ? "bg-tnt-amber-vivid text-black"
                        : "bg-tnt-amber text-black hover:bg-tnt-amber-vivid"
                    }`}
                  >
                    <CheckGlyph checked={isChecked} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Compare bar — appears once there's something to compare. */}
        {selected.size >= 2 && (
          <div className="mt-8 flex flex-wrap items-center gap-4 rounded-xl border border-tnt-amber/40 bg-white/5 px-6 py-4">
            <p className="font-body text-sm text-white/80">
              <span className="font-bold text-tnt-amber">{selected.size}</span>{" "}
              categories selected
            </p>
            <button
              ref={triggerRef}
              type="button"
              onClick={() => setCompareOpen(true)}
              className="ml-auto rounded-full bg-tnt-amber px-6 py-2 font-body text-sm font-semibold text-black transition-colors duration-300 hover:bg-tnt-amber-vivid"
            >
              Compare
            </button>
            <button
              type="button"
              onClick={() => setSelected(new Set())}
              className="font-body text-sm text-white/50 underline-offset-4 hover:text-white hover:underline"
            >
              Clear
            </button>
          </div>
        )}
      </div>

      {compareOpen && (
        // `data-lenis-prevent`: same fix as EquipmentFinder's capacity-chart
        // modal and CraneCapacityChart's table — without it, a wheel over
        // this overlay scrolls the (locked) page instead of the dialog.
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="compare-heading"
          data-lenis-prevent
          className="fixed inset-0 z-[60] overflow-y-auto overscroll-contain bg-black/70 p-4 py-10 sm:p-8"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setCompareOpen(false);
          }}
        >
          <div className="relative mx-auto w-full max-w-4xl rounded-2xl border border-white/10 bg-tnt-navy p-6 text-white sm:p-8">
            <button
              ref={closeRef}
              type="button"
              onClick={() => setCompareOpen(false)}
              aria-label="Close comparison"
              className="absolute top-4 right-4 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black text-white hover:border-tnt-amber hover:text-tnt-amber focus-visible:ring-2 focus-visible:ring-tnt-amber focus-visible:outline-none"
            >
              <svg viewBox="0 0 20 20" aria-hidden="true" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
                <path d="m5 5 10 10M15 5 5 15" />
              </svg>
            </button>

            <h2 id="compare-heading" className="font-display text-3xl tracking-wide uppercase sm:text-4xl">
              Compare Rigging &amp; Attachments
            </h2>
            <p className="mt-2 font-body text-sm text-white/60">
              What each category covers, side by side — talk to an engineer
              for a specific rigging plan.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {selectedCategories.map((r) => (
                <div key={r.index} className="relative rounded-xl border border-white/10 bg-white/5 p-5">
                  <button
                    type="button"
                    onClick={() => toggle(r.index)}
                    aria-label={`Remove ${r.title} from comparison`}
                    className="absolute top-3 right-3 text-white/40 hover:text-white"
                  >
                    <svg viewBox="0 0 20 20" aria-hidden="true" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
                      <path d="m5 5 10 10M15 5 5 15" />
                    </svg>
                  </button>
                  <Icon name={r.icon} className="h-8 w-8 text-tnt-amber" strokeWidth={1.5} />
                  <h3 className="mt-3 font-display text-lg tracking-wide uppercase">
                    {r.title}
                  </h3>
                  <p className="mt-3 border-t border-white/10 pt-3 font-body text-sm leading-relaxed text-white/70">
                    {r.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
