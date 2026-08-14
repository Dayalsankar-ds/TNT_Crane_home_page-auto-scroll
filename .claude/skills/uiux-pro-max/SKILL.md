---
name: uiux-pro-max
description: Professional UI/UX design standards — 8pt spacing grid, typography pairing and scale, OKLCH palette generation from a brand seed, mobile-first breakpoints, micro-interaction timing, WCAG 2.1 AA compliance, and dark mode. Use when designing or reviewing any interface, choosing spacing/type/color values, building design tokens, or auditing accessibility and contrast.
---

# UI/UX Pro Max

Design standards for production interfaces. Every contrast ratio in this file was computed, not estimated — see "Verifying contrast" to recheck after changing the seed.

---

## 1. The 8pt spacing grid

All spacing, sizing, and layout dimensions are multiples of **8px**. Use 4px only for optical adjustments inside small components (icon-to-label gaps, badge padding).

| Token | px | Typical use |
|---|---|---|
| `space-0.5` | 4 | Icon↔label, tight inline gaps |
| `space-1` | 8 | Inside compact controls |
| `space-2` | 16 | Default element gap, card padding (mobile) |
| `space-3` | 24 | Card padding (desktop), form field spacing |
| `space-4` | 32 | Between related groups |
| `space-6` | 48 | Between sections |
| `space-8` | 64 | Major section breaks |
| `space-12` | 96 | Page-level vertical rhythm |
| `space-16` | 128 | Hero / landing whitespace |

**Rules**

- Never invent an off-grid value. If 8 is too tight and 16 too loose, the component's internal structure is wrong — fix that, don't add `12px`.
- Touch targets are **minimum 44×44px** (WCAG 2.5.5 / iOS HIG). A 24px icon needs 10px padding on each side to qualify.
- Grid gutters: 16px mobile, 24px tablet, 32px desktop.
- Border radius runs its own scale — it is not on the 8pt grid: `4` (inputs, chips), `8` (buttons, cards), `12` (modals), `16` (sheets), `9999` (pills, avatars).

---

## 2. Typography

### Scale

Base 16px, ~1.25 modular ratio. Every line-height is a multiple of 4 so text blocks land on the grid.

| Token | Size / Line-height | Weight | Use |
|---|---|---|---|
| `text-xs` | 12 / 16 | 500 | Captions, legal, timestamps |
| `text-sm` | 14 / 20 | 400–500 | Secondary text, table cells, labels |
| `text-base` | 16 / 24 | 400 | Body copy — **never go below 16 for body** |
| `text-lg` | 20 / 28 | 400–500 | Lead paragraphs, card titles |
| `text-xl` | 24 / 32 | 600 | Section headings (h3) |
| `text-2xl` | 32 / 40 | 600 | Page headings (h2) |
| `text-3xl` | 40 / 48 | 700 | Hero headings (h1) |
| `text-4xl` | 48 / 56 | 700 | Display |
| `text-5xl` | 64 / 72 | 700–800 | Marketing display only |

### Pairing rules

A pairing needs **contrast in one dimension and harmony in the rest**. Two fonts that are merely similar read as a mistake.

1. **Two families maximum** — one for headings, one for UI/body. A third is permitted only for monospace numerals.
2. **Pair across categories, not within.** Geometric sans + humanist sans is a common failure; the shapes conflict without reading as intentional. Safe axes: serif display + neutral sans body, or one superfamily at two optical sizes.
3. **Match x-height.** Fonts with very different x-heights at the same `font-size` look mismatched. Compensate by size, not by hoping.
4. **Load 2–3 weights per family, no more.** Typically 400 / 500 / 700. Each extra weight is a real payload cost.
5. **Never synthesize.** No faux-bold or faux-italic — load the real cut or don't use it.
6. **Tighten as size grows.** `letter-spacing`: `-0.02em` at 32px+, `-0.01em` at 20–24px, `0` at body, `+0.01em` for uppercase labels.
7. **Measure: 45–75 characters.** Use `max-width: 65ch` on prose. Wider is measurably harder to read.
8. **Tabular numerals for any aligned figures** — currency, counts, IDs, tables. `font-variant-numeric: tabular-nums`, or a monospace face. Proportional digits make columns visibly ragged.

### Hierarchy

Establish rank with **size, weight, and color** — in that order. Reach for color last and never use it alone (see §6). Two adjacent levels must differ by at least one full scale step; if they differ only in weight, one of them is redundant.

---

## 3. Color palette generation

### Seed

```css
/* ⚠️ UNVERIFIED PLACEHOLDER — not confirmed as TNT Crane's official brand red.
   brandfetch.com/tntcrane.com returns 403; tntcrane.com exposes only a
   loading-skeleton color (#cfd4db). Replace with the value from the brand
   guide, then regenerate the ramp (see "Verifying contrast" below). */
--brand-seed: #C8102E;  /* OKLCH(0.5304, 0.2074, 22.3°) */
```

### Method

