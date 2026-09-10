"use client";

/**
 * HERO VERSION STORE — same pattern as navVersionStore.ts / aboutVersionStore.ts,
 * for the standalone "Hero 1 / 2" floating toggle (HeroToggle.tsx). (A sibling
 * themeVersionStore.ts once existed for a "Theme 1 / 2" toggle; removed
 * 2026-09-10 when theme one — brand maroon — was dropped project-wide.)
 *
 * Hero "one" is HeroScrollExperienceR3F — the shipped hero, untouched.
 * Hero "two" is HeroScrollExperienceManualScroll — the manual-scroll variant
 * copied in 2026-09-08 for side-by-side comparison (see that file's docblock).
 *
 * A plain module-level store read via `useSyncExternalStore` rather than
 * React Context, for the same reason as the other version stores: the
 * toggle (in the fixed chrome) and the hero (inside page.tsx's content) are
 * not in a shared component tree with a provider between them.
 *
 * Not persisted (no localStorage) — a same-session comparison toggle, not a
 * user preference that should survive a reload.
 */

import { useSyncExternalStore } from "react";

export type HeroVersion = "one" | "two";

let version: HeroVersion = "one";
const listeners = new Set<() => void>();

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function getSnapshot(): HeroVersion {
  return version;
}

// Server-rendered markup always starts on hero one; the client picks up
// whatever's live in the module after hydration via the subscription above.
function getServerSnapshot(): HeroVersion {
  return "one";
}

export function setHeroVersion(next: HeroVersion) {
  if (version === next) return;
  version = next;
  listeners.forEach((cb) => cb());
}

export function useHeroVersion(): [HeroVersion, (next: HeroVersion) => void] {
  const value = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return [value, setHeroVersion];
}
