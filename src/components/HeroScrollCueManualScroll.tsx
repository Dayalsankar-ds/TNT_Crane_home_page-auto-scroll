"use client";

/**
 * HERO SCROLL-UP CUE — MANUAL-SCROLL VARIANT.
 *
 * Copied 2026-09-08 from the sibling TNT_Crane_home_page-manual-scroll
 * project as part of that project's hero, as a second version alongside this
 * project's own HeroScrollCue.tsx. Pairs with useHeroAutoScrollManualScroll.ts
 * rather than this project's own useHeroAutoScroll.ts — kept self-contained
 * (its own local HERO_RUN_S/heroRunEase) rather than sharing constants with
 * this project's hook, matching how the source project had it.
 *
 * ONE-SHOT PER VISIT (2026-09-10, on request): a click here now spends the
 * same one-shot budget useHeroAutoScrollManualScroll.ts's wheel-triggered
 * runs do, and the button hides itself once that budget is gone — same
 * two-doors-one-budget arrangement as HeroScrollCue.tsx/useHeroAutoScroll.ts.
 * Without this, a click could still replay the sequence indefinitely even
 * after the hook's own wheel-triggered runs had permanently disarmed.
 *
 * Click-to-replay control for the hero's backward run. Clicking it plays the
 * whole sequence back to frame 1, animated the same way the hero itself
 * scrubs. It only ever arrives near the last frame, so it reads as "you've
 * reached the end — replay from the top."
 *
 * PLACEMENT is dictated by frame 00385, the same way HeroHeadline's is dictated
 * by the opening frames — the closing shot is a sunset ABOVE the clouds, so the
 * usual assumption that a hero is dark is wrong here:
 *
 *  - Centre and lower-centre are the TNT lockup, whose wordmark runs to roughly
 *    87% of frame height. The cue sits below that, in the bottom strip.
 *  - That strip is bright cloud, so legibility cannot come from the footage.
 *    It comes from two things already in the design: the persistent
 *    `from-black/60` vignette in the hero surface (which is OUTSIDE
 *    HeroHeadline's fading wrapper and so is still there at the last frame),
 *    and the same text-shadow pair the h1 carries.
 *  - Amber, not white, for the mark. It is the token the closing logo is
 *    already built from, and it holds against both bright cloud and the dark
 *    sky the sequence starts in — white does not.
 *
 * The reveal is the mirror of HeroHeadline's exit: that block fades OUT over
 * the opening quarter of the pin, this one fades IN over the closing tenth, and
 * both read progress off the same section with the same math.
 *
 * Progress here is deliberately UNCLAMPED, for the reason spelled out at length
 * in useHeroAutoScrollManualScroll: every position below the hero reports
 * exactly 1 once clamped, so a clamped reading would hold this at full
 * opacity for the entire rest of the page.
 */

import { useEffect, useRef, type RefObject } from "react";
import { getLenis } from "@/components/SmoothScroll";
import {
  hasHeroRunTriggeredManualScroll,
  markHeroRunTriggeredManualScroll,
} from "@/components/useHeroAutoScrollManualScroll";
import { Icon } from "@/components/site/primitives";

/** Seconds for the replay-to-top scroll. Long enough to read as a camera move
 *  rather than a jump cut, short enough that nobody feels held. */
const HERO_RUN_S = 2.8;

/** Gentle at both ends: eases in so the takeover doesn't snap out from under
 *  the click, and eases out so it settles onto frame 1 instead of slamming
 *  into it. */
const heroRunEase = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

/** Progress (0–1 through the pin) where the cue starts arriving and where it is
 *  fully present. Late and short on purpose — it belongs to the closing shot,
 *  not to the sequence. */
const REVEAL_FROM = 0.9;
const FULL_AT = 0.985;

/** Past this the hero is behind us and the cue is not just irrelevant but
 *  wrong — the upward run it advertises is no longer armed. The margin matches
 *  the hook's ARM_MARGIN so the two agree on where "the last frame" ends. */
const PAST_HERO = 1.02;

/** How far the cue rises into place, in px. Deliberately small and DOWNWARD
 *  (it starts below its resting place): the block is arriving from the bottom
 *  edge, which is the direction the chevron then points away from. */
const RISE = 12;

