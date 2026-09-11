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
 * that would move back above it for the rest of the visit — see
 * useHeroAutoScroll.ts's own docblock for the full rationale (identical
 * here, just against this file's own module state).
 */

import { useEffect, type RefObject } from "react";
import { getLenis } from "@/components/SmoothScroll";
import { CHROME_H } from "@/components/site/chrome";

/** Source footage frame rate, assumed 24fps (not stated in
 *  heroSequenceManualScroll.ts, unlike V5's documented 24fps) — the autoplay
 *  duration derives from this so it plays at roughly the clip's own pace. */
const FPS = 24;

/** Seconds for the second leg — the page-scroll continuation from the held
 *  last frame on to the Family strip. Deliberately short: a plain page
 *  transition covering a much shorter distance, not footage to watch. */
const FAMILY_REVEAL_S = 1;

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
      running = false;
    };

    // Second leg: chained from the first leg's onComplete rather than
    // folded into one long tween, so the hero's own pacing (HERO_RUN_S over
    // the pin's `distance()`) is untouched by the extra distance.
    const continueToFamily = () => {
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
    const forceComplete = () => {
      window.clearTimeout(watchdog);
      if (!running) return;
      heroPassed = true;
      lenis.scrollTo(endY(), { immediate: true, force: true });
      running = false;
    };

    const run = () => {
      running = true;
      hasTriggeredOnce = true;
      // Set here, not left for onScroll to notice later, so a run that gets
      // force-completed mid-flight still seals the boundary behind it.
      heroPassed = true;
      lenis.scrollTo(endY(), {
        duration: HERO_RUN_S,
        easing: heroRunEase,
        lock: true,
        force: true,
        onComplete: continueToFamily,
      });

      // DEADMAN SWITCH — see useHeroAutoScroll.ts's own note for why this
      // exists (observed for real: a backgrounded tab left the page
      // permanently unscrollable with nothing to recover it).
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

      // THE WALL — see useHeroAutoScroll.ts's own note. Immediate, not
      // animated: an eased correction would still show the hero for a
      // moment mid-tween, the one thing this exists to prevent.
      if (heroPassed) {
        const boundary = endY();
        if (window.scrollY < boundary - 1) {
          lenis.scrollTo(boundary, { immediate: true, force: true });
        }
      }
    };

    // Leaving the tab suspends rAF, which freezes the run mid-flight with
    // the scroll still locked. Recover now rather than let the deadman
    // switch find it a few seconds later.
    const onVisibility = () => {
      if (document.hidden) forceComplete();
    };

    window.addEventListener("keydown", onKeyDown, { passive: false });
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);

    // The autoplay itself — no gesture, no delay.
    run();

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("visibilitychange", onVisibility);
      // Unmounting mid-run would otherwise leave Lenis locked with nothing
      // left to unlock it — i.e. a page that cannot be scrolled at all.
      if (running) {
        window.clearTimeout(watchdog);
        lenis.scrollTo(lenis.animatedScroll, { immediate: true, force: true });
      }
    };
  }, [sectionRef, frameCount, enabled]);
}
