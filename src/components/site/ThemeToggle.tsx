"use client";

/**
 * THEME TOGGLE — floating "Theme 1 / 2" picker (2026-09-07, on request).
 * Removed 2026-09-10 when theme one (maroon) was dropped project-wide and
 * dark-slate became the only look; RESTORED 2026-09-14, on request ("I have
 * one more theme to show to my manager") — same file, same mechanism,
 * pulled back from git history rather than rewritten. See
 * themeVersionStore.ts's own docblock for what each theme actually swaps.
 *
 * Rendered by layout.tsx inside the bottom-left toggle row (HeroToggle used
 * to sit beside it here too; that one stays unrendered — see layout.tsx's
 * own note — so this is currently that row's only member).
 *
 * Same popover-above-a-pill pattern as the Nav/About pickers in SiteNav.tsx
 * (bottom-right), for visual consistency, but backed by its own
 * themeVersionStore rather than folded into that widget group — kept
 * separate on request, same as originally.
 *
 * No positioning of its own — the shared row in layout.tsx owns the fixed
 * placement.
 */

import { useState } from "react";
import { useThemeVersion } from "./themeVersionStore";

export default function ThemeToggle() {
  const [themeVersion, setThemeVersion] = useThemeVersion();
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-col items-start gap-2">
      {open && (
        <div
          id="theme-version-picker"
          className="flex flex-col gap-1 rounded-md border border-white/15 bg-tnt-slate p-1 shadow-xl shadow-black/30"
          role="group"
          aria-label="Theme versions"
        >
          {(["one", "two"] as const).map((version) => (
            <button
              key={version}
              type="button"
              onClick={() => setThemeVersion(version)}
              aria-pressed={themeVersion === version}
              className={`min-w-28 rounded-sm px-3 py-2 text-left font-mono text-xs tracking-[0.12em] uppercase transition-colors ${
                themeVersion === version
                  ? "bg-tnt-amber text-black"
                  : "text-white/75 hover:bg-white/10 hover:text-white"
              }`}
            >
              Theme {version === "one" ? "1" : "2"}
            </button>
          ))}
        </div>
      )}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls="theme-version-picker"
        className="rounded-full border border-tnt-amber bg-tnt-amber px-4 py-2.5 font-mono text-xs font-semibold tracking-[0.1em] text-black uppercase shadow-lg shadow-black/25 transition-colors hover:bg-white focus-visible:ring-2 focus-visible:ring-tnt-amber focus-visible:outline-none"
      >
        Theme / {themeVersion === "one" ? "01" : "02"}
      </button>
    </div>
  );
}
