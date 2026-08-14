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
  // Added 2026-07-30 — Fleet Guide swap to real-crane photography matching
  // the Section 2 mood (moody sunset/silhouette industrial shots), replacing
  // generic placeholders for 5 of 7 classes. All-Terrain and Rough-Terrain
  // kept on their original placeholders: every "all-terrain/rough-terrain
  // crane" tagged photo on Unsplash turned out to be a mislabeled excavator,
  // lift, or toy model — no genuine match found, confirmed with the user.
  crawlerCraneReal: "photo-1761896171748-ca4e9c81b5de",
  boomTruckReal: "photo-1662996432025-08bab8202d1b",
  towerCraneReal: "photo-1752233253959-551cc7dcc7ad",
  forkliftWarehouse: "photo-1714627798569-b3e36d409c4b",
  heavyLiftCraneReal: "photo-1553048686-e3d0396506b9",
} as const;

/**
 * FLEET GUIDE — owned photography (added 2026-08-04), one per class.
 *
 * Local paths under `public/`, not Unsplash IDs, so these do NOT go through
 * `IMG()`: they are served from this origin and sized by `next/image` at the
 * call site. Source files are TNT-branded sunset renders at 1254×1254 and
 * 2.2–2.6MB apiece — far too heavy to ship raw, which is why EquipmentGuide
 * uses `next/image` rather than the plain `<img>` the Unsplash URLs allowed
 * (Unsplash was doing the resizing server-side; here it is ours to do).
 *
 * SQUARE originals in a 4:3 card. `object-cover` centre-crops ~12.5% off the
 * top and bottom — verified acceptable on these compositions (the machine sits
 * mid-frame with sky above), but it does clip the very tip of the crawler's
 * boom. Swap the card to `aspect-square` if that tip matters more than the
 * card proportion.
 */
export const FLEET_PHOTOS = {
  crawlerCranes: "/photos/fleet/crawler-cranes.png",
  allTerrainCranes: "/photos/fleet/all-terrain-cranes.png",
  roughTerrainCranes: "/photos/fleet/rough-terrain-cranes.png",
  boomTrucks: "/photos/fleet/boom-trucks.png",
  towerCranes: "/photos/fleet/tower-cranes.png",
  carryDeckIndustrial: "/photos/fleet/carry-deck-industrial.png",
  heavyLiftGantry: "/photos/fleet/heavy-lift-gantry.png",
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
