"use client";

/**
 * SECTION 5 — FULL-SCOPE CAPABILITY  (project lifecycle)
 *
 * Replaces the bento grid (2026-07-29). The grid showed seven services as seven
 * peers and left the visitor to assemble the story themselves; worse, its tiles
 * shared grid ROWS, so the nav's per-service deep links resolved to only three
 * scroll positions and four of seven landed under a different service's name.
 *
 * The lifecycle — LIFT → PLAN → RIG → MOVE → STORE → RENEWABLE — is carried
 * by the STAGE labels and the numbering, not by a drawn spine. It was a
 * connected vertical chain until 2026-07-29; it is now a grid (3 columns at
 * `lg`) so every capability is visible at a glance, Crane Rental included
 * (see the note on that card below).
 *
 * Consequences worth knowing:
 *  - Stage numbering is JOURNEY order, and navigation.ts was renumbered to
 *    match — the panel and this section are one numbering system or neither
 *    means anything.
 *  - THE GRID REINSTATES THE ANCHOR COLLISION a chained layout would avoid.
 *    Three cards share a row, so /services#crane-rental and
 *    /services#specialized-rigging resolve to the same scroll position.
 *    <TargetHighlight> is what keeps the click legible — it outlines the
 *    requested card even when the page cannot move. Do not remove it while
 *    this layout stands.
 *  - Heavy Haul & Transport (was stage 05, "Transport") was removed entirely
 *    2026-09-11, on request. Crane Rental folding into the grid the same day
 *    (see below) brought the count back to six, so `lg:grid-cols-3` is a
 *    clean 3×2 again rather than the uneven 3+2 row the Transport removal
 *    left behind on its own.
 *
 * CRANE RENTAL FOLDED INTO THE GRID (2026-09-11, on request): it used to lead
 * as a full-width photo feature — the step given the biggest visual treatment
 * on the page, added 2026-09-03 when it swapped in for Lift Planning &
 * Engineering as the lead. That featured treatment (a separate LEAD const,
 * its own <ParallaxFrame> photo, its own "Request a crane rental" CTA) is
 * gone; Crane Rental is now just card 01 in the same STAGES array and grid
 * as everything else — same border/icon-well/blurb/"Learn more" pattern, no
 * special case. Its real TNT photo (SERVICE_PHOTOS.craneRentalAtCraneCoolerLift)
 * is unused now that there's no lead card to hold it; left in photos.ts
 * rather than deleted, in case a future feature treatment wants it back.
 *
 * NO SHADOWS anywhere in this section, by request: depth is a hairline border
 * that goes gold, a 4%-opacity gold wash, and a 2px lift.
 *
 * Every hover state is pure CSS. (The heading's own <RevealText> went with
 * the "One Partner, End to End" copy it animated, removed 2026-09-11 the
 * same day.)
 *
 * Palette: black / white / gold. NOT navy — the brand book has no navy, and the
 * retired #071034 was removed site-wide on 2026-07-28.
 *
 * LIGHT/DARK (2026-09-14, on request — "change this section to dark on
 * Theme 2"; the Theme 1/2 toggle this originally read was removed
 * project-wide 2026-09-23, so it's the Light/Dark toggle alone now): a
 * client component so it can read colorSchemeStore.ts. Light (default) is
 * the light shell — bg-white/text-black, black/N opacity utilities,
 * black-fill/amber-glyph icon-well hover. Dark flips the whole section to
 * the ORIGINAL 2026-09-02 dark treatment — bg-black/text-white, white/N
 * utilities, amber-fill/black-glyph hover — rather than reinventing it. The
 * closing CTA panel's solid amber fill is UNCHANGED in both — it reads fine
 * against either background, so it isn't part of the conditional.
 */

import Image from "next/image";
import Link from "next/link";
import { Eyebrow, Icon, type IconName } from "./primitives";
import { slugify } from "./navigation";
import TargetHighlight from "./TargetHighlight";
import { useColorScheme } from "./colorSchemeStore";
import { SERVICE_PHOTOS, RIGGING_PHOTOS, CASE_PHOTOS } from "./photos";

