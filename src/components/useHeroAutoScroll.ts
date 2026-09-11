"use client";

/**
 * HERO AUTO-PLAY — the hero plays itself, once, on load. No manual scrubbing.
 *
 * REWRITTEN 2026-09-10, on request, from a wheel-triggered hijack into an
 * unconditional autoplay: previously this hook only took over at the ends of
 * a scroll-scrubbed pin (see git history for that version). The pin, the
 * scrub-by-scroll-position contract HeroFrameGL/HeroHeadline read, and the
 * Lenis `scrollTo` mechanics underneath are ALL UNCHANGED — what changed is
 * only how the run starts and whether anything can stop it:
 *
 *  - STARTS ITSELF the moment frames are ready (`enabled` flips true) — no
 *    wheel gesture required. `hasTriggeredOnce` guards it so React 19 dev
 *    StrictMode's mount→cleanup→remount can't fire it twice, and so it can
 *    never restart later in the same visit.
 *  - CANNOT BE INTERRUPTED. There is no cancel-on-wheel escape anymore: wheel
 *    and touch input during the run simply do nothing, because Lenis's own
 *    `lock` already refuses non-forced scroll requests while a locked
 *    `scrollTo` is in flight — that is the exact mechanism the old cancel()
 *    used to have to override with `force: true` to let someone out. Not
 *    calling that override at all is sufficient to make wheel/touch inert.
 *    Keyboard is the one gap Lenis doesn't cover on its own (it virtualizes
 *    wheel/touch, not native keyboard scrolling), so `onKeyDown` below
 *    preventDefaults the scroll-relevant keys for the run's duration.
 *  - Only two ways out exist, and neither is "let the user scroll":
 *    reaching the end (the normal path), or the deadman-switch/visibility
 *    recovery below force-completing a run that got stuck (backgrounded
 *    tab, dropped rAF) — recovery jumps straight to the end rather than
 *    freezing wherever it stalled, since there is no "resume browsing from
 *    here" concept anymore.
 *
 * DOWN RUN, SECOND LEG (unchanged mechanism, carried over): reaching the last
 * frame holds there (HeroFrameGL clamps progress to 1) and the SAME locked
 * scroll continues as an ordinary page-scroll transition onto the Family
 * strip (#family), landing it just under the nav bar — the same line SiteNav
 * uses to reveal itself, so the strip and the bar arrive together. Chained
 * from the first leg's `onComplete` rather than one long tween, so the extra
 * distance doesn't speed up the hero's own frame pacing.
 *
 * HERO BECOMES UNREACHABLE ONCE PASSED (2026-09-10, same day, earlier):
 * `heroPassed` flips once scroll position clears the pin's bottom edge —
 * always true by the time the autoplay run finishes, since it always runs
 * to completion now — and from then on `onScroll` clamps any position that
 * would move back above that edge straight back down to it, for the rest of
 * the visit. Only a reload clears it, same as `hasTriggeredOnce`. One
 * accepted consequence: SiteNav's "Home" link targets `#top`, inside the
 * now-sealed pin, so it is a no-op once the hero has been passed.
 *
 * DURATION now matches the footage's own pace rather than a quick hijack
 * snap: HERO_RUN_S is derived from the trimmed frame count at 24fps (see
 * heroSequence.ts), so the autoplay reads as watching the actual clip, not a
 * sped-up preview of it.
 */

import { useEffect, type RefObject } from "react";
import { getLenis } from "@/components/SmoothScroll";
import { CHROME_H } from "@/components/site/chrome";

/** Source footage frame rate (see heroSequence.ts) — the autoplay duration is
 *  derived from this so it plays at the clip's own pace, not an arbitrary one. */
const FPS = 24;

/** Seconds for the second leg — the page-scroll continuation from the held
 *  last frame on to the Family strip. Deliberately short: a plain page
 *  transition covering a much shorter distance, not footage to watch. */
const FAMILY_REVEAL_S = 1;

/** How close to the bottom edge counts as "past" the pin, for the
 *  becomes-unreachable wall below. Not zero — a settling lerp can leave a
 *  pixel or two of slop, which shouldn't disqualify a position that has
 *  plainly cleared the hero. */
const ARM_MARGIN = 0.02;

/** How far past the nav's reveal line (CHROME_H) the second leg lands
 *  #family's top, in px. Landing exactly ON the threshold leaves the nav's
 *  visibility hinging on a single pixel against SiteNav's own rAF-polled
 *  read; the margin makes "nav visible on arrival" unconditional. */
const NAV_REVEAL_MARGIN = 24;

/** Gentle at both ends: eases in so playback doesn't snap on at frame 1, and
 *  eases out so it settles onto the last frame instead of slamming into it. */
const heroRunEase = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

/** Whether the autoplay has already run this visit. Module-level so it
 *  survives remounts from client-side navigation (still "the same visit")
 *  and guards against StrictMode's double mount — only a page reload
 *  resets it. */
let hasTriggeredOnce = false;

