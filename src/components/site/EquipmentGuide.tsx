"use client";

/**
 * EQUIPMENT GUIDE — the mid-page DARK BAND of the Technical Paper rhythm.
 *
 * Laid out 4-then-3-centred since 2026-08-04 — see the note on the wrapper.
 *
 * 2026-07-30: rebuilt as a 7-card photo grid, replacing the previous single
 * crossfading stage + giant dim/bright hover list (user's own words: "I don't
 * want that listing"). Reference was a single card screenshot — photo, a
 * solid dark footer bar with an icon + title + machine count on the left, and
 * a large amber arrow tile flush right.
 *
 * This drops a fair amount of machinery the old version needed and this one
 * doesn't: there is no more "active" class, so the crossfade stage, the
 * hover-intent debounce, and the whole hash→active-index selection dance
 * (useHashTarget, pointer-liveness tracking) are gone. What MUST survive
 * unchanged is the deep-link anchor contract — the nav's Equipment mega panel
 * links straight to `/equipment#crawler-cranes` etc. for all 7 classes, plus
 * `/equipment#fleet-guide` for the group header (see navigation.ts). A plain
 * per-card `id={slugify(title)}` plus the section's own `id="fleet-guide"`
 * satisfies that with the browser's native anchor scroll — no JS required.
 *
 * Icons reuse the exact glyphs navigation.ts already assigns each class in
 * the nav dropdown, so the same machine reads with the same icon in both
 * places.
 *
 * Machine counts are PLACEHOLDERS (no real per-class fleet data exists yet —
 * today's other data is capacity ranges like "80–750 T", not counts). Chosen
 * to roughly sum to the "750 cranes" figure quoted elsewhere on the site;
 * swap for real numbers when available. Crawler Cranes' 180+ is the one
 * number given in the reference image itself, kept as-is.
 *
 * COMPARE (2026-08-21, on request): the cards used to be `<Link href=
 * "#fleet-guide">` — the whole card as a hit area for an anchor that just
 * scrolled back to this section's own heading, a placeholder with no real
 * destination (there's no per-class detail page). That's gone. Each card is
 * now a plain container with a real checkbox in the corner the arrow tile
 * used to occupy; checking 2+ opens a compare view. `capacityRange` is NOT
 * invented for this — it's the same "80–750 T"-style figures navigation.ts's
 * Equipment panel already carries per class, copied here rather than
 * imported, matching how the icons are already duplicated rather than
 * cross-imported from that file.
 */

import { useEffect, useRef, useState } from "react";
import { Eyebrow, Icon, type IconName } from "./primitives";
import RevealText from "./RevealText";
import { IMG, PHOTOS, GRADIENTS } from "./photos";
import { slugify } from "./navigation";

type FleetClass = {
  index: string;
  title: string;
  machines: string;
  /** Real figure — see navigation.ts's Equipment panel, same source. */
  capacityRange: string;
  icon: IconName;
  photo: string;
  gradient: string;
};

const FLEET: FleetClass[] = [
  {
    index: "01",
    title: "Crawler Cranes",
    machines: "180+",
    capacityRange: "80–750 T",
    icon: "crawler",
    photo: PHOTOS.crawlerCraneReal,
    gradient: GRADIENTS.slate,
  },
  {
    index: "02",
    title: "All-Terrain Cranes",
    machines: "210+",
    capacityRange: "75–900 T",
    icon: "allterrain",
    photo: PHOTOS.allTerrainCraneReal,
    gradient: GRADIENTS.navy,
  },
  {
    index: "03",
    title: "Rough-Terrain Cranes",
    machines: "130+",
    capacityRange: "15–150 T",
    icon: "carrydeck",
    photo: PHOTOS.roughTerrainCraneReal,
    gradient: GRADIENTS.slate,
  },
  {
    index: "04",
    title: "Boom Trucks",
    machines: "120+",
    capacityRange: "10–50 T",
    icon: "boom",
    photo: PHOTOS.boomTruckReal,
    gradient: GRADIENTS.navy,
  },
  {
    index: "05",
    title: "Tower Cranes",
    machines: "35+",
    capacityRange: "5–40 T",
    icon: "tower",
    photo: PHOTOS.towerCraneReal,
    gradient: GRADIENTS.slate,
  },
  {
    index: "06",
    title: "Carry-Deck & Industrial",
    machines: "60+",
    capacityRange: "8–25 T",
    icon: "carrydeck",
    photo: PHOTOS.carryDeckIndustrialReal,
    gradient: GRADIENTS.maroon,
  },
  {
    index: "07",
    title: "Heavy-Lift & Gantry",
    machines: "15+",
    capacityRange: "Up to 1,300 T",
    icon: "heavylift",
    photo: PHOTOS.heavyLiftGantryReal,
    gradient: GRADIENTS.navy,
  },
];

