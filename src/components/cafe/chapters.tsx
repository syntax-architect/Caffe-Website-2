"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { gsap } from "@/components/gsap/gsap-provider";
import { cn } from "@/lib/utils";

/**
 * Pinned 3D chapter sequence — the room pins, three chapters of the
 * craft rotate through in perspective as the guest scrolls. Progress
 * rail + chapter counter react to the same scrub timeline.
 */

const CHAPTERS = [
  {
    index: "01",
    kicker: "Sourcing",
    title: "Twelve farms, one standard",
    copy: "We travel to origin every harvest, cup blind with the growers, and pay 2.4× fair-trade base. If a lot doesn't move us at the table, it never reaches the roastery.",
    img: "/images/beans-portrait.jpg",
    alt: "Fresh single-origin coffee beans in a roasting drum",
    tilt: -3.5,
  },
  {
    index: "02",
    kicker: "Roasting",
    title: "Fired at five, rested by nine",
    copy: "Our 12kg drum roasts in batches small enough to taste our mistakes before you do. Every roast is logged, curve-matched, and rested 48 hours before it touches the grinder.",
    img: "/images/beans-spoon.jpg",
    alt: "Roasted beans resting after the morning roast",
    tilt: 3,
  },
  {
    index: "03",
    kicker: "Ritual",
    title: "Twenty-five golden seconds",
    copy: "Dialled in at dawn, re-dialled at noon. Every shot is weighed, timed and tasted — because coffee deserves the same reverence as wine, and the room was built to prove it.",
    img: "/images/barista-pour.jpg",
    alt: "Barista pouring latte art at the NOIRÉ bar",
    tilt: -3,
  },
];

