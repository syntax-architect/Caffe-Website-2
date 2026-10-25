"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { Flame, Leaf, HandHeart, Coffee, BookOpen, CupSoda, Star } from "lucide-react";
import { gsap } from "@/components/gsap/gsap-provider";
import { SectionHeading } from "./section-heading";
import { Reveal } from "./reveal";
import { Ritual } from "./ritual";
import { ChapterSequence } from "./chapters";

/* GSAP-driven counter — counts up when scrolled into view. */
function Counter({
  to,
  suffix = "",
  decimals = 0,
}: {
  to: number;
  suffix?: string;
  decimals?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obj = { v: 0 };
    const ctx = gsap.context(() => {
      gsap.to(obj, {
        v: to,
        duration: 2.2,
        ease: "power3.out",
        onUpdate: () => {
          el.textContent = obj.v.toFixed(decimals) + suffix;
        },
        scrollTrigger: { trigger: el, start: "top 88%", once: true },
      });
    });
    return () => ctx.revert();
  }, [to, suffix, decimals]);

  return (
    <span ref={ref}>
      0{suffix}
    </span>
  );
}

const FEATURES = [
  {
    icon: Flame,
    title: "Roasted in-house, daily",
    text: "Our 12kg drum roaster fires at 5 AM. Nothing on the bar is ever older than nine days post-roast.",
  },
  {
    icon: Leaf,
    title: "Direct-trade origins",
    text: "We buy from twelve family farms across Ethiopia, Colombia and Sumatra — at 2.4× fair-trade base price.",
  },
  {
    icon: HandHeart,
    title: "Poured with patience",
    text: "Every shot is dialled in each morning and re-dialled at noon. If it isn't golden, it doesn't leave the bar.",
  },
];

const STATS = [
  { to: 12, suffix: "", label: "Single origins", decimals: 0, icon: Coffee },
  { to: 38, suffix: "", label: "House recipes", decimals: 0, icon: BookOpen },
  { to: 240, suffix: "k", label: "Cups a year", decimals: 0, icon: CupSoda },
  { to: 4.9, suffix: "", label: "Guest rating", decimals: 1, icon: Star },
];

