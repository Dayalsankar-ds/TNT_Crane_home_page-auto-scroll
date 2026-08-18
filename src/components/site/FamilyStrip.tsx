/**
 * FAMILY STRIP — slim trust band, right after the hero.
 *
 * Occupies the slot that briefly held CertificationsStrip (ISO 9001, NCCCO,
 * OSHA VPP, ISNetworld, Avetta). That badge row moved back to SafetyCulture
 * (its original home) after this strip couldn't get real, rights-cleared
 * certification logos on short notice — see SafetyCulture.tsx's docblock for
 * the full reasoning. This strip does the same job — a fast trust signal
 * right off the hero — with content TNT already owns outright, so there's no
 * rights or verification question: the real logos of the brands now unified
 * under TNT.
 *
 * TNT's own wordmark plus the four acquired brands whose kit includes a logo
 * (Southway, RMS Cranes, Eagle West, JMS). Stampede/TNT Canada and Allison
 * have no logo in the brand kit, and a logo-only strip has no text-fallback
 * slot, so they are simply not shown — this is a "some of the family" strip,
 * not the full roster.
 *
 * The full card-grid version (FamilyOfCompanies.tsx, which did carry a text
 * fallback for those two) was deleted on 2026-08-06 with the rest of the
 * non-homepage sections; it is in git history if the roster is ever needed
 * in full.
 *
 * The marks run in FULL COLOUR (2026-08-04, user decision — they were
 * grayscaled before). Each is its own brand's palette, so the row is
 * deliberately polychrome rather than tuned to the TNT gold/maroon.
 *
 * Fixed-height / auto-width per logo, not a shared box: the marks range from
 * roughly 2:1 (TNT) to 4:1 (Southway/RMS/Eagle West), so a fixed WIDTH would
 * letterbox some and crop others. Height is what stays constant.
 *
 * TNT runs taller than the rest (2026-08-18, on request): it's the Primary
 * mark now (near-square, 1200×987 — see SiteNav.tsx's docblock on the swap),
 * so matching the row's shared height would render it noticeably smaller in
 * WIDTH than the 2:1–4:1 marks beside it. `items-center` on the row keeps it
 * vertically centered against them at the taller size.
 */

const LOGOS: { name: string; src: string; big?: boolean }[] = [
  { name: "TNT Crane & Rigging", src: "/brand/tnt-primary.png", big: true },
  { name: "Southway Crane & Rigging", src: "/brand/southway.png" },
  { name: "RMS Cranes", src: "/brand/rms-cranes.png" },
  { name: "Eagle West Crane & Rigging", src: "/brand/eagle-west.png" },
  { name: "JMS Crane & Rigging", src: "/brand/jms.png" },
];

export default function FamilyStrip() {
  return (
    // `#family` — the nav's Family of Companies link used to point at
    // /coverage; that route is gone (2026-08-04, single-page site) and this
    // strip is the only surviving place the family is shown.
    <section id="family" className="scroll-mt-32 border-y border-black/10 bg-white">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-8 px-4 py-10 sm:px-6 sm:py-12 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        {/* Sized up from the 13px Eyebrow spec (2026-08-04) so it reads as the
           strip's title rather than a kicker — it is the only text here and has
           a full logo row to hold its own against. Tracking eases off as the
           size climbs: 0.18em is set for 13px caps and gets gappy well before
           20px. */}
        <p className="font-body text-lg font-bold tracking-[0.12em] text-black uppercase sm:text-xl">
          TNT Family of Companies
        </p>
        <ul className="flex flex-wrap items-center justify-center gap-x-10 gap-y-6 lg:justify-end">
          {LOGOS.map((l) => (
            <li
              key={l.name}
              className={`flex items-center ${l.big ? "h-12 sm:h-14" : "h-8 sm:h-9"}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={l.src}
                alt={l.name}
                className="h-full w-auto object-contain"
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
