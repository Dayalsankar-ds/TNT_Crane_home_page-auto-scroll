"use client";

/**
 * HERO TOGGLE — floating "Hero 1 / 2" picker (2026-09-08, on request).
 * Rendered by layout.tsx inside the shared bottom-left toggle row, so it
 * doesn't collide with the Nav/About pickers in SiteNav.tsx (bottom-right).
 * Used to sit next to ThemeToggle in that row; ThemeToggle was removed
 * 2026-09-10 when theme one (maroon) was dropped project-wide, so this is
 * now the row's only member.
 *
 * Backed by heroVersionStore rather than folded into SiteNav's own group —
 * the hero lives in page.tsx, not SiteNav, so a shared module store is what
 * connects the two (see that file's docblock).
 *
 * No positioning of its own — the shared row in layout.tsx owns the fixed
 * placement. Popover renders above the button (row order flipped from the
 * toggle's original top-right placement) to match the bottom-anchored group.
 */

import { useState } from "react";
import { useHeroVersion } from "./heroVersionStore";

export default function HeroToggle() {
  const [heroVersion, setHeroVersion] = useHeroVersion();
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-col items-start gap-2">
      {open && (
        <div
          id="hero-version-picker"
          className="flex flex-col gap-1 rounded-md border border-white/15 bg-tnt-slate p-1 shadow-xl shadow-black/30"
          role="group"
          aria-label="Hero versions"
        >
          {(["one", "two"] as const).map((version) => (
            <button
              key={version}
              type="button"
              onClick={() => setHeroVersion(version)}
              aria-pressed={heroVersion === version}
              className={`min-w-28 rounded-sm px-3 py-2 text-left font-mono text-xs tracking-[0.12em] uppercase transition-colors ${
                heroVersion === version
                  ? "bg-tnt-amber text-black"
                  : "text-white/75 hover:bg-white/10 hover:text-white"
              }`}
            >
              Hero version {version === "one" ? "1" : "2"}
            </button>
          ))}
        </div>
      )}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls="hero-version-picker"
        className="rounded-full border border-tnt-amber bg-tnt-amber px-4 py-2.5 font-mono text-xs font-semibold tracking-[0.1em] text-black uppercase shadow-lg shadow-black/25 transition-colors hover:bg-white focus-visible:ring-2 focus-visible:ring-tnt-amber focus-visible:outline-none"
      >
        Hero / {heroVersion === "one" ? "01" : "02"}
      </button>
    </div>
  );
}
