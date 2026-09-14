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
 * to completion now. Only a reload clears it, same as `hasTriggeredOnce`.
 * One accepted consequence: SiteNav's "Home" link targets `#top`, inside
 * the now-sealed pin, so it is a no-op once the hero has been passed.
 *
 * THE FLOOR IS FAMILY, NOT THE HERO'S LAST FRAME (2026-09-11, on request):
 * the wall above used to clamp back to `endY()` — the hero's own bottom
 * edge, i.e. its held last frame — which meant a scroll-back attempt (or a
 * recovered/force-completed run) could still leave someone resting on
 * exactly the frame this whole feature exists to get past. Both the wall
 * and `forceComplete()`'s recovery jump now target `familyLandingY()`
 * instead (falling back to `endY()` only when there truly is no Family
 * strip to land on): once the hero has been seen, the ONLY place scroll
 * position is ever allowed to settle is on or past Family — with the nav
 * bar visible, since `familyLandingY()` is defined relative to CHROME_H
 * for exactly that reason — never back at the hero itself, held frame or
 * not.
 *
 * DURATION matches the footage's own pace rather than a quick hijack snap:
 * HERO_RUN_S is derived from the trimmed frame count at 24fps (see
 * heroSequence.ts), so the autoplay reads as watching the actual clip, not a
 * sped-up preview of it.
 */

import { useEffect, type RefObject } from "react";
import { getLenis } from "@/components/SmoothScroll";
import { CHROME_H } from "@/components/site/chrome";

/** Drives the autoplay duration (frameCount / FPS) — NOT the footage's real
 *  frame rate (24fps, see heroSequence.ts). Bumped from 24 to 32 on
 *  2026-09-11 as a pragmatic (and, it turned out, insufficient) mitigation
 *  for playback getting interrupted before finishing — a shorter run was a
 *  smaller window for whatever interrupted it to land mid-flight. Reverted
 *  back to 24 the same day once the actual mechanism was fixed instead (see
 *  the CAPPED, SELF-DRIVEN PLAYBACK note on `run()` below, and
 *  `forceLenisLock`): a stall can no longer skip footage regardless of FPS,
 *  so there's no reason left to run the footage faster than its own pace. */
const FPS = 24;

/** Seconds for the second leg — the page-scroll continuation from the held
 *  last frame on to the Family strip. Deliberately short: a plain page
 *  transition covering a much shorter distance, not footage to watch. */
const FAMILY_REVEAL_S = 1;

/** Seconds the last frame holds, fully on screen, before the second leg
 *  starts. Raised from 0.6 to 1.2 on 2026-09-11 (on repeated request: "I
 *  can't see the last frame") — 0.6s reads as barely there once actually
 *  watched for, and the real bugs behind the ending appearing to vanish
 *  entirely (the lagSmoothing-driven skip, and the broken lock letting a
 *  wheel nudge race the playback loop — see `run()`'s docblock and
 *  `forceLenisLock`) are now fixed on their own; this bump is purely about
 *  making the beat at the end register, not about compensating for either
 *  of those. Without a hold at all, continueToFamily() would chain straight
 *  off the first leg's onComplete, so the pin would start scrolling away in
 *  the same tick it reached the last frame — visually indistinguishable
 *  from never reaching it. */
const END_HOLD_S = 1.2;

/** How often the stall watch samples scroll position, in ms. */
const STALL_CHECK_MS = 1000;

/** Consecutive stall-check ticks with (effectively) no scroll movement
 *  before the run is treated as genuinely stuck. 3 ticks at STALL_CHECK_MS
 *  is comfortably longer than END_HOLD_S's deliberate, on-purpose pause —
 *  that pause must never itself look like a stall. */
const STALL_TICKS_LIMIT = 3;

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

