"use client";

/**
 * CRANE RENTAL — dedicated service page (2026-09-18, on request: "create a
 * new page for Crane Rental from Full-Scope Capability... after selecting
 * Learn more button we have to add a dedicated page").
 *
 * The FIRST sub-page on this project — every other section on the site is a
 * same-page anchor on the homepage (single-page site by design, see
 * page.tsx's own history). Only this one stage's card in CoreServices.tsx
 * now points here (`/crane-rental`) instead of the shared `?service=...
 * #quote` stretched-link every other stage still uses — see that file's own
 * note on the Crane Rental stage for the exact change.
 *
 * Nav + footer come from the root layout automatically, same as the
 * homepage — this file supplies content only. Respects the site's
 * Light/Dark toggle (colorSchemeStore) via `dark:` utilities, same
 * convention as every homepage section.
 *
 * This page used to also connect to a "Theme 1/2" toggle (2026-09-18),
 * with the back link forcing Theme 2 before navigating home so CoreServices
 * matched. That toggle was removed project-wide 2026-09-23, on request —
 * `dark` below now follows Light/Dark alone, same as CoreServices.tsx and
 * SafetyCulture.tsx.
 *
 * Real TNT photography (SERVICE_PHOTOS.craneRentalAtCraneCoolerLift) — was
 * sourced 2026-09-03 for this exact purpose (a Crane Rental feature image)
 * but ended up unused when that section's featured-card treatment was
 * folded into the plain grid on 2026-09-11. First real use of it.
 *
 * Rental-model copy (Operated vs. Bare) is the same copy the old
 * EquipmentFinder section carried before its removal on 2026-09-10 — pulled
 * back from git history rather than rewritten, since it was accurate and
 * on-brand.
 */

import Link from "next/link";
import Image from "next/image";
import { Eyebrow, Icon } from "@/components/site/primitives";
import Button from "@/components/site/Button";
import { SERVICE_PHOTOS } from "@/components/site/photos";
import { useColorScheme } from "@/components/site/colorSchemeStore";

const RENTAL_MODELS = [
  {
    label: "Operated Rental",
    body: "Crane and certified operator, dispatched together. Our default model across every branch — the operator is part of the rental, not an add-on.",
  },
  {
    label: "Bare Rental",
    body: "Equipment only, self-operated. Available where your crew holds the required certifications — ask your branch to confirm eligibility.",
  },
];

const CRANE_CLASSES = [
  "All-Terrain Cranes",
  "Crawler Cranes",
  "Hydraulic Truck Cranes",
  "Rough-Terrain Cranes",
  "Carry Deck Cranes",
  "Tower Cranes",
];

export default function CraneRentalPage() {
  const [colorScheme] = useColorScheme();
  const dark = colorScheme === "dark";

  return (
    <div className="bg-white text-black dark:bg-black dark:text-white">
      {/* ── Header — breadcrumb back to Full-Scope Capability, eyebrow, h1 ── */}
      <section className="border-b border-black/10 dark:border-white/10">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <Link
            href="/#services"
            className="inline-flex items-center gap-2 font-body text-sm font-semibold text-tnt-amber hover:text-black dark:hover:text-white"
          >
            <Icon name="arrow" className="h-4 w-4 rotate-180" />
            Back to Full-Scope Capability
          </Link>

          <div className="mt-8 grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-16">
            <div>
              <Eyebrow>Full-Scope Capability</Eyebrow>
              <h1 className="mt-4 font-display text-5xl leading-[0.95] tracking-tight uppercase sm:text-6xl">
                Crane Rental
              </h1>
              <p className="mt-6 font-body text-base leading-relaxed text-tnt-body sm:text-lg">
                Operated or bare rental — by the day, month, or project, from
                8 to 1,300 tons. TNT&apos;s core service, and the fleet every
                other capability on this site supports.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Button href="/#quote" variant="primary" onDark={dark}>
                  Request a Quote
                </Button>
                <Button href="/#fleet-guide" variant="secondary" onDark={dark}>
                  View the Fleet
                </Button>
              </div>
            </div>

            <div className="relative aspect-4/3 overflow-hidden rounded-2xl border border-black/10 sm:aspect-16/10 dark:border-white/10">
              <Image
                src={SERVICE_PHOTOS.craneRentalAtCraneCoolerLift}
                alt="TNT Crane & Rigging all-terrain crane mid-lift at a commercial job site"
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Rental models — Operated vs. Bare ────────────────────────────── */}
      <section className="bg-tnt-gray dark:bg-tnt-slate">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <Eyebrow>Two Ways to Rent</Eyebrow>
          <h2 className="mt-3 font-display text-3xl tracking-wide uppercase sm:text-4xl">
            Operated or bare — your call
          </h2>

          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {RENTAL_MODELS.map((m) => (
              <div
                key={m.label}
                className="rounded-xl border border-black/12 bg-white p-6 dark:border-white/12 dark:bg-black sm:p-8"
              >
                <h3 className="font-body text-[13px] font-bold tracking-[0.16em] text-tnt-amber uppercase">
                  {m.label}
                </h3>
                <p className="mt-3 font-body text-[15px] leading-relaxed text-tnt-body">
                  {m.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Fleet range — capacity + classes, links back to About the Fleet ── */}
      <section>
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <Eyebrow>8 to 1,300 Tons</Eyebrow>
          <h2 className="mt-3 max-w-2xl font-display text-3xl tracking-wide uppercase sm:text-4xl">
            One fleet, six crane classes
          </h2>
          <p className="mt-4 max-w-2xl font-body text-base leading-relaxed text-tnt-body">
            Every rental draws on the same fleet backing the rest of TNT&apos;s
            capabilities — all-terrain to tower cranes, dispatched from 45+
            branches across the US and Canada.
          </p>

          <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {CRANE_CLASSES.map((c) => (
              <li
                key={c}
                className="flex items-center gap-3 rounded-lg border border-black/10 px-4 py-3 dark:border-white/10"
              >
                <Icon name="rental" className="h-5 w-5 shrink-0 text-tnt-amber" strokeWidth={1.5} />
                <span className="font-body text-sm font-semibold">{c}</span>
              </li>
            ))}
          </ul>

          <Link
            href="/#fleet-guide"
            className="mt-8 inline-flex items-center gap-2 font-body text-base font-semibold text-tnt-amber hover:text-black dark:hover:text-white"
          >
            See the full fleet
            <Icon name="arrow" className="h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* ── Closing CTA ──────────────────────────────────────────────────── */}
      <section className="bg-tnt-amber">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
          <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
            <p className="font-display text-2xl leading-tight tracking-wide text-black uppercase sm:text-3xl">
              Ready to rent a crane?
              <br />
              Tell us the load, the site, and the window.
            </p>
            <div className="flex shrink-0 gap-4">
              {/* No `onDark` on either button — this CTA panel is solid
                  amber in both Light and Dark mode (matches CoreServices'
                  own closing panel), so these always want the plain
                  "on-light" skin (black-filled primary, black-outline
                  secondary) regardless of the site's color-scheme toggle. */}
              <Button href="/#quote" variant="primary">
                Request a Quote
              </Button>
              <Button href="tel:+18007992505" variant="secondary">
                Call 1-800-799-2505
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
