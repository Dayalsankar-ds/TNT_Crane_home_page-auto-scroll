/**
 * Verified dummy photography (Unsplash, free stock).
 * Every ID below was checked to return HTTP 200 / image/jpeg before use.
 * Swap for owned project photography (or next/image) before production.
 */

export const IMG = (id: string, w = 1100) =>
  `https://images.unsplash.com/${id}?fm=jpg&q=70&w=${w}&auto=format&fit=crop`;

export const PHOTOS = {
  craneSlab: "photo-1751054554594-85de2fe63e6b",
  craneGroup: "photo-1692101736757-579f547ec36a",
  siteCrane1: "photo-1684497404598-6e844dff9cde",
  siteCrane2: "photo-1609867271967-a82f85c48531",
  crewObserve: "photo-1751054720514-067105f538d4",
  workerFrame: "photo-1587582423116-ec07293f0395",
  refineryNight: "photo-1726111262949-e22631a8c376",
  plantNight: "photo-1670689334799-cdc6777db8cc",
  windTurbine: "photo-1662307412846-de8b3001b749",
  // FLEET GUIDE — real photography, one verified Unsplash photo per class
  // (2026-08-17, replacing the 2026-08-04 owned local renders — user wanted
  // genuine photos, not art). All 7 IDs below were downloaded and inspected
  // frame-by-frame before use, not just tag-matched — Unsplash's own crane
  // tags are unreliable (see All-Terrain/Rough-Terrain note below).
  crawlerCraneReal: "photo-1761896171748-ca4e9c81b5de",
  allTerrainCraneReal: "photo-1771679910145-3a368d7f537c",
  // Closest genuine match found for a rough-terrain/pick-and-carry crane —
  // Unsplash has no photo explicitly tagged & verified as one; this compact
  // 4-wheel off-road boom crane is the correct equipment class regardless.
  roughTerrainCraneReal: "photo-1748974467633-2e21ffd9dd94",
  // A genuine boom-truck crane (SANY, lattice boom folded on a flatbed).
  // Replaces an earlier utility bucket/cherry-picker truck that was the
  // wrong machine for this class.
  boomTruckReal: "photo-1780362959783-9373296db52b",
  towerCraneReal: "photo-1752233253959-551cc7dcc7ad",
  // Warehouse forklift — the closest real substitute for "Carry-Deck &
  // Industrial": Unsplash has no photo of an actual carry-deck crane (a
  // niche compact industrial crane), same dead-end as All-Terrain/
  // Rough-Terrain below.
  carryDeckIndustrialReal: "photo-1714627798569-b3e36d409c4b",
  // Ship-to-shore gantry cranes at a container terminal — replaces an
  // earlier pick that was really just another tower-crane silhouette and
  // read as a near-duplicate of towerCraneReal above.
  heavyLiftGantryReal: "photo-1784913106399-ebbc16033acc",
} as const;

/**
 * CASE STUDIES — owned photography (added 2026-08-04), one per job.
 *
 * Local paths, same arrangement as FLEET_PHOTOS: not Unsplash IDs, so these
 * bypass `IMG()` and are sized by `next/image` at the call site (originals are
 * ~1370×1147 and 1.8–2.3MB each).
 *
 * TNT-211 "Bridge Girder Set" is ABSENT — only three of the four jobs were
 * supplied. It stays on its Unsplash placeholder until a real one arrives,
 * which is why StickyStack still carries the remote-image path.
 */
export const CASE_PHOTOS = {
  refineryReactorExchange: "/photos/cases/tnt-142-refinery-reactor-exchange.png",
  windFarmTurbineErection: "/photos/cases/tnt-098-wind-farm-turbine-erection.png",
  petrochemicalVesselPlacement:
    "/photos/cases/tnt-176-petrochemical-vessel-placement.png",
} as const;

// Tonal fallbacks shown behind each photo — a dead URL degrades to a gradient,
// never a broken-image icon.
// Rebuilt on BLACK 2026-07-28 — the brand palette has no navy, and these
// gradients were the last place the retired #071034 survived. Key names kept so
// the call sites (EquipmentGuide, StickyStack, NumberedBlock) don't churn;
// `navy` now means "black stack". Maroon also corrected to the official
// #781514 — it still carried the pre-brand-kit #6e1f1a.
export const GRADIENTS = {
  navy: "linear-gradient(135deg, #000000 0%, #242424 100%)",
  slate: "linear-gradient(135deg, #1a1a1a 0%, #000000 100%)",
  maroon: "linear-gradient(135deg, #781514 0%, #1a1a1a 60%, #000000 100%)",
} as const;
