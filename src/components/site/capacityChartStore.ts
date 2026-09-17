"use client";

/**
 * CAPACITY CHART STORE — whether the full crane capacity chart modal
 * (CraneCapacityChart.tsx, opened from About the Fleet) is open.
 *
 * Added 2026-09-18, on request: the Fleet nav dropdown's closing CTA was
 * renamed to "View Full Capacity Chart" (see navigation.ts) to match the
 * button on the homepage section, and then asked to actually open the SAME
 * popup — not just scroll to the section and require a second click. The
 * modal's `open` boolean previously lived as local `useState` inside
 * EquipmentGuide.tsx; it's a shared module-level store now so SiteNav.tsx
 * (a completely separate component tree) can open it too.
 *
 * Session-only (no persistence) — a modal's open/closed state has no
 * business surviving a reload.
 *
 * Same plain-module + `useSyncExternalStore` pattern as the other stores
 * in this directory (colorSchemeStore.ts, themeVersionStore.ts, etc.).
 */

import { useSyncExternalStore } from "react";

let open = false;
const listeners = new Set<() => void>();

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function getSnapshot(): boolean {
  return open;
}

function getServerSnapshot(): boolean {
  return false;
}

export function setCapacityChartOpen(next: boolean) {
  if (open === next) return;
  open = next;
  listeners.forEach((cb) => cb());
}

export function useCapacityChartOpen(): [boolean, (next: boolean) => void] {
  const value = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return [value, setCapacityChartOpen];
}
