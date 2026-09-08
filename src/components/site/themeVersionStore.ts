"use client";

/**
 * THEME VERSION STORE — same pattern as navVersionStore.ts / aboutVersionStore.ts,
 * for the standalone "Theme 1 / 2" floating toggle (ThemeToggle.tsx).
 *
 * Theme "one" is the site exactly as shipped — untouched. Theme "two" swaps
 * every maroon (brand red) surface for the same dark-slate alternate, so the
 * two stay visually consistent with each other:
 *   - SafetyCulture (iCARE) — the section's maroon band
 *   - StorySlideshow (About Us) — the active stat card's maroon fill
 * Per request (2026-09-07): keep theme one exactly as-is, compare a
 * matching alternate everywhere maroon currently appears as a fill.
 *
 * A plain module-level store read via `useSyncExternalStore` rather than
 * React Context, for the same reason as the other version stores: the
 * toggle and SafetyCulture are not in a shared component tree with a
 * provider between them.
 *
 * Not persisted (no localStorage) — a same-session design-review toggle,
 * not a user preference that should survive a reload.
 */

import { useSyncExternalStore } from "react";

export type ThemeVersion = "one" | "two";

let version: ThemeVersion = "one";
const listeners = new Set<() => void>();

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function getSnapshot(): ThemeVersion {
  return version;
}

// Server-rendered markup always starts on theme one; the client picks up
// whatever's live in the module after hydration via the subscription above.
function getServerSnapshot(): ThemeVersion {
  return "one";
}

export function setThemeVersion(next: ThemeVersion) {
  if (version === next) return;
  version = next;
  listeners.forEach((cb) => cb());
}

export function useThemeVersion(): [ThemeVersion, (next: ThemeVersion) => void] {
  const value = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return [value, setThemeVersion];
}
