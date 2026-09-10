"use client";

/**
 * HERO HEADLINE — the opening statement over the scrub sequence.
 *
 * Placement is dictated by the footage (frames-v2), not by taste:
 *  - The top half is bright sky and the yellow jib for most of the sequence, so
 *    top-anchored white type has almost no contrast to work with. (The loader
 *    already owns the top-left anyway.)
 *  - Dead centre is reserved: the branded jib plate crosses it around frame 100
 *    and the closing logo lands there at frame 289. Copy there fights the film.
 *  - Bottom-left is the only region that is dark or mid-tone in the opening
 *    frames, and it shares the loader's `max-w-5xl` measure so the two blocks
 *    hang off the same left edge.
 *
 * Legibility is not left to the footage: the block carries its own bottom-left
 * corner scrim. The scrim lives INSIDE the fading wrapper, so once the line
 * clears, the frame is exactly as un-graded as it was before — the hero itself
 * is not restyled.
 *
 * The line is an opening beat, not a permanent overlay: it holds through the
 * first fraction of the pin and clears before the crane's branded plate reaches
 * centre. Nothing static could stay readable across 290 frames that run from a
 * dark skyline to white cloud, and covering the logo reveal to try would cost
 * more than the copy is worth.
 *
 * 2026-08-07: a contact block (24/7 dispatch number + "Get a Quote") was added
 * to the right of the h1 on the same baseline, on feedback that the opening
 * screen carried no way to act. Removed again 2026-09-10, on request — the
 * scrim's second, weaker bottom-right layer went with it (it existed only to
 * hold that block's contrast; the frame's CENTRE reservation above is
 * unrelated and unchanged), and the h1 dropped back to a single-column block
 * now that there is nothing to sit beside on the baseline.
 */

import { useEffect, useRef, type RefObject } from "react";

/** Scroll progress (0–1 through the pinned section) where the line is at full
 *  strength, and where it has fully cleared. 0.26 ≈ frame 75 — comfortably
 *  before the branded jib plate crosses centre around frame 100. */
const HOLD_UNTIL = 0.08;
const CLEARED_BY = 0.26;

/** How far the block drifts up as it goes, in px. Small on purpose: the camera
 *  is already moving, so the copy only needs to let go, not travel. */
const DRIFT = 24;

export default function HeroHeadline({
  sectionRef,
  isStatic,
}: {
  /** The pinned <section>; the same element the frame surface measures. */
  sectionRef: RefObject<HTMLElement | null>;
  /** Poster / reduced / pending — no scrub to ride, so the line simply holds. */
  isStatic: boolean;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;

    // Static modes: clear anything a previous scrub run wrote and hold at full
    // strength. (Reduced motion lands here, so it never sees the drift.)
    if (isStatic) {
      wrap.style.opacity = "";
      wrap.style.transform = "";
      return;
    }

    const section = sectionRef.current;
    if (!section) return;

    let queued = false;

    const apply = () => {
      queued = false;
      // Identical progress math to HeroFrameGL: the sticky child is 100vh, so
      // the parent's extra height is the scrub distance.
      const distance = section.offsetHeight - window.innerHeight;
      const rect = section.getBoundingClientRect();
      const p =
        distance > 0 ? Math.min(1, Math.max(0, -rect.top / distance)) : 0;

      const t = Math.min(
        1,
        Math.max(0, (p - HOLD_UNTIL) / (CLEARED_BY - HOLD_UNTIL)),
      );
      const shown = 1 - t * t; // ease-out: holds, then leaves decisively

      wrap.style.opacity = String(shown);
      wrap.style.transform = `translate3d(0, ${(shown - 1) * DRIFT}px, 0)`;
    };

    const onScrollOrResize = () => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(apply);
    };

    apply(); // deep-link / restored scroll position must not flash the line in
    window.addEventListener("scroll", onScrollOrResize, { passive: true });
    window.addEventListener("resize", onScrollOrResize, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScrollOrResize);
      window.removeEventListener("resize", onScrollOrResize);
    };
  }, [sectionRef, isStatic]);

  return (
    <div
      ref={wrapRef}
      className="pointer-events-none absolute inset-0 flex items-end"
    >
      {/* Scrim — carries the contrast so the type never depends on what the
          frame happens to be doing. Single bottom-left radial: the h1 is the
          only thing it has to hold since the contact block (and its second,
          weaker bottom-right layer) was removed 2026-09-10. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(120%_90%_at_0%_100%,rgba(0,0,0,0.85)_0%,rgba(0,0,0,0.45)_38%,transparent_72%)]"
      />

      <div className="relative mx-auto flex w-full max-w-5xl flex-col px-6 pb-16 sm:px-8 sm:pb-24">
        {/* Written in title case and capitalised in CSS — screen readers spell
            out literal all-caps strings. Breaks are explicit at every width
            rather than left to wrapping: the mark gets its own line, then the
            claim in two. Tight leading is what binds the three lines into one
            block instead of three sentences. */}
        <h1 className="font-display text-[clamp(2.25rem,6.2vw,5.5rem)] leading-[0.92] tracking-tight text-white uppercase [text-shadow:0_1px_2px_rgba(0,0,0,0.4),0_8px_40px_rgba(0,0,0,0.55)]">
          {/* Gold bookends, in the hero's own yellow — the same one the jib and
              the loader bar carry. The mark opens the block and the full stop
              closes it; everything between stays white, so the colour frames
              the claim instead of competing with it. */}
          <span className="block text-brand-gold">TNT </span>
          <span className="block">Power Behind </span>
          <span className="block">
            Every Project<span className="text-brand-gold">.</span>
          </span>
        </h1>
      </div>
    </div>
  );
}
