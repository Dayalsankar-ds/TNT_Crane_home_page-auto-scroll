"use client";

/**
 * HERO SCROLL EXPERIENCE — R3F PORT (Phase 4 of the Three.js migration).
 *
 * Behavior-identical port of HeroScrollExperience.tsx: same frame sequence,
 * same mode heuristics (scrub / reduced / poster / pending, with the
 * `?scrub=1` override), same preloader UI, same sticky 500vh pin. The only
 * change is the frame surface — a WebGL textured plane (HeroFrameGL) instead
 * of 2D-canvas drawImage — which opens the door to true 3D moments in the
 * hero (camera drift, depth layers) later.
 *
 * The original component is kept untouched as the rollback path: swap the
 * import in app/page.tsx back to "@/components/HeroScrollExperience".
 *
 * The WebGL layer is mounted only in scrub mode via `dynamic(ssr: false)` —
 * static modes (mobile/reduced/pending) never download Three.js, and SSR
 * still paints the poster shell exactly as before.
 */

import dynamic from "next/dynamic";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import {
  ACTIVE_SEQUENCE,
  framePath as seqFramePath,
} from "@/components/heroSequence";
import HeroHeadline from "@/components/HeroHeadline";
import HeroScrollCue from "@/components/HeroScrollCue";
import useHeroAutoScroll from "@/components/useHeroAutoScroll";

const HeroFrameGL = dynamic(
  () => import("@/components/three/gl").then((m) => m.HeroFrameGL),
  { ssr: false },
);

// Which footage plays — and how tall the pin is — lives in heroSequence.ts so
// swapping sequences (or reverting) is a one-line change there.
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

export default function HeroScrollExperienceR3F() {
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

  // Static modes get no extra section height, so the sticky child collapses to
  // an ordinary 100vh hero with nothing to scrub through.
  const isStatic =
    mode === "poster" || mode === "reduced" || mode === "pending";
  const staticSrc = mode === "reduced" ? LAST_FRAME_SRC : FIRST_FRAME_SRC;
  const showLoader = mode === "scrub" && !framesReady;

  // One wheel gesture at either end of the pin plays the whole sequence to the
  // other end — down from frame 1, back up from the last frame. Gated on
  // framesReady as well as the mode: without the decoded sequence this would
  // scroll 500vh past a frozen frame 1. See the hook for the arm/cancel rules.
  useHeroAutoScroll({ sectionRef, enabled: mode === "scrub" && framesReady });

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

        {/* Closing beat, and the mirror of the headline: fades IN over the last
            tenth of the pin to advertise the backward run that useHeroAutoScroll
            arms at the final frame. Mounted after the headline so that if the
            two ever overlap, the cue wins the stack — but they cannot, since one
            has cleared by 26% and the other arrives at 90%. */}
        <HeroScrollCue sectionRef={sectionRef} isStatic={isStatic} />

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
