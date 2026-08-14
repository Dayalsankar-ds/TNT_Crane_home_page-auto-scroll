/**
 * SECTION 5 — FULL-SCOPE CAPABILITY  (project lifecycle)
 *
 * Replaces the bento grid (2026-07-29). The grid showed seven services as seven
 * peers and left the visitor to assemble the story themselves; worse, its tiles
 * shared grid ROWS, so the nav's per-service deep links resolved to only three
 * scroll positions and four of seven landed under a different service's name.
 *
 * The lifecycle — PLAN → LIFT → RIG → MOVE → TRANSPORT → STORE → RENEWABLE —
 * is carried by the STAGE labels and the numbering, not by a drawn spine. It
 * was a connected vertical chain until 2026-07-29; it is now a 3×2 grid so all
 * six follow-on capabilities are visible at a glance.
 *
 * Consequences worth knowing:
 *  - Stage numbering is JOURNEY order, and navigation.ts was renumbered to
 *    match — the panel and this section are one numbering system or neither
 *    means anything.
 *  - THE GRID REINSTATES THE ANCHOR COLLISION the chain had fixed. Three cards
 *    share a row, so /services#crane-rental and /services#specialized-rigging
 *    resolve to the same scroll position. <TargetHighlight> is what keeps the
 *    click legible — it outlines the requested card even when the page cannot
 *    move. Do not remove it while this layout stands.
 *
 * NO SHADOWS anywhere in this section, by request: depth is a hairline border
 * that goes gold, a 4%-opacity gold wash, and a 2px lift.
 *
 * Server component. The only client parts are <RevealText> (heading) and
 * <ParallaxFrame> (hero photo); every hover state is pure CSS.
 *
 * Palette: black / white / gold. NOT navy — the brand book has no navy, and the
 * retired #071034 was removed site-wide on 2026-07-28.
 */

import { Eyebrow, Icon, type IconName } from "./primitives";
import Button from "./Button";
import RevealText from "./RevealText";
import ParallaxFrame from "./ParallaxFrame";
import { PHOTOS } from "./photos";
import { slugify } from "./navigation";
import TargetHighlight from "./TargetHighlight";

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

/** Stage 01 leads as a full-width feature; it's the step everything else hangs
 *  off, and saying so is the section's whole point. */
const LEAD = {
  index: "01",
  stage: "Plan",
  title: "Lift Planning & Engineering",
  blurb:
    "Stamped lift plans, ground-bearing analysis, and crane selection — signed by in-house engineers before a single machine mobilizes. Every stage that follows is scoped here first.",
  photo: { id: PHOTOS.crewObserve, alt: "Engineers reviewing a lift plan on site" },
};

const STAGES: Stage[] = [
  { index: "02", stage: "Lift", title: "Crane Rental", blurb: "Operated or bare rental — by the day, month, or project, from 8 to 1,300 tons.", icon: "rental" },
  { index: "03", stage: "Rig", title: "Specialized Rigging", blurb: "Hydraulic gantries, jack-and-slide, and precision skidding where a crane can't reach.", icon: "rigging" },
  { index: "04", stage: "Move", title: "Machinery Moving", blurb: "SPMTs and skates for turnkey plant relocation — set, aligned, and levelled in place.", icon: "heavylift" },
  { index: "05", stage: "Transport", title: "Heavy Haul & Transport", blurb: "Permitted heavy-haul and modular transporters, routed and escorted end to end.", icon: "transport" },
  { index: "06", stage: "Store", title: "Industrial Storage", blurb: "Secure indoor and outdoor yards with crane access between phases of work.", icon: "storage" },
  { index: "07", stage: "Renewable", title: "Wind Energy", blurb: "Turbine erection, blade and component exchange across the wind corridor.", icon: "wind" },
];

