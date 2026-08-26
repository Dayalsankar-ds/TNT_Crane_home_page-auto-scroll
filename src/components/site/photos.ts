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
  // RIGGING & ATTACHMENTS — see RIGGING_PHOTOS below for the real,
  // locally-hosted set added 2026-08-26 (later same day). This Unsplash-only
  // set was the FIRST pass and undersold what's actually available: Unsplash
  // genuinely has poor rigging-hardware coverage, but that conclusion never
  // should have generalized to "only 3 categories possible" — tntcrane.com
  // and rmscranes.com's own service pages, not checked at the time, turned
  // out to have plenty. overheadBridgeCraneReal is the one category still
  // without a found real substitute, so it's the only survivor still in use.
  hookBlockReal: "photo-1718738002405-b149aac720bf",
  gantryCraneReal: "photo-1781156215091-4133052708d0",
  overheadBridgeCraneReal: "photo-1784916313628-d6525ab2199f",
} as const;

/**
 * RIGGING & ATTACHMENTS — real TNT/RMS photography (2026-08-26, correcting
 * the Unsplash-only pass above). Sourced from tntcrane.com and rmscranes.com
 * (RMS Cranes is "A TNT Company") service pages, downloaded and inspected
 * before use:
 *   - hydraulicGantry: TNT-branded hydraulic gantry setting a heavy
 *     concrete/vessel-sized load (tntcrane.com, Gantry_Banner — a wider crop
 *     of the same job CASE_PHOTOS.petrochemicalVesselPlacement uses)
 *   - cantileverSpreaderBar: a TNT-branded cantilever bar rigged off a
 *     crawler crane's hook, lifting flush against a high-rise facade
 *     (tntcrane.com, Rigging_Cantilever_Old_1) — stands in for
 *     below-the-hook lifting devices generally, since a cantilever bar is
 *     one, rather than keeping a separate, less specific Unsplash card for
 *     the same equipment family
 *   - spmtModularTransport: a Goldhofer SPMT hauling a large transformer
 *     (tntcrane.com, Rigging_Goldhofer_SPMT_Transformer_2025_1)
 *   - jackAndSlide: a jack-and-slide operation leveling equipment on skid
 *     rails, RMS-stenciled timber cribbing visible (tntcrane.com,
 *     Rigging_Jacking_Sliding_2025_1)
 *   - versaLiftMachineryMoving: a TNT-branded Versa-Lift moving a
 *     Siemens transformer (tntcrane.com, TNT-Machinery-Moving_Versa-Lift-
 *     25-35_Siemens_2560x1440)
 *
 * NOT included: a photo filed under "…Personnel…" (Rigging_Buda_Manitou_
 * Personnel) turned out to show a Manitou forklift loading HVAC units, not
 * a man-basket/personnel platform — the filename was misleading. Using it
 * under a "Personnel Lift" label would have mislabeled real footage, which
 * is worse than the label not existing, so it was left out rather than
 * force-fit.
 */
export const RIGGING_PHOTOS = {
  hydraulicGantry: "/photos/rigging/hydraulic-gantry.jpg",
  cantileverSpreaderBar: "/photos/rigging/cantilever-spreader-bar.jpg",
  spmtModularTransport: "/photos/rigging/spmt-modular-transport.jpg",
  jackAndSlide: "/photos/rigging/jack-and-slide.jpg",
  versaLiftMachineryMoving: "/photos/rigging/versa-lift-machinery-moving.jpg",
} as const;

/**
 * CASE STUDIES — real TNT photography, one per job (2026-08-26, replacing
 * the earlier three generic stock renders + one Unsplash placeholder — none
 * of the four previously showed actual TNT equipment on a real job site).
 * All four sourced from tntcrane.com's own uploads (one, the wind farm
 * erection, from rmscranes.com — RMS Cranes is "A TNT Company"), downloaded
 * and inspected before use, same rigor as the Fleet Guide photos:
 *   - refineryReactorExchange: a Liebherr LR1500 crawler crane rigged at a
 *     refinery/gas-plant site (tntcrane.com, Heavy-Lift_Demethanizer-Lift-1)
 *   - windFarmTurbineErection: two crawler cranes stepping a wind-tower
 *     section into place, blades and nacelle staged nearby (rmscranes.com,
 *     RMS-Cranes-Wind-Tower-Construction)
 *   - bridgeGirderSet: a TNT-branded all-terrain crane setting a girder
 *     over water (tntcrane.com, 900-Ton_Bridge-Girders_2024) — this job
 *     previously had no real photo at all and ran on an Unsplash placeholder
 *   - petrochemicalVesselPlacement: a TNT-branded hydraulic gantry lifting a
 *     vessel-sized load (tntcrane.com, Gantry_Old_1)
 *
 * None is an exact tonnage/technique match for its story's copy (the copy
 * itself is still placeholder narrative per this file's other case-photo
 * notes) — each is a genuine TNT job in the right category (refinery/plant,
 * wind, bridge, gantry), not a fabricated or mismatched stand-in.
 *
 * Local paths, same arrangement as FLEET_PHOTOS: not Unsplash IDs, so these
 * bypass `IMG()` and are sized by `next/image` at the call site.
 */
export const CASE_PHOTOS = {
  refineryReactorExchange: "/photos/cases/tnt-142-refinery-reactor-exchange.jpg",
  windFarmTurbineErection: "/photos/cases/tnt-098-wind-farm-turbine-erection.jpg",
  bridgeGirderSet: "/photos/cases/tnt-211-bridge-girder-set.jpg",
  petrochemicalVesselPlacement:
    "/photos/cases/tnt-176-petrochemical-vessel-placement.jpg",
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
