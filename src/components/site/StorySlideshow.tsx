"use client";

/**
 * STORY SLIDESHOW — the homepage's second section, six user-driven slides.
 *
 * 2026-07-30: supersedes OperationalScale.tsx (a static photo + 6-stat grid,
 * no interaction), which is now unused but left in the repo — same treatment
 * this project gives every superseded implementation (the original 2D hero,
 * ScaleBoard, ScrollExpandMedia).
 *
 * The background photo is fixed (one static image, not a per-slide
 * crossfade). Each stat card is paired 1:1 with a slide and is itself the
 * navigation control — no separate arrows/progress bar (removed 2026-07-30;
 * the cards being clickable made them redundant). Clicking a card highlights
 * it in brand maroon (not dimmed; maroon reads as "selected", dimming reads
 * as "disabled") and swaps in that stat's description.
 *
 * DESCRIPTION PLACEMENT — ABOUT VERSION GATE (2026-09-02): originally this
 * was purely responsive (left-of-photo on wide screens, a bar underneath on
 * narrow ones). On request, it's now gated on aboutVersionStore.ts instead —
 * the same store backing the "About /01 /02" picker in SiteNav.tsx — so
 * either composition can be previewed at any viewport width:
 *   - version "one": left side of the photo itself, over a left-to-right
 *               black scrim, with the 7-card panel still anchored on the
 *               right — a true two-column composition (the old lg+ layout).
 *   - version "two": a full-width black bar under the photo (the old
 *               below-lg layout). A second overlay doesn't fit beside the
 *               card panel at narrow widths (it already wants ~92% of the
 *               row), which is why this layout existed in the first place —
 *               now it's a deliberate choice rather than a width fallback.
 *
 * Auto-advances every 4s (2026-07-30) while the section is in view, unless
 * the user prefers reduced motion. Any manual navigation (card click, arrow
 * key, swipe) resets the timer rather than fighting it. Description copy is
 * set in Impact (`font-display`), matching the stat numerals above it.
 */

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type TouchEvent,
} from "react";
import { Icon, type IconName } from "./primitives";
import { useAboutVersion } from "./aboutVersionStore";

type Slide = {
  icon: IconName;
  /** Overrides the glyph icon with a self-contained badge image (iCARE) —
   *  see SafetyCulture.tsx's docblock on why the Badge variant, not a
   *  stroke icon, is what reads on any background. */
  badgeImg?: string;
  value: string;
  label: string;
  description: string;
};

// Real TNT Crane & Rigging photography (2026-08-20, on request) — sourced
// from tntcrane.com/wp-content/uploads/2023/09/TNT_Boom.jpg, replacing a
// generic stock crawler-crane photo. Boom tip and hook block against sky.
// Flipped horizontally (2026-08-20, on request) so the boom lands on the
// open left side of the panel instead of behind it — the tradeoff, accepted
// on request, is that the "TNT" wordmark on the boom now reads mirrored.
const HERO_IMAGE = "/photos/tnt-crane-boom-hook.jpg";
const HERO_ALT = "TNT crane boom and hook block against the sky";

const SLIDES: Slide[] = [
  {
    icon: "engineering",
    badgeImg: "/brand/icare-badge.png",
    value: "iCARE",
    label: "Safety Program",
    description:
      "iCARE is TNT's safety program — every operator, rigger, and crew member is personally accountable for the job running safely, on every lift, at every branch.",
  },
  {
    icon: "clock",
    value: "40+",
    label: "Years of Experience",
    description:
      "For more than 40 years, TNT Crane & Rigging has delivered lifting and rigging solutions across North America's most demanding job sites.",
  },
  {
    icon: "person",
    value: "1,750+",
    label: "Employees",
    description:
      "Certified operators, riggers, and engineers — nearly 1,750 strong — staff every branch, ready to mobilize on short notice.",
  },
  {
    icon: "boom",
    value: "700+",
    label: "Cranes in Fleet",
    description:
      "From crawler cranes to all-terrain and tower cranes, our fleet of 700-plus machines covers every capacity class you need.",
  },
  {
    icon: "pin",
    value: "45+",
    label: "Locations",
    description:
      "With 45-plus branches across the U.S. and Canada, TNT combines local response times with the reach of a national fleet.",
  },
  {
    icon: "trophy",
    value: "15th",
    label: "ACT 100 Ranking",
    description:
      "Ranked 15th on the ACT 100, TNT stands among the largest and most trusted crane and rigging operators in the industry.",
  },
  {
    icon: "headset",
    value: "24/7",
    label: "Emergency Response",
    description:
      "Storms, breakdowns, and emergency lifts don't wait for business hours — our crews dispatch around the clock, every day.",
  },
];