/** Ceiling on how much (virtual, eased-animation) time a single tick of the
 *  frame-playback leg's own rAF loop is allowed to credit, in ms — see the
 *  CAPPED, SELF-DRIVEN PLAYBACK docblock note. Deliberately much smaller
 *  than a real frame budget (16.7ms at 60fps): this is what turns "the tab
 *  just had a rough patch" into "briefly slow, then catches up at normal
 *  speed" instead of "the footage jump-cut to some other point." */
const MAX_STEP_MS = 50;

/** Re-locks Lenis after an `immediate: true` scrollTo — which is what the
 *  playback loop below uses every tick. That call path runs Lenis's own
 *  `reset()` internally, which unconditionally sets `isLocked = false` (see
 *  node_modules/lenis: `scrollTo({immediate:true})` → `this.reset()` →
 *  `this.isLocked = false`). The `lock: true` scrollTo OPTION does nothing
 *  for an immediate call — Lenis only honors it inside the animated
 *  (duration-based) path's `onStart`. That combination silently broke the
 *  "fully locked, not skippable" contract for the whole run: real wheel/
 *  touch input was going straight through to Lenis's own `onVirtualScroll`
 *  (which only blocks input when `isStopped || isLocked`), which does not
 *  fight this loop's own scrollTo cosmetically — it *queues its own*
 *  competing animated scrollTo, racing this loop for the target position.
 *  A user scrolling at all during the run could shove the target ahead of
 *  where this loop expected to be, which reads exactly like "the ending got
 *  skipped." Re-asserting the lock immediately after every tick's
 *  positioning call keeps wheel/touch inert for the run's entire duration,
 *  same as the old single duration-based tween did for free. `isLocked`'s
 *  setter is marked `private` in Lenis's own .d.ts (TS-only enforcement —
 *  it's a plain runtime accessor), hence the cast. */
