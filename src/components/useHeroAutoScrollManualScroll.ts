"use client";

/**
 * HERO AUTO-PLAY — MANUAL-SCROLL VARIANT. Plays itself, once, on load. No
 * manual scrubbing.
 *
 * Copied 2026-09-08 from the sibling TNT_Crane_home_page-manual-scroll
 * project as a second hero version, alongside this project's own
 * useHeroAutoScroll.ts, and kept in step with it since (one-shot-per-visit
 * 2026-09-10; this rewrite, same day). REWRITTEN from a wheel-triggered
 * hijack into an unconditional autoplay — see useHeroAutoScroll.ts's own
 * docblock for the full reasoning, mirrored here. In short:
 *
 *  - STARTS ITSELF the moment frames are ready — no wheel gesture required.
 *    `hasTriggeredOnce` guards against StrictMode's double-mount and against
 *    ever restarting later in the same visit.
 *  - CANNOT BE INTERRUPTED. No cancel-on-wheel escape: wheel/touch during the
 *    run do nothing, because Lenis's own `lock` already refuses non-forced
 *    scroll requests while a locked `scrollTo` is in flight. Keyboard is the
 *    one gap Lenis doesn't cover (native scroll keys, not wheel/touch), so
 *    `onKeyDown` preventDefaults them for the run's duration.
 *  - Recovery (backgrounded tab, stalled rAF) force-completes by jumping
 *    straight to the end, rather than freezing wherever it stalled — there
 *    is no "resume browsing from here" in this design.
 *
 * Kept as fully separate module-level state from useHeroAutoScroll.ts's own
 * (`hasTriggeredOnce`, `heroPassed` below) — the two hero versions are still
 * meant to run side-by-side without one arming or disarming the other.
 *
 * DOWN RUN, SECOND LEG (unchanged mechanism, carried over): reaching the
 * last frame holds there (HeroFrameGL clamps progress to 1) and the SAME
 * locked scroll continues on as an ordinary page-scroll transition, landing
 * with the Family strip (#family) pinned just under the nav bar. Chained
 * from the first leg's `onComplete`, not one long tween, so the extra
 * distance doesn't speed up the hero's own frame pacing.
 *
 * HERO BECOMES UNREACHABLE ONCE PASSED: `heroPassed` flips once scroll
 * position clears the pin's bottom edge, and `onScroll` clamps any position
 * that would move back above a floor for the rest of the visit — see
 * useHeroAutoScroll.ts's own docblock for the full rationale (identical
 * here, just against this file's own module state).
 *
 * THE FLOOR IS FAMILY, NOT THE HERO'S LAST FRAME (2026-09-11, on request):
 * that floor — and `forceComplete()`'s recovery jump — is `familyLandingY()`,
 * not `endY()`. Landing or clamping back to the hero's own bottom edge would
 * leave someone resting on its held last frame, which is exactly the state
 * this feature exists to make sure nobody settles on. Falls back to `endY()`
 * only when there truly is no Family strip to land on.
 *
 * STALL WATCH REPLACES A document.hidden CHECK (2026-09-11, same day): the
 * recovery that used to fire off `visibilitychange` turned out to be the
 * real cause behind "can't see the last frame" — see useHeroAutoScroll.ts's
 * own note for the full story. `document.hidden` is an INFERRED signal, and
 * it isn't trustworthy everywhere. This checks the thing that actually
 * matters directly: is scroll position still moving? If not, for
 * STALL_TICKS_LIMIT consecutive checks, the run is genuinely stuck —
 * regardless of why — and recovers the same way the deadman switch does.
 */

import { useEffect, type RefObject } from "react";
import { getLenis } from "@/components/SmoothScroll";
import { CHROME_H } from "@/components/site/chrome";

/** Drives the autoplay duration (frameCount / FPS) — NOT the footage's real
 *  frame rate (assumed 24fps; not stated in heroSequenceManualScroll.ts,
 *  unlike V5's documented 24fps). Bumped from 24 to 32 on 2026-09-11 as a
 *  pragmatic (and, it turned out, insufficient) mitigation for playback
 *  getting interrupted before finishing. Reverted back to 24 the same day
 *  once the actual mechanism was fixed instead — see useHeroAutoScroll.ts's
 *  matching note on `run()` and `forceLenisLock`: a stall can no longer skip
 *  footage regardless of FPS, so there's no reason left to run faster than
 *  the footage's own pace. */
const FPS = 24;

/** Seconds for the second leg — the page-scroll continuation from the held
 *  last frame on to the Family strip. Deliberately short: a plain page
 *  transition covering a much shorter distance, not footage to watch. */