const TOTAL = SLIDES.length;

export default function StorySlideshow() {
  const [aboutVersion] = useAboutVersion();
  const [index, setIndex] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);
  const touchStartX = useRef<number | null>(null);
  const inViewRef = useRef(false);
  const reducedMotionRef = useRef(false);

  useEffect(() => {
    reducedMotionRef.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
  }, []);

  const go = useCallback((next: number) => {
    setIndex(((next % TOTAL) + TOTAL) % TOTAL); // wraps both directions
  }, []);
  const prev = useCallback(() => go(index - 1), [go, index]);
  const next = useCallback(() => go(index + 1), [go, index]);

  // Arrow-key navigation, gated on the section actually being in view — a
  // page-wide listener would otherwise hijack Left/Right while someone is
  // reading an unrelated section, or typing in a form field anywhere on the
  // page.
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        inViewRef.current = entry.isIntersecting;
      },
      { threshold: 0.4 },
    );
    io.observe(section);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!inViewRef.current) return;
      const tag = (document.activeElement?.tagName || "").toLowerCase();
      if (tag === "input" || tag === "textarea" || tag === "select") return;
      if (e.key === "ArrowLeft") prev();
      else if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [prev, next]);

  const onTouchStart = (e: TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: TouchEvent) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(dx) < 40) return; // ignore taps / small jitter
    if (dx < 0) next();
    else prev();
  };

  // Autoplay — every 4s, only while the section is actually in view (an
  // off-screen carousel silently racking up index changes would desync the
  // in-view state and burn cycles for nothing) and never for reduced-motion.
  // Depends on `index` so every advance (auto OR manual) restarts the 4s
  // window, instead of a manual click getting immediately overridden by a
  // timer that was already mid-countdown.
  useEffect(() => {
    if (reducedMotionRef.current) return;
    const id = setInterval(() => {
      if (inViewRef.current) next();
    }, 4000);
    return () => clearInterval(id);
  }, [index, next]);

  const current = SLIDES[index];

  return (
    <section
      ref={sectionRef}
      id="statement"
      className="bg-white"
      aria-roledescription="carousel"
      aria-label="Why TNT Crane & Rigging"
    >
      {/* Screen-reader announcement only — the visual change (panel text) is
         silent to anyone not looking at it. */}
      <p aria-live="polite" className="sr-only">
        Slide {index + 1} of {TOTAL}
      </p>

      {/* Photo — fixed background, identical across every slide — with the
         stat grid overlaid top-right, inset equally on top/right/bottom. */}
      <div
        // Grown from 32/44rem (2026-08-19, iCARE card added as a 7th slide):
        // 6 cards filled the grid in exactly 3 rows at the old heights; the
        // 4th row now needs the extra room at every breakpoint or its bottom
        // edge clips against the panel's `overflow-hidden`. Trimmed back down
        // from 38/47/50rem the same day — with the card + description
        // padding both tightened, the full section (cards + description) now
        // fits inside common viewport heights without extra scrolling.
        className="relative min-h-[31rem] overflow-hidden sm:min-h-[37rem] lg:min-h-[40rem]"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={HERO_IMAGE}
          alt={HERO_ALT}
          className="absolute inset-0 h-full w-full object-cover"
        />

        {/* Left-side scrim (2026-09-02, on request: description moved from
           the bottom bar to the left side of the photo for version "one") —
           the photo has no dark region of its own on the left, so the amber
           description text needs a wash to stay legible sitting on top of
           it. Gated on the same About-version check as the description
           block below, not a breakpoint (see the docblock's ABOUT VERSION
           GATE note). */}
        {aboutVersion === "one" && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/85 via-black/45 to-transparent"
          />
        )}

        {/* Gutter wrapper — same mx-auto max-w-7xl frame every other section
           uses, so the panel stays centered within it on ultra-wide screens.
           Padding on an absolutely-positioned parent doesn't inset an
           absolutely-positioned child's right:0 (offsets resolve against the
           padding box's outer edge, same as the border edge) — so the actual
           gutter is applied directly on the panel below, at the same px-4
           sm:px-6 lg:px-8 scale every other section's margin uses. */}
        <div className="pointer-events-none absolute inset-y-4 inset-x-0 mx-auto max-w-7xl sm:inset-y-6 lg:inset-y-8">
          {/* Left-side description (version "one" only) — mirrors the
             description that used to sit in the full-width bar below the
             photo. There isn't enough spare width beside the card panel
             (which itself needs ~92% of the row) for a second overlay to
             sit next to it without the two colliding, which is why version
             "two" keeps the bottom-bar layout instead — see its own comment
             further down. */}
          {aboutVersion === "one" && (
            <div className="pointer-events-none absolute inset-y-0 left-8 flex w-[36%] max-w-md items-center">
              <p
                key={index}
                className="story-fade-up font-display text-xl leading-relaxed tracking-wide text-tnt-amber lg:text-2xl"
              >
                {current.description}
              </p>
            </div>
          )}

          <div className="pointer-events-auto absolute inset-y-0 right-4 w-[92%] max-w-md overflow-hidden bg-white shadow-2xl sm:right-6 lg:right-8 lg:max-w-xl">
            <dl className="grid h-full grid-cols-2">
              {SLIDES.map((s, i) => {
                const isActive = i === index;
                // The badge card (iCARE) leads the grid (2026-08-20, moved
                // from the last slide to the first, on request) and spans the
                // full width alone in its own row rather than leaving an
                // empty cell beside it. That shifts the 2-col pairing for
                // every card after it by one: they now pair up starting
                // AFTER the spanning row, so the left column is the ODD
                // indices (1, 3, 5), not the even ones. Bottom dividers still
                // go on every row except the true last one.
                const isFirst = i === 0;
                return (
                  <button
                    key={s.label}
                    type="button"
                    onClick={() => go(i)}
                    aria-current={isActive ? "true" : undefined}
                    aria-label={`${s.label}: ${s.value}`}
                    className={`flex flex-col items-center justify-center gap-1.5 px-4 py-3 text-center transition-colors duration-300 sm:gap-2 sm:py-4 ${
                      isActive ? "bg-tnt-maroon" : ""
                    } ${isFirst ? "col-span-2" : ""} ${
                      !isFirst && i % 2 === 1 ? "border-r border-black/10" : ""
                    } ${i < SLIDES.length - 2 ? "border-b border-black/10" : ""}`}
                  >
                    {s.badgeImg ? (
                      // Self-contained shield mark — no circular border
                      // wrapper, same reasoning as SafetyCulture's own badge.
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={s.badgeImg}
                        alt=""
                        className="h-8 w-8 object-contain sm:h-9 sm:w-9"
                      />
                    ) : (
                      <span
                        className={`flex h-8 w-8 items-center justify-center rounded-full border sm:h-9 sm:w-9 ${
                          isActive
                            ? "border-white text-white"
                            : "border-tnt-amber text-tnt-amber"
                        }`}
                      >
                        <Icon name={s.icon} className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={2.4} />
                      </span>
                    )}
                    <dt className="sr-only">{s.label}</dt>
                    <dd>
                      <span
                        className={`block font-display text-2xl leading-none tracking-wide sm:text-3xl lg:text-4xl ${
                          isActive ? "text-white" : "text-black"
                        }`}
                      >
                        {s.value}
                      </span>
                      <span
                        className={`mt-1.5 block font-body text-[10px] font-semibold tracking-[0.12em] uppercase sm:text-xs ${
                          isActive ? "text-white/80" : "text-tnt-meta"
                        }`}
                      >
                        {s.label}
                      </span>
                    </dd>
                  </button>
                );
              })}
            </dl>
          </div>
        </div>
      </div>

      {/* Content panel — the slide's description, version "two" only
         (2026-09-02, on request: gated on aboutVersionStore.ts rather than
         `lg:hidden` now, so this bar can be previewed at any viewport width
         — see the docblock's ABOUT VERSION GATE note; version "one" puts
         the description beside the photo instead, above).
         bg-black restored (2026-08-19, on request) — briefly bg-tnt-maroon
         to match SafetyCulture/iCARE, reverted back.
         min-h fixed (2026-08-20, on request) — was purely content-driven, so
         the panel visibly grew/shrank as the carousel auto-advanced between a
         2-line description and iCARE's 3-line one. Heights below are the
         EXACT measured worst case (iCARE, the longest copy) at each of the
         text size's three breakpoints — text + padding, zero slack, same
         methodology as the card grid's own min-h above — not rounded up,
         because the extra headroom pushed the total section past 800px
         viewport heights and broke the "fits without scrolling" requirement
         that sizing was tuned for. `items-center` still centers whichever
         text is shorter within the fixed box. */}
      {aboutVersion === "two" && (
        <div className="flex min-h-[170px] items-center justify-center bg-black px-8 py-3 text-center sm:min-h-[97px] sm:px-12 sm:py-4">
          <p
            key={index}
            className="story-fade-up max-w-3xl font-display text-lg leading-relaxed tracking-wide text-tnt-amber sm:text-xl lg:text-2xl"
          >
            {current.description}
          </p>
        </div>
      )}
    </section>
  );
}
