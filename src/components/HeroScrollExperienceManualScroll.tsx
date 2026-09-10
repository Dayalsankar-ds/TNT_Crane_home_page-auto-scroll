"use client";

/**
 * HERO SCROLL EXPERIENCE — MANUAL-SCROLL VARIANT.
 *
 * Copied 2026-09-08 from the sibling TNT_Crane_home_page-manual-scroll
 * project as a second hero version, alongside this project's own
 * HeroScrollExperienceR3F.tsx. Wired in as "Hero version two" behind
 * HeroToggle's floating picker (see heroVersionStore.ts) rather than swapped
 * into page.tsx directly.
 *
 * Differences from this project's own hero:
 *  - Frame sequence: heroSequenceManualScroll.ts's V3 (JPEG frames, served
 *    through Next's image optimizer; trimmed 2026-09-10 to end on the
 *    jobsite footage, same as V5 — see that file's docblock) instead of
 *    heroSequence.ts's V5 (WebP frames, served raw).
 *  - Auto-scroll hook: useHeroAutoScrollManualScroll.ts — originally the
 *    older, pre-one-shot form of this project's own hook, brought up to the
 *    same one-shot-per-visit and scroll-lock behavior 2026-09-10 (see that
 *    file's docblock for what's still deliberately kept separate).
 *  - Adds a manual, 1:1 scroll-tracking effect and a touch-momentum killer
 *    inside the pin (see below) that this project's own hero does not have.
 *  - Its own HeroScrollCueManualScroll.tsx (self-contained, no shared
 *    constants with the hook) rather than this project's HeroScrollCue.tsx.
 *
 * Shares HeroHeadline.tsx, HeroFrameGL.tsx (via three/gl.ts) and
 * SmoothScroll.tsx with this project's own hero — those are identical
 * between the two source projects, so nothing needed duplicating there.
 *
 * The WebGL layer is mounted only in scrub mode via `dynamic(ssr: false)` —
 * static modes (mobile/reduced/pending) never download Three.js, and SSR
 * still paints the poster shell exactly as before.
 */

import dynamic from "next/dynamic";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import {
  ACTIVE_SEQUENCE,
  optimizedFramePath as seqFramePath,
} from "@/components/heroSequenceManualScroll";
import HeroHeadline from "@/components/HeroHeadline";
import HeroScrollCueManualScroll from "@/components/HeroScrollCueManualScroll";
import useHeroAutoScrollManualScroll from "@/components/useHeroAutoScrollManualScroll";
import { getLenis } from "@/components/SmoothScroll";

const HeroFrameGL = dynamic(
  () => import("@/components/three/gl").then((m) => m.HeroFrameGL),
  { ssr: false },
);

// Which footage plays — and how tall the pin is — lives in
// heroSequenceManualScroll.ts so swapping sequences (or reverting) is a
// one-line change there.
const FRAME_START = ACTIVE_SEQUENCE.start;
const FRAME_COUNT = ACTIVE_SEQUENCE.count;
const FRAME_LAST = FRAME_START + FRAME_COUNT - 1;

// Sticky child is 100vh; the parent's extra height is the pin distance.
const SECTION_VH = ACTIVE_SEQUENCE.sectionVh;

const framePath = (n: number) => seqFramePath(ACTIVE_SEQUENCE, n);
const FIRST_FRAME_SRC = framePath(FRAME_START);
const LAST_FRAME_SRC = framePath(FRAME_LAST);

type Mode = "scrub" | "reduced" | "poster" | "pending";

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";
const COARSE_POINTER = "(pointer: coarse)";

function subscribeToMode(onChange: () => void) {
  const reduced = window.matchMedia(REDUCED_MOTION);
  const coarse = window.matchMedia(COARSE_POINTER);
  reduced.addEventListener("change", onChange);
  coarse.addEventListener("change", onChange);
  // getModeSnapshot also reads window.innerWidth, so resize has to notify or
  // that branch never re-evaluates after mount.
  window.addEventListener("resize", onChange, { passive: true });
  return () => {
    reduced.removeEventListener("change", onChange);
    coarse.removeEventListener("change", onChange);
    window.removeEventListener("resize", onChange);
  };
}