export function ChapterSequence() {
  const wrap = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ctx = gsap.context(() => {
      const chapters = gsap.utils.toArray<HTMLElement>(".chapter");

      if (reduce) {
        gsap.set(chapters, { position: "relative", autoAlpha: 1, rotateX: 0, rotateY: 0 });
        return;
      }

      gsap.set(chapters[0], { autoAlpha: 1 });

      const tl = gsap.timeline({
        defaults: { ease: "power2.inOut" },
        scrollTrigger: {
          trigger: wrap.current,
          start: "top top",
          end: "+=2600",
          scrub: 1,
          pin: stage.current,
          anticipatePin: 1,
          onUpdate: (self) => {
            const rail = document.querySelector<HTMLElement>(".chapter-rail-fill");
            const num = document.querySelector<HTMLElement>(".chapter-count-current");
            if (rail) rail.style.transform = `scaleX(${self.progress})`;
            if (num) {
              const idx = Math.min(CHAPTERS.length - 1, Math.floor(self.progress * CHAPTERS.length + 0.18));
              num.textContent = String(idx + 1).padStart(2, "0");
            }
          },
        },
      });

      // crossfade each chapter to the next, with a breathing beat between
      const BEAT = 0.55;
      let t = 0;
      for (let i = 1; i < chapters.length; i++) {
        const prev = chapters[i - 1];
        const cur = chapters[i];
        tl.to(prev, { autoAlpha: 0, rotateY: -20, xPercent: -6, scale: 0.95, duration: 1 }, t)
          .fromTo(
            cur,
            { autoAlpha: 0, rotateY: 20, xPercent: 6, scale: 0.95 },
            { autoAlpha: 1, rotateY: 0, xPercent: 0, scale: 1, duration: 1 },
            t
          );
        t += 1 + BEAT;
      }

      // image inner parallax during the pin
      chapters.forEach((ch) => {
        const img = ch.querySelector(".chapter-img");
        if (!img) return;
        gsap.fromTo(
          img,
          { yPercent: -8, scale: 1.14 },
          {
            yPercent: 8,
            scale: 1.14,
            ease: "none",
            scrollTrigger: {
              trigger: wrap.current,
              start: "top top",
              end: "+=2600",
              scrub: true,
            },
          }
        );
      });
    }, wrap);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={wrap} className="relative mt-28 sm:mt-36">
      {/* pinned stage */}
      <div
        ref={stage}
        className="perspective-1200 relative flex h-[100svh] flex-col items-center justify-center overflow-hidden"
      >
        {/* v5 ambient glow + floor shadow */}
        <div
          className="aurora left-1/2 top-[54%] h-[520px] w-[min(88vw,820px)] -translate-x-1/2 -translate-y-1/2 bg-[#c89b6a]/9 [--aurora-duration:24s]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute bottom-[9%] left-1/2 h-14 w-[46%] -translate-x-1/2 rounded-[100%] bg-black/65 blur-2xl"
          aria-hidden
        />

        {/* section micro-header — glass pill so the deck never eclipses it */}
        <div className="pointer-events-none absolute left-1/2 top-10 z-40 flex -translate-x-1/2 items-center gap-3 rounded-full border border-[#c89b6a]/30 bg-[#14100d]/75 px-5 py-2.5 backdrop-blur-md">
          <span className="h-1.5 w-1.5 rotate-45 bg-[#c89b6a]" aria-hidden />
          <p className="eyebrow whitespace-nowrap">Three acts of craft</p>
          <span className="h-1.5 w-1.5 rotate-45 bg-[#c89b6a]" aria-hidden />
        </div>

        {CHAPTERS.map((c, i) => (
          <article
            key={c.index}
            className={cn(
              "chapter absolute left-1/2 top-1/2 z-10 w-[min(92vw,64rem)] -translate-x-1/2 -translate-y-1/2 will-transform",
            )}
            aria-hidden={i !== 0}
          >
            <div
              className="shine relative mx-auto h-[min(62svh,600px)] overflow-hidden rounded-[2rem] border border-[#c89b6a]/25 shadow-[0_60px_120px_-40px_rgba(0,0,0,0.85)] will-transform"
              style={{ rotate: `${c.tilt}deg` }}
            >
              <div className="absolute inset-0 overflow-hidden">
                <Image
                  src={c.img}
                  alt={c.alt}
                  fill
                  sizes="(min-width: 1024px) 60rem, 92vw"
                  className="chapter-img object-cover"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0807]/92 via-[#0a0807]/35 to-[#0a0807]/10" aria-hidden />
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_115%,rgba(200,155,106,0.16),transparent_58%)]" aria-hidden />

              <div className="absolute inset-x-0 bottom-0 p-7 sm:p-10 lg:p-12">
                <div className="flex items-end justify-between gap-6">
                  <div className="max-w-xl">
                    <p className="eyebrow">{c.kicker}</p>
                    <h3 className="font-display mt-3 text-2xl font-medium leading-tight text-[#f4eddf] sm:text-3xl lg:text-4xl">
                      {c.title}
                    </h3>
                    <p className="mt-3 hidden max-w-lg text-pretty text-sm leading-relaxed text-[#d8ccb8] sm:block">
                      {c.copy}
                    </p>
                  </div>
                  <p className="font-display shrink-0 text-6xl font-light leading-none text-[#f4eddf]/20 sm:text-8xl" aria-hidden>
                    {c.index}
                  </p>
                </div>
              </div>
            </div>
          </article>
        ))}

        {/* progress rail */}
        <div className="absolute bottom-14 left-1/2 z-20 flex w-64 -translate-x-1/2 items-center gap-4 sm:w-80">
          <span className="font-mono text-[0.65rem] tabular-nums text-[#c89b6a]">
            <span className="chapter-count-current">01</span>
            <span className="text-[#a6947f]"> / 03</span>
          </span>
          <div className="h-px flex-1 bg-[#c89b6a]/15">
            <div className="chapter-rail-fill h-full w-full origin-left scale-x-0 bg-gradient-to-r from-[#9a7248] to-[#e9d3a8]" />
          </div>
          <span className="font-mono text-[0.65rem] text-[#a6947f]">CRAFT</span>
        </div>
      </div>
    </div>
  );
}
