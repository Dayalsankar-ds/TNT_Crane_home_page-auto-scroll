"use client";

/**
 * FAMILY STRIP — Premium Fortune 500 industrial section.
 *
 * Design Reference: Caterpillar, Liebherr, Mammoet aesthetic
 * - Clean, understated, premium
 * - Sophisticated hierarchy and spacing
 * - Geometric precision with elegant simplicity
 * - Full-bleed split layout: 38% left architectural panel (steep diagonal
 *   edge, vertically centered content, no gap to the right panel) + a
 *   2×2 logo grid on the right, anchored by an extended crosshair and a
 *   central gold diamond
 * - Flat off-white right panel (no texture — removed 2026-09-02, on request)
 * - Logos have NO hover effect (removed 2026-09-02, on request): each mark
 *   renders once at its normalized `weight` size and stays static — the
 *   scroll-in fade/rise (via IntersectionObserver + logoVisibility) is the
 *   only motion left in this section
 * - "TNT" is a large font-display label (bumped 13px → 30px across two
 *   requests) sitting above the "Family of / Companies" headline, not the
 *   small tracked <Eyebrow> primitive used elsewhere on the site
 *
 * NAV VERSION GATE (2026-09-02, on request): this is Nav version ONE's
 * Family-of-Companies section. Version two renders FamilyStripV2.tsx instead
 * — a deliberately different composition, not a variant of this file. Which
 * one shows is read from navVersionStore.ts, the same store backing the
 * "Nav / 01" / "Nav / 02" picker in SiteNav.tsx.
 */

import { useEffect, useRef, useState } from "react";
import { useNavVersion } from "./navVersionStore";
import FamilyStripV2 from "./FamilyStripV2";

const LOGOS: {
  name: string;
  src: string;
  company: string;
  id: string;
  /** Visual-weight multiplier on the logo's max box size — 1 = full size.
   *  Normalizes SVGs of different natural density/dimensions against each
   *  other rather than trusting each file's own intrinsic size. */
  weight: number;
}[] = [
  { name: "Southway Crane & Rigging", src: "/brand/southway.svg", company: "Southway", id: "southway", weight: 1 },
  { name: "RMS Cranes", src: "/brand/rms-cranes.svg", company: "RMS Cranes", id: "rms", weight: 1 },
  { name: "Eagle West Crane & Rigging", src: "/brand/eagle-west.svg", company: "Eagle West", id: "eagle", weight: 1 },
  { name: "JMS Crane & Rigging", src: "/brand/jms.svg", company: "JMS", id: "jms", weight: 0.85 },
];

