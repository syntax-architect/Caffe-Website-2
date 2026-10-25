"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { gsap } from "@/components/gsap/gsap-provider";

/**
 * The Ritual — v4 stacking-cards scroll sequence.
 *
 * The stage pins and each step card slides up over the previous one
 * while the cards beneath scale back and dim in perspective. A scrub-
 * drawn "extraction curve" traces the brew on the way in. Implemented
 * with a ScrollTrigger pin (not CSS sticky) so it stays butter-smooth
 * on mobile inside ScrollSmoother.
 */

const STEPS = [
  {
    index: "01",
    kicker: "Dose",
    title: "18.0 grams, weighed to the tenth",
    copy: "Every cup starts on the scale — 18 grams of single origin, ground nine seconds before water touches it. A tenth of a gram off and the shot is rebuilt, not served.",
    chips: ["0.1 g tolerance", "Ground to order"],
    img: "/images/beans-spoon.jpg",
    alt: "Scoop of freshly roasted beans over the grinder",
  },
  {
    index: "02",
    kicker: "Bloom",
    title: "Forty-five seconds of patience",
    copy: "Twice the coffee's weight in water at 93°C, and the bed rises and breathes. The bloom releases the roast's trapped CO₂ — skip it and every pour after tastes sharp.",
    chips: ["93°C exact", "2:1 water"],
    img: "/images/barista-pour.jpg",
    alt: "Water blooming fresh grounds during a pour-over",
  },
  {
    index: "03",
    kicker: "Pour",
    title: "Two minutes forty-five, in slow spirals",
    copy: "Three pours, each in a slow spiral from the rim inward. The kettle never stops moving — agitation is flavour's best friend and its fastest destroyer.",
    chips: ["Spiral pour", "2:45 total"],
    img: "/images/hero-card.jpg",
    alt: "Finished flat white with latte art on the walnut bar",
  },
  {
    index: "04",
    kicker: "Serve",
    title: "A warm cup, in a warmer room",
    copy: "Cups are heated to 55°C before the first pour lands. Then it crosses the bar in under thirty seconds — because the last meter of the ritual matters as much as the first.",
    chips: ["55°C cup", "30s to table"],
    img: "/images/interior-square.jpg",
    alt: "Sunlit corner of the NOIRÉ room with ceramics",
  },
];

/** Decorative extraction curve — draws itself with the scroll. */
function ExtractionCurve() {
  const pathRef = useRef<SVGPathElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const path = pathRef.current;
    const wrap = wrapRef.current;
    if (!path || !wrap) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const len = path.getTotalLength();
    const ctx = gsap.context(() => {
      gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });
      gsap.to(path, {
        strokeDashoffset: 0,
        ease: "none",
        scrollTrigger: {
          trigger: wrap,
          start: "top 85%",
          end: "top 25%",
          scrub: true,
        },
      });
      gsap.fromTo(
        ".curve-dot",
        { scale: 0, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          stagger: 0.12,
          ease: "back.out(2.5)",
          scrollTrigger: { trigger: wrap, start: "top 55%", once: true },
        }
      );
    }, wrap);
    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={wrapRef}
      className="pointer-events-none mx-auto mt-10 w-full max-w-3xl"
      aria-hidden
    >
      <svg viewBox="0 0 720 140" fill="none" className="h-20 w-full sm:h-24">
        <path
          ref={pathRef}
          d="M8 118 C 96 118, 118 30, 214 30 S 330 108, 424 96 S 560 22, 648 30"
          stroke="url(#curve-gold)"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        <circle className="curve-dot" cx="8" cy="118" r="4" fill="#c89b6a" />
        <circle className="curve-dot" cx="214" cy="30" r="4" fill="#e9d3a8" />
        <circle className="curve-dot" cx="424" cy="96" r="4" fill="#c89b6a" />
        <circle className="curve-dot" cx="648" cy="30" r="4" fill="#e9d3a8" />
        <defs>
          <linearGradient id="curve-gold" x1="0" y1="0" x2="720" y2="0" gradientUnits="userSpaceOnUse">
            <stop stopColor="#9a7248" />
            <stop offset="0.5" stopColor="#e9d3a8" />
            <stop offset="1" stopColor="#c89b6a" />
          </linearGradient>
        </defs>
      </svg>
      <div className="mt-2 flex justify-between font-mono text-[0.55rem] uppercase tracking-[0.24em] text-[#a6947f]/70">
        <span>extraction</span>
        <span>time</span>
      </div>
    </div>
  );
}

