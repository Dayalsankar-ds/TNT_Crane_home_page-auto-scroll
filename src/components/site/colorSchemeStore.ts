"use client";

/**
 * COLOR SCHEME STORE — "Light/Dark" toggle state, backing ThemeToggle.tsx's
 * popover (see appearanceStore.ts's history for how this file was briefly
 * merged away and then split back out, 2026-09-17, on request — "each one
 * is separate button not linked with each other"). Used to sit alongside an
 * independent "Theme 1/2" group (themeVersionStore.ts) — removed
 * project-wide 2026-09-23, on request, so this is now the toggle's only
 * state.
 *
 * Drives a real, PERSISTED site-wide color scheme (the `dark` class on
 * <html>, matched by `dark:` everywhere it's used — see globals.css's
 * `@custom-variant dark`) — a genuine viewer preference that should survive
 * a reload.
 *
 * Same plain-module + `useSyncExternalStore` pattern as the other version
 * stores.
 *
 * FORCED THEME FOR SPLIT LIGHT/DARK DEPLOYS (2026-10-01, on request —
 * "separate both light and dark theme... I want to share these two version
 * individually to client"): `NEXT_PUBLIC_FORCE_THEME` (set per-build, not
 * per-request — `npm run build:light` / `build:dark` in package.json) locks
 * the scheme to one value and disables the toggle, with ZERO changes to any
 * component that reads `useColorScheme()` — they still get back a scheme
 * and a setter, the setter just does nothing while forced. `FORCED_THEME`
 * is read once at module scope (inlined by Next at build time, same as any
 * `NEXT_PUBLIC_*` var), not per-render, so there's no risk of it drifting
 * mid-session. `getServerSnapshot()` and the initial `scheme` both return
 * the forced value when set, matching what layout.tsx now bakes directly
 * into the server-rendered `<html>` class — so a forced deploy never shows
 * a flash of the other theme before this store's own effect would
 * otherwise apply it.
 */

import { useEffect, useSyncExternalStore } from "react";

export type ColorScheme = "light" | "dark";

const STORAGE_KEY = "tnt-color-scheme";

/** Set only on a split light/dark deploy — see FORCED THEME note above. */
const FORCED_THEME: ColorScheme | null =
  process.env.NEXT_PUBLIC_FORCE_THEME === "dark"
    ? "dark"
    : process.env.NEXT_PUBLIC_FORCE_THEME === "light"
      ? "light"
      : null;

let scheme: ColorScheme = FORCED_THEME ?? "light";
const listeners = new Set<() => void>();

function readStored(): ColorScheme {
  if (FORCED_THEME) return FORCED_THEME;
  if (typeof window === "undefined") return "light";
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return stored === "dark" ? "dark" : "light";
}

function applyToDocument(next: ColorScheme) {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("dark", next === "dark");
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function getSnapshot(): ColorScheme {
  return scheme;
}

function getServerSnapshot(): ColorScheme {
  return FORCED_THEME ?? "light";
}

export function setColorScheme(next: ColorScheme) {
  if (FORCED_THEME) return; // locked for this deploy — see FORCED THEME note
  if (scheme === next) return;
  scheme = next;
  applyToDocument(next);
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, next);
  }
  listeners.forEach((cb) => cb());
}

export function useColorScheme(): [ColorScheme, (next: ColorScheme) => void] {
  const value = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  useEffect(() => {
    const stored = readStored();
    if (stored !== scheme) {
      scheme = stored;
      listeners.forEach((cb) => cb());
    }
    applyToDocument(scheme);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return [value, setColorScheme];
}