function getModeSnapshot(): Mode {
  // Test override: `?scrub=1` forces the full sequence on any device. Without
  // it, a phone or low-core machine gets the static poster by design — which
  // is indistinguishable from "the animation is broken".
  if (new URLSearchParams(window.location.search).has("scrub")) return "scrub";
  // An explicit motion preference outranks the device heuristic.
  if (window.matchMedia(REDUCED_MOTION).matches) return "reduced";
  const coarse = window.matchMedia(COARSE_POINTER).matches;
  const fewCores =
    typeof navigator.hardwareConcurrency === "number" &&
    navigator.hardwareConcurrency <= 4;
  return coarse || fewCores || window.innerWidth < 768 ? "poster" : "scrub";
}

// Server and first client render agree, so hydration matches.
const getServerModeSnapshot = (): Mode => "pending";

export default function HeroScrollExperienceManualScroll() {
  const mode = useSyncExternalStore(
    subscribeToMode,
    getModeSnapshot,
    getServerModeSnapshot,
  );

  const [loadProgress, setLoadProgress] = useState(0);
  const [framesReady, setFramesReady] = useState(false);

  const sectionRef = useRef<HTMLElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);

  // ---- Preload the sequence (unchanged from the 2D hero) -------------------
  useEffect(() => {
    if (mode !== "scrub") return;

    let cancelled = false;
    const images: HTMLImageElement[] = new Array(FRAME_COUNT);
    let settled = 0;

    // Requests are issued in frame order so the opening frames arrive first;
    // the browser's own connection pool handles queueing.
    for (let i = 0; i < FRAME_COUNT; i++) {
      const img = new Image();
      const done = () => {
        if (cancelled) return;
        settled += 1;
        setLoadProgress(settled / FRAME_COUNT);
        if (settled === FRAME_COUNT) setFramesReady(true);
      };
      img.onload = done;
      img.onerror = done; // a missing frame must not deadlock the loader
      img.src = framePath(FRAME_START + i);
      images[i] = img;
    }
    imagesRef.current = images;

    return () => {
      cancelled = true;
      // Drop references so the decoded surfaces become collectable.
      for (const img of images) {
        img.onload = null;
        img.onerror = null;
      }
      imagesRef.current = [];
      // Must accompany clearing imagesRef: leaving framesReady true would let
      // the frame surface run against an empty array on a later return to
      // "scrub", skipping the loading UI while nothing renders.
      setFramesReady(false);
      setLoadProgress(0);
    };
  }, [mode]);

  // ---- Manual, 1:1 scroll tracking inside the pin ---------------------------
  // SmoothScroll's Lenis instance eases toward each wheel tick's target
  // (lerp: 0.1) rather than applying it immediately, so releasing the wheel
  // lets the scroll glide a few frames further before settling — which reads
  // as the hero still animating on its own. Lenis reads `options.lerp` fresh
  // on every wheel event, and its Animate step treats a falsy lerp as "jump
  // straight to the target" (no damping at all) rather than "damp with 0
  // strength" — so zeroing it while inside the pin makes each wheel tick land
  // exactly where the wheel stopped, immediately. Outside the pin, the site's
  // normal glide (SmoothScroll's lerp: 0.1) is restored.
  useEffect(() => {
    if (mode !== "scrub") return;
    const section = sectionRef.current;
    if (!section) return;
    const lenis = getLenis();
    if (!lenis) return; // reduced motion — Lenis is never booted there

    const SITE_LERP = 0.1; // must match SmoothScroll's Lenis config

    const update = () => {
      const distance = section.offsetHeight - window.innerHeight;
      const p =
        distance > 0 ? -section.getBoundingClientRect().top / distance : 1;
      lenis.options.lerp = p >= 0 && p <= 1 ? 0 : SITE_LERP;
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update, { passive: true });
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      lenis.options.lerp = SITE_LERP;
    };
  }, [mode]);

  // ---- Kill native touch momentum inside the pin ----------------------------
  // HeroFrameGL reads scroll position directly every frame with no easing of
  // its own (see its useFrame), so the hero can only keep animating after a
  // finger lifts if the document's actual scroll position is still changing —
  // which native touch-scroll momentum does, exactly like flinging any long
  // page. Lenis never sees this (`syncTouch` is off site-wide), so the lerp
  // trick above doesn't reach it either. The only way to stop it is to take
  // over the gesture itself: read the finger's raw delta and apply it to
  // scrollY immediately, one-to-one, with nothing injected at release.
  useEffect(() => {
    if (mode !== "scrub") return;
    const section = sectionRef.current;
    if (!section) return;

    let tracking = false;
    let lastY = 0;

    const inPin = () => {
      const distance = section.offsetHeight - window.innerHeight;
      if (distance <= 0) return false;
      const p = -section.getBoundingClientRect().top / distance;
      return p >= 0 && p <= 1;
    };

    const onTouchStart = (e: TouchEvent) => {
      // Multi-touch (pinch/zoom) is left alone — only a single dragging
      // finger is a scroll gesture here.
      if (e.touches.length !== 1 || !inPin()) return;
      tracking = true;
      lastY = e.touches[0].clientY;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!tracking || e.touches.length !== 1) return;
      const y = e.touches[0].clientY;
      const delta = lastY - y; // finger moving up = scrolling down
      lastY = y;
      // Cancels the browser's own scroll for this gesture so nothing but
      // this handler's 1:1 delta ever moves the page while tracking.
      if (e.cancelable) e.preventDefault();
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const next = Math.min(max, Math.max(0, window.scrollY + delta));
      window.scrollTo({ top: next, behavior: "instant" });
    };

    // No momentum on release — tracking simply stops, and scroll stays
    // exactly at the last touchmove's position.
    const onTouchEnd = () => {
      tracking = false;
    };

    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    window.addEventListener("touchcancel", onTouchEnd, { passive: true });
    return () => {
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("touchcancel", onTouchEnd);
    };
  }, [mode]);

  // ---- Auto-play a full run when a flick lands at either end of the pin -----
  // Manual 1:1 scrubbing (above) stays untouched mid-sequence; this only arms
  // right at the opening or closing frame. See useHeroAutoScrollManualScroll.ts.
  useHeroAutoScrollManualScroll({
    sectionRef,
    enabled: mode === "scrub" && framesReady,
  });

  // Static modes get no extra section height, so the sticky child collapses to
  // an ordinary 100vh hero with nothing to scrub through.
  const isStatic =
    mode === "poster" || mode === "reduced" || mode === "pending";
  const staticSrc = mode === "reduced" ? LAST_FRAME_SRC : FIRST_FRAME_SRC;
  const showLoader = mode === "scrub" && !framesReady;

  return (
    <section
      ref={sectionRef}
      style={isStatic ? undefined : { height: `${SECTION_VH}vh` }}
      className="relative bg-black"
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-black">
        {/* Frame surface */}
        {isStatic ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={staticSrc}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <>
            <HeroFrameGL
              sectionRef={sectionRef}
              imagesRef={imagesRef}
              frameCount={FRAME_COUNT}
              framesReady={framesReady}
            />
            {/* First frame covers the GL canvas while the sequence loads, so
                the hero is never blank (the plane stays hidden until its first
                texture upload anyway). Full opacity: frame 01000 is already
                dark; dimming it rendered the hero effectively black. */}
            {showLoader && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={FIRST_FRAME_SRC}
                alt=""
                aria-hidden="true"
                className="absolute inset-0 h-full w-full object-cover"
              />
            )}
          </>
        )}

        {/* Persistent bottom gradient — filmic vignette that grounds the frame.
            Also the base layer the opening headline sits on; HeroHeadline adds
            its own bottom-left corner scrim on top of this. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-black/25 to-transparent"
        />

        {/* Opening statement — the page's only <h1>. Rides the same scroll
            progress as the frame surface and clears before the logo reveal. */}
        <HeroHeadline sectionRef={sectionRef} isStatic={isStatic} />

        {/* Replay cue — arrives near the last frame, plays the sequence back
            to frame 1 on click. Mirrors the auto-scroll run above. */}
        <HeroScrollCueManualScroll sectionRef={sectionRef} isStatic={isStatic} />

        {/* Loading state — anchored top-left over the frame. */}
        {showLoader && (
          <div className="absolute inset-x-0 top-0 px-6 pt-8 sm:px-8 sm:pt-12">
            <div className="mx-auto w-full max-w-5xl">
              <div className="mb-4 flex items-baseline gap-3">
                <p className="text-sm font-medium tracking-wide text-white/70">
                  Loading experience
                </p>
                <span className="font-mono text-sm tabular-nums text-brand-gold">
                  {Math.round(loadProgress * 100)}%
                </span>
              </div>
              <div
                role="progressbar"
                aria-label="Loading hero image sequence"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(loadProgress * 100)}
                className="h-0.5 w-full max-w-xs overflow-hidden rounded-full bg-white/15"
              >
                <div
                  className="h-full bg-brand-gold transition-[width] duration-200 ease-out"
                  style={{ width: `${Math.round(loadProgress * 100)}%` }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
