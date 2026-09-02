"use client";

/**
 * FAMILY STRIP V2 — alternate Family-of-Companies section, gated behind the
 * "Nav / 02" picker (see navVersionStore.ts). New design, not a variant of
 * FamilyStrip.tsx — deliberately a different composition so the picker has
 * something meaningfully different to compare:
 *
 *   V1 (FamilyStrip)   — light canvas, split diagonal charcoal panel + a
 *                         2×2 logo quadrant anchored on a crosshair.
 *   V2 (this file)     — black headline band on top, then a full-width light
 *                         "shelf" holding the four brands in one horizontal
 *                         row with hairline dividers — reads like a
 *                         portfolio/investor-relations "brands of the group"
 *                         strip rather than a geometric composition.
 *
 * THE LOGOS ARE FULL-COLOR LOCKUPS, NOT SILHOUETTES — this is why the shelf
 * is light, not dark. Checked each /public/brand/*.svg: they're built from a
 * default-black shape (a solid panel in southway/eagle-west/jms, bare
 * linework in rms-cranes) plus maroon/amber sub-elements, and southway/
 * eagle-west/jms additionally carry a WHITE sub-element that only reads
 * against something dark. There's no version of these marks that's legible
 * as flat white-on-black (an invert filter garbles the maroon/amber into
 * off-hues) or plain-rendered on black (the black portions vanish). V1
 * already proves the fix: put them on a light surface, unfiltered, exactly
 * as authored. This shelf is that surface, just inset in an otherwise dark
 * section instead of being the section itself.
 *
 * Same visual vocabulary as the rest of the site (black/white/gold, no
 * cards, no drop shadows, font-display headline, font-body labels) so it
 * still feels like this site, not a different product. The shelf is a
 * full-bleed strip, not a bounded/shadowed card, to stay inside that rule.
 */

import { useEffect, useRef, useState } from "react";

const BRANDS: { name: string; src: string; id: string; region: string }[] = [
  { name: "Southway Crane & Rigging", src: "/brand/southway.svg", id: "southway", region: "Gulf Coast" },
  { name: "RMS Cranes", src: "/brand/rms-cranes.svg", id: "rms", region: "Western Canada" },
  { name: "Eagle West Crane & Rigging", src: "/brand/eagle-west.svg", id: "eagle", region: "Pacific Northwest" },
  { name: "JMS Crane & Rigging", src: "/brand/jms.svg", id: "jms", region: "Central Canada" },
];

export default function FamilyStripV2() {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.2 },
    );
    io.observe(section);

    return () => io.disconnect();
  }, []);

  return (
    <section ref={sectionRef} id="family" className="relative overflow-hidden bg-black">
      {/* Headline band — left-aligned (2026-09-02, on request; was centered
          mid-page). Everything, description included, now sits flush left
          against the section's own padding instead of floating in the
          middle. */}
      <div className="mx-auto max-w-6xl px-6 py-24 sm:px-10 lg:px-16 lg:py-28">
        <div
          className={`max-w-2xl text-left transition-all duration-700 ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
          }`}
        >
          <p className="font-body text-[13px] font-bold tracking-[0.3em] text-tnt-amber uppercase">
            TNT Group
          </p>
          <h2 className="mt-4 font-display text-5xl leading-[0.95] tracking-tight text-white uppercase sm:text-6xl">
            Family of Companies
          </h2>
          <div className="mt-8 h-px w-16 bg-tnt-amber" />
          <p className="mt-8 max-w-lg font-body text-base leading-relaxed text-white/50">
            Four regional brands, one standard of work — each built its name
            long before joining the group, and keeps it today.
          </p>
        </div>
      </div>

      {/* Brand shelf — full-bleed light strip so the lockups render exactly
          as authored (see docblock). Hairline dividers, no card/shadow. */}
      <div
        className={`bg-[#FCFCFC] transition-all delay-150 duration-700 ${
          isVisible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
        }`}
      >
        <div className="mx-auto grid max-w-6xl grid-cols-1 divide-y divide-black/10 px-6 sm:grid-cols-2 sm:divide-x sm:divide-y-0 sm:px-10 lg:grid-cols-4 lg:px-16">
          {BRANDS.map((brand) => (
            <div
              key={brand.id}
              className="flex flex-col items-center gap-5 px-8 py-10 text-center"
            >
              <div className="flex h-14 w-full items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={brand.src}
                  alt={brand.name}
                  className="h-full w-auto max-w-[85%] object-contain"
                />
              </div>
              <p className="font-body text-xs font-semibold tracking-[0.14em] text-tnt-meta uppercase">
                {brand.region}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
