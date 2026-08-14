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

// The 16 branches the project already published, plus Odessa and San Antonio.
const SEEDS: Seed[] = [
  { id: "hou", city: "Houston, TX", state: "Texas", region: "Gulf Coast", brand: "TNT Crane & Rigging", country: "US", lat: 29.7604, lng: -95.3698 },
  { id: "cor", city: "Corpus Christi, TX", state: "Texas", region: "Gulf Coast", brand: "TNT Crane & Rigging", country: "US", lat: 27.8006, lng: -97.3964 },
  { id: "bat", city: "Baton Rouge, LA", state: "Louisiana", region: "Gulf Coast", brand: "TNT Crane & Rigging", country: "US", lat: 30.4515, lng: -91.1871 },
  { id: "dal", city: "Dallas, TX", state: "Texas", region: "South Central", brand: "TNT Crane & Rigging", country: "US", lat: 32.7767, lng: -96.797 },
  { id: "sat", city: "San Antonio, TX", state: "Texas", region: "South Central", brand: "TNT Crane & Rigging", country: "US", lat: 29.4241, lng: -98.4936 },
  { id: "ods", city: "Odessa, TX", state: "Texas", region: "Permian Basin", brand: "Allison Crane & Rigging", country: "US", lat: 31.8457, lng: -102.3676 },
  { id: "den", city: "Denver, CO", state: "Colorado", region: "Rocky Mountain", brand: "RMS Cranes", country: "US", lat: 39.7392, lng: -104.9903 },
  { id: "phx", city: "Phoenix, AZ", state: "Arizona", region: "Southwest", brand: "TNT Crane & Rigging", country: "US", lat: 33.4484, lng: -112.074 },
  { id: "lax", city: "Long Beach, CA", state: "California", region: "West Coast", brand: "TNT Crane & Rigging", country: "US", lat: 33.7701, lng: -118.1937 },
  { id: "sea", city: "Seattle, WA", state: "Washington", region: "Pacific NW", brand: "TNT Crane & Rigging", country: "US", lat: 47.6062, lng: -122.3321 },
  { id: "bil", city: "Billings, MT", state: "Montana", region: "Northern Rockies", brand: "JMS Crane & Rigging", country: "US", lat: 45.7833, lng: -108.5007 },
  { id: "chi", city: "Chicago, IL", state: "Illinois", region: "Midwest", brand: "TNT Crane & Rigging", country: "US", lat: 41.8781, lng: -87.6298 },
  { id: "atl", city: "Atlanta, GA", state: "Georgia", region: "Southeast", brand: "Southway Crane & Rigging", country: "US", lat: 33.749, lng: -84.388 },
  { id: "pit", city: "Pittsburgh, PA", state: "Pennsylvania", region: "Northeast", brand: "Allison Crane & Rigging", country: "US", lat: 40.4406, lng: -79.9959 },
  { id: "van", city: "Vancouver, BC", state: "British Columbia", region: "British Columbia", brand: "Eagle West Cranes", country: "CA", lat: 49.2827, lng: -123.1207 },
  { id: "cal", city: "Calgary, AB", state: "Alberta", region: "Western Canada", brand: "TNT Canada", country: "CA", lat: 51.0447, lng: -114.0719 },
  { id: "edm", city: "Edmonton, AB", state: "Alberta", region: "Western Canada", brand: "TNT Canada", country: "CA", lat: 53.5461, lng: -113.4938 },
  { id: "tor", city: "Toronto, ON", state: "Ontario", region: "Eastern Canada", brand: "TNT Canada", country: "CA", lat: 43.6532, lng: -79.3832 },
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
