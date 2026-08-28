"use client";

/**
 * FAMILY STRIP — slim trust band, right after the hero.
 *
 * Occupies the slot that briefly held CertificationsStrip (ISO 9001, NCCCO,
 * OSHA VPP, ISNetworld, Avetta). That badge row moved back to SafetyCulture
 * (its original home) after this strip couldn't get real, rights-cleared
 * certification logos on short notice — see SafetyCulture.tsx's docblock for
 * the full reasoning. This strip does the same job — a fast trust signal
 * right off the hero — with content TNT already owns outright, so there's no
 * rights or verification question: the real logos of the brands now unified
 * under TNT.
 *
 * Four acquired brands whose kits include a complete "A TNT Company" lockup:
 * Southway, RMS Cranes, Eagle West, and JMS. Stampede/TNT Canada and Allison
 * have no logo in the brand kit, and a logo-only strip has no text-fallback
 * slot, so they are simply not shown — this is a "some of the family" strip,
 * not the full roster.
 *
 * The full card-grid version (FamilyOfCompanies.tsx, which did carry a text
 * fallback for those two) was deleted on 2026-08-06 with the rest of the
 * non-homepage sections; it is in git history if the roster is ever needed
 * in full.
 *
 * The marks run in FULL COLOUR (2026-08-04, user decision — they were
 * grayscaled before). Each is its own brand's palette, so the row is
 * deliberately polychrome rather than tuned to the TNT gold/maroon.
 *
 * Fixed-height / auto-width per logo, not a shared box: the marks range from
 * roughly 2:1 (TNT) to 4:1 (Southway/RMS/Eagle West), so a fixed WIDTH would
 * letterbox some and crop others. Height is what stays constant.
 *
 * TNT runs taller than the rest (2026-08-18, on request): it's the Primary
 * mark now (near-square, 1200×987 — see SiteNav.tsx's docblock on the swap),
 * so matching the row's shared height would render it noticeably smaller in
 * WIDTH than the 2:1–4:1 marks beside it. `items-center` on the row keeps it
 * vertically centered against them at the taller size.
 *
 * AUTO-SCROLL ON TO ABOUT US (2026-08-20, on request; wait shortened 4s→3s
 * same day): 3s after this strip first scrolls into view, the page carries
 * itself on to the Statement/"About Us" section (#statement) — this is a
 * slim logo band nobody is meant to linger on, not a stop. Lands on the
 * section's very top so the full card grid + description fit one viewport
 * without further scrolling (see StorySlideshow.tsx's container sizing,
 * tuned for exactly this). One-shot, not a repeating tour: the observer
 * disconnects itself the moment it fires once, whether the timer completes
 * or gets cancelled, so scrolling back up to re-look at the logos later never
 * re-triggers it. Cancels instantly on the user's own wheel or touch — same
 * "never fight a scroll already happening" rule useHeroAutoScroll follows —
 * and never arms at all under prefers-reduced-motion, where getLenis() is
 * null for the whole session (no window.scrollTo fallback, same reasoning as
 * that hook: someone who asked for less motion should not get a programmatic
 * scroll anyway).
 */

import { useEffect, useRef } from "react";
import { getLenis } from "@/components/SmoothScroll";
import { heroRunEase } from "@/components/useHeroAutoScroll";

const LOGOS: { name: string; src: string; compact?: boolean }[] = [
  { name: "Southway Crane & Rigging", src: "/brand/southway-updated.png" },
  { name: "RMS Cranes", src: "/brand/rms-cranes-updated.png" },
  { name: "Eagle West Crane & Rigging", src: "/brand/eagle-west-updated.png" },
  { name: "JMS Crane & Rigging", src: "/brand/jms-updated.png", compact: true },
];

export default function FamilyStrip() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    // A wheel delta under this magnitude is trackpad-inertia decay, not a
    // deliberate new scroll — same reasoning, same value, as
    // useHeroAutoScroll's CANCEL_DELTA. Without this floor every arrival
    // silently cancelled itself: the very wheel gesture that carried the
    // user down to the strip was still emitting trailing events at the
    // instant the section crossed the intersection threshold.
    const CANCEL_DELTA = 12;
    // How long after arriving to wait before a wheel/touch counts as a fresh
    // interruption rather than the tail of the arrival gesture. Inertial
    // trackpads keep emitting small deltas for a few hundred ms after the
    // finger lifts — this is comfortably past that.
    const ARM_DELAY_MS = 500;

    let timer = 0;
    let armTimer = 0;
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) >= CANCEL_DELTA) cancel();
    };
    function cancel() {
      window.clearTimeout(timer);
      window.clearTimeout(armTimer);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", cancel);
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect(); // one shot — never re-arms on a later visit

        const lenis = getLenis();
        if (!lenis) return; // reduced-motion: no programmatic scroll, ever

        timer = window.setTimeout(() => {
          cancel();
          const target = document.getElementById("statement");
          if (target) lenis.scrollTo(target, { duration: 1.5, easing: heroRunEase });
        }, 3000);

        // Arm cancellation only once the arrival gesture has had time to
        // settle, so a genuine later scroll/touch can still interrupt it.
        armTimer = window.setTimeout(() => {
          window.addEventListener("wheel", onWheel, { passive: true });
          window.addEventListener("touchstart", cancel, { passive: true });
        }, ARM_DELAY_MS);
      },
      { threshold: 0.5 },
    );
    io.observe(section);

    return () => {
      io.disconnect();
      cancel();
    };
  }, []);

  return (
    // `#family` — the nav's Family of Companies link used to point at
    // /coverage; that route is gone (2026-08-04, single-page site) and this
    // strip is the only surviving place the family is shown.
    <section
      ref={sectionRef}
      id="family"
      className="scroll-mt-32 border-y border-black/10 bg-white"
    >
      <div className="mx-auto flex max-w-[120rem] flex-col items-center px-6 py-16 text-center sm:px-10 sm:py-20 lg:px-14 lg:py-24">
        <h2 className="font-body text-3xl font-bold tracking-[-0.02em] text-black sm:text-4xl lg:text-5xl">
          <span className="text-[#f8ae1c]">TNT</span> FAMILY OF COMPANIES
        </h2>
        <span className="mt-6 h-1 w-20 bg-[#f8ae1c]" aria-hidden="true" />
        <p className="mt-10 font-body text-base font-semibold tracking-[0.02em] text-[#666] uppercase sm:text-lg">
          Strong brands. One legacy of excellence.
        </p>
        <ul className="relative left-0 mt-20 grid w-full grid-cols-2 items-center gap-x-6 gap-y-12 px-4 sm:gap-x-12 sm:px-8 lg:mt-24 lg:grid-cols-4 lg:gap-x-8 lg:px-12 lg:left-4">
          {LOGOS.map((l) => (
            <li key={l.name} className="flex h-20 items-center justify-center sm:h-24 lg:h-28">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={l.src}
                alt={l.name}
                className={l.compact ? "h-1/2 w-full object-contain" : "max-h-full w-full object-contain"}
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
