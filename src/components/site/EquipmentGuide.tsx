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
 */

import Image from "next/image";
import Link from "next/link";
import { Eyebrow, Icon, type IconName } from "./primitives";
import RevealText from "./RevealText";
import { FLEET_PHOTOS, GRADIENTS } from "./photos";
import { slugify } from "./navigation";

type FleetClass = {
  index: string;
  title: string;
  machines: string;
  icon: IconName;
  photo: string;
  gradient: string;
};

const FLEET: FleetClass[] = [
  {
    index: "01",
    title: "Crawler Cranes",
    machines: "180+",
    icon: "crawler",
    photo: FLEET_PHOTOS.crawlerCranes,
    gradient: GRADIENTS.slate,
  },
  {
    index: "02",
    title: "All-Terrain Cranes",
    machines: "210+",
    icon: "allterrain",
    photo: FLEET_PHOTOS.allTerrainCranes,
    gradient: GRADIENTS.navy,
  },
  {
    index: "03",
    title: "Rough-Terrain Cranes",
    machines: "130+",
    icon: "carrydeck",
    photo: FLEET_PHOTOS.roughTerrainCranes,
    gradient: GRADIENTS.slate,
  },
  {
    index: "04",
    title: "Boom Trucks",
    machines: "120+",
    icon: "boom",
    photo: FLEET_PHOTOS.boomTrucks,
    gradient: GRADIENTS.navy,
  },
  {
    index: "05",
    title: "Tower Cranes",
    machines: "35+",
    icon: "tower",
    photo: FLEET_PHOTOS.towerCranes,
    gradient: GRADIENTS.slate,
  },
  {
    index: "06",
    title: "Carry-Deck & Industrial",
    machines: "60+",
    icon: "carrydeck",
    photo: FLEET_PHOTOS.carryDeckIndustrial,
    gradient: GRADIENTS.maroon,
  },
  {
    index: "07",
    title: "Heavy-Lift & Gantry",
    machines: "15+",
    icon: "heavylift",
    photo: FLEET_PHOTOS.heavyLiftGantry,
    gradient: GRADIENTS.navy,
  },
];

const TOTAL = String(FLEET.length).padStart(2, "0");

export default function EquipmentGuide() {
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
          {FLEET.map((f) => (
            <Link
              key={f.index}
              // Deep-link target for the nav's Equipment panel — see docblock.
              id={slugify(f.title)}
              href="#fleet-guide"
              // `flex flex-col` so the footer can claim the leftover height:
              // flex-wrap stretches the CARDS in a row to equal height, but not
              // their contents, so a one-line title (Boom Trucks, Tower Cranes)
              // used to leave its amber tile floating short of the card's
              // bottom edge while its two-line neighbours reached it.
              className="group flex basis-full flex-col scroll-mt-32 overflow-hidden rounded-2xl border border-white/10 bg-black transition-[transform,border-color] duration-300 ease-out hover:-translate-y-1 hover:border-tnt-amber/60 sm:basis-[calc(50%-0.75rem)] lg:basis-[calc(25%-1.125rem)]"
            >
              {/* Photo */}
              <div
                // `shrink-0`: the photo holds its 4:3 ratio and the footer
                // absorbs the height difference, never the other way round.
                className="relative aspect-4/3 shrink-0 overflow-hidden"
                style={{ backgroundImage: f.gradient }}
              >
                {/* `next/image`, not a plain `<img>`: these are locally served
                   2.2–2.6MB PNGs, and shipping them raw would be ~16MB for the
                   section. Next resizes and re-encodes to AVIF/WebP per
                   breakpoint. The Unsplash version could use a bare `<img>`
                   because Unsplash resized on its side via IMG(). `sizes`
                   mirrors the card's basis: full width, half at `sm`, quarter
                   at `lg`. */}
                <Image
                  src={f.photo}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
                {/* Fraction-index tag — the same numbered-catalog motif used
                   across the site (Fleet Guide's own heading, Case Studies'
                   job codes, the Statement slideshow's progress track). */}
                <span className="absolute top-4 left-4 rounded-full bg-black/60 px-3 py-1 font-mono text-[11px] tracking-[0.14em] text-white/80 tabular-nums backdrop-blur-sm">
                  <span className="text-tnt-amber">{f.index}</span> / {TOTAL}
                </span>
              </div>

              {/* Footer bar — icon + title/count on the left, arrow tile right.
                 `flex-1` makes it eat the card's leftover height so the amber
                 tile always lands flush on the bottom edge, whatever the title
                 wrapped to. */}
              <div className="flex flex-1 items-stretch justify-between gap-3 bg-black">
                {/* `min-w-0` so this column can be narrower than its nowrap
                   title if a future label outgrows the slot — without it the
                   flex item refuses to shrink and pushes the amber tile off
                   the card instead of just clipping. */}
                <div className="flex min-w-0 items-center gap-3 px-4 py-5">
                  <Icon
                    name={f.icon}
                    className="h-8 w-8 shrink-0 text-tnt-amber"
                    strokeWidth={1.5}
                  />
                  <div>
                    {/* SINGLE LINE at every breakpoint. Measured at the
                       4-across width the slot is ~142px once the tile, icon
                       and padding above are trimmed, while the longest title
                       ("Carry-Deck & Industrial") needs 170px at the old 18px
                       — hence the step down to 14px, which brings it to 132px
                       and leaves ~10px of margin. `text-lg` returns only if
                       the cards get wider again. The reserved two-line
                       min-height this replaced is no longer needed: every
                       title is one line, so the machine counts align by
                       construction. */}
                    <h3 className="truncate font-display text-sm leading-tight tracking-wide text-white uppercase">
                      {f.title}
                    </h3>
                    <p className="mt-1 font-body text-sm">
                      <span className="font-bold text-tnt-amber">
                        {f.machines}
                      </span>{" "}
                      <span className="text-white/50">Machines</span>
                    </p>
                  </div>
                </div>

                {/* Decorative — the whole card is the link, not a nested
                   control (an <a> inside an <a> is invalid HTML), so this is
                   a styled span, not a second interactive element. */}
                <span className="flex w-14 shrink-0 items-center justify-center bg-tnt-amber transition-colors duration-300 group-hover:bg-tnt-amber-vivid">
                  <Icon
                    name="arrow"
                    className="h-6 w-6 text-black transition-transform duration-300 group-hover:translate-x-1"
                    strokeWidth={2}
                  />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
