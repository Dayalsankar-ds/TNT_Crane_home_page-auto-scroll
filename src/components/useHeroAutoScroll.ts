"use client";

/**
 * HERO AUTO-SCROLL — one wheel gesture plays the whole hero, either way.
 *
 * Added 2026-08-07 on feedback that the hero should run itself: the first
 * downward wheel at the opening frame hands the scroll over to a timed
 * animation that carries the page to the last frame and stops there. The
 * mirror was added the same day — an upward wheel at the last frame plays the
 * sequence back to frame 1 and stops.
 *
 * This is scroll hijacking, which is worth being deliberate about — the whole
 * complaint against it is that it takes control away and doesn't give it back.
 * So:
 *
 *  - It arms only at the two ENDS of the pin, and only for the direction that
 *    leads away from that end. Mid-sequence it is inert, so it can never fight
 *    a scroll already in progress.
 *  - A deliberate wheel the OTHER way during a run cancels it instantly, as
 *    does Escape. The run holds the scroll (`lock: true`) precisely so the
 *    trailing events of the triggering gesture can't abort it a frame later —
 *    which makes an explicit way out mandatory, not a nicety.
 *  - A cancel leaves you mid-sequence with nothing armed. Reaching an end is
 *    the only thing that re-arms, so "stop" means stop.
 *  - It only ever runs in `scrub` mode with the sequence fully preloaded.
 *    Reduced-motion and poster/mobile have no pin to traverse, and running
 *    before the frames are decoded would scroll 500vh past a frozen frame 1.
 *
 * Wheel only, on purpose. Keyboard scrolling stays literal: teleporting a
 * keyboard user four viewports on a single ArrowDown is a worse trade than
 * making them hold the key, and the effect is designed around a wheel/trackpad
 * flick anyway.
 *
 * DOWN RUN, SECOND LEG (added 2026-08-14): reaching the last frame no longer
 * just stops the scroll — it holds there (HeroFrameGL already clamps its own
 * progress to 1, so nothing extra is needed to freeze the frame) and the SAME
 * locked scroll continues on as an ordinary page-scroll transition, landing
 * with the Family strip (#family) pinned just under the nav bar — the same
 * line SiteNav uses to reveal itself (see SiteNav.tsx), so the strip and the
 * bar arrive together. This is a second `lenis.scrollTo` chained from the
 * first's `onComplete`, not one long tween across both distances — stretching
 * a single tween over the added distance would have sped up the hero's own
 * frame playback to fit inside the same HERO_RUN_S. The UP run (last frame
 * back to first) is untouched by any of this.
 *
 * ONE-SHOT PER VISIT (2026-09-03, on request): both ends used to re-arm
 * every time scroll position returned to them, so scrolling back to the top
 * and back down again replayed the whole hijack, and the UP run let anyone
 * at the last frame replay it backward on demand — indefinitely, either one,
 * as many times as the position revisited an end. On request, the mechanism
 * now fires at most ONCE per visit, whichever direction gets there first
 * (in practice always DOWN, landing at the opening frame): `hasTriggeredOnce`
 * flips the moment a run starts (not waits for completion — an interrupted
 * run has already used its one shot, the same call this file makes about
 * hijacking being worth being deliberate over) and `armFor` refuses to arm
 * either direction ever again after that. This permanently retires the UP
 * run in the overwhelming majority of visits, since DOWN almost always fires
 * first — that's the intended effect, not a side effect: "disable the scroll
 * back/repeat functionality" was the explicit ask. `hasTriggeredOnce` is a
 * module-level flag, same convention as navVersionStore.ts/
 * aboutVersionStore.ts — it survives client-side navigation away from and
 * back to the homepage (still "the same visit") and only resets on an actual
 * page reload.
 *
 * HeroScrollCue's "Scroll Up" button is a SECOND, independent way to replay
 * the sequence — it deliberately bypasses this hook's wheel handling (see
 * that file's docblock), so this hook has no visibility into a click there
 * on its own. hasHeroRunTriggered()/markHeroRunTriggered() are exported
 * specifically so that component can read and spend the same one-shot
 * budget: the cue hides itself once the budget is spent, and a click
 * spends it too, so a manual replay can't leave the forward run able to
 * re-arm. One budget, two doors.
 */

import { useEffect, type RefObject } from "react";
import { getLenis } from "@/components/SmoothScroll";
import { CHROME_H } from "@/components/site/chrome";

/** Seconds for a full run, either direction. Long enough to read as a camera
 *  move rather than a jump cut, short enough that nobody feels held.
 *
 *  Exported because HeroScrollCue's button runs the same journey from a click.
 *  It is the same move to the viewer, so it must not be a second, differently
 *  timed animation that happens to go the same way. */
export const HERO_RUN_S = 2.8;

/** Seconds for the second leg of the DOWN run — the page-scroll continuation
 *  from the held last frame on to the Family strip. Deliberately shorter than
 *  HERO_RUN_S: this is a plain page transition covering a much shorter
 *  distance, not a frame sequence to read. */
