"use client";

/**
 * HERO VERSIONED — swaps between the two hero implementations based on
 * heroVersionStore. The floating toggle that drives it (HeroToggle) is
 * rendered separately, by layout.tsx — see that file's docblock.
 *
 * Keyed by version so switching remounts the hero fresh (fresh frame
 * preload, fresh scroll-mode detection) rather than reusing state across
 * two components with different internals.
 */

import HeroScrollExperienceR3F from "@/components/HeroScrollExperienceR3F";
import HeroScrollExperienceManualScroll from "@/components/HeroScrollExperienceManualScroll";
import { useHeroVersion } from "./heroVersionStore";

export default function HeroVersioned() {
  const [heroVersion] = useHeroVersion();

  return heroVersion === "one" ? (
    <HeroScrollExperienceR3F key="hero-one" />
  ) : (
    <HeroScrollExperienceManualScroll key="hero-two" />
  );
}
