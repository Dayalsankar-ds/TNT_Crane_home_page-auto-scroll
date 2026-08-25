/**
 * HERO FRAME SEQUENCE — which image sequence the scroll-scrub hero plays.
 *
 * Only the active sequence ships. Two earlier cuts (V1, a dark crawler-crane
 * sequence; V2, a tower crane over a city skyline) were removed on 2026-08-06
 * to shrink the repo — their frames and masters are no longer in the project.
 * V3 (JPEG) was replaced by V4 (WebP, same scene) on 2026-08-17; its frames
 * remain in public/video/frames-v3 but are unreferenced. V4 was replaced by
 * V5 on 2026-08-25; its frames remain in public/video/frames-v4, also
 * unreferenced now.
 *
 * Masters live outside public/ (anything under public/ is served to browsers),
 * and are not kept in this repo. V5's masters ("Clip 01.mp4" / "Clip 02.mp4",
 * supplied 2026-08-25) were extracted straight from
 * `Video/Updated video/` at the repo root, which is itself outside public/
 * for the same reason — worth moving out of the repo entirely if that
 * directory sticks around.
 *
 * Re-encode with scripts/encode-hero-frames.sh, passing the master directory
 * as its first argument — NOTE this script is stale, JPEG-only, and expects
 * pre-extracted numbered frames rather than a raw video; V5 was produced with
 * a direct ffmpeg pipeline instead (audio stripped, scaled to 1280px wide,
 * libwebp q:v 40). See the V5 sequence's own comment below for the exact
 * command shape.
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

/**
 * "Hero Section 5" (2026-08-25, on request): new footage entirely — two
 * fresh source clips ("Clip 01.mp4", 8.08s; "Clip 02.mp4", 4.09s, both
 * 1920×1080 @ 24fps with audio) concatenated in numeric order into one
 * sequence, replacing V4's scene outright rather than re-cutting it.
 * Pipeline per clip: `ffmpeg -i <clip> -an -vf "fps=24,scale=1280:-2:
 * flags=lanczos" -c:v libwebp -q:v 40 -compression_level 6 -start_number
 * <n> frames-v5/%05d.webp` — `-an` drops the audio track (both source
 * clips had one), the two ffmpeg runs share one output directory with
 * Clip 02's `-start_number` picking up where Clip 01 left off (193) so the
 * numbering stays one continuous sequence. q:v 40 was chosen empirically:
 * V4 averaged ~70KB/frame and this footage compressed heavier at the same
 * quality setting (~103KB/frame at q:v 75) — q:v 40 brought it back to
 * ~69KB/frame with no visible quality loss on inspection. 290 frames,
 * ~20MB total. `sectionVh` is scaled from V4's 480vh by the frame-count
 * ratio (480 × 290⁄314 ≈ 443) to preserve the same ~1.53vh-per-frame scrub
 * pace rather than carrying V4's absolute value over unchanged.
 */
export const SEQUENCE_V5: HeroSequence = {
  dir: "/video/frames-v5",
  start: 0,
  count: 290,
  ext: "webp",
  sectionVh: 443,
};

/** The sequence the hero renders. */
export const ACTIVE_SEQUENCE = SEQUENCE_V5;

/** Zero-padded public URL for a frame index. */
export const framePath = (seq: HeroSequence, n: number) =>
  `${seq.dir}/${String(n).padStart(5, "0")}.${seq.ext}`;
