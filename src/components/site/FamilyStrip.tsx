"use client";

/**
 * FAMILY STRIP — Premium enterprise section showcasing TNT Family of Companies.
 *
 * Design: Modern geometric layout with:
 * - Left trapezoid panel (dark charcoal #222222) with angled right edge
 * - Right white panel with 2×2 logo grid
 * - Geometric dividers with central TNT yellow diamond
 * - Hover interactions and entrance animations
 * - Fortune 500 industrial aesthetic
 *
 * Layout: Full-width, split panel design
 * - Left (32%): Dark trapezoid with heading and tagline
 * - Right (68%): White background with logo grid
 * - Grid dividers create visual hierarchy
 * - Premium whitespace and sharp typography
 */

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { getLenis } from "@/components/SmoothScroll";
import { heroRunEase } from "@/components/useHeroAutoScroll";

const LOGOS: { name: string; src: string; id: string }[] = [
  { name: "Southway Crane & Rigging", src: "/brand/southway.svg", id: "southway" },
  { name: "RMS Cranes", src: "/brand/rms-cranes.svg", id: "rms" },
  { name: "Eagle West Crane & Rigging", src: "/brand/eagle-west.svg", id: "eagle" },
  { name: "JMS Crane & Rigging", src: "/brand/jms.svg", id: "jms" },
];

export default function FamilyStrip() {
  const sectionRef = useRef<HTMLElement>(null);
  const [hoveredLogo, setHoveredLogo] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 },
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
      className="relative overflow-hidden bg-white py-32"
    >
      <div className="mx-auto max-w-[1400px]">
        {/* Main Container: Split Layout */}
        <div className="grid gap-0 lg:grid-cols-[32%_68%]">
          {/* LEFT PANEL: Dark Trapezoid with Content */}
          <div
            className={`relative flex flex-col items-start justify-center px-8 py-16 sm:px-12 sm:py-20 lg:px-16 lg:py-24 transition-all duration-700 ${
              isVisible ? "translate-x-0 opacity-100" : "-translate-x-full opacity-0"
            }`}
            style={{
              backgroundColor: "#222222",
              clipPath: "polygon(0 0, 100% 0, 85% 100%, 0 100%)",
            }}
          >
            {/* Heading */}
            <div className="relative z-10">
              <h2 className="font-display text-6xl font-black leading-tight tracking-tight text-white sm:text-7xl lg:text-8xl">
                <span className="block text-[#F5B21A]">TNT</span>
                <span className="block">FAMILY OF</span>
                <span className="block">COMPANIES</span>
              </h2>

              {/* Yellow Divider Line */}
              <div className="mt-8 h-1.5 w-32 bg-[#F5B21A] sm:w-40" />

              {/* Tagline */}
              <p className="mt-10 font-body text-sm font-semibold tracking-wide text-[#7A7A7A] uppercase sm:text-base lg:text-lg">
                <span className="block">Strong Brands.</span>
                <span className="block">One Legacy of</span>
                <span className="block">Excellence.</span>
              </p>
            </div>
          </div>

          {/* RIGHT PANEL: White Grid with Logos and Dividers */}
          <div className="relative flex flex-col items-center justify-center bg-white px-8 py-16 sm:px-12 sm:py-20 lg:px-16 lg:py-24">
            {/* 2×2 Grid Container */}
            <div className="relative w-full max-w-2xl">
              {/* Grid Lines (Dividers) */}
              <div className="absolute inset-0 pointer-events-none">
                {/* Vertical Line */}
                <div className="absolute left-1/2 top-0 bottom-0 w-px bg-[#EAEAEA] transform -translate-x-1/2" />
                {/* Horizontal Line */}
                <div className="absolute top-1/2 left-0 right-0 h-px bg-[#EAEAEA] transform -translate-y-1/2" />
                {/* Central Yellow Diamond */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <div
                    className="w-4 h-4 bg-[#F5B21A]"
                    style={{ transform: "rotate(45deg)" }}
                  />
                </div>
              </div>

              {/* Logo Grid (2×2) */}
              <div className="grid grid-cols-2 gap-8 sm:gap-12 lg:gap-16">
                {LOGOS.map((logo, index) => (
                  <div
                    key={logo.id}
                    className={`relative flex items-center justify-center h-32 sm:h-40 lg:h-48 transition-all duration-500 ${
                      isVisible
                        ? "translate-y-0 opacity-100"
                        : "translate-y-8 opacity-0"
                    }`}
                    style={{
                      transitionDelay: isVisible ? `${index * 100}ms` : "0ms",
                    }}
                    onMouseEnter={() => setHoveredLogo(logo.id)}
                    onMouseLeave={() => setHoveredLogo(null)}
                  >
                    <div
                      className={`relative cursor-pointer transition-all duration-300 ${
                        hoveredLogo && hoveredLogo !== logo.id
                          ? "opacity-60"
                          : "opacity-100"
                      } ${hoveredLogo === logo.id ? "scale-105 drop-shadow-2xl" : "scale-100"}`}
                    >
                      {/* Logo Image */}
                      <img
                        src={logo.src}
                        alt={logo.name}
                        className="h-full w-full object-contain"
                        style={{
                          filter: "drop-shadow(0 2px 8px rgba(0, 0, 0, 0.06))",
                        }}
                      />

                      {/* Orange Underline Animation (on hover) */}
                      {hoveredLogo === logo.id && (
                        <div className="absolute bottom-0 left-1/2 h-1 bg-orange-500 transform -translate-x-1/2 animate-pulse"
                          style={{
                            width: "60%",
                            animation: "slideInWidth 300ms ease-out forwards",
                          }}
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CSS Animation Keyframes */}
      <style>{`
        @keyframes slideInWidth {
          from {
            width: 0;
          }
          to {
            width: 60%;
          }
        }
      `}</style>
    </section>
  );
}
