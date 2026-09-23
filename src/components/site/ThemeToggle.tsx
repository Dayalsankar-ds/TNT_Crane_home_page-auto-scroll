"use client";

/**
 * THEME TOGGLE — floating "Light / Dark" picker.
 *
 * Used to also carry a "Theme 1 / 2" group (themeVersionStore.ts, a
 * same-session A/B look for CoreServices/SafetyCulture/StorySlideshow) —
 * removed project-wide on request, "we don't want that any more". Every
 * section that read it now renders its Theme 1 (default) look permanently;
 * only the genuine Light/Dark viewer preference remains.
 *
 * Rendered by layout.tsx inside the bottom-left toggle row (HeroToggle used
 * to sit beside it here too; that one stays unrendered — see layout.tsx's
 * own note).
 *
 * Same popover-above-a-pill pattern as the Nav/About pickers in SiteNav.tsx
 * (bottom-right), for visual consistency.
 *
 * No positioning of its own — the shared row in layout.tsx owns the fixed
 * placement.
 */

import { useState } from "react";
import { useColorScheme } from "./colorSchemeStore";

export default function ThemeToggle() {
  const [colorScheme, setColorScheme] = useColorScheme();
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-col items-start gap-2">
      {open && (
        <div
          id="theme-version-picker"
          className="flex flex-col gap-2 rounded-md border border-white/15 bg-tnt-slate p-2 shadow-xl shadow-black/30"
        >
          <div role="group" aria-label="Light or dark mode">
            <p className="px-1 pb-1 font-mono text-[10px] tracking-[0.14em] text-white/40 uppercase">
              Mode
            </p>
            <div className="flex flex-col gap-1">
              {(["light", "dark"] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setColorScheme(option)}
                  aria-pressed={colorScheme === option}
                  className={`min-w-28 rounded-sm px-3 py-2 text-left font-mono text-xs tracking-[0.12em] uppercase transition-colors ${
                    colorScheme === option
                      ? "bg-tnt-amber text-black"
                      : "text-white/75 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {option === "light" ? "Light" : "Dark"}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls="theme-version-picker"
        className="rounded-full border border-tnt-amber bg-tnt-amber px-4 py-2.5 font-mono text-xs font-semibold tracking-[0.1em] text-black uppercase shadow-lg shadow-black/25 transition-colors hover:bg-white focus-visible:ring-2 focus-visible:ring-tnt-amber focus-visible:outline-none"
      >
        {colorScheme === "light" ? "Light" : "Dark"}
      </button>
    </div>
  );
}
