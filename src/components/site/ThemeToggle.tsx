"use client";

/**
 * THEME TOGGLE — floating "Theme 1 / 2" + "Light / Dark" picker.
 *
 * Theme 1/2 picker added 2026-09-07, on request. Removed 2026-09-10 when
 * theme one (maroon) was dropped project-wide and dark-slate became the only
 * look; RESTORED 2026-09-14, on request ("I have one more theme to show to
 * my manager") — same file, same mechanism, pulled back from git history
 * rather than rewritten.
 *
 * Light/Dark added 2026-09-17 as its own floating pill (colorSchemeStore.ts
 * + ColorSchemeToggle.tsx), then went through several rounds the same day:
 * merged into this one pill/popover as two independent groups → linked so
 * picking one set both → collapsed into one store → and finally, per this
 * message, SPLIT BACK to two fully independent groups ("each one is
 * separate button not linked with each other"). Net effect after all of
 * that: back to where the "merged popover" step started — one pill, one
 * popover, two groups, two unrelated stores (themeVersionStore.ts and
 * colorSchemeStore.ts) that never touch each other. Picking Theme 1/2 does
 * not change Light/Dark, and picking Light/Dark does not change Theme 1/2.
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
import { useThemeVersion } from "./themeVersionStore";
import { useColorScheme } from "./colorSchemeStore";

export default function ThemeToggle() {
  const [themeVersion, setThemeVersion] = useThemeVersion();
  const [colorScheme, setColorScheme] = useColorScheme();
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-col items-start gap-2">
      {open && (
        <div
          id="theme-version-picker"
          className="flex flex-col gap-2 rounded-md border border-white/15 bg-tnt-slate p-2 shadow-xl shadow-black/30"
        >
          <div role="group" aria-label="Theme versions">
            <p className="px-1 pb-1 font-mono text-[10px] tracking-[0.14em] text-white/40 uppercase">
              Theme
            </p>
            <div className="flex flex-col gap-1">
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
          </div>

          <div className="border-t border-white/10 pt-2" role="group" aria-label="Light or dark mode">
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
        Theme / {themeVersion === "one" ? "01" : "02"} · {colorScheme === "light" ? "Light" : "Dark"}
      </button>
    </div>
  );
}
