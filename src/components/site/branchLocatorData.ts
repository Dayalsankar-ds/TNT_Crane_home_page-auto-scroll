/**
 * BRANCH LOCATOR DATA — branches and their capabilities. Built on the SERVER.
 *
 * Branches store real lat/lng, which is what MapLibre consumes directly. That
 * choice already paid off once: this file previously projected every branch
 * into a dotted-map coordinate space, and swapping the backdrop for MapLibre
 * needed no change to the data at all.
 *
 * SERVICES come from navigation.ts via the operating brand, not a new table —
 * capability varies by operating company, and the mega panel already defines
 * it. One source, so the map and the nav can't disagree.
 */

import { servicesForRegion, type RegionId } from "./navigation";

export type Country = "US" | "CA";

type Seed = {
  id: string;
  city: string;
  /** Full state/province name, so "Texas" matches as well as "TX". */
  state: string;
  region: string;
  /** Operating TNT-family brand — the consolidation bridge. */
  brand: string;
  country: Country;
  lat: number;
  lng: number;
};

export type Branch = Seed & {
  /** Capabilities this branch's operating company actually offers. */
  services: string[];
};

/**
 * Capability scope by operating company. TNT-operated branches carry the full
 * scope (null = unrestricted); the acquired brands inherit their region's set.
 */
const BRAND_REGION: Record<string, RegionId | null> = {
  "TNT Crane & Rigging": null,
  "TNT Canada": "western-canada",
  "RMS Cranes": "rocky-mountain",
  "JMS Crane & Rigging": "northern-rockies",
  "Southway Crane & Rigging": "southeast",
  "Allison Crane & Rigging": "northeast-permian",
  "Eagle West Cranes": "western-canada",
};

// The 16 TNT branches with complete location details
const SEEDS: Seed[] = [
  { id: "aus", city: "Austin, TX", state: "Texas", region: "Central Texas", brand: "TNT Crane & Rigging", country: "US", lat: 30.2672, lng: -97.7431 },
  { id: "bea", city: "Beaumont, TX", state: "Texas", region: "Southeast Texas", brand: "TNT Crane & Rigging", country: "US", lat: 30.0656, lng: -94.1277 },
  { id: "bud", city: "Buda, TX", state: "Texas", region: "Central Texas", brand: "TNT Crane & Rigging", country: "US", lat: 30.2499, lng: -97.8604 },
  { id: "cor", city: "Corpus Christi, TX", state: "Texas", region: "Gulf Coast", brand: "TNT Crane & Rigging", country: "US", lat: 27.8006, lng: -97.3964 },
  { id: "dal", city: "Dallas, TX", state: "Texas", region: "North Texas", brand: "TNT Crane & Rigging", country: "US", lat: 32.7767, lng: -96.797 },
  { id: "edi", city: "Edinburg, TX", state: "Texas", region: "Rio Grande Valley", brand: "TNT Crane & Rigging", country: "US", lat: 26.3064, lng: -97.8377 },
  { id: "ftw", city: "Fort Worth, TX", state: "Texas", region: "North Texas", brand: "TNT Crane & Rigging", country: "US", lat: 32.7555, lng: -97.3308 },
  { id: "fre", city: "Freeport, TX", state: "Texas", region: "Brazoria", brand: "TNT Crane & Rigging", country: "US", lat: 28.9532, lng: -95.3368 },
  { id: "hou", city: "Houston, TX", state: "Texas", region: "Gulf Coast", brand: "TNT Crane & Rigging", country: "US", lat: 29.7604, lng: -95.3698 },
  { id: "mid", city: "Midland, TX", state: "Texas", region: "Permian Basin", brand: "TNT Crane & Rigging", country: "US", lat: 31.9973, lng: -102.0779 },
  { id: "nor", city: "Norco, LA", state: "Louisiana", region: "Gulf Coast", brand: "TNT Crane & Rigging", country: "US", lat: 30.2202, lng: -90.7506 },
  { id: "okc", city: "Oklahoma City, OK", state: "Oklahoma", region: "Central Oklahoma", brand: "TNT Crane & Rigging", country: "US", lat: 35.4676, lng: -97.5164 },
  { id: "pam", city: "Pampa, TX", state: "Texas", region: "Texas Panhandle", brand: "TNT Crane & Rigging", country: "US", lat: 35.5427, lng: -100.9896 },
  { id: "sat", city: "San Antonio, TX", state: "Texas", region: "South Central", brand: "TNT Crane & Rigging", country: "US", lat: 29.4241, lng: -98.4936 },
  { id: "stj", city: "St James, LA", state: "Louisiana", region: "Gulf Coast", brand: "TNT Crane & Rigging", country: "US", lat: 30.2072, lng: -90.8486 },
  { id: "tul", city: "Tulsa, OK", state: "Oklahoma", region: "Northeast Oklahoma", brand: "TNT Crane & Rigging", country: "US", lat: 36.1539, lng: -95.9928 },
];

export type BranchLocatorData = {
  branches: Branch[];
};

export function buildBranchLocator(): BranchLocatorData {
  return {
    branches: SEEDS.map((b) => ({
      ...b,
      services: servicesForRegion(BRAND_REGION[b.brand] ?? null),
    })),
  };
}