export default function CoreServices() {
  return (
    <section id="services" className="scroll-mt-32 bg-white">
      {/* Marks the stage the nav's deep link asked for. Now that each stage is
          its own row the scroll also lands correctly, but the highlight still
          answers "which one did I click?" on arrival. */}
      <TargetHighlight selector=".svc-tile" />

      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        {/* ── Section header ───────────────────────────────────────────── */}
        <div className="max-w-3xl">
          <Eyebrow>Full-Scope Capability</Eyebrow>
          <RevealText
            as="h2"
            text="One Partner, End to End"
            className="mt-3 font-display text-4xl tracking-wide text-black uppercase sm:text-5xl lg:text-6xl"
          />
          <p className="mt-5 font-body text-base leading-relaxed text-tnt-body sm:text-lg">
            Most lifts pass through four contractors before the load is set. Ours
            pass through one. Engineering, rigging, transport, and storage run on
            a single scope of work, a single schedule, and a single point of
            accountability — from the first ground-bearing calculation to the
            final set.
          </p>
        </div>

        {/* ── Stage 01 — the lead capability ───────────────────────────── */}
        <article
          id={slugify(LEAD.title)}
          className="svc-tile group relative mt-10 scroll-mt-32 overflow-hidden rounded-2xl bg-black sm:mt-12"
        >
          <ParallaxFrame
            id={LEAD.photo.id}
            alt={LEAD.photo.alt}
            className="min-h-[19rem] sm:min-h-[22rem] lg:min-h-[25rem]"
          >
            {/* Two scrims: a bottom-up ramp for the copy, and a left wash so the
                text column holds contrast whatever the photo does behind it. */}
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-t from-black via-black/55 to-black/10"
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/25 to-transparent"
            />

            {/* Min-heights trimmed 2026-08-04 (26/32/36rem → 21/24/26rem).
                These are a floor for the PHOTO, not a container for the copy —
                the overlay's content measures ~370px at `lg`, so 36rem was
                holding roughly 200px of empty frame and the lead alone ran 58%
                of the viewport. The new floor still clears the copy with room
                to spare; drop it further and the text starts driving the box,
                which is when the photo stops reading as a feature. */}
            <div className="relative flex h-full min-h-[21rem] flex-col justify-end p-7 sm:min-h-[24rem] sm:p-10 lg:min-h-[26rem] lg:p-14">
              <div className="flex items-center gap-3">
                <span className="font-mono text-sm text-tnt-amber tabular-nums">
                  {LEAD.index}
                </span>
                <span className="h-px w-8 bg-tnt-amber/60" aria-hidden="true" />
                <span className="font-body text-[11px] font-bold tracking-[0.22em] text-tnt-amber uppercase">
                  {LEAD.stage}
                </span>
              </div>
              <h3 className="mt-4 max-w-2xl font-display text-3xl leading-[1.05] tracking-wide text-white uppercase sm:text-4xl lg:text-5xl">
                {LEAD.title}
              </h3>
              <p className="mt-4 max-w-xl font-body text-sm leading-relaxed text-white/75 sm:text-base">
                {LEAD.blurb}
              </p>
              {/* self-start: the overlay is a column flex, which would otherwise
                  stretch the button across the full frame. */}
              <Button
                href="#quote"
                variant="primary"
                onDark
                className="mt-7 self-start"
              >
                Start with a lift plan
              </Button>
            </div>
          </ParallaxFrame>
        </article>

        {/* ── Stages 02–07 — the grid ──────────────────────────────────── */}
        {/* Still an <ol>: the six read 02→07 across rows, so the order is real
            and assistive tech should hear "2 of 6" rather than a pile of cards.
            The lifecycle now lives in the STAGE labels and numbering rather than
            in a drawn spine — a 3-across grid has no single path to trace.
            Equal heights come from the grid + `h-full` + column flex, not from
            trimming the copy. */}
        <ol className="mt-6 grid gap-4 sm:mt-8 sm:grid-cols-2 lg:grid-cols-3">
          {STAGES.map((s) => (
            <li
              key={s.index}
              id={slugify(s.title)}
              className="svc-tile group relative scroll-mt-32"
            >
              {/* No shadow at any state. Depth comes from the hairline border
                  going gold, a barely-there gold wash, and a 2px lift — enough
                  to register as interactive without a drop shadow. */}
              <article className="relative flex h-full flex-col rounded-xl border border-black/12 bg-white p-5 transition-[translate,border-color,background-color] duration-300 ease-out group-hover:-translate-y-0.5 group-hover:border-tnt-amber group-hover:bg-tnt-amber/[0.04] focus-within:border-tnt-amber sm:p-6">
                <div className="flex items-start justify-between gap-3">
                  {/* Icon well */}
                  <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-tnt-amber/10 text-tnt-amber transition-colors duration-300 group-hover:bg-black group-hover:text-tnt-amber">
                    <Icon name={s.icon} className="h-6 w-6" />
                  </span>
                  <span className="flex items-center gap-2 pt-1">
                    <span className="font-mono text-[11px] text-black/30 tabular-nums transition-colors duration-300 group-hover:text-tnt-amber">
                      {s.index}
                    </span>
                    <span className="font-body text-[10px] font-bold tracking-[0.2em] text-tnt-amber uppercase">
                      {s.stage}
                    </span>
                  </span>
                </div>

                <h3 className="mt-5 font-display text-xl tracking-wide text-black uppercase">
                  {s.title}
                </h3>
                {/* flex-1 pushes the CTA to a common baseline across the row,
                    so blurbs of different lengths still align. */}
                <p className="mt-2 flex-1 font-body text-[13px] leading-relaxed text-tnt-body">
                  {s.blurb}
                </p>

                {/* Hairline separator instead of a shadow to divide the card's
                    body from its action. */}
                <span
                  aria-hidden="true"
                  className="mt-5 block h-px w-full bg-black/10 transition-colors duration-300 group-hover:bg-tnt-amber/40"
                />

                {/* Learn more — the whole card is the hit area via the stretched
                    link, so this is the affordance, not the target. */}
                <span className="mt-4 flex items-center gap-2 font-body text-sm font-semibold text-black transition-colors duration-300 group-hover:text-tnt-amber">
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
        <div className="mt-12 overflow-hidden rounded-2xl bg-black sm:mt-14">
          <div className="flex flex-col gap-7 p-8 sm:p-10 lg:flex-row lg:items-center lg:justify-between lg:p-12">
            <div>
              <p className="font-display text-2xl leading-tight tracking-wide text-white uppercase sm:text-3xl lg:text-4xl">
                One partner.
                <br />
                <span className="text-tnt-amber">
                  From lift planning to final set.
                </span>
              </p>
              <p className="mt-3 max-w-lg font-body text-sm leading-relaxed text-white/60 sm:text-base">
                Tell us the load, the site, and the window. We&rsquo;ll scope the
                rest.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:shrink-0">
              <Button href="#quote" variant="primary" onDark>
                Request a quote
              </Button>
              <Button href="#contact" variant="secondary" onDark>
                Talk to an engineer
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