export default function HeroScrollCueManualScroll({
  sectionRef,
  isStatic,
}: {
  /** The pinned <section> — the same element the frame surface measures. */
  sectionRef: RefObject<HTMLElement | null>;
  /** Poster / reduced / pending. No pin exists, so there is no last frame to
   *  sit at and no backward run to advertise: the cue stays out entirely. */
  isStatic: boolean;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;

    // Static modes never show this. Written explicitly rather than by not
    // rendering, so a mode change back to scrub finds clean inline styles.
    if (isStatic) {
      wrap.style.opacity = "0";
      wrap.style.transform = "";
      const button = buttonRef.current;
      if (button) {
        button.style.pointerEvents = "none";
        button.toggleAttribute("inert", true);
      }
      return;
    }

    const section = sectionRef.current;
    if (!section) return;

    let queued = false;

    const apply = () => {
      queued = false;

      const distance = section.offsetHeight - window.innerHeight;
      const rect = section.getBoundingClientRect();
      // Unclamped — see the file header.
      const p = distance > 0 ? -rect.top / distance : 0;

      // hasHeroRunTriggeredManualScroll() short-circuits the same way
      // PAST_HERO does: once the shared one-shot budget is spent (by this
      // cue's own click, or by the hook's wheel-triggered run), the backward
      // run is gone for the rest of the visit and the cue advertising it
      // would be wrong to show.
      const t =
        hasHeroRunTriggeredManualScroll() || p > PAST_HERO
          ? 0
          : Math.min(
              1,
              Math.max(0, (p - REVEAL_FROM) / (FULL_AT - REVEAL_FROM)),
            );
      const shown = t * t * (3 - 2 * t); // smoothstep: no hard edge at either end

      wrap.style.opacity = String(shown);
      wrap.style.transform = `translate3d(0, ${(1 - shown) * RISE}px, 0)`;

      // A transparent button left clickable and tabbable is an invisible
      // control sitting over the page. Threshold a hair above 0 so a barely
      // opaque button is not hittable either.
      const button = buttonRef.current;
      if (button) {
        const gone = shown < 0.05;
        button.style.pointerEvents = gone ? "none" : "auto";
        button.toggleAttribute("inert", gone);
      }
    };

    const onScrollOrResize = () => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(apply);
    };

    apply(); // a restored scroll position must not flash the cue in
    window.addEventListener("scroll", onScrollOrResize, { passive: true });
    window.addEventListener("resize", onScrollOrResize, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScrollOrResize);
      window.removeEventListener("resize", onScrollOrResize);
    };
  }, [sectionRef, isStatic]);

  /**
   * An explicit, deliberate click gets an ordinary interruptible scroll —
   * no lock, so the user can scroll away mid-replay without a cancel gesture.
   */
  const replay = () => {
    const section = sectionRef.current;
    if (!section) return;

    // Spends the shared one-shot budget (2026-09-10, on request): this is
    // the OTHER door to the backward run, and leaving it un-gated would let
    // a click land back at frame 1 with the forward auto-scroll still able
    // to re-arm there.
    markHeroRunTriggeredManualScroll();

    const top = window.scrollY + section.getBoundingClientRect().top;

    // Null under reduced motion, where Lenis is never booted. That mode is
    // static anyway so this is unreachable in practice, but a 480vh jump is a
    // bad enough failure to be worth the branch.
    const lenis = getLenis();
    if (lenis) {
      lenis.scrollTo(top, { duration: HERO_RUN_S, easing: heroRunEase });
    } else {
      window.scrollTo({ top, behavior: "smooth" });
    }
  };

  return (
    <div
      ref={wrapRef}
      style={{ opacity: 0 }}
      className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center pb-6 sm:pb-8"
    >
      <button
        ref={buttonRef}
        type="button"
        onClick={replay}
        inert
        style={{ pointerEvents: "none" }}
        aria-label="Replay the hero sequence from the beginning"
        className="group flex flex-col items-center gap-1.5 rounded-sm px-3 py-1 focus-visible:ring-2 focus-visible:ring-tnt-amber focus-visible:outline-none"
      >
        <Icon
          name="chevron-up"
          strokeWidth={2}
          className="tnt-scroll-cue__chevron h-5 w-5 text-tnt-amber drop-shadow-[0_2px_6px_rgba(0,0,0,0.55)]"
        />
        {/* Same mono micro-label as the contact block's "24/7 Dispatch" — size,
            tracking and uppercase all match, so the hero opens and closes in
            one voice. The text-shadow is the h1's, because this sits on bright
            cloud and the footage cannot be relied on for contrast. */}
        <span className="font-mono text-[11px] tracking-[0.14em] text-white/75 uppercase transition-colors group-hover:text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.5),0_8px_40px_rgba(0,0,0,0.55)]">
          Scroll Up
        </span>
      </button>
    </div>
  );
}