const FAMILY_REVEAL_S = 1;

/** How close to an end counts as "at" it. Not zero — a restored scroll
 *  position or a settling lerp can leave you a pixel or two off, and that
 *  shouldn't disqualify the frame you are plainly looking at. */
const ARM_MARGIN = 0.02;

/** Wheel delta against the run that counts as "let me out" rather than gesture
 *  noise. Inertial trackpads emit small opposite-sign deltas as a flick decays,
 *  so this has to clear that floor or a run would cancel itself. */
const CANCEL_DELTA = 12;

/** Wheel delta AT an end that counts as "take over" rather than a deliberate
 *  slow scrub. Without this floor, the first micro-delta of any scrub attempt
 *  right at an end — trackpad or notched wheel alike — launched the full run,
 *  leaving no way to manually scrub in from either boundary. Same order of
 *  magnitude as CANCEL_DELTA: both exist to separate "gesture noise" from "an
 *  intentional flick," just on opposite sides of a run. */
const TRIGGER_DELTA = 12;

/** How far past the nav's reveal line (CHROME_H) the DOWN run's second leg
 *  lands #family's top, in px. Landing exactly ON the threshold leaves the
 *  nav's visibility hinging on a single pixel — any rounding/clamp/settling
 *  drift between this scrollTo's target and SiteNav's own rAF-polled read can
 *  land on the wrong side of it. The margin makes "nav visible on arrival"
 *  unconditional instead of a coin flip. */
const NAV_REVEAL_MARGIN = 24;

/** Gentle at both ends: eases in so the takeover doesn't snap out from under
 *  the triggering flick, and eases out so it settles onto the target frame
 *  instead of slamming into it. */
export const heroRunEase = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

type Dir = "down" | "up";

/** Whether the one-shot hijack has already fired this visit — see the
 *  ONE-SHOT PER VISIT note above. Module-level so it survives remounts from
 *  client-side navigation, not just this hook's own lifetime. */
let hasTriggeredOnce = false;

/** Read-only check for other components that need to respect the same
 *  one-shot budget — currently HeroScrollCue, whose "Scroll Up" replay
 *  button is a second, independent way back to frame 1 that this hook has
 *  no visibility into on its own (see markHeroRunTriggered below). */
export function hasHeroRunTriggered() {
  return hasTriggeredOnce;
}

/** Spends the one-shot from OUTSIDE this hook's own wheel handling.
 *  HeroScrollCue's click-to-replay deliberately bypasses this hook (it's an
 *  ordinary interruptible scroll, not the locked hijack — see that file's
 *  docblock), so nothing here would otherwise know a replay happened. Call
 *  this wherever an alternate path also plays the hero sequence, so the
 *  forward run can't re-arm afterward. */
export function markHeroRunTriggered() {
  hasTriggeredOnce = true;
}

