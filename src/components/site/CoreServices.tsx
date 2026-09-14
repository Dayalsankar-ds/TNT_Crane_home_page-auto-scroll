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
 * THEME-CONDITIONAL LIGHT/DARK (2026-09-14, on request — "change this
 * section to dark on Theme 2"): back to a client component (was briefly
 * server-only, see history) so it can read themeVersionStore.ts's "Theme
 * 1/2" toggle, same as SafetyCulture.tsx and StorySlideshow.tsx already do.
 * Theme one (default) is the light shell — bg-white/text-black, black/N
 * opacity utilities, black-fill/amber-glyph icon-well hover. Theme two
 * flips the whole section to the ORIGINAL 2026-09-02 dark treatment —
 * bg-black/text-white, white/N utilities, amber-fill/black-glyph hover —
 * rather than reinventing it. The closing CTA panel's solid amber fill is
 * UNCHANGED in both themes — it reads fine against either background, so
 * it isn't part of the conditional.
 */

import Image from "next/image";
import { Eyebrow, Icon, type IconName } from "./primitives";
import Button from "./Button";
import { slugify } from "./navigation";
import TargetHighlight from "./TargetHighlight";
import { useThemeVersion } from "./themeVersionStore";

type Stage = {
  /** Journey position. Mirrors navigation.ts. */
  index: string;
  /** The verb — what this step DOES. Carries the sequence. */
  stage: string;
  /** The service name — what it's called and sold as. */
  title: string;
  blurb: string;
  icon: IconName;
};

const STAGE_ICONS: Record<string, string> = {
  "Specialized Rigging": "/icons/hook.svg",
  "Machinery Moving": "/icons/forklift.svg",
  "Industrial Storage": "/icons/cart.svg",
  "Wind Energy": "/icons/tower-crane.svg",
  // Crane Rental and "Lift Planning & Engineering" have no dedicated icon
  // asset — both fall through to the /icons/crane.svg default below, which
  // (for Crane Rental at least) is the right icon anyway.
};

const STAGES: Stage[] = [
  { index: "01", stage: "Lift", title: "Crane Rental", blurb: "Operated or bare rental — by the day, month, or project, from 8 to 1,300 tons. TNT's core service and the fleet every other capability on this page supports.", icon: "rental" },
  { index: "02", stage: "Plan", title: "Lift Planning & Engineering", blurb: "Stamped lift plans, ground-bearing analysis, and crane selection — signed by in-house engineers before a single machine mobilizes.", icon: "engineering" },
  { index: "03", stage: "Rig", title: "Specialized Rigging", blurb: "Hydraulic gantries, jack-and-slide, and precision skidding where a crane can't reach.", icon: "rigging" },
  { index: "04", stage: "Move", title: "Machinery Moving", blurb: "SPMTs and skates for turnkey plant relocation — set, aligned, and levelled in place.", icon: "heavylift" },
  { index: "05", stage: "Store", title: "Industrial Storage", blurb: "Secure indoor and outdoor yards with crane access between phases of work.", icon: "storage" },
  { index: "06", stage: "Renewable", title: "Wind Energy", blurb: "Turbine erection, blade and component exchange across the wind corridor.", icon: "wind" },
];

