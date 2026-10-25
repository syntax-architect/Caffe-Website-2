"use client";

import { Star, Quote } from "lucide-react";
import { SectionHeading } from "./section-heading";
import { Reveal } from "./reveal";

interface Review {
  quote: string;
  name: string;
  role: string;
  initials: string;
}

const ROW_ONE: Review[] = [
  {
    quote:
      "The Noir is the best espresso I've had outside Milan. I've stopped ordering coffee anywhere else in the city — it just feels like settling.",
    name: "Amara Chen",
    role: "Food critic, The Ledger",
    initials: "AC",
  },
  {
    quote:
      "I wrote half my novel at the window seat in the Conservatory. Nobody rushes you, the light is perfect, and the cardamom knots should be illegal.",
    name: "Jonas Reiner",
    role: "Novelist",
    initials: "JR",
  },
  {
    quote:
      "Watched a siphon brew prepared tableside like a ceremony. My father — a lifetime barista — went quiet, then asked for a job application.",
    name: "Sofia Marchetti",
    role: "Regular since 2017",
    initials: "SM",
  },
  {
    quote:
      "Basque cheesecake with a Kyoto drip on a rainy Tuesday. I genuinely teared up. My therapist now recommends this place to patients.",
    name: "Dev Patel",
    role: "Guest",
    initials: "DP",
  },
];

const ROW_TWO: Review[] = [
  {
    quote:
      "Every cafe claims 'craft'. NOIRÉ is the only one where you can taste the obsession in the first sip — and the ninety-ninth.",
    name: "Elena Voss",
    role: "Q-grader",
    initials: "EV",
  },
  {
    quote:
      "They remembered my order, my name, and my dog's name by visit three. The coffee is world-class; the warmth is something rarer.",
    name: "Marcus Webb",
    role: "Neighbourhood local",
    initials: "MW",
  },
  {
    quote:
      "As a pastry chef I'm insufferable about croissants. 72 hours of lamination you can hear shatter. I have no further notes.",
    name: "Linh Tran",
    role: "Executive pastry chef",
    initials: "LT",
  },
  {
    quote:
      "Took a client here instead of a boardroom. Deal closed before the Chemex finished. That's the strongest review I can give.",
    name: "Harold Kim",
    role: "Founder, Rampart Studio",
    initials: "HK",
  },
];

function Stars({ count = 5 }: { count?: number }) {
  return (
    <div className="flex gap-1" aria-label={`${count} out of 5 stars`}>
      {Array.from({ length: count }).map((_, i) => (
        <Star key={i} className="h-3.5 w-3.5 fill-[#c89b6a] text-[#c89b6a]" />
      ))}
    </div>
  );
}

function ReviewCard({ review }: { review: Review }) {
  return (
    <article className="group relative mx-3 w-[320px] shrink-0 overflow-hidden rounded-3xl border border-[#c89b6a]/15 bg-[#14100d]/90 p-7 transition-colors duration-500 hover:border-[#c89b6a]/40 sm:w-[400px]">
      <Quote
        className="absolute -right-3 -top-3 h-20 w-20 text-[#c89b6a]/8 transition-colors duration-500 group-hover:text-[#c89b6a]/15"
        aria-hidden
      />
      <Stars />
      <blockquote className="mt-4 text-pretty text-sm leading-relaxed text-[#d8ccb8] sm:text-[0.95rem]">
        “{review.quote}”
      </blockquote>
      <footer className="mt-6 flex items-center gap-4">
        <span className="font-display grid h-11 w-11 place-items-center rounded-full border border-[#c89b6a]/35 bg-[#1c1611] text-sm font-medium text-[#e9d3a8]">
          {review.initials}
        </span>
        <div>
          <p className="text-sm font-bold text-[#f4eddf]">{review.name}</p>
          <p className="text-xs text-[#a6947f]">{review.role}</p>
        </div>
      </footer>
    </article>
  );
}

export function Testimonials() {
  return (
    <section
      id="reviews"
      className="relative overflow-hidden bg-[#0d0a08] py-24 sm:py-32"
      aria-labelledby="reviews-heading"
    >
      <div
        className="pointer-events-none absolute -left-40 top-1/2 h-[420px] w-[420px] -translate-y-1/2 rounded-full bg-[#c89b6a]/6 blur-[130px]"
        aria-hidden
      />

      <div className="mx-auto w-full max-w-7xl px-5 sm:px-8">
        <SectionHeading
          id="reviews-heading"
          eyebrow="Word of Mouth"
          align="center"
          title={
            <>
              What the room{" "}
              <em className="text-gold-gradient font-light italic">
                keeps saying
              </em>
            </>
          }
        />

        <Reveal delay={0.15} className="mt-8 flex justify-center">
          <div className="glass inline-flex flex-wrap items-center justify-center gap-x-5 gap-y-2 rounded-full px-7 py-3.5">
            <Stars />
            <span className="font-display text-lg font-medium text-[#f4eddf]">
              4.9 <span className="text-sm text-[#a6947f]">/ 5</span>
            </span>
            <span className="hidden h-4 w-px bg-[#c89b6a]/30 sm:block" aria-hidden />
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#a6947f]">
              2,400+ guest reviews
            </span>
          </div>
        </Reveal>
      </div>

      {/* marquee rows */}
      <Reveal delay={0.2} amount={0.1}>
        <div className="marquee-paused relative mt-14 space-y-6">
          {/* edge fades */}
          <div
            className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-[#0d0a08] to-transparent sm:w-32"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-[#0d0a08] to-transparent sm:w-32"
            aria-hidden
          />

          <div className="overflow-hidden">
            <div
              className="marquee-track py-1"
              style={{ ["--marquee-duration" as string]: "56s" }}
            >
              {[0, 1].map((dup) => (
                <div key={dup} className="flex shrink-0" aria-hidden={dup === 1}>
                  {ROW_ONE.map((r) => (
                    <ReviewCard key={`${dup}-${r.name}`} review={r} />
                  ))}
                </div>
              ))}
            </div>
          </div>

          <div className="overflow-hidden">
            <div
              className="marquee-track reverse py-1"
              style={{ ["--marquee-duration" as string]: "64s" }}
            >
              {[0, 1].map((dup) => (
                <div key={dup} className="flex shrink-0" aria-hidden={dup === 1}>
                  {ROW_TWO.map((r) => (
                    <ReviewCard key={`${dup}-${r.name}`} review={r} />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
