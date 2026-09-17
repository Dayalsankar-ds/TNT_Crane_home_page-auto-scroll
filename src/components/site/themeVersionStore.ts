"use client";

/**
 * THEME VERSION STORE — "Theme 1 / 2" toggle state, backing one of the two
 * independent groups in ThemeToggle.tsx's popover (see appearanceStore.ts's
 * history for how this file was briefly merged away and then split back
 * out, 2026-09-17, on request — "each one is separate button not linked
 * with each other").
 *
 * Deliberately INDEPENDENT of colorSchemeStore.ts's "Light/Dark" state.
 * Picking Theme 1/2 has no effect on Light/Dark, and vice versa — the two
 * are separate settings that happen to share one floating pill/popover for
 * layout convenience only.
 *
 * Session-only (no persistence): a same-session comparison of two brand
 * looks for CoreServices/SafetyCulture/StorySlideshow, not a viewer
 * preference that should survive a reload.
 *
 * Same plain-module + `useSyncExternalStore` pattern as the other version
 * stores (heroVersionStore.ts, navVersionStore.ts, aboutVersionStore.ts).
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
