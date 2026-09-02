"use client";

/**
 * ABOUT VERSION STORE — same pattern as navVersionStore.ts, for the
 * "About /01 /02" picker (the second floating bottom-right widget in
 * SiteNav.tsx). Toggles StorySlideshow's own two description layouts
 * (desktop-style beside the photo vs. mobile-style in a bar underneath) so
 * either can be previewed at any viewport width — see the "ABOUT VERSION
 * GATE" note in StorySlideshow.tsx.
 *
 * A plain module-level store read via `useSyncExternalStore` rather than
 * React Context, for the same reason as navVersionStore: SiteNav and
 * StatementSection are siblings under RootLayout with no shared provider.
 *
 * Not persisted (no localStorage) — a same-session design-review toggle,
 * not a user preference that should survive a reload.
 */

import { useSyncExternalStore } from "react";

export type AboutVersion = "one" | "two";

let version: AboutVersion = "one";
const listeners = new Set<() => void>();

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function getSnapshot(): AboutVersion {
  return version;
}

// Server-rendered markup always starts on version one; the client picks up
// whatever's live in the module after hydration via the subscription above.
function getServerSnapshot(): AboutVersion {
  return "one";
}

export function setAboutVersion(next: AboutVersion) {
  if (version === next) return;
  version = next;
  listeners.forEach((cb) => cb());
}

export function useAboutVersion(): [AboutVersion, (next: AboutVersion) => void] {
  const value = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return [value, setAboutVersion];
}
