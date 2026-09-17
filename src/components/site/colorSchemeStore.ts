"use client";

/**
 * COLOR SCHEME STORE — "Light/Dark" toggle state, backing the other of the
 * two independent groups in ThemeToggle.tsx's popover (see
 * appearanceStore.ts's history for how this file was briefly merged away
 * and then split back out, 2026-09-17, on request — "each one is separate
 * button not linked with each other").
 *
 * Deliberately INDEPENDENT of themeVersionStore.ts's "Theme 1/2" state.
 * Picking Light/Dark has no effect on Theme 1/2, and vice versa.
 *
 * Drives a real, PERSISTED site-wide color scheme (the `dark` class on
 * <html>, matched by `dark:` everywhere it's used — see globals.css's
 * `@custom-variant dark`) — unlike Theme 1/2, this is a genuine viewer
 * preference that should survive a reload.
 *
 * Same plain-module + `useSyncExternalStore` pattern as the other version
 * stores.
 */

import { useEffect, useSyncExternalStore } from "react";

export type ColorScheme = "light" | "dark";

const STORAGE_KEY = "tnt-color-scheme";

let scheme: ColorScheme = "light";
const listeners = new Set<() => void>();

function readStored(): ColorScheme {
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
  return "light";
}

export function setColorScheme(next: ColorScheme) {
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