export default function useHeroAutoScroll({
  sectionRef,
  enabled,
}: {
  /** The pinned <section> — the same element the frame surface measures. */
  sectionRef: RefObject<HTMLElement | null>;
  /** Scrub mode with frames decoded. Anything else and this does nothing. */
  enabled: boolean;
}) {
  useEffect(() => {
    if (!enabled) return;

    const section = sectionRef.current;
    if (!section) return;

    // Null under prefers-reduced-motion (Lenis is never booted there). No
    // fallback to window.scrollTo on purpose: someone who asked for less
    // motion should not be handed a 500vh programmatic scroll.
    const lenis = getLenis();
    if (!lenis) return;

    let armed: Dir | null = null;
    let running: Dir | null = null;
    let watchdog = 0;

    // Same math as HeroFrameGL and HeroHeadline — the sticky child is 100vh, so
    // the parent's extra height is the scrub distance — but deliberately NOT
    // clamped to 0–1.
    //
    // The clamp is what makes the backward trigger dangerous: every position
    // below the hero reports exactly 1, so a clamped reading would arm the
    // "play backwards" run while you were down at the footer, and an ordinary
    // wheel-up there would rip you back to the top of the page. Unclamped, past
    // the hero reads >1 and before it reads <0, which is precisely the
    // information needed to tell "at the last frame" from "long gone past it".
    const distance = () => section.offsetHeight - window.innerHeight;
    const rawProgress = () => {
      const d = distance();
      if (d <= 0) return 1;
      return -section.getBoundingClientRect().top / d;
    };

    /** Which run, if any, this position should arm. Refuses to arm either
     *  direction once the one-shot has already fired this visit. */
    const armFor = (p: number): Dir | null => {
      if (hasTriggeredOnce) return null;
      if (p >= -ARM_MARGIN && p <= ARM_MARGIN) return "down"; // opening frame
      if (p >= 1 - ARM_MARGIN && p <= 1 + ARM_MARGIN) return "up"; // last frame
      return null; // mid-sequence, or nowhere near the hero
    };

    // Absolute scroll positions of the two ends. Measured at trigger time
    // rather than cached: ScrollTrigger.refresh() and late-loading images can
    // still move the section after mount.
    const startY = () => window.scrollY + section.getBoundingClientRect().top;
    const endY = () => startY() + distance();

    // Where the DOWN run's second leg lands: the scrollY that puts #family's
    // top NAV_REVEAL_MARGIN px past the nav's reveal line, measured live
    // rather than cached like startY/endY. Falls back to endY() — i.e. no
    // second leg — if the Family strip isn't on the page.
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

    const cancel = () => {
      window.clearTimeout(watchdog);
      if (!running) return;
      running = null;
      // `force` is required — the run set isLocked, and Lenis drops any
      // scrollTo made while locked unless forced. Landing on animatedScroll
      // stops exactly where the eye already is, and `reset()` inside the
      // immediate branch is what clears the lock.
      lenis.scrollTo(lenis.animatedScroll, { immediate: true, force: true });
    };

    // Ends the run (either direction): releases the lock and clears the
    // deadman switch. `running` must stay truthy — not just non-null between
    // the two DOWN legs — for the whole duration, so a wheel-against-the-run
    // during the family-reveal leg still cancels it exactly like it would
    // during the frame playback.
    const finish = () => {
      window.clearTimeout(watchdog);
      running = null;
    };

    // Second leg of a DOWN run: chained from the first leg's onComplete
    // rather than folded into one long tween, so the hero's own pacing
    // (HERO_RUN_S over the pin's `distance()`) is untouched by the extra
    // distance. `running` is left as "down" throughout — same lock, same
    // cancel-on-wheel-up behavior, just a second target.
    const continueToFamily = () => {
      window.clearTimeout(watchdog); // supersede the first leg's deadman switch
      const landing = familyLandingY();
      if (landing <= endY()) {
        // No Family strip to land on (or it's already above the fold) —
        // stop exactly where the original run always stopped.
        running = null;
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
          if (running) cancel();
        },
        FAMILY_REVEAL_S * 1000 + 1200,
      );
    };

    const run = (dir: Dir) => {
      armed = null;
      running = dir;
      // Spends the one shot now, not on completion — an interrupted run
      // still used its trigger, and a cancelled hijack is not an invitation
      // to try again. See the ONE-SHOT PER VISIT docblock note.
      hasTriggeredOnce = true;
      lenis.scrollTo(dir === "down" ? endY() : startY(), {
        duration: HERO_RUN_S,
        easing: heroRunEase,
        lock: true,
        force: true,
        // UP is unchanged — stops at the first frame. DOWN holds the last
        // frame (nothing to draw beyond clamped progress=1) and continues
        // into the page-scroll leg above.
        onComplete: dir === "down" ? continueToFamily : finish,
      });

      // DEADMAN SWITCH. `lock: true` is only ever released by the animation
      // finishing (or by cancel()), and the animation only advances on rAF —
      // which the browser suspends outright in a background tab. Observed for
      // real: a run started, the tab was backgrounded, and <html> was left with
      // `lenis-locked` and a page that could not be scrolled at all, with
      // nothing on a timer to recover it.
      //
      // visibilitychange below covers the common case immediately; this covers
      // everything else (a stalled ticker, a dropped onComplete). Background
      // timers are clamped to ~1s but they do still fire, so the lock always
      // gets released eventually.
      watchdog = window.setTimeout(
        () => {
          if (running) cancel();
        },
        HERO_RUN_S * 1000 + 1200,
      );
    };

    const onWheel = (e: WheelEvent) => {
      if (running) {
        // Only a wheel AGAINST the run is an escape. With the run's own
        // direction we'd cancel on the triggering flick's own inertia.
        const against =
          running === "down" ? e.deltaY < -CANCEL_DELTA : e.deltaY > CANCEL_DELTA;
        if (against) cancel();
        return;
      }
      if (!armed) return;
      if (Math.abs(e.deltaY) < TRIGGER_DELTA) return; // slow scrub, not a flick
      const dir: Dir = e.deltaY > 0 ? "down" : "up";
      if (dir !== armed) return; // wrong way for the end we're sitting at
      if (armFor(rawProgress()) !== armed) return; // moved since we armed
      run(dir);
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") cancel();
    };

    // Arming is recomputed per scroll rather than latched, so leaving an end
    // disarms as reliably as arriving at one arms. Cheap next to what the hero
    // is already doing every frame.
    const onScroll = () => {
      if (running) return;
      armed = armFor(rawProgress());
    };

    // The target is captured when a run starts, so a resize mid-run leaves it
    // aiming at a stale position. Bail rather than land somewhere wrong.
    const onResize = () => cancel();

    // Leaving the tab suspends rAF, which freezes the run mid-flight with the
    // scroll still locked. End it now rather than let the deadman switch find
    // it a few seconds later — this is the path that actually happens.
    const onVisibility = () => {
      if (document.hidden) cancel();
    };

    onScroll(); // arm from the position we mount at, not the first scroll

    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
      // Unmounting mid-run would otherwise leave Lenis locked with nothing
      // left to unlock it — i.e. a page that cannot be scrolled at all.
      cancel();
    };
  }, [sectionRef, enabled]);
}
