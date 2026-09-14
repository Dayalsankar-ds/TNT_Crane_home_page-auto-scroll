// Re-encodes public/video/frames-v3/*.jpg (V3, the manual-scroll hero's
// footage) to public/video/frames-v3-webp/*.webp — quality 60, no resize
// (1280 is already the frames' native width). Run this from the project
// root (`node scripts/encode-v3-webp.mjs`) whenever frames-v3/'s source
// JPEGs change, or SEQUENCE_V3.count in heroSequenceManualScroll.ts is
// raised past the currently-encoded range.
//
// Replaces routing every frame through Next's `/_next/image` optimizer at
// request time (2026-09-11, on request: "the local host link loading time
// [is] taking too long") — see heroSequenceManualScroll.ts's own docblock
// for the full story. Uses the same `sharp` library and settings the
// optimizer itself used, just run once, offline, instead of on every load.

import sharp from "sharp";
import path from "node:path";
import { fileURLToPath } from "node:url";

const PROJECT_ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const SRC = path.join(PROJECT_ROOT, "public/video/frames-v3");
const DEST = path.join(PROJECT_ROOT, "public/video/frames-v3-webp");

// Matches SEQUENCE_V3.count in heroSequenceManualScroll.ts — only the frames
// actually used need encoding (frames-v3/ has 386 on disk, unused past 285).
const COUNT = 286;
const QUALITY = 60;
const CONCURRENCY = 8;

async function encodeOne(n) {
  const name = String(n).padStart(5, "0");
  await sharp(path.join(SRC, `${name}.jpg`))
    .webp({ quality: QUALITY })
    .toFile(path.join(DEST, `${name}.webp`));
}

async function pool(items, worker, concurrency) {
  let next = 0;
  const workers = Array.from({ length: concurrency }, async () => {
    while (next < items.length) {
      const i = next++;
      await worker(items[i]);
    }
  });
  await Promise.all(workers);
}

const start = Date.now();
const indices = Array.from({ length: COUNT }, (_, i) => i);
await pool(indices, encodeOne, CONCURRENCY);
console.log(
  `Encoded ${COUNT} frames to ${DEST} in ${((Date.now() - start) / 1000).toFixed(1)}s`,
);
