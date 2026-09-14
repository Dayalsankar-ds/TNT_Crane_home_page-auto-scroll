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

import { Eyebrow, Icon, type IconName } from "./primitives";
import { slugify } from "./navigation";
import { FLEET_PHOTOS, PHOTOS, IMG, GRADIENTS } from "./photos";

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
  return (
    <section id="fleet-guide" className="bg-tnt-gray text-black">
      <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
        <div className="max-w-3xl">
          <Eyebrow>About the Fleet</Eyebrow>
          <h2 className="mt-4 font-display text-5xl leading-[0.95] tracking-tight text-black uppercase sm:text-6xl">
            A modern fleet of
            <br />
            more than 700 cranes
          </h2>

          {/* The two closing paragraphs from the live site. Its own copy
              links "Specialized Rigging"/"Machinery Moving"/"Industrial
              Storage" out to those service pages — reproduced here as
              same-page anchors to CoreServices.tsx's own stage cards
              (identical slugs: `slugify("Specialized Rigging")` etc.), since
              those are the real equivalent sections on THIS site. */}
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
            equipment relocation to complex rigging in tight spaces and safe
            storage solutions, we handle it all with efficiency and care.
          </p>
        </div>

        {/* Gallery — native scroll-snap, no library. `-mx-4 px-4` (etc.)
            bleeds the scroll track to the viewport edge on mobile so the
            first/last card isn't flush against the gutter, while the cards
            themselves still align to the same max-w-7xl grid on desktop. */}
        <div className="mt-14 -mx-4 flex snap-x snap-mandatory gap-5 overflow-x-auto px-4 pb-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
          {FLEET_TYPES.map((t) => (
            <div
              key={t.name}
              id={slugify(t.name)}
              className="group w-64 shrink-0 scroll-mt-32 snap-start overflow-hidden rounded-2xl border border-black/10 bg-white sm:w-72"
            >
              <div
                className="relative aspect-4/3"
                style={{ backgroundImage: t.gradient }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={t.photo}
                  alt={t.name}
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
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
              <div className="flex items-center gap-3 px-4 py-4">
                <Icon
                  name={t.icon}
                  className="h-6 w-6 shrink-0 text-tnt-amber"
                  strokeWidth={1.5}
                />
                <span className="font-body text-sm font-semibold text-black">
                  {t.name}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