Generate in **OKLCH, not HSL**. HSL's lightness is not perceptual — equal L values across different hues produce visibly uneven ramps. In OKLCH, hold hue constant, step lightness, and let chroma peak mid-ramp and fall off at both ends (full-chroma tints look neon; full-chroma shades look muddy). Clip out-of-gamut steps by reducing chroma while preserving hue and lightness.

### Generated ramp

Contrast ratios are measured, not estimated.

| Token | Hex | vs white | vs `#1C1C1E` | Use |
|---|---|---|---|---|
| `brand-50` | `#FFF2F1` | 1.09 | 15.57 | Subtlest tint background |
| `brand-100` | `#FFE2E0` | 1.22 | 13.94 | Hover on tinted surface |
| `brand-200` | `#FFCAC7` | 1.44 | 11.77 | Borders on tint, disabled fill |
| `brand-300` | `#FFA4A0` | 1.90 | 8.97 | Dark-mode borders, decorative |
| `brand-400` | `#FB6B6C` | 2.83 | 6.01 | **Dark-mode text/accent** |
| `brand-500` | `#C8102E` | 5.88 | 2.89 | **Light-mode primary** (seed) |
| `brand-600` | `#BC112B` | 6.44 | 2.64 | Hover on primary |
| `brand-700` | `#990A21` | 8.65 | 2.16 | Active/pressed |
| `brand-800` | `#79111C` | 10.95 | 1.80 | High-emphasis text on light |
| `brand-900` | `#5D1117` | 13.50 | 1.56 | Maximum-contrast text on light |

### The trap

**`brand-500` passes AA on white (5.88:1) but fails on dark surfaces (2.89:1 on `#1C1C1E`).** A saturated mid-red is simply not legible on near-black. Do not reuse the same primary token across both themes.

- Light mode primary → `brand-500`, white text on top (5.88:1, AA ✅)
- Dark mode primary → `brand-400`, **black** text on top — white on `brand-400` is only 2.83:1 and fails

`brand-600` and darker are unusable as foreground in dark mode at any size. Everything `brand-300` and lighter is background/decoration only in light mode.

### Semantic layer

Never reference a ramp step directly in a component. Map through semantic tokens so theming is one substitution:

```css
--color-action-primary        /* → brand-500 light / brand-400 dark */
--color-action-primary-hover
--color-action-on-primary     /* → white light / black dark */
--color-text-primary
--color-text-secondary
--color-surface
--color-surface-elevated
--color-border
```

Status colors (success / warning / danger / info) are generated by the same OKLCH method from their own seeds. **Danger must be visibly distinct from the brand red** — when the brand is already red, shift danger toward a cooler crimson and lean on icons plus text, never hue alone.

---

## 4. Mobile-first responsive

Author base styles for the smallest screen; every media query is `min-width`. Never write `max-width` queries — they invert the cascade and fight the mobile-first base.

| Token | min-width | Target |
|---|---|---|
| base | 0 | 360px phone (design target) |
| `sm` | 640px | Large phone / small tablet portrait |
| `md` | 768px | Tablet portrait |
| `lg` | 1024px | Tablet landscape / small laptop |
| `xl` | 1280px | Desktop |
| `2xl` | 1536px | Large desktop |

**Rules**

- Design at **360px** first. It's the real floor; 320px is now rare enough to treat as graceful-degradation only.
- Breakpoints serve **content**, not devices. If a layout breaks at 900px, add a breakpoint at 900px — don't force it into `md`.
- Prefer intrinsic layout over breakpoints. `grid-template-columns: repeat(auto-fit, minmax(280px, 1fr))` and `clamp()` remove most queries entirely.
- Fluid type: `clamp(2rem, 1.5rem + 2.5vw, 3rem)`. Always include a fixed component in the middle term so the value still scales when the user zooms.
- Container max-width 1280px with 16/24/32px responsive gutters.
- Test at 200% zoom (WCAG 1.4.4) and at 320px width without horizontal scroll (WCAG 1.4.10 reflow).

---

## 5. Micro-interactions

### Timing

| Duration | Use |
|---|---|
| 100ms | Instant feedback — hover, focus ring |
| 150ms | Small state changes — button press, checkbox, toggle |
| 200ms | Default — dropdowns, tooltips, small reveals |
| 300ms | Modals, drawers, page-level transitions |
| 500ms+ | Large choreographed sequences only |

Anything past 400ms feels broken for a direct-manipulation response. Anything under 80ms isn't perceived as motion at all.

### Easing

```css
--ease-standard:   cubic-bezier(0.2, 0, 0, 1);    /* default; most UI motion */
--ease-decelerate: cubic-bezier(0, 0, 0, 1);      /* entering the screen */
--ease-accelerate: cubic-bezier(0.3, 0, 1, 1);    /* leaving the screen */
--ease-spring:     cubic-bezier(0.34, 1.56, 0.64, 1); /* playful overshoot; use sparingly */
```

Never `linear` for spatial movement — it reads mechanical. `linear` is correct only for continuous loops (spinners, progress).

### Rules

