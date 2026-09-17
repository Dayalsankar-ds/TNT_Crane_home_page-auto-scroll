/**
 * HERO VERSIONED — thin wrapper kept so `page.tsx` doesn't need to change
 * if the hero implementation changes again; not a real "versioned" switch
 * any more.
 *
 * MANUAL-SCROLL HERO REMOVED, AUTO-SCROLL HERO IS NOW THE ONLY ONE
 * (2026-09-17, on request — "remove the existing manual-scroll hero and
 * replace it with the auto-scroll hero only"): this used to render
 * HeroScrollExperienceManualScroll (with HeroScrollExperienceR3F sitting
 * unused on disk behind a since-removed "Hero 1/2" toggle, see prior
 * history via `git log` on this file). HeroScrollExperienceManualScroll.tsx,
 * heroSequenceManualScroll.ts, useHeroAutoScrollManualScroll.ts,
 * heroVersionStore.ts, and HeroToggle.tsx were all deleted outright in the
 * same request — there is only one hero now, no toggle, no version store.
 */

import HeroScrollExperienceR3F from "@/components/HeroScrollExperienceR3F";

export default function HeroVersioned() {
  return <HeroScrollExperienceR3F />;
}