const FAMILY_REVEAL_S = 1;

/** Seconds the last frame holds, fully on screen, before the second leg
 *  starts. Raised from 0.6 to 1.2 on 2026-09-11 (on repeated request: "I
 *  can't see the last frame") — see useHeroAutoScroll.ts's matching note.
 *  0.6s reads as barely there once actually watched for, and the real bugs
 *  behind the ending appearing to vanish entirely are now fixed on their
 *  own; this bump is purely about making the beat at the end register.
 *  Without a hold at all, the second leg would chain straight off the first
 *  leg's onComplete, so the pin would start scrolling away in the same tick
 *  it reached the last frame — visually indistinguishable from never
 *  reaching it. */
const END_HOLD_S = 1.2;

/** How often the stall watch samples scroll position, in ms. */
const STALL_CHECK_MS = 1000;

/** Consecutive stall-check ticks with (effectively) no scroll movement
 *  before the run is treated as genuinely stuck. 3 ticks at STALL_CHECK_MS
 *  is comfortably longer than END_HOLD_S's deliberate, on-purpose pause. */
const STALL_TICKS_LIMIT = 3;

/** How close to the bottom edge counts as "past" the pin, for the
 *  becomes-unreachable wall below. */
const ARM_MARGIN = 0.02;

/** How far past the nav's reveal line (CHROME_H) the second leg lands
 *  #family's top, in px — see useHeroAutoScroll.ts's own note. */
const NAV_REVEAL_MARGIN = 24;

/** Gentle at both ends: eases in so playback doesn't snap on at frame 1, and
 *  eases out so it settles onto the last frame instead of slamming into it. */
const heroRunEase = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

/** Ceiling on how much (virtual, eased-animation) time a single tick of the
 *  frame-playback leg's own rAF loop is allowed to credit, in ms — see the
 *  CAPPED, SELF-DRIVEN PLAYBACK note on `run()` below. */
const MAX_STEP_MS = 50;

/** Re-locks Lenis after an `immediate: true` scrollTo — see
 *  useHeroAutoScroll.ts's matching note for the full story. That call path
 *  runs Lenis's own `reset()` internally, which unconditionally sets
 *  `isLocked = false`; the `lock: true` scrollTo option does nothing for an
 *  immediate call. Without re-asserting the lock every tick, real wheel/
 *  touch input during the run went straight through to Lenis's own
 *  handling and queued a competing animated scrollTo, racing this loop for
 *  the target position — exactly what a "the ending got skipped" report
 *  from an impatient scroll during load looks like. `isLocked`'s setter is
 *  marked `private` in Lenis's own .d.ts (TS-only — it's a plain runtime
 *  accessor), hence the cast. */
const forceLenisLock = (lenis: NonNullable<ReturnType<typeof getLenis>>) => {
  (lenis as unknown as { isLocked: boolean }).isLocked = true;
};

/** Whether this hero version's autoplay has already run this visit.
 *  Module-level so it survives remounts from client-side navigation and
 *  guards StrictMode's double mount — only a page reload resets it. A
 *  separate flag from useHeroAutoScroll.ts's own, on purpose (see docblock). */
let hasTriggeredOnce = false;

/** Whether scroll position has ever been observed past the hero's bottom
 *  edge this visit. A separate module-level flag, same reason as
 *  `hasTriggeredOnce` above. */
let heroPassed = false;

/** Native keys that move scroll position on their own, independent of
 *  Lenis's wheel/touch virtualization. */
const SCROLL_KEYS = new Set([
  " ",
  "Spacebar",
  "PageUp",
  "PageDown",
  "Home",
  "End",
  "ArrowUp",
  "ArrowDown",
]);

