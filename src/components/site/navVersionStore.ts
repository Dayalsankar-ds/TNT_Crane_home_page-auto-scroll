"use client";

/**
 * NAV VERSION STORE — tiny cross-tree store for the "Nav / 01" vs "Nav / 02"
 * picker (the floating bottom-right widget in SiteNav.tsx).
 *
 * That picker used to be local `useState` inside SiteNav, which was fine
 * while it only swapped a detail inside SiteNav's own Services mega-panel.
 * Now the homepage's Family-of-Companies section (FamilyStrip / FamilyStripV2)
 * also needs to read the current version, and it's a sibling of SiteNav under
 * RootLayout (see layout.tsx) — no shared Context provider exists between
 * them. Rather than thread a Context through layout.tsx for one toggle, this
 * is a plain module-level store read via `useSyncExternalStore`, which is
 * exactly what that hook is for: external state no single component tree owns.
 *
 * Not persisted (no localStorage) — this is a same-session design-review
 * toggle, not a user preference that should survive a reload.
 */

import { useSyncExternalStore } from "react";

export type NavVersion = "one" | "two";

let version: NavVersion = "one";
const listeners = new Set<() => void>();

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function getSnapshot(): NavVersion {
  return version;
}

// Server-rendered markup always starts on version one; the client picks up
// whatever's live in the module after hydration via the subscription above.
function getServerSnapshot(): NavVersion {
  return "one";
}

export function setNavVersion(next: NavVersion) {
  if (version === next) return;
  version = next;
  listeners.forEach((cb) => cb());
}

export function useNavVersion(): [NavVersion, (next: NavVersion) => void] {
  const value = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return [value, setNavVersion];
}