export function Ritual() {
  const wrap = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ctx = gsap.context(() => {
      const slots = gsap.utils.toArray<HTMLElement>(".ritual-slot");
      const rail = document.querySelector<HTMLElement>(".ritual-rail-fill");
      const num = document.querySelector<HTMLElement>(".ritual-count-current");

      const paint = (progress: number) => {
        if (rail) rail.style.transform = `scaleX(${progress})`;
        if (num) {
          const idx = Math.min(
            STEPS.length - 1,
            Math.floor(progress * STEPS.length + 0.14)
          );
          num.textContent = String(idx + 1).padStart(2, "0");
        }
      };

      if (reduce) {
        // static, readable stack — no pin, no transforms
        gsap.set(stage.current, { height: "auto" });
        gsap.set(slots, { position: "relative", autoAlpha: 1, yPercent: 0 });
        gsap.set(".ritual-slot + .ritual-slot", { marginTop: "1.5rem" });
        return;
      }

      gsap.set(slots[0], { autoAlpha: 1 });
      gsap.set(slots.slice(1), { autoAlpha: 0, yPercent: 55 });

      const tl = gsap.timeline({
        defaults: { ease: "power2.out" },
        scrollTrigger: {
          trigger: stage.current,
          start: "top top",
          end: () => `+=${window.innerHeight * 3.4}`,
          scrub: 1,
          pin: stage.current,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => paint(self.progress),
        },
      });

      const BEAT = 0.45;
      for (let i = 1; i < slots.length; i++) {
        const at = i - 1 + BEAT;
        // next card rises over the stack
        tl.to(
          slots[i],
          {
            autoAlpha: 1,
            yPercent: 0,
            rotate: 0,
            transformPerspective: 1200,
            duration: 1,
          },
          at
        );
        // cards beneath scale back & dim, layered by depth
        for (let j = 0; j < i; j++) {
          const depth = i - j;
          tl.to(
            slots[j].querySelector(".ritual-card"),
            {
              scale: 1 - depth * 0.042,
              filter: `brightness(${Math.max(0.45, 1 - depth * 0.17)})`,
              duration: 1,
              ease: "power1.out",
            },
            at
          );
        }
        // a beat to read the card
        tl.to({}, { duration: BEAT });
      }
    }, wrap);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={wrap} className="relative mt-28 sm:mt-36" id="ritual">
      {/* micro-header */}
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="flex flex-col items-center text-center">
          <div className="flex items-center gap-4">
            <span className="h-px w-10 bg-gradient-to-r from-transparent to-[#c89b6a]" aria-hidden />
            <p className="eyebrow">The Ritual</p>
            <span className="h-px w-10 bg-gradient-to-l from-transparent to-[#c89b6a]" aria-hidden />
          </div>
          <h3 className="font-display mt-5 max-w-2xl text-balance text-3xl font-medium leading-tight text-[#f4eddf] sm:text-4xl lg:text-5xl">
            Four steps.{" "}
            <em className="text-gold-gradient font-light italic">Zero shortcuts.</em>
          </h3>
          <p className="mt-4 max-w-xl text-pretty text-sm leading-relaxed text-[#a6947f] sm:text-base">
            The same pour-over, performed the same way, every single time
            it is ordered. Keep scrolling to watch it stack.
          </p>
        </div>

        <ExtractionCurve />
      </div>

      {/* pinned stage */}
      <div
        ref={stage}
        className="perspective-1200 relative mt-6 h-[100svh] overflow-visible"
      >
        {STEPS.map((s, i) => (
          <div
            key={s.index}
            className="ritual-slot absolute inset-0 z-10 flex items-center px-5 will-transform sm:px-8"
            style={{ zIndex: 10 + i }}
            aria-hidden={i !== 0}
          >
            <article className="ritual-card shine relative mx-auto grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-[#c89b6a]/25 bg-[#14100d]/95 shadow-[0_70px_140px_-40px_rgba(0,0,0,0.9)] will-transform lg:grid-cols-[1.05fr_0.95fr]">
              {/* copy side */}
              <div className="flex flex-col justify-center gap-5 p-8 sm:p-12 lg:p-14">
                <div className="flex items-center gap-4">
                  <span className="font-mono text-[0.65rem] tracking-[0.3em] text-[#c89b6a]">
                    {s.index}
                  </span>
                  <span className="h-px flex-1 bg-[#c89b6a]/20" aria-hidden />
                  <span className="text-[0.6rem] font-bold uppercase tracking-[0.3em] text-[#a6947f]">
                    {s.kicker}
                  </span>
                </div>
                <h4 className="font-display text-balance text-2xl font-medium leading-tight text-[#f4eddf] sm:text-3xl lg:text-4xl">
                  {s.title}
                </h4>
                <p className="max-w-md text-pretty text-sm leading-relaxed text-[#a6947f] sm:text-base">
                  {s.copy}
                </p>
                <div className="flex flex-wrap gap-2.5">
                  {s.chips.map((c) => (
                    <span
                      key={c}
                      className="rounded-full border border-[#c89b6a]/30 px-3.5 py-1.5 font-mono text-[0.58rem] uppercase tracking-[0.18em] text-[#e9d3a8]"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>

              {/* image side */}
              <div className="relative min-h-[220px] overflow-hidden lg:min-h-[440px]">
                <Image
                  src={s.img}
                  alt={s.alt}
                  fill
                  sizes="(min-width: 1024px) 40rem, 92vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[#14100d] via-[#14100d]/25 to-transparent max-lg:opacity-70" aria-hidden />
                <p
                  className="font-display pointer-events-none absolute bottom-4 right-6 text-7xl font-light leading-none text-[#f4eddf]/15 sm:text-8xl"
                  aria-hidden
                >
                  {s.index}
                </p>
              </div>
            </article>
          </div>
        ))}

        {/* progress rail */}
        <div className="absolute bottom-12 left-1/2 z-30 flex w-64 -translate-x-1/2 items-center gap-4 sm:w-80">
          <span className="font-mono text-[0.65rem] tabular-nums text-[#c89b6a]">
            <span className="ritual-count-current">01</span>
            <span className="text-[#a6947f]"> / 04</span>
          </span>
          <div className="h-px flex-1 bg-[#c89b6a]/15">
            <div className="ritual-rail-fill h-full w-full origin-left scale-x-0 bg-gradient-to-r from-[#9a7248] to-[#e9d3a8]" />
          </div>
          <span className="font-mono text-[0.65rem] text-[#a6947f]">POUR</span>
        </div>
      </div>
    </div>
  );
}
