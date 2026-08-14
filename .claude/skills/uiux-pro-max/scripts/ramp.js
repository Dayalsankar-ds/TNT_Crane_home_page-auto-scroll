// OKLCH ramp generator + WCAG contrast verification
const srgbToLin = (c) => (c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
const linToSrgb = (c) => (c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055);

function hexToRgb(hex) {
  const h = hex.replace('#', '');
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
}
function rgbToHex([r, g, b]) {
  return '#' + [r, g, b].map((v) => Math.round(Math.max(0, Math.min(1, v)) * 255).toString(16).padStart(2, '0')).join('').toUpperCase();
}
function rgbToOklab([r, g, b]) {
  const R = srgbToLin(r), G = srgbToLin(g), B = srgbToLin(b);
  const l = Math.cbrt(0.4122214708 * R + 0.5363325363 * G + 0.0514459929 * B);
  const m = Math.cbrt(0.2119034982 * R + 0.6806995451 * G + 0.1073969566 * B);
  const s = Math.cbrt(0.0883024619 * R + 0.2817188376 * G + 0.6299787005 * B);
  return [
    0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s,
  ];
}
function oklabToRgb([L, A, B_]) {
  const l_ = L + 0.3963377774 * A + 0.2158037573 * B_;
  const m_ = L - 0.1055613458 * A - 0.0638541728 * B_;
  const s_ = L - 0.0894841775 * A - 1.2914855480 * B_;
  const l = l_ ** 3, m = m_ ** 3, s = s_ ** 3;
  return [
    linToSrgb(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
    linToSrgb(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
    linToSrgb(-0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s),
  ];
}
const inGamut = ([r, g, b]) => [r, g, b].every((v) => v >= -0.0001 && v <= 1.0001);

// Reduce chroma until the color fits sRGB (preserves hue + lightness)
function gamutFit(L, C, H) {
  let lo = 0, hi = C;
  for (let i = 0; i < 40; i++) {
    const mid = (lo + hi) / 2;
    const rgb = oklabToRgb([L, mid * Math.cos(H), mid * Math.sin(H)]);
    if (inGamut(rgb)) lo = mid; else hi = mid;
  }
  return oklabToRgb([L, lo * Math.cos(H), lo * Math.sin(H)]);
}
function relLum([r, g, b]) {
  const [R, G, B] = [r, g, b].map((v) => srgbToLin(Math.max(0, Math.min(1, v))));
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}
const contrast = (a, b) => {
  const [l1, l2] = [relLum(a), relLum(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
};

const SEED = process.argv[2] || '#C8102E';
const seedRgb = hexToRgb(SEED);
const [sL, sA, sB] = rgbToOklab(seedRgb);
const H = Math.atan2(sB, sA);
const seedC = Math.hypot(sA, sB);

console.log(`SEED ${SEED}  ->  OKLCH(${sL.toFixed(4)}, ${seedC.toFixed(4)}, ${(H * 180 / Math.PI + 360) % 360}deg)\n`);

// Lightness targets per step; chroma peaks mid-ramp and falls off at the ends
const steps = [
  [50, 0.971, 0.13], [100, 0.936, 0.22], [200, 0.885, 0.42], [300, 0.808, 0.62],
  [400, 0.706, 0.85], [500, sL, 1.0], [600, 0.508, 0.95], [700, 0.436, 0.82],
  [800, 0.375, 0.66], [900, 0.316, 0.52],
];

const white = [1, 1, 1], black = [0, 0, 0];
const rows = [];
for (const [name, L, cMul] of steps) {
  const rgb = gamutFit(L, seedC * cMul, H);
  const hex = rgbToHex(rgb);
  const cw = contrast(rgb, white), cb = contrast(rgb, black);
  const onWhite = cw >= 4.5 ? 'AA' : cw >= 3 ? 'AA-lg' : '--';
  const best = cw >= cb ? 'white' : 'black';
  const bestRatio = Math.max(cw, cb);
  rows.push({ name, hex, cw: cw.toFixed(2), cb: cb.toFixed(2), onWhite, best, bestRatio: bestRatio.toFixed(2) });
}
console.log('step   hex        vs-white  vs-black  text-as-fg-on-white  best-on-top');
for (const r of rows) {
  console.log(
    String(r.name).padEnd(6), r.hex.padEnd(10),
    r.cw.padStart(6), '  ', r.cb.padStart(6), '  ',
    r.onWhite.padEnd(19), `${r.best} (${r.bestRatio}:1)`
  );
}

// Dark-mode verification: contrast is NOT symmetric across themes.
// A step that passes on white routinely fails on a dark surface.
const darkSurfaces = {
  '#0A0A0A (base)': '#0A0A0A',
  '#121212 (raised)': '#121212',
  '#1C1C1E (card)': '#1C1C1E',
};
const verdict = (r) => (r >= 4.5 ? 'AA text' : r >= 3 ? 'AA large/UI only' : 'FAIL');

for (const [label, bg] of Object.entries(darkSurfaces)) {
  console.log(`\n=== as foreground on ${label} ===`);
  for (const r of rows) {
    const ratio = contrast(hexToRgb(r.hex), hexToRgb(bg));
    console.log(
      `  ${String(r.name).padEnd(4)} ${r.hex}  ${ratio.toFixed(2).padStart(5)}:1  ${verdict(ratio)}`
    );
  }
}

// findLast, not find: rows run 50→900, so we want the DARKEST (most saturated)
// step that still clears 4.5:1 — not the lightest, which would be a near-white tint.
const darkPick = rows.findLast((r) => contrast(hexToRgb(r.hex), hexToRgb('#1C1C1E')) >= 4.5);
const lightPick = rows.find((r) => Number(r.cw) >= 4.5);
console.log('\n--- recommended semantic mapping ---');
console.log(`  light-mode primary : brand-${lightPick ? lightPick.name : '??'} (${lightPick ? lightPick.hex : 'none passes'})`);
console.log(`  dark-mode  primary : brand-${darkPick ? darkPick.name : '??'} (${darkPick ? darkPick.hex : 'none passes'})`);
console.log('  Re-check on-color text direction before shipping.');
