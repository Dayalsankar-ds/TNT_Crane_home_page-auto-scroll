// HERO REMOVED ENTIRELY 2026-09-23, on request (no more auto-scroll
// animation on the homepage). Unlike the 2026-09-18 hide (which left
// everything on disk), this deleted the hero outright: HeroVersioned.tsx,
// HeroScrollExperienceR3F.tsx, useHeroAutoScroll.ts, heroSequence.ts,
// HeroFamilyLogos.tsx, HeroFrameGL.tsx, HeroHeadline.tsx, the
// encode-hero-frames.sh/encode-hero-video.sh scripts, and every
// public/video/frames-v6/*.webp frame. The pre-R3F implementation is still
// further back in git history if ever needed: git show
// 5d89d04:src/components/HeroScrollExperience.tsx
// FamilyStripV2 rendered directly as of 2026-09-13, on request — Nav
// version 1's FamilyStrip.tsx (the diagonal-panel + 2x2 grid design) is
// hidden, unrendered on disk; see that file's own docblock for what's still
// there vs. what's live. FamilyStripV2 no longer depends on navVersion at
// all here — it renders regardless of which Nav version is active.
import FamilyStripV2 from "@/components/site/FamilyStripV2";
import StatementSection from "@/components/site/StatementSection";
import EquipmentGuide from "@/components/site/EquipmentGuide";
import CoreServices from "@/components/site/CoreServices";
import CoverageMap from "@/components/site/CoverageMap";
import SafetyCulture from "@/components/site/SafetyCulture";
import ContactSection from "@/components/site/ContactSection";
import RequestQuote from "@/components/site/RequestQuote";

/**
 * HOMEPAGE — the shortlisted Toyota-style arc (2026-07-27 trim, 21 → 9):
 * open cinematic → declare → what we do → catalog the machines (dark band) →
 * where we are → trust (iCARE) → prove it → convert. Everything
 * cut from here still ships on its own route (/about, /charts, /coverage,
 * /industries, /services, /careers, /for-sale, /contact) — the footer links
 * carry the secondary audiences.
 *
 * 2026-07-30: SafetyCulture (iCARE) added as a 10th section, between "prove
 * it" and "convert" — safety credentials land best immediately before the
 * ask, not earlier in the arc.
 *
 * 2026-08-21: SafetyCulture moved ahead of CaseStudies, on request — safety
 * credentials now land before the case-studies proof rather than after it.
 *
 * 2026-08-19: EquipmentGuide (Fleet Guide) moved to sit directly after
 * StatementSection, on request — the catalog now follows "who we are"
 * immediately.
 *
 * 2026-08-19 (later same day): CoreServices moved to sit directly after
 * StatementSection too, on request — it now lands ahead of Fleet Guide,
 * so "what we do" follows "who we are" before the equipment catalog.
 *
 * 2026-09-09: CoreServices moved back to sit immediately after
 * StatementSection (About Us) — Services now follows About Us directly.
 *
 * 2026-07-30 (later same day): a slim strip added right after the hero. First
 * built as CertificationsStrip (credential chips), but couldn't get real,
 * rights-cleared certification logos — repurposed as FamilyStrip instead:
 * TNT's own owned brand marks, no rights question. The certification chips
 * moved back to SafetyCulture, their original home — see that file's
 * docblock for the full back-and-forth.
 *
 * 2026-09-10: EquipmentFinder ("Find Your Machine") removed entirely, on
 * request — it used to sit here, between CoreServices and EquipmentGuide.
 * Its capacity-chart modal (CraneCapacityChart.tsx) and fleet data
 * (craneChartData.ts) were removed with it, since neither was used anywhere
 * else. The "Find Equipment" nav column that linked to it (navigation.ts)
 * was dropped too.
 */
export default function Home() {
  return (
    // Nav + footer live in the root layout; the homepage supplies content only.
    // `id="top"` stays — SiteNav's "Home" link targets it regardless of what
    // renders first. No offset-cancelling wrapper needed now that the hero
    // (which ran full-bleed beneath the fixed nav) is gone — <main>'s own
    // `pt-[var(--chrome-h)]` (see layout.tsx) handles the nav clearance.
    <div id="top">
        {/* Trust, fast — TNT's own family-of-companies logos up front now
            that the hero is gone. FamilyStripV2 only as of 2026-09-13 — see
            that file's own docblock. */}
        <FamilyStripV2 />

        {/* Manifesto + scale — Technical Paper opening statement (About Us) */}
        <StatementSection />

        {/* What we do — sits directly behind About Us (2026-09-09, on request). */}
        <CoreServices /> {/* services (compaction pending) */}

        {/* Fleet catalog — dark band #1, follows Services. */}
        <EquipmentGuide /> {/* rigging & attachments catalog — dark band #1 */}

        {/* Where we are */}
        <CoverageMap /> {/* nearest branch — dark band #2 (glass) */}

        {/* Case Studies hidden 2026-09-15, on request ("just hide, don't
            delete") — CaseStudies.tsx is untouched on disk, just unrendered;
            re-add `<CaseStudies />` here (between CoverageMap and
            SafetyCulture, same spot) if it comes back. The nav's About
            panel and the footer both still link to `/#projects` — that
            anchor (`id="projects"` in CaseStudies.tsx) no longer exists on
            the page while this is hidden, so those two links are inert
            until it's restored; left as-is since only the section itself
            was asked to hide. */}

        {/* Trust — iCARE safety program */}
        <SafetyCulture />

        {/* Convert — the dark finale */}
        <ContactSection /> {/* reach a human */}
        <RequestQuote /> {/* request a quote */}
    </div>
  );
}
