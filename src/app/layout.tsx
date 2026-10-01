import type { Metadata } from "next";
import { Geist, Geist_Mono, Open_Sans } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import SiteNav from "@/components/site/SiteNav";
import SiteFooter from "@/components/site/SiteFooter";
import SmoothScroll from "@/components/SmoothScroll";
import ThemeToggle from "@/components/site/ThemeToggle";

// Geist stays the body default so the existing hero's inherited font is unchanged.
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Body face for the section system (`font-body`).
const openSans = Open_Sans({
  variable: "--font-open-sans",
  subsets: ["latin"],
  display: "swap",
});

// Display face (`font-display`), replacing the SF Pro system stack 2026-07-30.
// Self-hosted from Assets/Impact.ttf — commercially licensed; webfont-license
// coverage confirmed with the user before wiring this in. Single static
// weight, so no bold variant exists to select — the old forced 700 override
// on .font-display is dropped in globals.css to avoid the browser
// faux-bolding an already-heavy face.
const impact = localFont({
  src: "./fonts/Impact.ttf",
  variable: "--font-impact",
  weight: "400",
  style: "normal",
  display: "swap",
});

export const metadata: Metadata = {
  title: "TNT Crane & Rigging — Crane Rental, Rigging & Lift Engineering",
  description:
    "Crane rental, specialty rigging, and lift engineering unified across North America. Find equipment by capacity, locate your nearest branch, and request a lift plan.",
};

// FORCED THEME FOR SPLIT LIGHT/DARK DEPLOYS (2026-10-01, on request —
// "separate both light and dark theme... I want to share these two version
// individually to client"): same `NEXT_PUBLIC_FORCE_THEME` env var
// colorSchemeStore.ts reads, checked here too so the `dark` class is baked
// into the server-rendered <html> directly — no flash of the other theme
// while that store's own client-side effect would otherwise apply it a tick
// later. Unset (the ordinary, un-split deploy) and this is a no-op.
const FORCED_THEME =
  process.env.NEXT_PUBLIC_FORCE_THEME === "dark"
    ? "dark"
    : process.env.NEXT_PUBLIC_FORCE_THEME === "light"
      ? "light"
      : null;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${openSans.variable} ${impact.variable} h-full antialiased ${FORCED_THEME === "dark" ? "dark" : ""}`}
    >
      <body className="min-h-full">
        {/* Inertial smooth scroll + single GSAP rAF loop for all scroll motion */}
        <SmoothScroll />
        {/* Fixed nav + shared footer wrap every route */}
        <SiteNav />
        {/* Light/Dark floating toggle, bottom-left. Hero 1/2 used to sit
            beside it in this row (HeroToggle.tsx) — deleted 2026-09-17
            along with the manual-scroll hero it toggled to, since there's
            only one hero now. This pill used to also carry a "Theme 1/2"
            group — removed 2026-09-23, on request — see ThemeToggle.tsx's
            own docblock.
            Hidden outright on a forced-theme deploy (see FORCED_THEME
            above) — nothing for a viewer to toggle when the deploy itself
            is the one-theme version. */}
        {!FORCED_THEME && (
          <div className="fixed bottom-4 left-4 z-[60] flex items-end gap-2 sm:bottom-6 sm:left-6">
            <ThemeToggle />
          </div>
        )}
        {/* The nav is fixed, so it overlays page content. Inner routes used to
            clear it only by accident — their first section's `py-20` happened
            to exceed the old 102px chrome. Raising the bar to 122px put the
            first eyebrow 10px UNDER it. This reserves the space explicitly.
            The homepage cancels it (see page.tsx) because its hero is meant to
            run full-bleed beneath the bar. */}
        <main className="pt-[var(--chrome-h)]">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