type Stage = {
  /** Journey position. Mirrors navigation.ts. */
  index: string;
  /** The verb — what this step DOES. Carries the sequence. Unused by the
   *  card itself (no reference design has shown a stage word since
   *  2026-09-22) — kept on the type/data only because navigation.ts's
   *  ordering comment still refers to it. */
  stage: string;
  /** The service name — what it's called and sold as. Titles are TNT's
   *  own real service names again as of 2026-09-22's "REAL SOLUTIONS FOR
   *  A HEAVIER TOMORROW" reference (full names: Specialized Rigging,
   *  Machinery Moving, Industrial Storage — not the shortened Rigging/
   *  Heavy Lift/Industrial Services this file briefly carried the same
   *  day), so most `id` overrides below are gone — `slugify(title)` alone
   *  matches navigation.ts again. Engineering keeps its override: its
   *  display title is short but navigation.ts still links to the fuller
   *  `/#lift-planning-engineering`. */
  title: string;
  blurb: string;
  icon: IconName;
  /** Real TNT/RMS photography — see the note on each assignment below in
   *  STAGES. Every stage has one now (Industrial Storage's was added
   *  2026-09-22), so there is no icon-well fallback branch left to render. */
  photo?: string;
  /** Dedicated page, when one exists (2026-09-18, Crane Rental's own
   *  /crane-rental — see that route's own docblock). Every stage without
   *  one still falls back to the shared `?service=...#quote` link below;
   *  this is the exception, not a new pattern every card is expected to
   *  grow. */
  href?: string;
  /** Sub-links shown inside the card, above the Learn More/Explore row
   *  (2026-09-22, matching the "REAL SOLUTIONS" reference's expanded
   *  Crane Rental card). Only Crane Rental has one in the reference; every
   *  other card omits this and renders the plain blurb-only body. Targets
   *  are EquipmentGuide's own fleet-type ids where an exact match exists
   *  (Crawler Cranes, Rough-Terrain Cranes); "Mobile Cranes" has no exact
   *  fleet-type id in EquipmentGuide, so it lands on the guide generally. */
  sublist?: { label: string; href: string }[];
  /** Overrides `slugify(title)` for the card's `id` — see the note on
   *  `title` above. Only Engineering needs this now. */
  id?: string;
};

/**
 * MATCHES THE "REAL SOLUTIONS FOR A HEAVIER TOMORROW" REFERENCE EXACTLY
 * (2026-09-22, on request — third reference image, "Build this service
 * section exactly," following the same "no need do same from the image,
 * do IT exactly" correction the first Figma reference already taught this
 * file). This reference happens to show TNT's real 5-service count
 * (confirmed against tntcrane.com the same day) with its own full names,
 * so no service was added or renamed to make it fit — Crane Rental,
 * Specialized Rigging, Machinery Moving, Industrial Storage, Engineering.
 *
 * Photos are the same real, already-sourced TNT/RMS assets this file was
 * already using for these five stages (not new downloads) — see photos.ts.
 */
const STAGES: Stage[] = [
  {
    index: "01",
    stage: "Lift",
    title: "Crane Rental",
    blurb: "A modern fleet for projects of any size.",
    icon: "rental",
    href: "/crane-rental",
    photo: SERVICE_PHOTOS.craneRentalAtCraneCoolerLift,
    sublist: [
      { label: "Mobile Cranes", href: "/#fleet-guide" },
      { label: "Crawler Cranes", href: "/#crawler-cranes" },
      { label: "Rough-Terrain Cranes", href: "/#rough-terrain-cranes" },
    ],
  },
  { index: "02", stage: "Rig", title: "Specialized Rigging", blurb: "Engineered rigging solutions for complex lifts.", icon: "rigging", photo: CASE_PHOTOS.petrochemicalVesselPlacement },
  { index: "03", stage: "Move", title: "Machinery Moving", blurb: "Safe, precise and efficient movement of critical equipment.", icon: "heavylift", photo: CASE_PHOTOS.refineryReactorExchange },
  { index: "04", stage: "Store", title: "Industrial Storage", blurb: "Secure and flexible storage for your valuable equipment.", icon: "storage", photo: RIGGING_PHOTOS.versaLiftMachineryMoving },
  { index: "05", stage: "Plan", title: "Engineering", blurb: "Lift planning and engineering for safer, smarter outcomes.", icon: "engineering", id: "lift-planning-engineering", photo: CASE_PHOTOS.bridgeGirderSet },
];

/** Right-side vertical tag list in the section header — copy taken
 *  verbatim from the reference; generic enough to be true of TNT
 *  specifically, not placeholder text borrowed from a different design. */
const HEADER_TAGS = ["People", "Equipment", "Expertise", "Safer Outcomes"];

