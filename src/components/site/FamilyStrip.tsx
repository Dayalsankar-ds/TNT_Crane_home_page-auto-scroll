"use client";

/**
 * FAMILY STRIP — Premium Fortune 500 industrial section.
 *
 * Design Reference: Caterpillar, Liebherr, Mammoet aesthetic
 * - Clean, understated, premium
 * - Sophisticated hierarchy and spacing
 * - Geometric precision with elegant simplicity
 * - 24% left trapezoid panel + 2×2 logo grid
 * - Shortened center dividers with yellow anchor
 * - Subtle micro-interactions and texture
 *
 * Layout:
 * - Section header with context ("OUR NETWORK")
 * - Split layout: 24% left + 76% right
 * - Perfectly balanced 2×2 logo grid with invisible zones
 * - Independent logo animations with "A TNT Company" reveal
 * - Off-white background with subtle industrial texture
 */

import { useEffect, useRef, useState } from "react";
import { getLenis } from "@/components/SmoothScroll";

const LOGOS: { name: string; src: string; company: string; id: string }[] = [
  { name: "Southway Crane & Rigging", src: "/brand/southway.svg", company: "Southway", id: "southway" },
  { name: "RMS Cranes", src: "/brand/rms-cranes.svg", company: "RMS Cranes", id: "rms" },
  { name: "Eagle West Crane & Rigging", src: "/brand/eagle-west.svg", company: "Eagle West", id: "eagle" },
  { name: "JMS Crane & Rigging", src: "/brand/jms.svg", company: "JMS", id: "jms" },
];

export default function FamilyStrip() {
  const sectionRef = useRef<HTMLElement>(null);
  const [hoveredLogo, setHoveredLogo] = useState<string | null>(null);
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

  return (
    <section
      ref={sectionRef}
      id="family"
      className="relative overflow-hidden py-32 lg:py-40"
      style={{
        backgroundColor: "#FCFCFC",
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.025'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      }}
    >
      {/* Section Header */}
      <div className="mx-auto mb-24 max-w-[1400px] px-6 text-center sm:px-10 lg:mb-32 lg:px-16">
        <p className="font-body text-xs font-bold tracking-[0.1em] text-[#7A7A7A] uppercase">
          OUR NETWORK
        </p>
        <h2 className="mt-3 font-display text-5xl font-bold tracking-tight text-black sm:text-6xl lg:text-7xl">
          Family of Companies
        </h2>
        <p className="mx-auto mt-8 max-w-3xl font-body text-base text-[#666] sm:text-lg lg:text-xl">
          A trusted network delivering crane, rigging and specialized lifting solutions across North America.
        </p>
      </div>

      {/* Main Layout Container */}
      <div className="mx-auto max-w-[1400px] px-6 sm:px-10 lg:px-16">
        <div className="grid gap-24 lg:grid-cols-[1fr_2fr] lg:gap-24 items-start">
          {/* LEFT PANEL: Trapezoid (24% equiv) */}
          <div
            className={`relative flex flex-col justify-start transition-all duration-700 ${
              isVisible ? "translate-x-0 opacity-100" : "-translate-x-12 opacity-0"
            }`}
            style={{
              backgroundColor: "#222222",
              clipPath: "polygon(0 0, 100% 0, 90% 100%, 0 100%)",
              padding: "72px",
              minHeight: "360px",
            }}
          >
            {/* Left Panel Content */}
            <div>
              <p className="font-display text-5xl font-black leading-tight text-[#F5B21A] tracking-tight">
                TNT
              </p>
              <h3 className="mt-3 font-display text-6xl font-bold leading-tight text-white tracking-tight">
                Family of Companies
              </h3>

              {/* Yellow Accent Line */}
              <div className="mt-10 h-1 w-20 bg-[#F5B21A]" />

              {/* Tagline */}
              <p className="mt-10 font-body text-lg leading-relaxed text-[#999]">
                <span className="block">Strong Brands.</span>
                <span className="block">One Legacy.</span>
                <span className="block">Shared Excellence.</span>
              </p>
            </div>
          </div>

          {/* RIGHT PANEL: Logo Grid (76% equiv) */}
          <div className="relative">
            {/* Center Dividers with Diamond */}
            <div className="absolute inset-0 pointer-events-none">
              {/* Vertical Line (shortened) */}
              <div
                className="absolute left-1/2 w-px bg-[#EAEAEA] transform -translate-x-1/2"
                style={{
                  top: "calc(50% - 70px)",
                  bottom: "calc(50% - 70px)",
                  height: "140px",
                }}
              />
              {/* Horizontal Line (shortened) */}
              <div
                className="absolute top-1/2 h-px bg-[#EAEAEA] transform -translate-y-1/2"
                style={{
                  left: "calc(50% - 70px)",
                  right: "calc(50% - 70px)",
                  width: "140px",
                }}
              />
              {/* Central Yellow Diamond */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div
                  className="bg-[#F5B21A]"
                  style={{
                    width: "12px",
                    height: "12px",
                    transform: "rotate(45deg)",
                  }}
                />
              </div>
            </div>

            {/* 2×2 Logo Grid */}
            <div className="grid grid-cols-2 gap-24 sm:gap-28 lg:gap-32">
              {LOGOS.map((logo, index) => (
                <div
                  key={logo.id}
                  className={`relative flex flex-col items-center justify-center transition-all duration-500 ${
                    logoVisibility[logo.id as keyof typeof logoVisibility]
                      ? "translate-y-0 opacity-100"
                      : "translate-y-8 opacity-0"
                  }`}
                  onMouseEnter={() => setHoveredLogo(logo.id)}
                  onMouseLeave={() => setHoveredLogo(null)}
                >
                  {/* Logo Container */}
                  <div
                    className={`relative h-32 w-full sm:h-40 lg:h-48 transition-all duration-300 ${
                      hoveredLogo && hoveredLogo !== logo.id
                        ? "opacity-40"
                        : "opacity-100"
                    } ${hoveredLogo === logo.id ? "scale-104" : "scale-100"}`}
                    style={{
                      transform: hoveredLogo === logo.id ? "scale(1.04)" : "scale(1)",
                    }}
                  >
                    {/* Invisible Hover Zone */}
                    <div
                      className={`absolute inset-0 rounded-lg transition-all duration-300 ${
                        hoveredLogo === logo.id
                          ? "bg-white/80 shadow-2xl"
                          : "bg-transparent"
                      }`}
                      style={{
                        boxShadow: hoveredLogo === logo.id ? "0 12px 48px rgba(0,0,0,0.12)" : "none",
                        padding: "20px",
                      }}
                    >
                      {/* Logo Image */}
                      <img
                        src={logo.src}
                        alt={logo.name}
                        className="h-full w-full object-contain"
                      />
                    </div>

                    {/* Orange Underline Animation */}
                    {hoveredLogo === logo.id && (
                      <div
                        className="absolute bottom-0 left-1/2 h-1 bg-orange-500 transform -translate-x-1/2"
                        style={{
                          width: "50%",
                          animation: "slideInWidth 300ms ease-out forwards",
                        }}
                      />
                    )}
                  </div>

                  {/* "A TNT Company" Label */}
                  {hoveredLogo === logo.id && (
                    <p className="mt-6 animate-fade-in font-body text-sm font-semibold tracking-wide text-[#666] uppercase">
                      A TNT Company
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes slideInWidth {
          from {
            width: 0;
          }
          to {
            width: 50%;
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fadeIn 300ms ease-out forwards;
        }
      `}</style>
    </section>
  );
}