export default function FamilyStrip() {
  // Gated on the "Nav / 01" vs "Nav / 02" picker (see navVersionStore.ts) —
  // version two renders FamilyStripV2 entirely instead. Read before the
  // early return below so every hook in this component still runs on every
  // render, version two included (rules of hooks) — the IntersectionObserver
  // effect just never finds a section to observe in that branch, since
  // sectionRef never attaches to a rendered <section> when we bail out.
  const [navVersion] = useNavVersion();
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [logoVisibility, setLogoVisibility] = useState<Record<string, boolean>>({
    southway: false,
    rms: false,
    eagle: false,
    jms: false,
  });

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          // Stagger logo visibility
          LOGOS.forEach((logo, index) => {
            setTimeout(() => {
              setLogoVisibility((prev) => ({ ...prev, [logo.id]: true }));
            }, index * 120);
          });
        }
      },
      { threshold: 0.2 },
    );
    io.observe(section);

    return () => {
      io.disconnect();
    };
  }, []);

  if (navVersion === "two") return <FamilyStripV2 />;

  return (
    <section
      ref={sectionRef}
      id="family"
      className="relative overflow-hidden"
      style={{ backgroundColor: "#FCFCFC" }}
    >
      {/* Main Layout Container — full-bleed (2026-09-02, on request): no
          outer padding or max-width, so the section runs edge-to-edge on
          all four sides instead of sitting in a centered, margined column. */}
      <div className="w-full">
        {/* items-stretch + no lg gap (was items-start + gap-24): the left
            panel now spans the full row height instead of just its own
            content height, so it reads as a structural slab rather than a
            floating card. Edge-to-edge on desktop so the panel's steep
            diagonal is what separates it from the canvas, not a gutter. */}
        <div className="grid gap-16 lg:min-h-[560px] lg:grid-cols-[38%_62%] lg:items-stretch lg:gap-0">
          {/* LEFT PANEL: architectural slab (38%) */}
          <div
            className={`relative flex flex-col justify-center bg-tnt-slate transition-all duration-700 ${
              isVisible ? "translate-x-0 opacity-100" : "-translate-x-12 opacity-0"
            }`}
            style={{
              clipPath: "polygon(0 0, 100% 0, 55% 100%, 0 100%)",
              padding: "56px",
            }}
          >
            {/* Left Panel Content */}
            <div className="max-w-md">
              {/* Well above the shared <Eyebrow> primitive's fixed 13px
                  (bumped 13px → 16px → 24px, 2026-09-02, on request) — a
                  plain <p> instead of <Eyebrow className="..."> since
                  Tailwind's utility order isn't source order, so an appended
                  override class isn't guaranteed to beat the primitive's own
                  text-[13px]. */}
              <p className="font-display text-3xl tracking-[0.1em] text-tnt-amber uppercase">
                TNT
              </p>
              <h3 className="mt-4 font-display text-6xl leading-[0.92] tracking-tight text-white uppercase lg:text-7xl">
                Family of
                <br />
                Companies
              </h3>

              {/* Gold Accent Line */}
              <div className="mt-12 h-1 w-20 bg-tnt-amber" />

              {/* Tagline */}
              <p className="mt-12 font-body text-sm leading-relaxed tracking-[0.08em] text-white/50 uppercase">
                <span className="block">Strong Brands.</span>
                <span className="block">One Legacy of</span>
                <span className="block">Excellence.</span>
              </p>
            </div>
          </div>

          {/* RIGHT PANEL: Logo Grid (62%) */}
          <div className="relative flex items-center justify-center px-4 py-10 sm:px-8 lg:px-16 lg:py-0">
            {/* Center Dividers with Diamond */}
            <div className="absolute inset-0 pointer-events-none">
              {/* Vertical Line */}
              <div
                className="absolute left-1/2 w-px bg-[#EAEAEA] transform -translate-x-1/2"
                style={{
                  top: "calc(50% - 220px)",
                  bottom: "calc(50% - 220px)",
                  height: "440px",
                }}
              />
              {/* Horizontal Line */}
              <div
                className="absolute top-1/2 h-px bg-[#E5E5E5] transform -translate-y-1/2"
                style={{
                  left: "calc(50% - 220px)",
                  right: "calc(50% - 220px)",
                  width: "440px",
                }}
              />
              {/* Central Gold Diamond */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div
                  className="bg-tnt-amber"
                  style={{
                    width: "12px",
                    height: "12px",
                    transform: "rotate(45deg)",
                  }}
                />
              </div>
            </div>

            {/* 2×2 Logo Grid — gaps trimmed back with the shorter section
                (2026-09-02) so the grid doesn't force the row taller than
                the panel's own min-height. */}
            <div className="grid grid-cols-2 gap-y-10 gap-x-12 sm:gap-x-16 lg:gap-y-14 lg:gap-x-16">
              {LOGOS.map((logo) => (
                <div
                  key={logo.id}
                  className={`relative flex flex-col items-center justify-center transition-all duration-500 ${
                    logoVisibility[logo.id as keyof typeof logoVisibility]
                      ? "translate-y-0 opacity-100"
                      : "translate-y-8 opacity-0"
                  }`}
                >
                  {/* Logo Container — no hover effect (removed 2026-09-02,
                      on request): was a scale/dim/underline/label set on
                      mouse enter, now just renders the mark at its
                      normalized `weight` size. */}
                  <div className="relative flex h-20 w-full items-center justify-center sm:h-24 lg:h-28">
                    <img
                      src={logo.src}
                      alt={logo.name}
                      className="h-full w-full object-contain"
                      style={{ transform: `scale(${logo.weight})` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