export default function CoreServices() {
  const [colorScheme] = useColorScheme();
  const dark = colorScheme === "dark";

  return (
    <section
      id="services"
      className={`scroll-mt-32 ${dark ? "bg-black text-white" : "bg-white text-black"}`}
    >
      {/* Marks the stage the nav's deep link asked for. Now that each stage is
          its own row the scroll also lands correctly, but the highlight still
          answers "which one did I click?" on arrival. */}
      <TargetHighlight selector=".svc-tile" />

      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        {/* ── Section header ───────────────────────────────────────────── */}
        {/* COPY NOW MATCHES THE FIGMA REFERENCE VERBATIM (2026-09-22, on
            request — see the STAGES docblock above for the full "keep ours"
            → "no, match the image" correction). "Full-Scope Capability" /
            "One Partner, End to End" are gone; this is the reference's own
            eyebrow/heading/intro text. */}
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <Eyebrow>Services</Eyebrow>
            <h2
              className={`mt-3 font-display text-4xl leading-[0.95] tracking-wide uppercase sm:text-5xl ${dark ? "text-white" : "text-black"}`}
            >
              Real Solutions
              <br />
              <span className="text-tnt-amber">For a Heavier Tomorrow.</span>
            </h2>
            <p
              className={`mt-4 max-w-xl font-body text-base leading-relaxed ${dark ? "text-white/60" : "text-black/60"}`}
            >
              From crane rentals to engineered lift planning, we deliver
              specialized solutions to keep your projects moving safely and
              efficiently.
            </p>
          </div>

          <ul
            className={`flex shrink-0 flex-col gap-1.5 border-l pl-5 font-body text-[13px] font-semibold tracking-[0.08em] uppercase ${
              dark ? "border-tnt-amber/60 text-white/70" : "border-tnt-amber/60 text-black/70"
            }`}
          >
            {HEADER_TAGS.map((tag) => (
              <li key={tag}>{tag}</li>
            ))}
          </ul>
        </div>

        {/* ── Stages 01–06 — the grid ──────────────────────────────────── */}
        {/* Still an <ol>: the six read 01→06 across rows, so the order is real
            and assistive tech should hear "1 of 6" rather than a pile of cards.
            The lifecycle lives in the STAGE labels and numbering rather than
            in a drawn spine or a featured lead card — a 3-across grid has no
            single path to trace, and no card is bigger than another (Crane
            Rental included, since 2026-09-11 — see the docblock above).
            Equal heights come from the grid + `h-full` + column flex, not from
            trimming the copy. */}
        <ol className="mt-10 grid gap-4 sm:mt-12 sm:grid-cols-2 lg:grid-cols-5">
          {STAGES.map((s) => (
            <li
              key={s.index}
              id={s.id ?? slugify(s.title)}
              className="svc-tile group relative scroll-mt-32"
            >
              {/* No shadow at any state. Depth comes from the hairline border
                  going gold, a barely-there gold wash, and a 2px lift — enough
                  to register as interactive without a drop shadow. Every
                  card leads with a full-bleed photo (all 5 stages have one),
                  cropping in on hover the same way EquipmentGuide's fleet
                  gallery does. */}
              <article
                className={`relative flex h-full flex-col overflow-hidden rounded-xl border transition-[translate,border-color,background-color] duration-300 ease-out group-hover:-translate-y-0.5 group-hover:border-tnt-amber focus-within:border-tnt-amber ${
                  dark
                    ? "border-white/12 bg-white/[0.03]"
                    : "border-black/12 bg-black/[0.03]"
                }`}
              >
                <div className="relative aspect-4/3 overflow-hidden">
                  <Image
                    src={s.photo!}
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 20vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                  />
                </div>

                <div className="flex flex-1 flex-col p-5 sm:p-6">
                  {/* Small line icon + a short amber rule underneath —
                      matches the "REAL SOLUTIONS" reference's mark below
                      each photo. Plain <Icon>, not an image asset: every
                      stage's `icon` is already a valid IconName. */}
                  <Icon name={s.icon} className="h-7 w-7 text-tnt-amber" strokeWidth={1.5} />
                  <span
                    aria-hidden="true"
                    className="mt-2 h-px w-6 bg-tnt-amber transition-all duration-300 group-hover:w-9"
                  />

                  <h3
                    className={`mt-3 font-display text-lg tracking-wide uppercase ${dark ? "text-white" : "text-black"}`}
                  >
                    {s.title}
                  </h3>
                  <p
                    className={`mt-2 font-body text-[13px] leading-relaxed ${dark ? "text-white/60" : "text-black/60"}`}
                  >
                    {s.blurb}
                  </p>

                  {/* Crane Rental's expanded sub-list (2026-09-22, matching
                      the reference's own treatment of card 01 only). */}
                  {s.sublist && (
                    <ul
                      className={`mt-3 flex flex-col gap-1 border-t pt-3 ${dark ? "border-white/10" : "border-black/10"}`}
                    >
                      {s.sublist.map((item) => (
                        <li key={item.label}>
                          {/* Real, independently-clickable link (relative
                              z-10 lifts it above the card's stretched
                              overlay link below) — not just an affordance
                              like the card-level Learn More/Explore. */}
                          <Link
                            href={item.href}
                            className={`relative z-10 flex items-center gap-1.5 font-body text-[12px] font-semibold hover:text-tnt-amber ${
                              dark ? "text-white/70" : "text-black/70"
                            }`}
                          >
                            {item.label}
                            <Icon name="arrow" className="h-3 w-3 text-tnt-amber" />
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* Spacer pushes the Learn More/Explore row to a common
                      baseline across the row regardless of sub-list length. */}
                  <div className="flex-1" />

                  {/* Learn more / Explore + circular arrow button — the
                      whole card is the hit area via the stretched link
                      below, so this is the affordance, not the target. */}
                  <div
                    className={`mt-4 flex items-center justify-between border-t pt-4 ${dark ? "border-white/10" : "border-black/10"}`}
                  >
                    <span
                      className={`font-mono text-xs font-semibold tracking-[0.1em] uppercase transition-colors duration-300 group-hover:text-tnt-amber ${
                        dark ? "text-white" : "text-black"
                      }`}
                    >
                      {s.sublist ? "Explore" : "Learn more"}
                    </span>
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-colors duration-300 group-hover:border-tnt-amber group-hover:bg-tnt-amber ${
                        dark ? "border-white/25" : "border-black/25"
                      }`}
                    >
                      <Icon
                        name="arrow"
                        className={`h-4 w-4 -rotate-45 text-tnt-amber transition-colors duration-300 group-hover:text-black`}
                      />
                    </span>
                  </div>
                </div>

                {/* Stretched link: one focusable element per card, full-card hit
                    area, and a real focus ring — a div with onClick would give
                    none of those.
                    NOTE: there is no per-service detail page for most stages
                    yet, so those still convert to the quote form. `?service=`
                    is carried so whoever wires the form up can pre-select the
                    capability; nothing reads it today.
                    The path was `/contact` until 2026-08-04; that route is gone
                    and the quote form now lives on this page, so this is a
                    PATH-RELATIVE url — it keeps the query param while resolving
                    to the current page rather than a deleted one.
                    Crane Rental is the one exception (2026-09-18, on request):
                    `s.href` points at its own dedicated page instead.

                    NEXT/LINK, NOT A PLAIN <a> (2026-09-18, on request — "why
                    is it taking more time to load"): a plain <a> to
                    /crane-rental forced a full browser navigation (confirmed
                    via `performance.getEntriesByType("navigation")[0].type
                    === "navigate"`) — the whole page reloading from scratch
                    instead of Next's normal instant client-side route swap.
                    <Link> restores that (and still resolves the query-param
                    fallback correctly for every other stage). */}
                <Link
                  href={s.href ?? `?service=${slugify(s.title)}#quote`}
                  className="absolute inset-0 rounded-xl focus-visible:ring-2 focus-visible:ring-tnt-amber focus-visible:ring-offset-2 focus-visible:outline-none"
                >
                  <span className="sr-only">
                    {s.title} — stage {s.index}, {s.stage}. Learn more.
                  </span>
                </Link>
              </article>
            </li>
          ))}
        </ol>

        {/* ── Closing row — tagline + skewed CTA banner ───────────────────── */}
        {/* Replaces the old solid-amber "One partner..." panel (2026-09-22,
            on request, "REAL SOLUTIONS FOR A HEAVIER TOMORROW" reference —
            that reference has no full-width panel at all, just this
            bottom-left tagline / bottom-right CTA pairing). The parallelogram
            skew is a CSS `clip-path`, not a `transform: skew` — a transform
            would tilt the button's own text with it; clip-path only cuts the
            visible shape, so "Discuss Your Project" stays upright. */}
        <div className="mt-14 flex flex-col items-start justify-between gap-8 sm:mt-16 lg:flex-row lg:items-center">
          <div>
            <span
              aria-hidden="true"
              className="mb-3 block h-px w-8 bg-tnt-amber"
            />
            <p
              className={`font-display text-2xl leading-[0.95] tracking-wide uppercase sm:text-3xl ${dark ? "text-white" : "text-black"}`}
            >
              Built for
              <br />
              <span className="text-tnt-amber">What&rsquo;s Next.</span>
            </p>
          </div>

          <Link
            href="#quote"
            className="group relative inline-flex items-center gap-3 bg-tnt-amber py-5 pr-10 pl-12 font-body text-sm font-bold tracking-[0.08em] text-black uppercase transition-colors duration-300 hover:bg-tnt-amber-vivid"
            style={{ clipPath: "polygon(6% 0%, 100% 0%, 94% 100%, 0% 100%)" }}
          >
            Discuss Your Project
            <Icon
              name="arrow"
              className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
            />
          </Link>
        </div>
      </div>
    </section>
  );
}
