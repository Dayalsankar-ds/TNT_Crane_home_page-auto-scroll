/**
 * HERO VERSIONED — used to swap between the two hero implementations based
 * on heroVersionStore + the floating "Hero 1/2" toggle (HeroToggle.tsx,
 * previously rendered by layout.tsx).
 *
 * HERO ONE HIDDEN (2026-09-11, on request: "hide the hero version 1, keep
 * only hero version 2"). This now renders HeroScrollExperienceManualScroll
 * unconditionally — no version store, no toggle, no choice. Nothing was
 * deleted, per the explicit ask to keep hero one available for later:
 *
 *  - HeroScrollExperienceR3F.tsx, useHeroAutoScroll.ts, HeroToggle.tsx, and
 *    heroVersionStore.ts are all untouched and still on disk — just not
 *    imported by anything right now, so they carry no runtime cost.
 *  - layout.tsx no longer renders <HeroToggle /> (see that file for the
 *    removed block) — there is nothing left to toggle.
 *
 * TO BRING HERO ONE BACK: restore this file's previous body (`git log` this
 * file, or the commit around 2026-09-11's "hide hero one" change) — the
 * short version is re-import HeroScrollExperienceR3F and useHeroVersion from
 * "./heroVersionStore", branch on `heroVersion === "one"` again, and re-add
 * `<HeroToggle />` to layout.tsx.
 *
 * Was previously keyed by version (`key="hero-one"` / `key="hero-two"`) so
 * switching remounted the hero fresh rather than reusing state across two
 * components with different internals — moot with only one hero rendered,
 * but worth restoring alongside the toggle if hero one comes back.
 */

import HeroScrollExperienceManualScroll from "@/components/HeroScrollExperienceManualScroll";

export default function HeroVersioned() {
  return <HeroScrollExperienceManualScroll />;
}