/** Whether scroll position has ever been observed past the hero's bottom
 *  edge this visit — see the HERO BECOMES UNREACHABLE ONCE PASSED docblock
 *  note above. Module-level for the same reason as `hasTriggeredOnce`. */
let heroPassed = false;

/** Native keys that move scroll position on their own, independent of
 *  Lenis's wheel/touch virtualization — the one input class this hook has
 *  to block explicitly rather than relying on Lenis's lock to do it. */
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

export default function useHeroAutoScroll({
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
    // Already played this visit (or a StrictMode remount re-entering this
    // effect) — nothing left for this hook to do. The wall below is enforced
    // by onScroll regardless, so leaving early here doesn't reopen it.
    if (hasTriggeredOnce) return;

    const section = sectionRef.current;
    if (!section) return;

    // Null under prefers-reduced-motion (Lenis is never booted there). No
    // fallback to window.scrollTo on purpose: someone who asked for less
    // motion should not be handed a programmatic scroll through the pin at
    // all — reduced mode renders the static last-frame poster instead (see
    // the experience component).
    const lenis = getLenis();
    if (!lenis) return;

    const HERO_RUN_S = frameCount / FPS;

    let running = false;
    let watchdog = 0;

    // Same math as HeroFrameGL and HeroHeadline — the sticky child is 100vh,
    // so the parent's extra height is the scrub distance — but deliberately
    // NOT clamped to 0–1, so "long past the hero" is distinguishable from
    // "sitting at the last frame" for the wall below.
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
    // NAV_REVEAL_MARGIN px past the nav's reveal line, measured live rather
    // than cached. Falls back to endY() — i.e. no second leg — if the
    // Family strip isn't on the page.
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

    // Ends the run: releases the lock and clears the deadman switch.
    const finish = () => {
      window.clearTimeout(watchdog);
      running = false;
    };

    // Second leg: chained from the first leg's onComplete rather than folded
    // into one long tween, so the hero's own pacing (HERO_RUN_S over the
    // pin's `distance()`) is untouched by the extra distance.
    const continueToFamily = () => {
      window.clearTimeout(watchdog); // supersede the first leg's deadman switch
      const landing = familyLandingY();
      if (landing <= endY()) {
        // No Family strip to land on (or it's already above the fold) —
        // stop exactly where the run always stops.
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

    // RECOVERY, not an escape hatch: something (a backgrounded tab, a
    // stalled ticker, a dropped onComplete) left the run stuck mid-flight.
    // There is no "resume browsing from here" in this design — the only
    // sane recovery is to jump straight to the end and let the page unlock,
    // same as if the run had finished normally.
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

      // DEADMAN SWITCH. `lock: true` is only ever released by the animation
      // finishing (or by forceComplete()), and the animation only advances
      // on rAF — which the browser suspends outright in a background tab.
      // Observed for real: a run started, the tab was backgrounded, and
      // <html> was left with `lenis-locked` and a page that could not be
      // scrolled at all, with nothing on a timer to recover it.
      //
      // visibilitychange below covers the common case immediately; this
      // covers everything else. Background timers are clamped to ~1s but do
      // still fire, so the lock always gets released eventually.
      watchdog = window.setTimeout(
        () => {
          if (running) forceComplete();
        },
        HERO_RUN_S * 1000 + 1200,
      );
    };

    // Blocks native keyboard scrolling for the run's duration — the one
    // input class Lenis doesn't virtualize on its own (it owns wheel/touch
    // directly, which is why no wheel/touch listener is needed here at
    // all: Lenis's own `lock` already refuses to act on them while a locked
    // scrollTo is in flight, the same mechanism this file used to have to
    // override with `force: true` to let someone cancel out).
    const onKeyDown = (e: KeyboardEvent) => {
      if (running && SCROLL_KEYS.has(e.key)) e.preventDefault();
    };

    // Position-tracking only now — no arming, since nothing needs a gesture
    // to start it anymore. Still runs every scroll tick to catch and seal
    // the wall below.
    const onScroll = () => {
      if (running) return;

      // Catches "scrolled past without the run having started at all" —
      // shouldn't happen in practice now that the run starts itself
      // unconditionally, but costs nothing to keep as a backstop (e.g. the
      // run being skipped because Lenis wasn't ready yet at mount).
      if (!heroPassed && rawProgress() > 1 + ARM_MARGIN) heroPassed = true;

      // THE WALL. Once heroPassed, any position this tick reports above the
      // pin's bottom edge is a scroll attempt going back INTO the hero —
      // wheel, touch, keyboard, or a scrollbar drag alike, since this reads
      // window.scrollY after the fact rather than the gesture that produced
      // it. Snap back immediately rather than let it settle: an animated
      // correction would still show the hero for a moment mid-tween, which
      // is the one thing this exists to prevent.
      if (heroPassed) {
        const boundary = endY();
        if (window.scrollY < boundary - 1) {
          lenis.scrollTo(boundary, { immediate: true, force: true });
        }
      }
    };

    // Leaving the tab suspends rAF, which freezes the run mid-flight with
    // the scroll still locked. Recover now rather than let the deadman
    // switch find it a few seconds later — this is the path that actually
    // happens in practice.
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
