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
 *  - Auto-scroll hook: useHeroAutoScrollManualScroll.ts — kept as a fully
 *    separate module from this project's own useHeroAutoScroll.ts, but
 *    brought to identical behavior across every change so far (one-shot,
 *    the becomes-unreachable wall, and 2026-09-10's rewrite into an
 *    unconditional, un-cancellable autoplay — no more manual scrubbing).
 *
 * 2026-09-10: this file used to carry two extra effects here (a 1:1
 * lerp-zeroing scroll tracker, and a touch-momentum killer) purely to make
 * MANUAL scrubbing inside the pin feel direct, plus its own
 * HeroScrollCueManualScroll.tsx replay cue. All three are gone along with
 * manual scrubbing itself — see the autoplay hook's own docblock.
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
import useHeroAutoScrollManualScroll from "@/components/useHeroAutoScrollManualScroll";

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

  // The two effects that used to live here (a 1:1 lerp-zeroing scroll
  // tracker, and a touch-momentum killer) existed solely to make MANUAL
  // scrubbing inside the pin feel direct. Removed 2026-09-10 along with
  // manual scrubbing itself — the autoplay hook below claims the scroll the
  // moment frames are ready and holds it locked, so there is no longer a
  // window in which a user's own wheel/touch gesture drives the pin at all.

  // Plays the whole sequence itself, once, the moment frames are ready — no
  // manual scrubbing, no gesture to start it. See that hook's own docblock
  // for the full mechanism (Lenis lock, keyboard blocking, the
  // becomes-unreachable wall afterward).
  useHeroAutoScrollManualScroll({
    sectionRef,
    frameCount: FRAME_COUNT,
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