export default function useHeroAutoScrollManualScroll({
  sectionRef,
  frameCount,
  enabled,
}: {
  /** The pinned <section> — the same element the frame surface measures. */
  sectionRef: RefObject<HTMLElement | null>;
  /** Frames in the active sequence — sets how long the autoplay takes. */
  frameCount: number;
  /** Scrub mode with frames decoded. Anything else and this does nothing. */
  enabled: boolean;
}) {
  useEffect(() => {
    if (!enabled) return;
    if (hasTriggeredOnce) return;

    const section = sectionRef.current;
    if (!section) return;

    // Null under prefers-reduced-motion (Lenis is never booted there).
    const lenis = getLenis();
    if (!lenis) return;

    const HERO_RUN_S = frameCount / FPS;

    let running = false;
    let watchdog = 0;
    let holdTimer = 0;
    let stallWatch = 0;
    let lastStallY = 0;
    let stallTicks = 0;
    let playRaf = 0;

    // Same math as HeroFrameGL and HeroHeadline — the sticky child is 100vh,
    // so the parent's extra height is the scrub distance — but deliberately
    // NOT clamped to 0–1, so "long past the hero" is distinguishable from
    // "sitting at the last frame".
    const distance = () => section.offsetHeight - window.innerHeight;
    const rawProgress = () => {
      const d = distance();
      if (d <= 0) return 1;
      return -section.getBoundingClientRect().top / d;
    };

    // Absolute scroll positions of the two ends. Measured at trigger time
    // rather than cached: late-loading images can still move the section
    // after mount.
    const startY = () => window.scrollY + section.getBoundingClientRect().top;
    const endY = () => startY() + distance();

    // Where the second leg lands: the scrollY that puts #family's top
    // NAV_REVEAL_MARGIN px past the nav's reveal line. Falls back to endY()
    // — i.e. no second leg — if the Family strip isn't on the page.
    const familyLandingY = () => {
      const family = document.getElementById("family");
      if (!family) return endY();
      return (
        window.scrollY +
        family.getBoundingClientRect().top -
        CHROME_H +
        NAV_REVEAL_MARGIN
      );
    };

    const finish = () => {
      window.clearTimeout(watchdog);
      cancelAnimationFrame(playRaf);
      stopStallWatch();
      running = false;
    };

    // STALL WATCH — see this file's own docblock and useHeroAutoScroll.ts's
    // matching note for the full story. Checks the thing that actually
    // matters directly (is scroll position still moving?) instead of
    // inferring it from document.hidden.
    const startStallWatch = () => {
      lastStallY = window.scrollY;
      stallTicks = 0;
      stallWatch = window.setInterval(() => {
        if (!running) return;
        const y = window.scrollY;
        if (Math.abs(y - lastStallY) < 1) {
          stallTicks += 1;
          if (stallTicks >= STALL_TICKS_LIMIT) forceComplete();
        } else {
          stallTicks = 0;
        }
        lastStallY = y;
      }, STALL_CHECK_MS);
    };
    const stopStallWatch = () => {
      window.clearInterval(stallWatch);
    };

    // Fires when the first leg's tween completes — holds on the last frame
    // for END_HOLD_S before starting the second leg. `running` is still
    // checked: a backgrounded tab can race forceComplete() in between the
    // tween completing and this timer firing, and that recovery path
    // already finished the job.
    const onFrameSequenceComplete = () => {
      if (!running) return;
      holdTimer = window.setTimeout(continueToFamily, END_HOLD_S * 1000);
    };

    // Second leg: chained from the hold above (was the first leg's
    // onComplete directly, before END_HOLD_S existed) rather than folded
    // into one long tween, so the hero's own pacing (HERO_RUN_S over the
    // pin's `distance()`) is untouched by the extra distance.
    const continueToFamily = () => {
      if (!running) return; // forceComplete() beat the hold timer to it
      window.clearTimeout(watchdog); // supersede the first leg's deadman switch
      const landing = familyLandingY();
      if (landing <= endY()) {
        running = false;
        return;
      }
      lenis.scrollTo(landing, {
        duration: FAMILY_REVEAL_S,
        easing: heroRunEase,
        lock: true,
        force: true,
        onComplete: finish,
      });
      watchdog = window.setTimeout(
        () => {
          if (running) forceComplete();
        },
        FAMILY_REVEAL_S * 1000 + 1200,
      );
    };

    // RECOVERY, not an escape hatch — see useHeroAutoScroll.ts's own note.
    // Targets familyLandingY(), not endY(): see THE FLOOR IS FAMILY above.
    const forceComplete = () => {
      window.clearTimeout(watchdog);
      window.clearTimeout(holdTimer); // don't let a pending hold fire after this
      cancelAnimationFrame(playRaf);
      stopStallWatch();
      if (!running) return;
      heroPassed = true;
      const landing = familyLandingY();
      lenis.scrollTo(landing > endY() ? landing : endY(), {
        immediate: true,
        force: true,
      });
      running = false;
    };

    // CAPPED, SELF-DRIVEN PLAYBACK (2026-09-11, replacing a
    // `lenis.scrollTo(endY(), { duration: HERO_RUN_S, easing: heroRunEase })`
    // tween here — see useHeroAutoScroll.ts's own matching note for the full
    // root-cause story). That tween's progress was computed from real
    // elapsed wall-clock time on every `gsap.ticker` tick, and SmoothScroll's
    // site-wide `gsap.ticker.lagSmoothing(0)` means any real stall during the
    // run (main-thread jank decoding this leg's own ~200+ frame images, a
    // dropped tick) made the tween's next tick see a large delta-time and
    // snap straight to progress 1 — skipping the last frames rather than
    // playing through them. Confirmed reproducible in a fresh tab and in
    // real Safari.
    //
    // This loop keeps its own elapsed-time accumulator, advanced each of its
    // OWN rAF ticks by `min(realDelta, MAX_STEP_MS)` — decoupled from GSAP's
    // shared, lag-smoothing-disabled clock — so a stall of any length can
    // only ever credit MAX_STEP_MS of playback progress for the tick right
    // after it. A slow tab plays back slower, on purpose; it can no longer
    // skip footage. Every tick sets Lenis's position with `immediate: true`,
    // computed purely from this loop's own accumulator, so a stray wheel/
    // touch nudge between two ticks is simply overwritten by the next one —
    // the same inertness the old duration-tween's `lock` gave for free.
    const run = () => {
      running = true;
      hasTriggeredOnce = true;
      // Set here, not left for onScroll to notice later, so a run that gets
      // force-completed mid-flight still seals the boundary behind it.
      heroPassed = true;
      startStallWatch();

      const from = startY();
      const to = endY();
      const durationMs = HERO_RUN_S * 1000;
      let elapsedMs = 0;
      let lastTick = performance.now();

      const tick = (now: number) => {
        if (!running) return;
        const rawDelta = now - lastTick;
        lastTick = now;
        elapsedMs += Math.min(rawDelta, MAX_STEP_MS);

        const t = Math.min(elapsedMs / durationMs, 1);
        const y = from + (to - from) * heroRunEase(t);
        lenis.scrollTo(y, { immediate: true, force: true });
        forceLenisLock(lenis);

        if (t >= 1) {
          onFrameSequenceComplete();
          return;
        }
        playRaf = requestAnimationFrame(tick);
      };
      playRaf = requestAnimationFrame(tick);

      // DEADMAN SWITCH — see useHeroAutoScroll.ts's own note for why this
      // exists (observed for real: a backgrounded tab left the page
      // permanently unscrollable with nothing to recover it). The stall
      // watch above covers the common case well before this fires; this is
      // the outer, unconditional fallback.
      watchdog = window.setTimeout(
        () => {
          if (running) forceComplete();
        },
        HERO_RUN_S * 1000 + 1200,
      );
    };

    // Blocks native keyboard scrolling for the run's duration — the one
    // input class Lenis doesn't virtualize on its own. No wheel/touch
    // listener is needed here at all: Lenis's own `lock` already refuses to
    // act on them while a locked scrollTo is in flight.
    const onKeyDown = (e: KeyboardEvent) => {
      if (running && SCROLL_KEYS.has(e.key)) e.preventDefault();
    };

    // Position-tracking only — no arming, since nothing needs a gesture to
    // start it anymore. Still runs every scroll tick to catch and seal the
    // wall below.
    const onScroll = () => {
      if (running) return;

      if (!heroPassed && rawProgress() > 1 + ARM_MARGIN) heroPassed = true;

      // THE WALL — see useHeroAutoScroll.ts's own note. Floor is
      // familyLandingY(), not endY(): see THE FLOOR IS FAMILY above.
      // Immediate, not animated: an eased correction would still show the
      // hero for a moment mid-tween, the one thing this exists to prevent.
      if (heroPassed) {
        const landing = familyLandingY();
        const boundary = landing > endY() ? landing : endY();
        if (window.scrollY < boundary - 1) {
          lenis.scrollTo(boundary, { immediate: true, force: true });
        }
      }
    };

    // The visibilitychange-based recovery that used to live here was
    // REMOVED 2026-09-11 — see this file's docblock and
    // useHeroAutoScroll.ts's matching note for why. The stall watch above
    // covers the "tab got backgrounded" case directly, without trusting an
    // API that can misreport.

    window.addEventListener("keydown", onKeyDown, { passive: false });
    window.addEventListener("scroll", onScroll, { passive: true });

    // The autoplay itself — no gesture, no delay.
    run();

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("scroll", onScroll);
      // Unmounting mid-run would otherwise leave Lenis locked with nothing
      // left to unlock it — i.e. a page that cannot be scrolled at all.
      window.clearTimeout(holdTimer);
      window.clearInterval(stallWatch);
      cancelAnimationFrame(playRaf);
      if (running) {
        window.clearTimeout(watchdog);
        lenis.scrollTo(lenis.animatedScroll, { immediate: true, force: true });
      }
    };
  }, [sectionRef, frameCount, enabled]);
}
