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
 * Rigging logo above the clouds. 386 4K frames total as encoded, Adobe
 * Media Encoder export, at ~1vh of scroll per frame.
 *
 * TRIMMED TO THE JOBSITE FOOTAGE ONLY (2026-09-10, on request, matching the
 * same cut made to heroSequence.ts's V5): `count` cut from 386 to 286 —
 * frames 286–385 (the camera pulling back through a macro shot of the
 * branded plate to the static logo over clouds) no longer play. Ends on the
 * last clean jobsite frame instead, straight on to Family of Companies.
 * Frames 286–385 are unused but left on disk in frames-v3/, not deleted.
 * `sectionVh` rescaled to the trimmed count, same ratio as before: 480 ×
 * 286⁄386 ≈ 356.
 */
export const SEQUENCE_V3: HeroSequence = {
  dir: "/video/frames-v3",
  start: 0,
  count: 286,
  sectionVh: 356,
};

/** The sequence the hero renders. */
export const ACTIVE_SEQUENCE = SEQUENCE_V3;

/** Zero-padded public URL for a frame index, in the original JPEGs — kept
 *  around because `frames-v3/` is the source `scripts/encode-v3-webp.mjs`
 *  reads from, not because anything still serves it to a browser. */
export const framePath = (seq: HeroSequence, n: number) =>
  `${seq.dir}/${String(n).padStart(5, "0")}.jpg`;

/**
 * PRE-ENCODED, SERVED STATIC (2026-09-11, replacing a live `/_next/image`
 * re-encode) — on request, after "the local host link loading time [is]
 * taking too long": every frame used to route through Next's image
 * optimizer to get re-encoded from JPEG to WebP on the fly per request.
 * That's real, measured work (median ~273ms, some over 500ms) that a dev
 * server repeats on every cold load, times 286 frames — nothing was ever
 * cached ahead of time. `scripts/encode-v3-webp.mjs` now does that exact
 * same JPEG→WebP re-encode (quality 60, no resize — 1280 is already the
 * frames' native width) once, offline, with `sharp` directly (the same
 * library the optimizer itself uses under the hood), writing the output to
 * `public/video/frames-v3-webp/`. This just serves that output as a static
 * file — same approach V5 already uses for its own frames (see
 * heroSequence.ts), and the same output the optimizer used to produce, just
 * computed ahead of time instead of on every request. Re-run the script if
 * `frames-v3/`'s source JPEGs or `SEQUENCE_V3.count` ever change.
 */
export const optimizedFramePath = (seq: HeroSequence, n: number) =>
  `${seq.dir}-webp/${String(n).padStart(5, "0")}.webp`;