const forceLenisLock = (lenis: NonNullable<ReturnType<typeof getLenis>>) => {
  (lenis as unknown as { isLocked: boolean }).isLocked = true;
};

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
    let holdTimer = 0;
    let stallWatch = 0;
    let lastStallY = 0;
    let stallTicks = 0;
    let playRaf = 0;

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
      cancelAnimationFrame(playRaf);
      stopStallWatch();
      running = false;
    };

    // STALL WATCH (2026-09-11, replacing a document.hidden/visibilitychange
    // check that turned out to be the real cause behind "can't see the last
    // frame" — see git history for that version). `document.hidden` is an
    // INFERRED signal for "is anyone watching this," and it isn't
    // trustworthy: this project's own dev/preview tooling was observed
    // reporting it `true` continuously on a tab someone was actively
    // looking at, which fired the old recovery early and cut the sequence
    // short mid-playback. This checks the thing that actually matters
    // DIRECTLY instead of inferring it: is scroll position still moving?
    // If it hasn't moved in STALL_TICKS_LIMIT consecutive checks, the run
    // is stuck — full stop, regardless of WHY (backgrounded tab, dropped
    // rAF, a hostile embedding's own quirks) — and recovers exactly like
    // the deadman switch below does. A tab that's actually just showing the
    // hero to someone always has scrollY moving during a leg, so this can't
    // false-positive the way the old signal did.
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
    // for END_HOLD_S before starting the second leg, rather than chaining
    // straight into it. `running` is still checked: a backgrounded tab can
    // race forceComplete() in between the tween completing and this timer
    // firing, and that recovery path already finished the job.
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
    // sane recovery is to jump straight past the hero, same rest position
    // the run lands on when it finishes normally (see familyLandingY() at
    // the wall below) — never the hero's own last frame. Landing mid-hero
    // here would leave the page settled on exactly the frame this feature
    // exists to make sure nobody rests on.
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
    // tween here). That tween's progress was computed by GSAP/Lenis from
    // real elapsed wall-clock time on every `gsap.ticker` tick — and
    // SmoothScroll.tsx deliberately calls `gsap.ticker.lagSmoothing(0)` site
    // -wide (so ScrollTrigger-driven sections elsewhere don't visibly
    // "catch up" after a stall). Combined, those two facts mean any real
    // stall during the run — main-thread jank from decoding this leg's own
    // ~200+ frame images, a dropped tick, anything — made the NEXT tick
    // report a large real delta-time, which the duration-based tween read as
    // "most/all of the duration has now elapsed" and snapped straight to 1.
    // That is what a "the last frame never shows" / "it jumps to the end"
    // report from a real stall looks like: not a broken recovery path, but
    // the playback tween itself skipping straight past the frames it stalled
    // on. Confirmed reproducible in a fresh tab and in real Safari.
    //
    // The fix is to stop reading GSAP's shared, lag-smoothing-disabled
    // clock for this leg's OWN pacing. This loop keeps its own elapsed-time
    // accumulator and advances it by `min(realDelta, MAX_STEP_MS)` each of
    // its own rAF ticks — so a stall of any length can only ever credit
    // MAX_STEP_MS of playback progress for the tick after it, the same as a
    // string of ordinary frames would. The run genuinely takes longer (a
    // slow tab plays back slower), which is the trade this makes on purpose:
    // stalling still costs time, but it can no longer skip footage. Every
    // tick moves Lenis with `immediate: true`, which computes and applies
    // the scroll position for this instant only — nothing carries over
    // between ticks except this loop's own accumulator.
    //
    // `forceLenisLock()` after every tick's scrollTo is NOT cosmetic — see
    // its own docblock. Without it, real wheel/touch input during the run
    // goes straight through to Lenis's own handling instead of being
    // inert, and queues a competing animated scrollTo that races this loop
    // for the target position. That race is exactly what a "the ending got
    // skipped" report from an impatient scroll during load looks like.
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

      // DEADMAN SWITCH. This loop only advances on rAF — which the browser
      // suspends outright in a background tab, same as the tween it
      // replaced. Observed for real: a run started, the tab was
      // backgrounded, and <html> was left with `lenis-locked` and a page
      // that could not be scrolled at all, with nothing on a timer to
      // recover it.
      //
      // The stall watch above covers this well before this fires in the
      // common case (a background tab's scroll position stops moving
      // almost immediately); this is the outer, unconditional fallback for
      // anything that leaves `running` true past the run's own expected
      // length regardless of what scrollY was doing. Background timers are
      // clamped to ~1s but do still fire, so the lock always gets released
      // eventually.
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

      // THE WALL. Boundary is the FAMILY landing spot, not the hero's own
      // last frame (2026-09-11, on request) — the whole point is that once
      // the visit has seen the hero, its last frame is never the resting
      // state again, so the floor a scroll attempt gets clamped to has to
      // sit past it, not at its edge. Falls back to endY() only when there
      // really is no Family strip to land on (see familyLandingY()).
      //
      // Any position this tick reports above that floor is a scroll attempt
      // going back INTO the hero — wheel, touch, keyboard, or a scrollbar
      // drag alike, since this reads window.scrollY after the fact rather
      // than the gesture that produced it. Snap back immediately rather
      // than let it settle: an animated correction would still show the
      // hero for a moment mid-tween, which is the one thing this prevents.
      if (heroPassed) {
        const landing = familyLandingY();
        const boundary = landing > endY() ? landing : endY();
        if (window.scrollY < boundary - 1) {
          lenis.scrollTo(boundary, { immediate: true, force: true });
        }
      }
    };

    // The visibilitychange-based recovery that used to live here was
    // REMOVED 2026-09-11 — see the STALL WATCH note above for why
    // (document.hidden turned out to be an unreliable signal in at least
    // one real environment, and it was the actual cause behind "can't see
    // the last frame"). The stall watch covers the "tab got backgrounded"
    // case this existed for — rAF suspending means scrollY genuinely stops
    // moving, which the stall watch catches directly — without trusting an
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
