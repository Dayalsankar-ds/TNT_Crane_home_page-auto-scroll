/**
 * HERO FRAME SEQUENCE — which image sequence the scroll-scrub hero plays.
 *
 * Only the active sequence ships. Two earlier cuts (V1, a dark crawler-crane
 * sequence; V2, a tower crane over a city skyline) were removed on 2026-08-06
 * to shrink the repo — their frames and masters are no longer in the project.
 * V3 (JPEG) was replaced by V4 (WebP, same scene) on 2026-08-17; its frames
 * remain in public/video/frames-v3 but are unreferenced.
 *
 * Masters live outside public/ (anything under public/ is served to browsers),
 * and are not kept in this repo. Re-encode with scripts/encode-hero-frames.sh,
 * passing the master directory as its first argument.
 */

export type HeroSequence = {
  /** Public path of the encoded frames, no trailing slash. */
  dir: string;
  /** Index of the first frame file. */
  start: number;
  /** How many frames in the sequence. */
  count: number;
  /** File extension of the encoded frames (no dot). */
  ext: string;
  /**
   * Total section height in vh. The sticky child is 100vh, so the scrub
   * distance is (vh − 100). Tune per sequence: too much height over too few
   * frames makes the scrub feel steppy and the hero overstay.
   */
  sectionVh: number;
};

/**
 * "Hero Section 3": drone flythrough over a TNT job site at dusk (crawler
 * crane setting a load, aerial site pass), resolving to the TNT Crane &
 * Rigging logo above the clouds. 386 4K frames, Adobe Media Encoder export,
 * at ~1vh of scroll per frame.
 */
export const SEQUENCE_V3: HeroSequence = {
  dir: "/video/frames-v3",
  start: 0,
  count: 386,
  ext: "jpg",
  sectionVh: 480,
};

/**
 * "Hero Section 4": same dusk drone-flythrough/logo-reveal scene as V3, re-cut
 * from its two source clips and re-encoded as WebP (2026-08-17) — 314 frames
 * at 1280px wide, ~22MB total versus V3's 386 JPEG frames at ~51MB. `sectionVh`
 * is kept identical to V3 so the scroll-trigger mechanics (pin distance,
 * auto-scroll arm/disarm points) are unchanged; only the image asset differs.
 */
export const SEQUENCE_V4: HeroSequence = {
  dir: "/video/frames-v4",
  start: 0,
  count: 314,
  ext: "webp",
  sectionVh: 480,
};

/** The sequence the hero renders. */
export const ACTIVE_SEQUENCE = SEQUENCE_V4;

/** Zero-padded public URL for a frame index. */
export const framePath = (seq: HeroSequence, n: number) =>
  `${seq.dir}/${String(n).padStart(5, "0")}.${seq.ext}`;
