"use client";

/**
 * SAFETY CULTURE — iCARE.
 *
 * TNT's safety program, given its own moment right before the homepage's
 * convert beat (CaseStudies "prove it" → this → ContactSection "convert").
 * Same maroon contrast-band pattern ClientSelfService established: the band
 * color itself marks the section, eyebrow + h2 + subline up top, then a
 * supporting row below.
 *
 * Logo: Assets/PNG Logos/iCARE_Badge-Logo (copied to public/brand/icare-badge.png).
 * The Badge variant was used instead of Primary/Secondary because both of
 * those bake "Safety Culture Starts With Me" in as black text on a
 * transparent background — illegible on this section's maroon fill. The
 * Badge is a self-contained shield (works on any background), so the
 * tagline is set here as real text instead, in the site's own type.
 *
 * 2026-09-07: Theme 2 (see themeVersionStore.ts / ThemeToggle.tsx) swaps
 * this band from maroon to dark slate, on request — a same-session
 * comparison of the red used here specifically. Theme 1 is unchanged.
 * Removed 2026-09-10 (theme one dropped project-wide, slate made permanent),
 * RESTORED 2026-09-14 on request ("one more theme to show to my manager") —
 * back to the original conditional below, EXCEPT theme one's own fill:
 * "change red to dark color" (2026-09-14, same day) swapped it from
 * `bg-tnt-maroon` to `bg-tnt-navy` (pure black — a different dark from
 * theme two's slate, so the two toggle states still read as distinct). No
 * other color changed as part of that request.
 *
 * THEME 1 IS LIGHT NOW (2026-09-15, on request — "iCARE needs to be in
 * light theme," confirmed as Theme 1 only, Theme 2 stays dark slate): the
 * section shell is `bg-white` on Theme 1, every white/N text/border utility
 * that existed to read against a dark fill is now the equivalent black/N,
 * and the pillar/badge chip fills flip from `bg-white/5` to `bg-black/5`.
 * The iCARE badge PNG and the amber accents are unchanged — both already
 * read fine on white. Theme 2 keeps its original dark styling untouched.
 *
 * 2026-07-30: the certification-chip row briefly moved to a new strip right
 * after the hero (CertificationsStrip), to avoid the same five badges
 * appearing twice on one page. That strip couldn't get real, rights-cleared
 * logos for these credentials on short notice (see its own history — moved
 * from fabricated seal art to a "pending" placeholder rather than risk an
 * unverified compliance claim), so the strip was repurposed to show TNT's
 * own Family of Companies logos instead, and the certification chips moved
 * back here — their original, and now only, home.
 */

import { Icon, type IconName } from "./primitives";
import Reveal from "./Reveal";
import { useThemeVersion } from "./themeVersionStore";
import { useColorScheme } from "./colorSchemeStore";

const BADGES = ["ISO 9001", "NCCCO Certified", "OSHA VPP", "ISNetworld", "Avetta"];

const PILLARS: { icon: IconName; title: string; body: string }[] = [
  {
    icon: "person",
    title: "Stop-Work Authority",
    body: "Every employee — on any job, at any level — can halt work that doesn't meet our standard. No exceptions, no penalty for calling it.",
  },
  {
    icon: "engineering",
    title: "Certified Operators",
    body: "NCCCO-certified crews, daily equipment inspections, and a stamped lift plan before the first pick.",
  },
  {
    icon: "trophy",
    title: "Measured Every Month",
    body: "Safety performance is tracked and reported at every branch — not an annual review, a running standard.",
  },
];

export default function SafetyCulture() {
  const [themeVersion] = useThemeVersion();
  // Same rule as CoreServices.tsx: Light/Dark and Theme 1/2 never affect
  // each other's state, but either one alone forces this section dark.
  const [colorScheme] = useColorScheme();
  const dark = themeVersion === "two" || colorScheme === "dark";

  return (
    <section
      id="safety"
      className={`scroll-mt-32 ${dark ? "bg-tnt-slate" : "bg-white"}`}
    >
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
        <div className="grid items-center gap-10 lg:grid-cols-[auto_1fr] lg:gap-16">
          {/* Badge — self-contained shield mark, reads fine on either fill. */}
          <Reveal className="flex justify-center lg:justify-start">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand/icare-badge.png"
              alt="iCARE safety program badge"
              className="h-32 w-32 sm:h-40 sm:w-40"
            />
          </Reveal>

          <Reveal delay={80} className="max-w-2xl">
            <p className="font-body text-[13px] font-bold tracking-[0.18em] text-tnt-amber uppercase">
              iCARE
            </p>
            <h2
              className={`mt-3 font-display text-4xl tracking-wide uppercase sm:text-5xl ${dark ? "text-white" : "text-black"}`}
            >
              Safety Culture Starts With Me
            </h2>
            <p
              className={`mt-4 font-body text-base sm:text-lg ${dark ? "text-white/80" : "text-black/70"}`}
            >
              iCARE is TNT&rsquo;s safety program — every operator, rigger, and
              crew member is personally accountable for the job running
              safely, on every lift, at every branch.
            </p>
          </Reveal>
        </div>

        <ul className="mt-14 grid gap-6 sm:grid-cols-3">
          {PILLARS.map((p, i) => (
            <li key={p.title}>
              <Reveal delay={i * 100} className="h-full">
                <div
                  className={`flex h-full flex-col rounded-xl border p-6 ${
                    dark ? "border-white/15 bg-white/5" : "border-black/12 bg-black/[0.03]"
                  }`}
                >
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-tnt-amber text-white">
                    <Icon name={p.icon} className="h-6 w-6" />
                  </span>
                  <h3
                    className={`mt-5 font-display text-xl tracking-wide uppercase ${dark ? "text-white" : "text-black"}`}
                  >
                    {p.title}
                  </h3>
                  <p
                    className={`mt-2 flex-1 font-body text-sm leading-relaxed ${dark ? "text-white/75" : "text-black/60"}`}
                  >
                    {p.body}
                  </p>
                </div>
              </Reveal>
            </li>
          ))}
        </ul>

        <div className={`mt-14 border-t pt-8 ${dark ? "border-white/10" : "border-black/10"}`}>
          <p className="text-center font-body text-[13px] font-bold tracking-[0.18em] text-tnt-amber uppercase lg:text-left">
            Certifications &amp; Compliance
          </p>
          <ul className="mt-5 flex flex-wrap justify-center gap-3 lg:justify-start">
            {BADGES.map((b) => (
              <li
                key={b}
                className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 font-body text-sm font-semibold ${
                  dark
                    ? "border-white/15 bg-white/5 text-white/85"
                    : "border-black/12 bg-black/[0.03] text-black/75"
                }`}
              >
                <Icon name="engineering" className="h-4 w-4 text-tnt-amber" />
                {b}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
