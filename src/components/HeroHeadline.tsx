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
 * on feedback that the opening screen carried no way to act. It deliberately
 * reuses SiteNav's contact rail verbatim — same `tel:` mono treatment, same
 * amber primary-on-dark Button — because the nav is HIDDEN over the hero, so
 * this is that rail reappearing where it's missing, not a second competing
 * style.
 *
 * It sits to the RIGHT of the h1, on the same baseline, per follow-up feedback
 * (it was first stacked underneath). That puts type on the right of the frame,
 * which the placement notes above had kept clear — so the scrim gained a
 * second, weaker bottom-right layer to pay for it. The frame's CENTRE is still
 * untouched; that reservation is about the branded plate and the logo reveal
 * and has not changed.
 *
 * Because it rides the same fade as the headline, the row is guarded: once the
 * block has faded out it is `inert` and `pointer-events: none`. Without that,
 * a fully transparent Get-a-Quote button stays clickable and tabbable over the
 * rest of the pin — an invisible control in the middle of the screen.
 */

import { useEffect, useRef, type RefObject } from "react";
import Button from "@/components/site/Button";
import { Icon } from "@/components/site/primitives";

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
  const actionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;

    // Static modes: clear anything a previous scrub run wrote and hold at full
    // strength. (Reduced motion lands here, so it never sees the drift.)
    if (isStatic) {
      wrap.style.opacity = "";
      wrap.style.transform = "";
      const actions = actionsRef.current;
      if (actions) {
        actions.style.removeProperty("pointer-events");
        actions.removeAttribute("inert");
      }
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

      // Once the block is visually gone, its controls must stop existing for
      // the mouse AND the keyboard — see the note at the top of this file. The
      // threshold is a hair above 0 so a button that's a few percent opaque
      // isn't clickable either.
      const actions = actionsRef.current;
      if (actions) {
        const gone = shown < 0.05;
        actions.style.pointerEvents = gone ? "none" : "auto";
        actions.toggleAttribute("inert", gone);
      }
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
          frame happens to be doing.

          Two layers since the contact block moved right (2026-08-07). The
          bottom-LEFT radial is the original and still does the heavy lifting
          for the h1. The bottom-RIGHT one is new, deliberately weaker (0.6 vs
          0.85) and tighter (falls off by 58% vs 72%): it only has to hold a
          button and two short lines, and the frame's centre — where the
          branded jib plate crosses and the logo lands — has to stay clean. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(120%_90%_at_0%_100%,rgba(0,0,0,0.85)_0%,rgba(0,0,0,0.45)_38%,transparent_72%),radial-gradient(70%_60%_at_100%_100%,rgba(0,0,0,0.6)_0%,rgba(0,0,0,0.3)_34%,transparent_58%)]"
      />

      {/* Headline left, contact block right, both sitting on the same baseline
          (`items-end`). Below `sm` there isn't width for two columns, so it
          falls back to the stacked order — headline, then the contact block
          under it. */}
      <div className="relative mx-auto flex w-full max-w-5xl flex-col px-6 pb-16 sm:flex-row sm:items-end sm:justify-between sm:gap-10 sm:px-8 sm:pb-24">
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

        {/* Contact + CTA. `pointer-events-auto` is required: the whole overlay
            is pointer-events-none so the frame surface stays scrubbable, and
            these two are the only things on it meant to be hit.

            `shrink-0` matters: without it the flex row steals width from this
            column before the h1, and the number wraps mid-string. The h1 has
            room to give (its size is a clamp on vw) — this block does not. */}
        <div
          ref={actionsRef}
          className="pointer-events-auto mt-8 flex shrink-0 flex-col items-start gap-4 sm:mt-0 sm:items-end sm:gap-5 sm:pb-2"
        >
          {/* Same number, same mono treatment as SiteNav's contact rail. The
              "24/7 Dispatch" line is the one addition — on the opening screen
              a bare number doesn't say whether anyone answers at 2am, and the
              quote section already makes that promise in words. */}
          <a
            href="tel:+18007992505"
            className="group inline-flex items-center gap-2.5 rounded-sm focus-visible:ring-2 focus-visible:ring-tnt-amber focus-visible:outline-none"
          >
            <Icon
              name="headset"
              className="h-7 w-7 shrink-0 text-tnt-amber"
              strokeWidth={1.6}
            />
            <span className="flex flex-col leading-tight">
              {/* Stepped up from the nav's 16px (2026-08-07): this is a hero,
                  not an 80px utility bar, and the number is a primary action
                  here rather than a persistent convenience. */}
              <span className="font-mono text-2xl font-semibold whitespace-nowrap text-white transition-colors group-hover:text-tnt-amber">
                1-800-799-2505
              </span>
              <span className="font-mono text-[12px] tracking-[0.14em] text-white/60 uppercase">
                24/7 Dispatch
              </span>
            </span>
          </a>

          {/* Nav's own CTA scaled up for the hero — same skin, same amber, same
              arrow-less label, just not at 80px-nav proportions.

              `text-lg!` needs the important modifier. Button hard-codes
              `text-sm` in its own class string, and a plain `text-lg` here
              loses: same specificity, and Tailwind emits `text-sm` last, so
              source order decides against us. Measured — without the `!` this
              button computes to 14px, silently ignoring the override. Full
              width below `sm`, where it's the widest thing in the stack and a
              shrink-wrapped button reads as an afterthought. */}
          <Button
            href="#quote"
            variant="primary"
            onDark
            arrow={false}
            className="w-full justify-center px-8 py-4 text-lg! sm:w-auto"
          >
            Get a Quote
          </Button>
        </div>
      </div>
    </div>
  );
}
