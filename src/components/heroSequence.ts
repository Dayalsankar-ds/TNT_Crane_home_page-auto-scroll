/**
 * HERO FRAME SEQUENCE — which image sequence the scroll-scrub hero plays.
 *
 * Only the active sequence ships — everything else is fully removed, not
 * just unreferenced, to keep the project folder to just what's live. V1
 * (dark crawler-crane) and V2 (tower crane over a city skyline) went this
 * way on 2026-08-06. V3 (JPEG, replaced by V4 on 2026-08-17) and V4 (WebP,
 * replaced by V5 on 2026-08-25) followed the same day V5 shipped: their
 * `public/video/frames-v3` / `frames-v4` directories and their masters
 * (previously the repo-root `Video/` folder — itself outside public/,
 * same reasoning as below, but still inside the project folder) were moved
 * out to `../hero-video-archive` (a sibling of the project directory) on
 * request, to shrink the project folder rather than the repo specifically —
 * `Video/` was already gitignored, so this didn't change what git tracked.
 * Their `HeroSequence` consts were deleted here too, once nothing in
 * public/ backed them.
 *
 * Masters live outside public/ (anything under public/ is served to
 * browsers) — now genuinely outside the project folder entirely, per the
 * above, rather than merely gitignored-but-present.
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
 * ~69KB/frame with no visible quality loss on inspection. 290 frames total
 * as encoded, ~20MB.
 *
 * TRIMMED TO CLIP 01 ONLY (2026-09-10, on request): `count` cut from 290 to
 * 193 — Clip 02 (frames 193–289: the camera pulling back from a macro shot
 * of the branded plate to the static "TNT CRANE & RIGGING" logo over
 * clouds) no longer plays at all, in either the manual scrub or the
 * auto-scroll hijack. The hero now ends on Clip 01's own last frame (real
 * jobsite footage) and goes straight on to Family of Companies from there.
 * Frames 193–289 are unused but left on disk in frames-v5/, not deleted —
 * ask if you also want those removed to shrink the repo.
 * `sectionVh` is rescaled to the trimmed count by the same ratio the
 * original 443 was derived by (480 × 290⁄314 ≈ 443): 443 × 193⁄290 ≈ 295,
 * preserving the ~1.53vh-per-frame scrub pace rather than leaving 97
 * frames' worth of scrub distance pinned on nothing.
 *
 * V5's own masters ("Clip 01.mp4" / "Clip 02.mp4") have since moved too —
 * see this file's top docblock — from the repo-root `Video/Updated video/`
 * to `../hero-video-archive/masters/Updated video/`.
 */
export const SEQUENCE_V5: HeroSequence = {
  dir: "/video/frames-v5",
  start: 0,
  count: 193,
  ext: "webp",
  sectionVh: 295,
};

/** The sequence the hero renders. */
export const ACTIVE_SEQUENCE = SEQUENCE_V5;

/** Zero-padded public URL for a frame index. */
export const framePath = (seq: HeroSequence, n: number) =>
  `${seq.dir}/${String(n).padStart(5, "0")}.${seq.ext}`;