1. **Animate compositor-friendly properties only** — `transform` and `opacity`. Animating `width`, `height`, `top`, or `margin` triggers layout on every frame and drops frames on mid-tier phones.
2. **Motion must mean something.** Reveal a relationship, show where something came from, or confirm an action. Decorative motion becomes irritating by the tenth viewing.
3. **Entering is slower than exiting.** Enter ~200–300ms decelerating; exit ~150ms accelerating. Users have already decided when dismissing.
4. **Origin-aware transitions.** A dropdown scales from the trigger's edge, not the viewport center.
5. **Stagger lists at 20–40ms** per item, capped at ~8 items. Beyond that the tail feels slow.
6. **Never block input on animation.** A user who clicks during a transition must be able to act immediately.
7. **Loading:** <200ms show nothing (a flashed spinner is worse than none); 200ms–1s spinner; >1s skeleton or progress with real percentage.

### Reduced motion — required

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

Reduce means *reduce*, not remove: keep opacity fades (they don't trigger vestibular symptoms), drop parallax, large translations, scale, and rotation. This is WCAG 2.3.3 and non-negotiable for anyone with vestibular disorders.

---

## 6. WCAG 2.1 AA

### Contrast minimums

| Content | Ratio |
|---|---|
| Body text (<18.66px, or <24px bold) | **4.5:1** |
| Large text (≥18.66px bold, or ≥24px) | **3:1** |
| UI components, icons, focus indicators, chart keys | **3:1** |
| Disabled elements | exempt — but don't rely on dimming alone to convey state |

Placeholder text is real text: 4.5:1. The common `#999` on white is 2.85:1 and fails.

### Non-negotiables

- **Never encode meaning in color alone** (1.4.1). Every status needs an icon, label, or shape too. Roughly 1 in 12 men has a color vision deficiency — for a red brand, red/green status pairs are the highest-risk combination you can ship.
- **Visible focus on every interactive element** (2.4.7). Minimum 2px, 3:1 against the adjacent background. Use `:focus-visible` so pointer users don't see rings, and **never** ship `outline: none` without a replacement.
- **Logical focus order** matching visual order (2.4.3). No positive `tabindex`.
- **Label every input** (3.3.2). A placeholder is not a label — it disappears on focus and fails at 4.5:1 in most implementations.
- **Semantic HTML first.** `<button>` for actions, `<a href>` for navigation. A `<div onclick>` is invisible to assistive tech and unreachable by keyboard.
- **One `<h1>` per page**, no skipped heading levels.
- **Text resizes to 200%** without loss of content (1.4.4) — use `rem`, never fixed `px` heights on text containers.
- **Reflow at 320px** with no horizontal scroll (1.4.10).
- **Errors identified in text** (3.3.1), programmatically tied via `aria-describedby`, and announced with `role="alert"`.
- **Respect `prefers-reduced-motion`** (2.3.3).
- **No content flashing more than 3×/second** (2.3.1).

### Verifying contrast

Regenerate and re-verify whenever the seed changes. The generator script:

```
.claude/skills/uiux-pro-max/scripts/ramp.js
```

```bash
node .claude/skills/uiux-pro-max/scripts/ramp.js "#YOURHEX"
```

It converts the seed to OKLCH, builds the 10-step ramp with gamut clipping, prints measured WCAG ratios against white, black, and all three dark surfaces, then recommends the light- and dark-mode primary steps. **Do not hand-edit the hex values in §3** — rerun this and paste the output. Automated checks catch roughly a third of real accessibility defects; keyboard-only and screen-reader passes are still required.

---

## 7. Dark mode

Dark mode is a **separate palette**, not an inversion. Inverting produces halation — saturated light-on-dark text vibrates and smears for astigmatic readers.

### Rules

1. **Never pure black or pure white.** Surfaces bottom out at `#0A0A0A`–`#121212`; primary text tops out near `#E6E6E6`. `#FFF` on `#000` is 21:1 and physically uncomfortable to read at length.
2. **Elevation is lighter, not shadowed.** Shadows are nearly invisible on dark. Raise the surface's lightness per level: `#0A0A0A` base → `#121212` raised → `#1C1C1E` card → `#242426` overlay.
3. **Desaturate.** Saturated hues glow against dark. Reduce chroma ~15–25% and raise lightness — this is exactly why dark mode uses `brand-400`, not `brand-500` (§3).
4. **Re-verify every ratio.** Contrast is not symmetric across themes. `brand-500` passes on white and fails on `#1C1C1E`.
5. **Dim large imagery** to ~80% brightness, or supply dark-mode assets. Logos need a dark-surface variant — a red mark on near-black is often illegible.
6. **Borders get lighter, not darker.** `rgba(255,255,255,0.08–0.12)` reads better than any solid gray.

### Implementation

Define semantic tokens once, override the values per theme, and let components reference only semantics. Support system preference *and* a manual override — the toggle must win in both directions:

```css
:root { color-scheme: light dark; }

/* system default */
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) { /* dark values */ }
}
/* explicit override */
:root[data-theme="dark"]  { /* dark values */ }
:root[data-theme="light"] { /* light values */ }
```

Set `color-scheme` so native form controls, scrollbars, and the caret follow the theme. Apply the stored theme **before first paint** with a blocking inline script in `<head>` — otherwise dark-mode users get a white flash on every load.
