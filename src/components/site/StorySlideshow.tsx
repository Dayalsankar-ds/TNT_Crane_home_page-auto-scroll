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
 * as "disabled") and swaps in that stat's description on the black panel
 * below.
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

type Slide = {
  icon: IconName;
  value: string;
  label: string;
  description: string;
};

const HERO_IMAGE = "/photos/tnt-crawler-crane-wide.jpg";
const HERO_ALT = "TNT crawler crane on site at sunset";

const SLIDES: Slide[] = [
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
        className="relative min-h-[32rem] overflow-hidden lg:min-h-[44rem]"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={HERO_IMAGE}
          alt={HERO_ALT}
          className="absolute inset-0 h-full w-full object-cover"
        />

        {/* Gutter wrapper — same mx-auto max-w-7xl frame every other section
           uses, so the panel stays centered within it on ultra-wide screens.
           Padding on an absolutely-positioned parent doesn't inset an
           absolutely-positioned child's right:0 (offsets resolve against the
           padding box's outer edge, same as the border edge) — so the actual
           gutter is applied directly on the panel below, at the same px-4
           sm:px-6 lg:px-8 scale every other section's margin uses. */}
        <div className="pointer-events-none absolute inset-y-4 inset-x-0 mx-auto max-w-7xl sm:inset-y-6 lg:inset-y-8">
          <div className="pointer-events-auto absolute inset-y-0 right-4 w-[92%] max-w-md overflow-hidden bg-white shadow-2xl sm:right-6 lg:right-8 lg:max-w-xl">
            <dl className="grid h-full grid-cols-2">
              {SLIDES.map((s, i) => {
                const isActive = i === index;
                return (
                  <button
                    key={s.label}
                    type="button"
                    onClick={() => go(i)}
                    aria-current={isActive ? "true" : undefined}
                    aria-label={`${s.label}: ${s.value}`}
                    className={`flex flex-col items-center justify-center gap-2 px-4 py-6 text-center transition-colors duration-300 sm:gap-3 sm:py-8 ${
                      isActive ? "bg-tnt-maroon" : ""
                    } ${i % 2 === 0 ? "border-r border-black/10" : ""} ${
                      i < SLIDES.length - 2 ? "border-b border-black/10" : ""
                    }`}
                  >
                    <span
                      className={`flex h-9 w-9 items-center justify-center rounded-full border sm:h-11 sm:w-11 ${
                        isActive
                          ? "border-white text-white"
                          : "border-tnt-amber text-tnt-amber"
                      }`}
                    >
                      <Icon name={s.icon} className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={2.4} />
                    </span>
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

      {/* Content panel — the slide's description on a black background,
         directly beneath the photo/stat-grid row now that the arrows and
         progress bar are gone; the stat cards themselves are the only
         navigation control. Keyed on `index` so each slide change is a fresh
         mount, which is what makes the CSS entrance animation replay. */}
      <div className="flex items-center justify-center bg-black px-8 py-14 text-center sm:px-12 sm:py-16">
        <p
          key={index}
          className="story-fade-up max-w-3xl font-display text-lg leading-relaxed tracking-wide text-tnt-amber sm:text-xl lg:text-2xl"
        >
          {current.description}
        </p>
      </div>
    </section>
  );
}
