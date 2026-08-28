"use client";

/**
 * REQUEST A QUOTE — the primary conversion action (was entirely missing).
 *
 * Enerblock "tell us about your project" band, in our design system. Front-end
 * only: on submit it shows a success state — there is NO backend yet, so wire
 * the handler to a real endpoint/email service before launch. Services are
 * multi-select chips (reusing the Coverage filter-pill treatment).
 */

import { useState, type FormEvent } from "react";
import { Eyebrow } from "./primitives";
import Button from "./Button";
import RevealText from "./RevealText";

const SERVICES = [
  "Crane Rental",
  "Specialized Rigging",
  "Machinery Moving",
  "Industrial Storage",
  "Engineering",
];

const field =
  "w-full rounded-md border border-black/15 bg-white px-4 py-3 font-body text-sm text-black placeholder:text-tnt-meta focus:border-tnt-amber focus:ring-1 focus:ring-tnt-amber focus:outline-none";
const label =
  "block font-body text-[11px] font-semibold tracking-[0.16em] text-tnt-meta uppercase";

export default function RequestQuote() {
  const [selected, setSelected] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);

  const toggle = (s: string) =>
    setSelected((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s],
    );

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    // TODO: POST to a real endpoint / email service.
    setSubmitted(true);
  };

  return (
    <section id="quote" className="scroll-mt-32 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,22rem)_1fr] lg:gap-16">
          {/* Left — statement */}
          <div className="lg:sticky lg:top-[var(--chrome-h)] lg:self-start">
            <Eyebrow>Request a Quote</Eyebrow>
            <RevealText
              as="h2"
              text="Request a Job Quote"
              className="mt-3 font-display text-4xl tracking-wide text-black uppercase sm:text-5xl"
            />
            <p className="mt-4 font-body text-base text-tnt-body sm:text-lg">
              Tell us about the lift and a TNT rep will follow up with capacity,
              availability, and pricing. Prefer to talk it through?
            </p>
            <p className="mt-2 font-mono text-sm text-tnt-navy">
              Call 1-800-799-2505 — 24/7.
            </p>
          </div>

          {/* Right — form */}
          {submitted ? (
            <div className="flex flex-col items-start justify-center rounded-2xl border border-black/10 bg-white p-8 sm:p-12">
              <span className="font-display text-3xl tracking-wide text-tnt-navy uppercase sm:text-4xl">
                Request received
              </span>
              <p className="mt-3 max-w-md font-body text-base text-tnt-body">
                Thanks — a TNT Sales Representative will be in touch shortly. For
                anything urgent, call{" "}
                <a href="tel:+18007992505" className="font-semibold text-tnt-amber">
                  1-800-799-2505
                </a>
                .
              </p>
            </div>
          ) : (
            <form
              onSubmit={onSubmit}
              className="rounded-2xl border border-black/10 bg-white p-6 sm:p-8"
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="q-name" className={label}>
                    Full name
                  </label>
                  <input id="q-name" name="name" required className={`mt-2 ${field}`} />
                </div>
                <div>
                  <label htmlFor="q-company" className={label}>
                    Company
                  </label>
                  <input id="q-company" name="company" className={`mt-2 ${field}`} />
                </div>
                <div>
                  <label htmlFor="q-email" className={label}>
                    Email
                  </label>
                  <input id="q-email" name="email" type="email" required className={`mt-2 ${field}`} />
                </div>
                <div>
                  <label htmlFor="q-phone" className={label}>
                    Phone
                  </label>
                  <input id="q-phone" name="phone" type="tel" className={`mt-2 ${field}`} />
                </div>
              </div>

              {/* Services — multi-select chips */}
              <fieldset className="mt-6">
                <legend className={label}>Services required</legend>
                <div className="mt-3 flex flex-wrap gap-2">
                  {SERVICES.map((s) => {
                    const on = selected.includes(s);
                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => toggle(s)}
                        aria-pressed={on}
                        className={`rounded-full border px-4 py-2 font-body text-sm font-semibold transition-colors ${
                          on
                            ? "border-tnt-amber bg-tnt-amber text-black"
                            : "border-black/15 text-tnt-body hover:border-black/40 hover:text-black"
                        }`}
                      >
                        {s}
                      </button>
                    );
                  })}
                </div>
              </fieldset>

              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="q-start" className={label}>
                    Start date
                  </label>
                  <input id="q-start" name="start" type="date" className={`mt-2 ${field}`} />
                </div>
                <div>
                  <label htmlFor="q-duration" className={label}>
                    Estimated duration
                  </label>
                  <input
                    id="q-duration"
                    name="duration"
                    placeholder="e.g. 3 days"
                    className={`mt-2 ${field}`}
                  />
                </div>
              </div>

              <div className="mt-6">
                <label htmlFor="q-desc" className={label}>
                  Project description
                </label>
                <textarea
                  id="q-desc"
                  name="description"
                  rows={4}
                  placeholder="Load, radius, site conditions, access…"
                  className={`mt-2 ${field} resize-y`}
                />
              </div>

              <div className="mt-6">
                <label htmlFor="q-file" className={label}>
                  Attach a drawing or spec (optional)
                </label>
                <input
                  id="q-file"
                  name="file"
                  type="file"
                  className="mt-2 block w-full font-body text-sm text-tnt-body file:mr-4 file:rounded-md file:border-0 file:bg-black file:px-4 file:py-2 file:font-semibold file:text-white hover:file:bg-tnt-navy"
                />
              </div>

              <label className="mt-6 flex items-start gap-3 font-body text-[13px] leading-relaxed text-tnt-body">
                <input type="checkbox" name="consent" className="mt-1 h-4 w-4 accent-tnt-amber" />
                <span>
                  I agree to receive text messages from TNT Crane &amp; Rigging
                  about my request. Reply STOP to opt out. Message &amp; data
                  rates may apply.
                </span>
              </label>

              <div className="mt-8">
                <Button type="submit" variant="primary">
                  Submit request
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
