/**
 * HERO FRAME SEQUENCE — which image sequence the scroll-scrub hero plays.
 *
 * Only the active sequence ships — everything else is fully removed, not
 * just unreferenced, to keep the project folder to just what's live. V1
 * (dark crawler-crane) and V2 (tower crane over a city skyline) went this
 * way on 2026-08-06. V3 (JPEG, replaced by V4 on 2026-08-17), V4 (WebP,
 * replaced by V5 on 2026-08-25), and V5 itself (replaced by V6 on
 * 2026-09-17) each had their `public/video/frames-vN` directory and
 * matching master video moved out to `../hero-video-archive` (a sibling of
 * the project directory) once replaced — to shrink the project folder
 * rather than the repo specifically. Their `HeroSequence` consts are
 * deleted here too, once nothing in public/ backs them.
 *
 * Masters live outside public/ (anything under public/ is served to
 * browsers) — genuinely outside the project folder entirely, per the above,
 * rather than merely gitignored-but-present.
 *
 * Re-encode with scripts/encode-hero-frames.sh, passing the master directory
 * as its first argument — NOTE this script is stale, JPEG-only, and expects
 * pre-extracted numbered frames rather than a raw video; V5 and V6 were both
 * produced with a direct ffmpeg pipeline instead (audio stripped, scaled to
 * 1280px wide, libwebp q:v 40). See V6's own comment below for the exact
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
 * "Hero Section 6" (2026-09-17, on request — "I have added Hero section
 * Video folder in our project folder, use that video, remove the current
 * video section replace with latest one"): new footage entirely, replacing
 * V5's scene outright. Two source clips ("Video 01.mp4", 10.04s; "Video
 * 02.mp4", 6.04s, both 3840×2160 HEVC @ 24fps) concatenated in numeric
 * order. Pipeline per clip, run twice sharing one output directory:
 * `ffmpeg -i <clip> -an -vf "scale=1280:-2:flags=lanczos" -c:v libwebp
 * -q:v 40 -compression_level 6 -start_number <n> frames-v6/%05d.webp` —
 * no `fps=24` filter this time (unlike V5): the source was already 24fps,
 * so an explicit fps filter would only risk dropping or duplicating frames
 * for no gain, on request ("ensuring that no frames are missed or
 * removed"). `-an` drops audio (both clips had a track). Video 02's
 * `-start_number` picks up at 241, exactly where Video 01's 241 frames
 * (00000–00240) end, keeping the numbering one continuous sequence. Same
 * q:v 40 as V5 — this footage is also 4K-sourced and compresses to a
 * similar ~52KB/frame average. 386 frames total, ~20MB.
 *
 * Manual-scroll hero variant (HeroScrollExperienceManualScroll.tsx) was
 * removed the same request, on request ("remove the existing manual-scroll
 * hero and replace it with the auto-scroll hero only") — this sequence and
 * HeroScrollExperienceR3F.tsx are now the ONLY hero, no toggle between two.
 *
 * `sectionVh` scaled from V5's untrimmed 290-frame/443vh ratio (≈1.528
 * vh/frame, the same pace V5's own trim preserved): 386 × 1.528 ≈ 590.
 *
 * V6's own masters ("Video 01.mp4" / "Video 02.mp4") moved — see this
 * file's top docblock — from the repo-root `Hero section Video/` to
 * `../hero-video-archive/masters/Hero section Video/`.
 */
export const SEQUENCE_V6: HeroSequence = {
  dir: "/video/frames-v6",
  start: 0,
  count: 386,
  ext: "webp",
  sectionVh: 590,
};

/** The sequence the hero renders. */
export const ACTIVE_SEQUENCE = SEQUENCE_V6;

/** Zero-padded public URL for a frame index. */
export const framePath = (seq: HeroSequence, n: number) =>
  `${seq.dir}/${String(n).padStart(5, "0")}.${seq.ext}`;