export function Story() {
  const ref = useRef<HTMLElement>(null);

  /* GSAP parallax on the image stack + rotating badge */
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to(".story-img-1", {
        yPercent: -9,
        ease: "none",
        scrollTrigger: { trigger: ref.current, start: "top bottom", end: "bottom top", scrub: true },
      });
      gsap.fromTo(
        ".story-img-2",
        { yPercent: 14 },
        {
          yPercent: -12,
          ease: "none",
          scrollTrigger: { trigger: ref.current, start: "top bottom", end: "bottom top", scrub: true },
        }
      );
      gsap.to(".story-badge", {
        rotate: 140,
        ease: "none",
        scrollTrigger: { trigger: ref.current, start: "top bottom", end: "bottom top", scrub: true },
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section
      id="craft"
      ref={ref}
      className="relative overflow-hidden py-24 sm:py-32 lg:py-40"
      aria-labelledby="craft-heading"
    >
      {/* ambient glow */}
      <div
        className="pointer-events-none absolute -left-40 top-1/3 h-[480px] w-[480px] rounded-full bg-[#c89b6a]/6 blur-[120px]"
        aria-hidden
      />

      <div className="mx-auto grid w-full max-w-7xl items-center gap-16 px-5 sm:px-8 lg:grid-cols-2 lg:gap-24">
        {/* ——— Image stack with GSAP parallax ——— */}
        <div className="relative order-2 lg:order-1">
          <div className="story-img-1 will-transform">
            <Reveal direction="right" amount={0.25}>
              <div className="shine relative overflow-hidden rounded-[2rem] border border-[#c89b6a]/20">
                <div className="relative aspect-[4/5]">
                  <Image
                    src="/images/barista-pour.jpg"
                    alt="Barista pouring latte art at the NOIRÉ bar"
                    fill
                    sizes="(min-width: 1024px) 42vw, 92vw"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0807]/50 to-transparent" />
                </div>
              </div>
            </Reveal>
          </div>

          {/* overlapping secondary image */}
          <div className="story-img-2 absolute -bottom-10 -right-3 w-2/5 will-transform sm:-right-8 sm:w-[46%]">
            <Reveal direction="up" delay={0.2} amount={0.4}>
              <div className="relative overflow-hidden rounded-2xl border-4 border-[#0a0807] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.8)]">
                <div className="relative aspect-square">
                  <Image
                    src="/images/beans-portrait.jpg"
                    alt="Freshly roasted single-origin coffee beans"
                    fill
                    sizes="(min-width: 1024px) 20vw, 40vw"
                    className="object-cover"
                  />
                </div>
              </div>
            </Reveal>
          </div>

          {/* rotating est. badge */}
          <div className="story-badge absolute -left-4 -top-8 z-10 sm:-left-8 sm:-top-10" aria-hidden>
            <div className="relative grid h-24 w-24 place-items-center rounded-full border border-[#c89b6a]/40 bg-[#14100d]/90 backdrop-blur-md sm:h-28 sm:w-28">
              <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full">
                <defs>
                  <path
                    id="badge-circle"
                    d="M 50,50 m -36,0 a 36,36 0 1,1 72,0 a 36,36 0 1,1 -72,0"
                  />
                </defs>
                <text className="fill-[#c89b6a] text-[9.5px] font-semibold uppercase tracking-[0.24em]">
                  <textPath href="#badge-circle">
                    est 2016 · noiré coffee ·
                  </textPath>
                </text>
              </svg>
              <span className="font-display text-lg italic text-[#e9d3a8]">
                9<span className="text-sm">yr</span>
              </span>
            </div>
          </div>
        </div>

        {/* ——— Copy ——— */}
        <div className="order-1 lg:order-2">
          <SectionHeading
            id="craft-heading"
            eyebrow="The Craft"
            title={
              <>
                Nine years of chasing the{" "}
                <em className="text-gold-gradient font-light italic">
                  perfect extraction
                </em>
              </>
            }
          />

          <Reveal delay={0.2}>
            <div className="mt-8 space-y-5 text-base leading-relaxed text-[#c9bba6]">
              <p>
                NOIRÉ began as a two-seat espresso bar wedged between a
                bookbinder and a florist — one machine, one grinder, and a
                stubborn belief that coffee deserves the same reverence as
                wine. Nine years later, the room is bigger. The belief
                hasn&apos;t moved an inch.
              </p>
              <p>
                Every lot we buy is cupped blind, scored, and roasted on
                premises in batches small enough to taste our mistakes
                before you do. It is slower this way. It is also the only
                way we know.
              </p>
            </div>
          </Reveal>

          {/* Feature list */}
          <div className="mt-10 space-y-6">
            {FEATURES.map((f, i) => (
              <Reveal key={f.title} delay={0.12 + i * 0.1} direction="up">
                <div className="group flex items-start gap-5">
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-[#c89b6a]/25 bg-[#14100d] text-[#c89b6a] transition-all duration-500 group-hover:border-[#c89b6a] group-hover:bg-[#c89b6a] group-hover:text-[#14100d]">
                    <f.icon className="h-5 w-5" strokeWidth={1.5} />
                  </span>
                  <div>
                    <p className="font-mono text-[0.55rem] uppercase tracking-[0.3em] text-[#c89b6a]/70" aria-hidden>
                      {String(i + 1).padStart(2, "0")}
                    </p>
                    <h3 className="font-display mt-0.5 text-lg font-medium text-[#f4eddf]">
                      {f.title}
                    </h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-[#a6947f]">
                      {f.text}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>

      {/* ——— v4: The Ritual — pinned stacking-cards sequence ——— */}
      <Ritual />

      {/* ——— Pinned 3D chapter scroll sequence ——— */}
      <ChapterSequence />

      {/* ——— Counters ——— */}
      <div className="mx-auto mt-24 w-full max-w-7xl px-5 sm:mt-32 sm:px-8">
        <Reveal>
          <dl className="corner-ticks grid grid-cols-2 gap-px overflow-hidden rounded-3xl border border-[#c89b6a]/15 bg-[#c89b6a]/10 lg:grid-cols-4">
            {STATS.map((s) => (
              <div
                key={s.label}
                className="group relative bg-[#16110d]/85 px-8 py-10 text-center backdrop-blur-sm transition-colors duration-500 hover:bg-[#1e1712] sm:py-12"
              >
                <s.icon
                  className="absolute right-6 top-6 h-5 w-5 text-[#c89b6a]/25 transition-all duration-500 group-hover:scale-110 group-hover:text-[#c89b6a]/75"
                  strokeWidth={1.5}
                  aria-hidden
                />
                <dd className="font-display text-4xl font-medium text-[#e9d3a8] transition-transform duration-500 group-hover:scale-105 sm:text-5xl">
                  <Counter to={s.to} suffix={s.suffix} decimals={s.decimals} />
                </dd>
                <dt className="mt-3 text-[0.65rem] font-bold uppercase tracking-[0.26em] text-[#a6947f]">
                  {s.label}
                </dt>
              </div>
            ))}
          </dl>
        </Reveal>
      </div>
    </section>
  );
}