const TOTAL = String(FLEET.length).padStart(2, "0");

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

  const selectedClasses = FLEET.filter((f) => selected.has(f.index));

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
          <Eyebrow>Fleet Guide</Eyebrow>
          <RevealText
            as="h2"
            barClassName="bg-tnt-amber"
            text="Seven Hundred Fifty Cranes. Seven Classes."
            className="mt-4 font-display text-5xl leading-[0.95] tracking-tight text-white uppercase sm:text-7xl"
          />
          <p className="mt-4 font-body text-sm text-white/60 sm:text-base">
            Check any classes you need and compare their rated capacity side
            by side.
          </p>
        </div>

        {/* FLEX, not grid (2026-08-04). Seven cards over a 3-col grid ran
            3/3/1; this runs 4 then 3, LEFT-aligned — the leftover row starts
            at the same edge as the row above it rather than centring under it
            (was `justify-center` briefly the same day). Row one fills the
            width, so `justify-start` only has any effect on the short row.
            Card widths are basis calcs that subtract the gutters: at `lg`,
            four cards leave three 24px gaps, hence 25% − 18px. Keep the basis
            values in step with `gap-6`. */}
        <div className="mt-16 flex flex-wrap justify-start gap-6">
          {FLEET.map((f) => {
            const isChecked = selected.has(f.index);
            return (
              <div
                key={f.index}
                // Deep-link target for the nav's Equipment panel — see
                // docblock. Was on the card's <Link>; a plain element with an
                // id and scroll-mt is exactly as valid an anchor target.
                id={slugify(f.title)}
                // `flex flex-col` so the footer can claim the leftover
                // height: flex-wrap stretches the CARDS in a row to equal
                // height, but not their contents, so a one-line title (Boom
                // Trucks, Tower Cranes) used to leave its amber tile
                // floating short of the card's bottom edge while its
                // two-line neighbours reached it.
                className={`group flex basis-full flex-col scroll-mt-32 overflow-hidden rounded-2xl border bg-black transition-[transform,border-color] duration-300 ease-out hover:-translate-y-1 sm:basis-[calc(50%-0.75rem)] lg:basis-[calc(25%-1.125rem)] ${
                  isChecked
                    ? "border-tnt-amber"
                    : "border-white/10 hover:border-tnt-amber/60"
                }`}
              >
                {/* Photo */}
                <div
                  // `shrink-0`: the photo holds its 4:3 ratio and the footer
                  // absorbs the height difference, never the other way round.
                  className="relative aspect-4/3 shrink-0 overflow-hidden"
                  style={{ backgroundImage: f.gradient }}
                >
                  {/* Plain `<img>`, not `next/image`: these are Unsplash IDs
                     run through `IMG()`, which already resizes/re-encodes on
                     Unsplash's side — same pattern as ParallaxFrame and
                     StickyStack's remote-photo branch. */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={IMG(f.photo, 800)}
                    alt=""
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  {/* Fraction-index tag — the same numbered-catalog motif
                     used across the site (Fleet Guide's own heading, Case
                     Studies' job codes, the Statement slideshow's progress
                     track). */}
                  <span className="absolute top-4 left-4 rounded-full bg-black/60 px-3 py-1 font-mono text-[11px] tracking-[0.14em] text-white/80 tabular-nums backdrop-blur-sm">
                    <span className="text-tnt-amber">{f.index}</span> / {TOTAL}
                  </span>
                </div>

                {/* Footer bar — icon + title/count/capacity on the left,
                   compare checkbox tile right (was a decorative arrow — the
                   whole card used to be the link this tile pointed nowhere
                   real for; now it's the card's one real control).
                   `flex-1` makes it eat the card's leftover height so the
                   tile always lands flush on the bottom edge, whatever the
                   title wrapped to. */}
                <div className="flex flex-1 items-stretch justify-between gap-3 bg-black">
                  {/* `min-w-0` so this column can be narrower than its
                     nowrap title if a future label outgrows the slot —
                     without it the flex item refuses to shrink and pushes
                     the tile off the card instead of just clipping. */}
                  <div className="flex min-w-0 items-center gap-3 px-4 py-5">
                    <Icon
                      name={f.icon}
                      className="h-8 w-8 shrink-0 text-tnt-amber"
                      strokeWidth={1.5}
                    />
                    <div>
                      {/* SINGLE LINE at every breakpoint. Measured at the
                         4-across width the slot is ~142px once the tile,
                         icon and padding above are trimmed, while the
                         longest title ("Carry-Deck & Industrial") needs
                         170px at the old 18px — hence the step down to 14px,
                         which brings it to 132px and leaves ~10px of margin.
                         `text-lg` returns only if the cards get wider again.
                         The reserved two-line min-height this replaced is no
                         longer needed: every title is one line, so the
                         machine counts align by construction. */}
                      <h3 className="truncate font-display text-sm leading-tight tracking-wide text-white uppercase">
                        {f.title}
                      </h3>
                      <p className="mt-1 font-body text-sm">
                        <span className="font-bold text-tnt-amber">
                          {f.machines}
                        </span>{" "}
                        <span className="text-white/50">Machines</span>
                      </p>
                      <p className="font-body text-[11px] text-white/40">
                        {f.capacityRange}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggle(f.index)}
                    aria-pressed={isChecked}
                    aria-label={
                      isChecked
                        ? `Remove ${f.title} from comparison`
                        : `Add ${f.title} to comparison`
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

        {/* Compare bar — appears once there's something to compare. Two
           selections is the minimum a "compare" reads as meaningful; one
           checked class just sits highlighted with nothing to do yet. */}
        {selected.size >= 2 && (
          <div className="mt-8 flex flex-wrap items-center gap-4 rounded-xl border border-tnt-amber/40 bg-white/5 px-6 py-4">
            <p className="font-body text-sm text-white/80">
              <span className="font-bold text-tnt-amber">{selected.size}</span>{" "}
              classes selected
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
              Compare Fleet Classes
            </h2>
            <p className="mt-2 font-body text-sm text-white/60">
              Rated capacity range per class — for a specific machine's real
              load chart, use the capacity finder above.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {selectedClasses.map((f) => (
                <div key={f.index} className="relative rounded-xl border border-white/10 bg-white/5 p-5">
                  <button
                    type="button"
                    onClick={() => toggle(f.index)}
                    aria-label={`Remove ${f.title} from comparison`}
                    className="absolute top-3 right-3 text-white/40 hover:text-white"
                  >
                    <svg viewBox="0 0 20 20" aria-hidden="true" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
                      <path d="m5 5 10 10M15 5 5 15" />
                    </svg>
                  </button>
                  <Icon name={f.icon} className="h-8 w-8 text-tnt-amber" strokeWidth={1.5} />
                  <h3 className="mt-3 font-display text-lg tracking-wide uppercase">
                    {f.title}
                  </h3>
                  <dl className="mt-4 space-y-2 font-body text-sm">
                    <div className="flex items-center justify-between border-t border-white/10 pt-2">
                      <dt className="text-white/50">Capacity</dt>
                      <dd className="font-bold text-tnt-amber">{f.capacityRange}</dd>
                    </div>
                    <div className="flex items-center justify-between border-t border-white/10 pt-2">
                      <dt className="text-white/50">Fleet size</dt>
                      <dd className="font-semibold">{f.machines}</dd>
                    </div>
                  </dl>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
