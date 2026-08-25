// R3F port of the hero (Phase 4). The pre-R3F implementation and its two
// .bak variants were deleted on 2026-08-06 in the dead-code sweep — they are
// in git history if a rollback is ever needed:
//   git show 5d89d04:src/components/HeroScrollExperience.tsx
import HeroScrollExperience from "@/components/HeroScrollExperienceR3F";
import FamilyStrip from "@/components/site/FamilyStrip";
import StatementSection from "@/components/site/StatementSection";
import EquipmentFinder from "@/components/site/EquipmentFinder";
import EquipmentGuide from "@/components/site/EquipmentGuide";
import CoreServices from "@/components/site/CoreServices";
import CoverageMap from "@/components/site/CoverageMap";
import CaseStudies from "@/components/site/CaseStudies";
import SafetyCulture from "@/components/site/SafetyCulture";
import ContactSection from "@/components/site/ContactSection";
import RequestQuote from "@/components/site/RequestQuote";

/**
 * HOMEPAGE — the shortlisted Toyota-style arc (2026-07-27 trim, 21 → 9):
 * open cinematic → declare → what we do → catalog the machines (dark band) →
 * find yours → where we are → trust (iCARE) → prove it → convert. Everything
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
 * immediately, ahead of EquipmentFinder's single-machine search.
 *
 * 2026-08-19 (later same day): CoreServices moved to sit directly after
 * StatementSection too, on request — it now lands ahead of Fleet Guide,
 * so "what we do" follows "who we are" before the equipment catalog.
 *
 * 2026-07-30 (later same day): a slim strip added right after the hero. First
 * built as CertificationsStrip (credential chips), but couldn't get real,
 * rights-cleared certification logos — repurposed as FamilyStrip instead:
 * TNT's own owned brand marks, no rights question. The certification chips
 * moved back to SafetyCulture, their original home — see that file's
 * docblock for the full back-and-forth.
 */
export default function Home() {
  return (
    // Nav + footer live in the root layout; the homepage supplies content only.
    // `-mt-[var(--chrome-h)]` cancels the offset <main> reserves for the fixed
    // nav on inner routes: the hero is deliberately full-bleed beneath the bar,
    // which stays hidden over it anyway.
    <div id="top" className="-mt-[var(--chrome-h)] bg-black text-white">
        {/* HERO — mechanism (scrub, pin, modes) is locked; do not restyle.
            Carries the page's <h1> as an opening overlay (HeroHeadline). */}
        <HeroScrollExperience />

        {/* Trust, fast — TNT's own family-of-companies logos right off the hero */}
        <FamilyStrip />

        {/* Manifesto + scale — Technical Paper opening statement */}
        <StatementSection />

        {/* What we do — sits directly behind the About/manifesto statement
            (2026-08-19, on request). */}
        <CoreServices /> {/* services (compaction pending) */}

        {/* Fleet catalog — dark band #1, follows Services. */}
        <EquipmentGuide /> {/* fleet catalog — dark band #1 */}

        {/* Qualify: full catalog seen, now find the machine */}
        <EquipmentFinder /> {/* find your machine */}

        {/* Where we are */}
        <CoverageMap /> {/* nearest branch — dark band #2 (glass) */}

        {/* Trust — iCARE safety program, moved ahead of Case Studies
            (2026-08-21, on request; was right before ContactSection). */}
        <SafetyCulture />

        {/* Proof — sticky-stack case studies */}
        <CaseStudies />

        {/* Convert — the dark finale */}
        <ContactSection /> {/* reach a human */}
        <RequestQuote /> {/* request a quote */}
    </div>
  );
}
