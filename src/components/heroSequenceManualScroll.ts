/**
 * HERO FRAME SEQUENCE — which image sequence the scroll-scrub hero plays.
 *
 * MANUAL-SCROLL VARIANT (copied 2026-09-08 from the sibling
 * TNT_Crane_home_page-manual-scroll project, as a second hero version to sit
 * alongside heroSequence.ts's V5). Deliberately renamed rather than merged
 * into heroSequence.ts, so the two frame sequences and their consumers stay
 * fully independent.
 *
 * Only the active sequence ships. Two earlier cuts (V1, a dark crawler-crane
 * sequence; V2, a tower crane over a city skyline) were removed on 2026-08-06
 * to shrink the repo — their frames and masters are no longer in the project.
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
  sectionVh: 480,
};

/** The sequence the hero renders. */
export const ACTIVE_SEQUENCE = SEQUENCE_V3;

/** Zero-padded public URL for a frame index. */
export const framePath = (seq: HeroSequence, n: number) =>
  `${seq.dir}/${String(n).padStart(5, "0")}.jpg`;

// Must match an entry in next.config.ts's images.deviceSizes / images.qualities
// — the optimizer 400s on a w=/q= it wasn't configured to allow. 1280 is the
// frames' native width, so this is a format re-encode, not a resize.
const OPT_WIDTH = 1280;
const OPT_QUALITY = 60;

/**
 * Same frame, routed through Next's built-in image optimizer (`sharp`,
 * already a transitive dep of `next`) instead of served raw from `public/`.
 * Re-encodes the JPEG to WebP/AVIF on the fly, which is what actually shrinks
 * the 386-frame preload — no ffmpeg or master footage required to get this
 * win, unlike re-encoding the source frames themselves.
 */
export const optimizedFramePath = (seq: HeroSequence, n: number) =>
  `/_next/image?url=${encodeURIComponent(framePath(seq, n))}&w=${OPT_WIDTH}&q=${OPT_QUALITY}`;
