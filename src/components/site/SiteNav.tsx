"use client";

/**
 * SITE NAV — added onto the Hero, not into it.
 *
 * Rendered as a fixed sibling above <HeroScrollExperience /> in page.tsx, so
 * the locked hero markup is never touched.
 *
 * Frosted dark glass (.glass-nav): translucent slate + backdrop-blur, so the
 * hero and sections blur through the bar. The tint is held dark enough (0.7)
 * that white nav text stays legible over the light sections below; a heavier
 * shadow drops in once scrolled. Degrades to solid slate where backdrop-filter
 * is unsupported (see globals.css).
 *
 * Visibility: on the HOMEPAGE only, the bar hides over the hero and is shown
 * once #family (the Family Strip, first section after the hero) reaches the
 * top of the viewport. A rAF loop reads that section's position each frame, so it
 * stays in sync under the hero's transform-based smooth-scroll (window `scroll`
 * events are unreliable). On every other route there is no hero, so the bar is
 * always visible — the check is gated on the pathname, not merely on the
 * target existing, so reusing the section on another route can't hide the bar.
 *
 * The toggle is instant, not animated: `.glass-nav` uses `backdrop-filter`,
 * which pushes opacity/transform transitions onto the main thread, and this
 * page's scroll rAF loops starve them (a CSS transition here freezes mid-fade).
 * The mega panels below open instantly for the same reason — they are children
 * of the glass header, so a fade on them stutters exactly the same way.
 *
 * STRUCTURE (2026-07-28). The bar carried nine flat links plus a phone number
 * and a CTA — eleven items, which is why the desktop layout could not engage
 * until `xl`. It now carries four group triggers (see navigation.ts), each
 * opening a panel that exposes the site's ~23 real destinations. Triggers are
 * real <Link>s to the group's own landing page, so the panel is an enhancement
 * and never the only route in — keyboard and no-JS users still get there.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { gsap } from "gsap";
import Link from "next/link";
import Button from "./Button";
import TopInfoBar from "./TopInfoBar";
import { Icon } from "./primitives";
import LocationSelect, { wasEscapeHandled } from "./LocationSelect";
import { CHROME_H } from "./chrome";
import Image from "next/image";
import {
  FAMILY_BRANDS,
  NAV_GROUPS,
  SERVICE_LOCATIONS,
  activeGroup,
  brandOf,
  servicesPanelFor,
  type LocationId,
  type NavColumn,
} from "./navigation";

// Hover intent. OPEN is short enough to feel immediate on a deliberate hover
// but long enough that sweeping the pointer across all four triggers doesn't
// flash three panels. CLOSE is the more important one: it's the grace period
// for the diagonal move from a trigger down into its own panel, which briefly
// leaves both.
const OPEN_MS = 90;
const CLOSE_MS = 180;

// Reveal band for the homepage bar. Show once #family reaches the chrome;
// hide only after it has fallen a clear 140px back below that line. The gap is
// the deadband — without it, scroll settling right on the threshold strobes the
// bar and tears down any open panel. 140px is comfortably wider than Lenis's
// overshoot while still feeling immediate.
//
// This is also the line the hero's auto-scroll (useHeroAutoScroll.ts) lands
// on after the last frame: it scrolls on until #family's top sits at exactly
// this threshold, so the bar and the Family strip arrive together.
const REVEAL_AT = CHROME_H;
const HIDE_AT = CHROME_H + 140;

export default function SiteNav() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const [mobileSection, setMobileSection] = useState<string | null>(null);
  // Which region the Services panel is filtered to. Held here rather than in
  // the panel so the choice survives closing and reopening the menu — someone
  // who told us they're in the Gulf Coast shouldn't have to say it twice.
  const [location, setLocation] = useState<LocationId>("all");
  // Inner routes have no hero, so start visible; the homepage starts hidden and
  // is revealed by the scroll loop below. Seeded from the initial pathname so
  // there's no first-paint flash on a direct load of an inner route.
  const [visible, setVisible] = useState(pathname !== "/");

  const current = activeGroup(pathname);
  const hoverTimer = useRef<number | null>(null);

  const clearHover = useCallback(() => {
    if (hoverTimer.current !== null) window.clearTimeout(hoverTimer.current);
    hoverTimer.current = null;
  }, []);
  const scheduleOpen = useCallback(
    (label: string) => {
      clearHover();
      hoverTimer.current = window.setTimeout(() => setOpenGroup(label), OPEN_MS);
    },
    [clearHover],
  );
  const scheduleClose = useCallback(() => {
    clearHover();
    hoverTimer.current = window.setTimeout(() => setOpenGroup(null), CLOSE_MS);
  }, [clearHover]);
  useEffect(() => clearHover, [clearHover]);

  // Keep the "am I on the homepage?" flag in a ref the rAF loop can read without
  // being re-created on navigation (SiteNav lives in the layout and persists
  // across client-side route changes, so the loop is set up once).
  const isHomeRef = useRef(pathname === "/");
  useEffect(() => {
    isHomeRef.current = pathname === "/";
  }, [pathname]);

  // The open panel, readable from the ticker below without re-registering it
  // on every open/close. Mirrored in an effect, same as isHomeRef above.
  const openGroupRef = useRef<string | null>(null);
  useEffect(() => {
    openGroupRef.current = openGroup;
  }, [openGroup]);

  // Reveal the bar once #family (the Family Strip, first section after the
  // hero) reaches the top — homepage only. Position is polled rather than
  // driven by `scroll` events, which are unreliable under smooth-scrolling;
  // on non-home routes the bar is always shown.
  //
  // Runs on gsap.ticker, NOT a private requestAnimationFrame. SmoothScroll's
  // whole point is that there is exactly one rAF loop on the page — this was
  // the only perpetual loop still outside it.
  //
  // HYSTERESIS (REVEAL_AT vs HIDE_AT) is the important part. With a single
  // threshold, a scroll that comes to rest near it strobes the bar: Lenis's
  // inertial lerp oscillates by a few px as it settles, and each flip both
  // flickered the chrome and — via `shownGroup` — tore down any open mega
  // panel. Measured at 13 flips from a ±5px jiggle. The deadband means the bar
  // must travel a real distance back up before it hides again.
  useEffect(() => {
    let shown: boolean | null = null;
    const tick = () => {
      let next: boolean;
      if (!isHomeRef.current) {
        next = true;
      } else {
        const target = document.getElementById("family");
        next = !target
          ? true
          : target.getBoundingClientRect().top <= (shown ? HIDE_AT : REVEAL_AT);
      }
      // An open panel pins the bar. The visitor is actively using the nav; the
      // scroll position that would otherwise hide it is not the stronger signal.
      if (openGroupRef.current) next = true;
      if (next !== shown) {
        shown = next;
        setVisible(next);
      }
    };
    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  }, []);

  // Any navigation closes everything. Covers the case a link inside a panel
  // points at the route you're already on, where no unmount would occur.
  // Adjusted during render rather than in an effect: this is derived-from-props
  // state, and an effect here would paint the open panel once on the new route
  // before closing it (and trips react-hooks/set-state-in-effect).
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpenGroup(null);
    setMobileOpen(false);
    setMobileSection(null);
  }

  // A panel left open while the bar hides over the hero would float detached,
  // so visibility gates it at render time — no second piece of state to sync.
  const shownGroup = visible ? openGroup : null;

  // Escape closes the open panel or the mobile sheet.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      // The location combobox consumes Escape first (to clear its search, then
      // to close itself). It can't stop us by propagation — React 19 delegates
      // to `document`, the same node this listener is on — so it marks the
      // native event instead. See LocationSelect.
      if (wasEscapeHandled(e)) return;
      setOpenGroup(null);
      setMobileOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  // Crossing to `lg` hides the mobile sheet by CSS, but the state stays true —
  // which would leave the body scroll lock below applied with nothing on screen
  // to explain it, i.e. a page that simply cannot scroll. Close it on the
  // breakpoint itself rather than trusting the sheet to be dismissed first.
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const sync = () => {
      if (mq.matches) setMobileOpen(false);
    };
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  // Lock the page behind the mobile sheet. Lenis leaves touch to native
  // momentum scrolling, so an overflow lock on <body> is all this needs; the
  // sheet scrolls internally.
  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

  return (
    <header
      // `inert` while hidden. opacity-0 + pointer-events-none stops the MOUSE
      // but leaves every link in the tab order and the accessibility tree, so
      // a keyboard user starting at the top of the homepage tabbed through the
      // whole invisible bar — utility strip, socials, wordmark, all four
      // triggers — before reaching anything on screen. inert removes it from
      // both. Cheaper and more correct than visibility:hidden here, since the
      // toggle is instant anyway (no transition to preserve).
      inert={!visible}
      className={`glass-nav fixed inset-x-0 top-0 z-50 shadow-md shadow-black/20 ${
        visible ? "" : "pointer-events-none -translate-y-full opacity-0"
      }`}
      // Closing on focus leaving the header is what makes the panels usable by
      // keyboard: tabbing off the last link in a panel puts it away without
      // needing Escape. relatedTarget is null when focus leaves the document
      // entirely, which should not close anything.
      onBlur={(e) => {
        if (e.relatedTarget && !e.currentTarget.contains(e.relatedTarget)) {
          setOpenGroup(null);
        }
      }}
    >
      {/* Utility strip — inside the header so it hides with the nav over the
          hero. Adds 36px to the chrome at `lg`+ (see CHROME_H). */}
      <TopInfoBar />

      {/* Wrapper spans the bar AND the panel, so the pointer can travel from a
          trigger into its panel without crossing "outside". */}
      <div onMouseLeave={scheduleClose}>
        {/* h-20 = 80px; pairs with TopInfoBar's h-10 to make CHROME_H = 120. */}
        <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Wordmark — swapped back to Secondary mark, 2026-08-18 (traded
              places with FamilyStrip's first logo, which now carries Primary).
              Secondary is a DIFFERENT shape, not just a smaller version of
              Primary: it's wide (1200×579 vs Primary's near-square 1200×987),
              a flat "TNT" lockup with "CRANE & RIGGING" beneath — built for a
              compact horizontal placement, which suits this 80px bar better
              than Primary's stacked crane-boom illustration did.

              No white chip here, unlike the marks in the Services panel: this
              logo is drawn ON a black block, so it sits correctly against the
              dark nav — it's the light surfaces that need the chip. `priority`
              because it's above the fold on every route. */}
          <Link href="/" className="flex shrink-0 items-center">
            <Image
              src="/brand/tnt.png"
              alt="TNT Crane &amp; Rigging — home"
              width={1200}
              height={579}
              priority
              sizes="(min-width: 640px) 133px, 112px"
              className="h-[54px] w-auto sm:h-[64px]"
            />
          </Link>

          {/* Desktop group triggers — four items now fit at `lg`, matching the
              breakpoint TopInfoBar and the sticky offsets already use. */}
          <ul className="hidden items-center gap-1 lg:flex">
            {NAV_GROUPS.map((g) => {
              const isOpen = shownGroup === g.label;
              const isCurrent = current === g.label;
              return (
                <li key={g.label} onMouseEnter={() => scheduleOpen(g.label)}>
                  <Link
                    href={g.href}
                    aria-expanded={isOpen}
                    aria-haspopup="true"
                    aria-current={isCurrent ? "page" : undefined}
                    onClick={() => setOpenGroup(null)}
                    onFocus={() => setOpenGroup(g.label)}
                    onKeyDown={(e) => {
                      if (e.key === "ArrowDown") {
                        e.preventDefault();
                        setOpenGroup(g.label);
                      }
                    }}
                    // 16px to match the panel's stepped-up labels (2026-08-04)
                    // — the trigger and the column it opens are the same rung
                    // of the hierarchy and looked mismatched a step apart.
                    className={`flex items-center gap-1.5 rounded-md px-3 py-2 font-body text-base font-semibold whitespace-nowrap transition-colors ${
                      isOpen || isCurrent
                        ? "text-tnt-amber"
                        : "text-white/85 hover:text-tnt-amber"
                    }`}
                  >
                    {g.label}
                    <svg
                      viewBox="0 0 12 12"
                      aria-hidden="true"
                      className={`h-3 w-3 ${isOpen ? "rotate-180" : ""}`}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="m2.5 4.5 3.5 3.5 3.5-3.5" />
                    </svg>
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Contact rail */}
          <div className="hidden items-center gap-5 lg:flex">
            <a
              href="tel:+18007992505"
              className="font-mono text-base font-semibold whitespace-nowrap text-white transition-colors hover:text-tnt-amber"
            >
              1-800-799-2505
            </a>
            <Button href="/#quote" variant="primary" onDark arrow={false}>
              Get a Quote
            </Button>
          </div>

          {/* Mobile toggle */}
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-md text-white lg:hidden"
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            <span className="relative block h-4 w-6">
              <span
                className={`absolute left-0 block h-0.5 w-6 bg-current transition-transform duration-300 ${
                  mobileOpen ? "top-1.5 rotate-45" : "top-0"
                }`}
              />
              <span
                className={`absolute top-1.5 left-0 block h-0.5 w-6 bg-current transition-opacity duration-300 ${
                  mobileOpen ? "opacity-0" : "opacity-100"
                }`}
              />
              <span
                className={`absolute left-0 block h-0.5 w-6 bg-current transition-transform duration-300 ${
                  mobileOpen ? "top-1.5 -rotate-45" : "top-3"
                }`}
              />
            </span>
          </button>
        </nav>

        {/* ---- Mega panel (desktop only) ------------------------------------
            Solid navy rather than more glass: the strip above is already navy,
            so the chrome reads as tiers instead of one thick blur, and link
            text over a translucent panel would sit on whatever section
            happened to be scrolling underneath. */}
        {shownGroup &&
          NAV_GROUPS.filter((g) => g.label === shownGroup).map((g) => {
            // Services is the one group whose answer depends on where you are.
            // Everything else is national and renders as authored.
            const localized = g.label === "Services";
            const { columns, feature } = localized
              ? servicesPanelFor(location)
              : { columns: g.columns, feature: g.feature };
            // Remounting on the location key replays the swap animation. A
            // transition would be the obvious choice, but transitions inside
            // this backdrop-filtered header freeze mid-flight under the scroll
            // rAF loops (see the note at the top); a keyframe animation always
            // lands on its final state even when frames are dropped.
            const swapKey = localized ? location : "static";

            return (
              <div
                key={g.label}
                className="absolute inset-x-0 top-full hidden border-t border-tnt-amber/40 bg-tnt-navy shadow-2xl shadow-black/40 lg:block"
                onMouseEnter={clearHover}
              >
                {/* Gaps and rails were tightened on 2026-08-04 to buy width
                    for the columns: at the stepped-up 16px label the longest
                    item ("Lift Planning & Engineering", 27ch) needs ~330px a
                    row and the columns only had ~276px, so it wrapped to two
                    lines. Outer gap 10→6, rails 15/19rem→12.5/17rem and their
                    inner padding 8/10→6/8 hand ~128px to the grid. The panel's
                    own `max-w-7xl` and `py-12` are deliberately untouched. */}
                <div className="mx-auto flex max-w-7xl gap-6 px-4 py-12 sm:px-6 lg:px-8">
                  {/* Location picker leads the panel from a rail of its own.
                      It's a filter, and a filter belongs upstream of what it
                      filters — left of the columns, read before them. */}
                  {localized && (
                    <div className="w-[12.5rem] shrink-0 border-r border-white/10 pr-6">
                      <LocationSelect value={location} onChange={setLocation} />
                    </div>
                  )}

                  <div
                    key={swapKey}
                    className={`nav-swap grid flex-1 gap-x-8 gap-y-8 ${
                      columns.length > 1 ? "grid-cols-2" : "grid-cols-1"
                    }`}
                  >
                    {columns.map((col) => (
                      <PanelColumn key={col.no} col={col} />
                    ))}
                  </div>

                  <div className="w-[17rem] shrink-0 border-l border-white/10 pl-8">
                    {/* Closing card — one destination per panel that carries
                        the group's argument, so the panel makes a point
                        instead of only listing. */}
                    <div key={swapKey} className="nav-swap">
                      {/* Stepped up with PanelColumn (2026-08-04) so the
                          closing card doesn't shrink relative to the list it
                          sits beside. */}
                      <p className="font-body text-[13px] font-bold tracking-[0.18em] text-tnt-amber uppercase">
                        {feature.eyebrow}
                      </p>
                      <p className="mt-3 font-display text-3xl leading-tight tracking-wide text-white uppercase">
                        {feature.title}
                      </p>
                      <p className="mt-3 font-body text-base leading-relaxed text-white/60">
                        {feature.blurb}
                      </p>
                      <Link
                        href={feature.href}
                        onClick={() => setOpenGroup(null)}
                        className="mt-5 inline-flex items-center gap-2 font-body text-base font-semibold text-tnt-amber hover:text-white"
                      >
                        {feature.cta}
                        <Icon name="arrow" className="h-5 w-5" />
                      </Link>

                      {/* The family. "All Locations" shows every company that
                          ships a mark; a chosen market shows just the one that
                          runs it — which is the claim the panel is making at
                          that moment. */}
                      {localized && <FamilyMarks location={location} />}
                    </div>
                  </div>
                </div>

                {/* Screen readers get told the list changed; the visual swap
                    alone is silent to anyone not looking at it. */}
                {localized && (
                  <p aria-live="polite" className="sr-only">
                    Showing services for{" "}
                    {SERVICE_LOCATIONS.find((l) => l.id === location)?.label}.
                  </p>
                )}
              </div>
            );
          })}
      </div>

      {/* ---- Mobile sheet ---------------------------------------------------
          Groups become accordion sections rather than one 23-item list. Height
          is capped to the viewport minus the bar so the sheet scrolls itself
          instead of the locked page behind it. */}
      <div
        id="mobile-menu"
        // Lenis leaves touch to native momentum, so this matters mainly for a
        // trackpad at a narrow window — but the sheet should scroll itself in
        // every input mode, not just the one it was designed for.
        data-lenis-prevent
        className={`overflow-y-auto overscroll-contain bg-tnt-slate lg:hidden ${
          mobileOpen ? "max-h-[calc(100vh-5rem)]" : "max-h-0 overflow-hidden"
        } transition-[max-height] duration-300`}
      >
        <ul className="flex flex-col gap-1 px-4 pt-2 pb-6">
          {NAV_GROUPS.map((g) => {
            const expanded = mobileSection === g.label;
            const localized = g.label === "Services";
            const cols = localized
              ? servicesPanelFor(location).columns
              : g.columns;
            return (
              <li key={g.label} className="border-b border-white/10 last:border-0">
                <div className="flex items-center">
                  <Link
                    href={g.href}
                    onClick={() => setMobileOpen(false)}
                    aria-current={current === g.label ? "page" : undefined}
                    className={`flex-1 rounded-md px-3 py-3.5 font-display text-base tracking-wide uppercase ${
                      current === g.label ? "text-tnt-amber" : "text-white"
                    }`}
                  >
                    {g.label}
                  </Link>
                  <button
                    type="button"
                    onClick={() =>
                      setMobileSection((v) => (v === g.label ? null : g.label))
                    }
                    aria-expanded={expanded}
                    aria-label={`${expanded ? "Collapse" : "Expand"} ${g.label}`}
                    className="inline-flex h-11 w-11 items-center justify-center rounded-md text-white/70"
                  >
                    <svg
                      viewBox="0 0 12 12"
                      aria-hidden="true"
                      className={`h-3 w-3 transition-transform duration-200 ${
                        expanded ? "rotate-180" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="m2.5 4.5 3.5 3.5 3.5-3.5" />
                    </svg>
                  </button>
                </div>

                {expanded && (
                  <div className="pb-3">
                    {/* Real <select> on touch: the OS picker is better than
                        anything reimplemented, and it's keyboard-complete for
                        free. The desktop panel uses the custom listbox because
                        it shows the region's operating brand on a second line,
                        which a native option can't. */}
                    {localized && (
                      <div className="mt-2 px-3">
                        <label
                          htmlFor="mobile-location"
                          className="font-mono text-[11px] tracking-[0.14em] text-white/45 uppercase"
                        >
                          Choose Location
                        </label>
                        <select
                          id="mobile-location"
                          value={location}
                          onChange={(e) =>
                            setLocation(e.target.value as LocationId)
                          }
                          className="mt-2 w-full rounded-md border border-white/20 bg-white/5 px-3 py-2.5 font-body text-sm font-semibold text-white focus-visible:ring-2 focus-visible:ring-tnt-amber focus-visible:outline-none"
                        >
                          {SERVICE_LOCATIONS.map((loc) => (
                            <option
                              key={loc.id}
                              value={loc.id}
                              className="bg-tnt-slate text-white"
                            >
                              {loc.label} — {loc.brand}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                    {cols.map((col) => (
                      <div key={col.no} className="mt-2">
                        <p className="px-3 font-mono text-[11px] tracking-[0.14em] text-tnt-amber uppercase">
                          {col.heading}
                        </p>
                        <ul className="mt-1">
                          {col.items.map((item) => (
                            <li key={item.label + item.href}>
                              <Link
                                href={item.href}
                                onClick={() => setMobileOpen(false)}
                                className="flex items-center gap-3 rounded-md px-3 py-2.5 font-body text-[15px] text-white/80 hover:bg-white/10 hover:text-tnt-amber"
                              >
                                {item.index && (
                                  <span className="font-mono text-[11px] text-white/30 tabular-nums">
                                    {item.index}
                                  </span>
                                )}
                                <span className="flex-1">{item.label}</span>
                                {item.meta && (
                                  <span className="font-mono text-[11px] text-white/40 tabular-nums">
                                    {item.meta}
                                  </span>
                                )}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}
              </li>
            );
          })}

          <li className="mt-4">
            <a
              href="tel:+18007992505"
              onClick={() => setMobileOpen(false)}
              className="block rounded-md px-3 py-3 font-mono text-base font-semibold text-tnt-amber hover:bg-white/10"
            >
              1-800-799-2505
            </a>
          </li>
          <li className="mt-2">
            <Button
              href="/#quote"
              variant="primary"
              onDark
              arrow={false}
              onClick={() => setMobileOpen(false)}
              className="w-full justify-center py-3"
            >
              Get a Quote
            </Button>
          </li>
        </ul>
      </div>
    </header>
  );
}

/**
 * Operating-company marks under the feature card.
 *
 * Each logo sits on a white chip. Every mark in the brand kit is drawn for a
 * LIGHT background — TNT, Southway, JMS and Eagle West sit on a black block
 * whose "A TNT Company" lockup is black text, and RMS Cranes is maroon-and-black
 * on transparent, effectively invisible on this panel. The brand guide forbids
 * altering brand colours, so the fix is to give each logo the surface it was
 * drawn for rather than to filter or invert it.
 *
 * `fill` + object-contain rather than fixed width/height: the marks run from
 * 2:1 (TNT) to 4:1 (Southway), so one width/height pair would letterbox some
 * and crop others. The chip is the frame; each logo fits itself inside it.
 */
function FamilyMarks({ location }: { location: LocationId }) {
  const one = brandOf(location);
  const marks = one ? (one.logo ? [{ brand: one.brand, logo: one.logo }] : []) : FAMILY_BRANDS;

  return (
    <div className="mt-7 border-t border-white/10 pt-5">
      <p className="font-mono text-[10px] tracking-[0.14em] text-white/40 uppercase">
        {one ? "Operated by" : "Operating companies"}
      </p>

      {marks.length > 0 ? (
        <ul className="mt-3 flex flex-wrap gap-2">
          {marks.map((m) => (
            <li
              key={m.brand}
              // Chip scaled up from 28×76 on 2026-08-04. The ~2.7:1 ratio is
              // kept: the marks range from 2:1 to 4:1 and object-contain fits
              // each inside the chip, so changing the chip's proportion would
              // silently re-letterbox all of them.
              className="relative h-10 w-[108px] rounded-sm bg-white p-1.5"
              // The company name reaches assistive tech here; the image itself
              // is decorative so it isn't announced twice.
              aria-label={m.brand}
            >
              <Image
                src={m.logo}
                alt=""
                aria-hidden="true"
                fill
                sizes="108px"
                className="object-contain"
              />
            </li>
          ))}
        </ul>
      ) : (
        // Allison and Stampede/TNT Canada ship no mark. Their real name in type
        // is honest; a stand-in graphic would not be.
        <p className="mt-2 font-body text-sm font-semibold text-white/80">
          {one?.brand}
        </p>
      )}
    </div>
  );
}

/**
 * One link column inside a mega panel.
 *
 * The visible "BLCK. NN / HEADING" label was removed 2026-07-29. The grouping
 * moves to `aria-label` on the list rather than disappearing outright — a
 * screen reader still hears "Capabilities" and "Industries" as separate lists,
 * which is the only thing the heading was carrying that wasn't decorative.
 */
/** Panel type was sized up one step on 2026-08-04 (label 14→16px, mono
 *  index/meta 11→12px, icons 16→20px, row padding 2.5→3). This component backs
 *  EVERY group's panel, not just Services, so the step applies across all four
 *  — a bigger Services panel next to a smaller Equipment one would read as a
 *  mistake rather than emphasis. */
function PanelColumn({ col }: { col: NavColumn }) {
  return (
    <div>
      <ul aria-label={col.heading}>
        {col.items.map((item) => (
          <li key={item.label + item.href}>
            <Link
              href={item.href}
              className="group flex items-center gap-3 rounded-md px-3 py-3 transition-colors hover:bg-white/5"
            >
              {item.index && (
                <span className="font-mono text-[12px] text-white/30 tabular-nums transition-colors group-hover:text-tnt-amber">
                  {item.index}
                </span>
              )}
              {item.icon && (
                <Icon
                  name={item.icon}
                  className="h-5 w-5 shrink-0 text-white/40 transition-colors group-hover:text-tnt-amber"
                  strokeWidth={1.6}
                />
              )}
              {/* `whitespace-nowrap` is the guarantee, the widths above are
                  the room: a label reads as one line or not at all, so a
                  future item longer than the column overflows visibly here
                  rather than silently reflowing to two lines. */}
              <span className="font-body text-base font-semibold whitespace-nowrap text-white/85 transition-colors group-hover:text-white">
                {item.label}
              </span>
              {item.meta && (
                <span className="ml-auto font-mono text-[12px] whitespace-nowrap text-white/35 tabular-nums">
                  {item.meta}
                </span>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