export default function CoreServices() {
  const [themeVersion] = useThemeVersion();
  const dark = themeVersion === "two";

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
        {/* The "One Partner, End to End" headline + intro paragraph were
            removed 2026-09-11, on request — Eyebrow alone now carries the
            section label. */}
        <div className="max-w-3xl">
          <Eyebrow>Full-Scope Capability</Eyebrow>
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
        <ol className="mt-10 grid gap-4 sm:mt-12 sm:grid-cols-2 lg:grid-cols-3">
          {STAGES.map((s) => (
            <li
              key={s.index}
              id={slugify(s.title)}
              className="svc-tile group relative scroll-mt-32"
            >
              {/* No shadow at any state. Depth comes from the hairline border
                  going gold, a barely-there gold wash, and a 2px lift — enough
                  to register as interactive without a drop shadow. */}
              <article
                className={`relative flex h-full flex-col rounded-xl border p-5 transition-[translate,border-color,background-color] duration-300 ease-out group-hover:-translate-y-0.5 group-hover:border-tnt-amber group-hover:bg-tnt-amber/[0.06] focus-within:border-tnt-amber sm:p-6 ${
                  dark
                    ? "border-white/12 bg-white/[0.03]"
                    : "border-black/12 bg-black/[0.03]"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  {/* Icon well */}
                  <span
                    className={`inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-tnt-amber/10 text-tnt-amber transition-colors duration-300 ${
                      dark
                        ? "group-hover:bg-tnt-amber group-hover:text-black"
                        : "group-hover:bg-black group-hover:text-tnt-amber"
                    }`}
                  >
                    <Image
                      src={STAGE_ICONS[s.title] ?? "/icons/crane.svg"}
                      alt=""
                      width={24}
                      height={24}
                      unoptimized
                      className={`h-6 w-6 object-contain transition-[filter] duration-300 [filter:brightness(0)_saturate(100%)_invert(63%)_sepia(65%)_saturate(721%)_hue-rotate(352deg)_brightness(97%)_contrast(101%)] ${
                        dark ? "group-hover:[filter:brightness(0)_saturate(100%)]" : ""
                      }`}
                    />
                  </span>
                  <span className="flex items-center gap-2 pt-1">
                    <span
                      className={`font-mono text-[11px] tabular-nums transition-colors duration-300 group-hover:text-tnt-amber ${
                        dark ? "text-white/30" : "text-black/30"
                      }`}
                    >
                      {s.index}
                    </span>
                    <span className="font-body text-[10px] font-bold tracking-[0.2em] text-tnt-amber uppercase">
                      {s.stage}
                    </span>
                  </span>
                </div>

                <h3
                  className={`mt-5 font-display text-xl tracking-wide uppercase ${dark ? "text-white" : "text-black"}`}
                >
                  {s.title}
                </h3>
                {/* flex-1 pushes the CTA to a common baseline across the row,
                    so blurbs of different lengths still align. */}
                <p
                  className={`mt-2 flex-1 font-body text-[13px] leading-relaxed ${dark ? "text-white/60" : "text-black/60"}`}
                >
                  {s.blurb}
                </p>

                {/* Hairline separator instead of a shadow to divide the card's
                    body from its action. */}
                <span
                  aria-hidden="true"
                  className={`mt-5 block h-px w-full transition-colors duration-300 group-hover:bg-tnt-amber/40 ${
                    dark ? "bg-white/10" : "bg-black/10"
                  }`}
                />

                {/* Learn more — the whole card is the hit area via the stretched
                    link, so this is the affordance, not the target. */}
                <span
                  className={`mt-4 flex items-center gap-2 font-body text-sm font-semibold transition-colors duration-300 group-hover:text-tnt-amber ${
                    dark ? "text-white" : "text-black"
                  }`}
                >
                  Learn more
                  <Icon
                    name="arrow"
                    className="h-4 w-4 text-tnt-amber transition-transform duration-300 group-hover:translate-x-1"
                  />
                </span>

                {/* Stretched link: one focusable element per card, full-card hit
                    area, and a real focus ring — a div with onClick would give
                    none of those.
                    NOTE: there is no per-service detail page to point at yet, so
                    every card converts to the quote form. `?service=` is carried
                    so whoever wires the form up can pre-select the capability;
                    nothing reads it today.
                    The path was `/contact` until 2026-08-04; that route is gone
                    and the quote form now lives on this page, so this is a
                    PATH-RELATIVE url — it keeps the query param while resolving
                    to the current page rather than a deleted one. */}
                <a
                  href={`?service=${slugify(s.title)}#quote`}
                  className="absolute inset-0 rounded-xl focus-visible:ring-2 focus-visible:ring-tnt-amber focus-visible:ring-offset-2 focus-visible:outline-none"
                >
                  <span className="sr-only">
                    {s.title} — stage {s.index}, {s.stage}. Learn more.
                  </span>
                </a>
              </article>
            </li>
          ))}
        </ol>

        {/* ── Closing CTA ──────────────────────────────────────────────── */}
        {/* Solid amber fill (2026-09-02, on request) — was bg-black with a
            white/10 border; flipped to the site's standard bg-tnt-amber +
            text-black pairing (same convention as the nav CTA, active chips,
            etc.) so it pops against the now-black section instead of nearly
            disappearing into it. Buttons drop `onDark` since the fill itself
            is light now — primary/secondary "light" skins (black fill /
            black outline) are what read on amber. */}
        <div className="mt-12 overflow-hidden rounded-2xl bg-tnt-amber sm:mt-14">
          <div className="flex flex-col gap-7 p-8 sm:p-10 lg:flex-row lg:items-center lg:justify-between lg:p-12">
            <div>
              <p className="font-display text-2xl leading-tight tracking-wide text-black uppercase sm:text-3xl lg:text-4xl">
                One partner.
                <br />
                From lift planning to final set.
              </p>
              <p className="mt-3 max-w-lg font-body text-sm leading-relaxed text-black/70 sm:text-base">
                Tell us the load, the site, and the window. We&rsquo;ll scope the
                rest.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:shrink-0">
              <Button href="#quote" variant="primary">
                Request a quote
              </Button>
              <Button href="#contact" variant="secondary">
                Talk to an engineer
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
