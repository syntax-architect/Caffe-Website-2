"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { gsap } from "@/components/gsap/gsap-provider";
import { SectionHeading } from "./section-heading";
import { Reveal } from "./reveal";
import { cn } from "@/lib/utils";

/**
 * The Space — flagship GSAP scroll sequence:
 * desktop pins the section and drives a horizontal gallery with
 * scrubbed per-tile parallax; mobile keeps a calm vertical stack.
 */

interface Tile {
  src: string;
  alt: string;
  caption: string;
  sub: string;
  /** desktop panel width in vw */
  w: string;
  ratio: string;
  speed: number; // inner image parallax factor
}

const TILES: Tile[] = [
  {
    src: "/images/interior-main.jpg",
    alt: "The main room of NOIRÉ with warm ambient lighting and wooden furniture",
    caption: "The Long Room",
    sub: "Where mornings linger",
    w: "w-[82vw] lg:w-[56vw]",
    ratio: "aspect-[16/10]",
    speed: -10,
  },
  {
    src: "/images/barista-alt.jpg",
    alt: "Barista crafting a pour-over at the counter",
    caption: "The Pour Bar",
    sub: "Eight seats, front row",
    w: "w-[74vw] lg:w-[34vw]",
    ratio: "aspect-[4/5]",
    speed: 12,
  },
  {
    src: "/images/beans-spoon.jpg",
    alt: "Roasted beans resting after the morning roast",
    caption: "The Roastery",
    sub: "Fires at 5 AM",
    w: "w-[74vw] lg:w-[38vw]",
    ratio: "aspect-[4/3]",
    speed: -14,
  },
  {
    src: "/images/interior-square.jpg",
    alt: "Sunlit corner seating with plants and ceramics",
    caption: "The Conservatory",
    sub: "Plants & patience",
    w: "w-[82vw] lg:w-[44vw]",
    ratio: "aspect-[4/3]",
    speed: 10,
  },
  {
    src: "/images/hero-bg.jpg",
    alt: "A finished flat white on the walnut bar",
    caption: "The Wall",
    sub: "Brass, walnut, low light",
    w: "w-[74vw] lg:w-[36vw]",
    ratio: "aspect-[4/5]",
    speed: -12,
  },
  {
    src: "/images/pastry-main.jpg",
    alt: "Morning pastries on ceramic plates",
    caption: "The Counter",
    sub: "Baked at dawn",
    w: "w-[82vw] lg:w-[48vw]",
    ratio: "aspect-[16/10]",
    speed: 14,
  },
];

function Panel({ tile, className }: { tile: Tile; className?: string }) {
  return (
    <figure
      className={cn(
        "group relative shrink-0 overflow-hidden rounded-[1.75rem] border border-[#c89b6a]/15 will-transform",
        tile.w,
        className
      )}
      data-cursor="View"
    >
      <div className={cn("relative", tile.ratio)}>
        <Image
          src={tile.src}
          alt={tile.alt}
          fill
          sizes="(min-width: 1024px) 45vw, 90vw"
          className="object-cover"
        />
      </div>
      <div
        className="absolute inset-0 bg-gradient-to-t from-[#0a0807]/85 via-[#0a0807]/10 to-transparent opacity-80 transition-opacity duration-500 group-hover:opacity-95"
        aria-hidden
      />
      <figcaption className="absolute inset-x-0 bottom-0 flex items-end justify-between p-6 sm:p-8">
        <div className="translate-y-1 transition-transform duration-500 group-hover:translate-y-0">
          <p className="text-[0.6rem] font-bold uppercase tracking-[0.3em] text-[#c89b6a]">
            {tile.sub}
          </p>
          <p className="font-display mt-2 text-2xl font-medium text-[#f4eddf] sm:text-3xl">
            {tile.caption}
          </p>
        </div>
        <span
          className="mb-1 grid h-11 w-11 shrink-0 place-items-center rounded-full border border-[#c89b6a]/40 text-[#e9d3a8] opacity-0 transition-all duration-500 group-hover:opacity-100"
          aria-hidden
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4">
            <path d="M7 17L17 7M17 7H8M17 7v9" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </figcaption>
    </figure>
  );
}

export function Gallery() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  /* ——— Pinned horizontal sequence (desktop) ——— */
  useEffect(() => {
    if (!isDesktop) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ctx = gsap.context(() => {
      const track = trackRef.current;
      const section = sectionRef.current;
      if (!track || !section) return;

      const getDistance = () => track.scrollWidth - window.innerWidth;

      if (reduce) {
        // graceful: no pin, allow native horizontal overflow scroll
        gsap.set(track, { x: 0 });
        return;
      }

      const tween = gsap.to(track, {
        x: () => -getDistance(),
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: () => `+=${getDistance()}`,
          scrub: 1,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const fill = document.querySelector<HTMLElement>(".space-progress-fill");
            if (fill) fill.style.transform = `scaleX(${self.progress})`;
          },
        },
      });

      // per-panel image parallax driven by the container animation
      gsap.utils.toArray<HTMLElement>(".space-panel").forEach((panel) => {
        const img = panel.querySelector("img");
        if (!img) return;
        gsap.fromTo(
          img,
          { xPercent: -6, scale: 1.12 },
          {
            xPercent: 6,
            scale: 1.12,
            ease: "none",
            scrollTrigger: {
              trigger: panel,
              containerAnimation: tween,
              start: "left right",
              end: "right left",
              scrub: true,
            },
          }
        );
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [isDesktop]);

  return (
    <section
      id="space"
      ref={sectionRef}
      className="relative overflow-hidden py-24 sm:py-32 lg:py-40"
      aria-labelledby="space-heading"
    >
      <div
        className="pointer-events-none absolute left-1/2 top-0 h-[380px] w-[720px] -translate-x-1/2 rounded-full bg-[#c89b6a]/5 blur-[140px]"
        aria-hidden
      />

      <div className="mx-auto w-full max-w-7xl px-5 sm:px-8">
        <SectionHeading
          id="space-heading"
          eyebrow="The Space"
          align="center"
          title={
            <>
              A room built for{" "}
              <em className="text-gold-gradient font-light italic">
                doing nothing beautifully
              </em>
            </>
          }
          description="Walnut, warm brass, low light. Four rooms, ninety-eight seats, and not a single one you'll want to leave. Bring a book, or don't — watching the bar is theatre enough."
        />
      </div>

      {isDesktop ? (
        /* ——— Horizontal pinned track ——— */
        <div className="relative mt-16">
          <div className="overflow-hidden">
            <div
              ref={trackRef}
              className="flex w-max items-center gap-6 px-[8vw] will-transform sm:gap-10"
            >
              {TILES.map((tile) => (
                <div key={tile.caption} className="space-panel">
                  <Panel tile={tile} />
                </div>
              ))}

              {/* terminal card */}
              <div className="flex w-[60vw] shrink-0 items-center justify-center lg:w-[36vw]">
                <a
                  href="#visit"
                  className="group flex aspect-square w-56 flex-col items-center justify-center gap-4 rounded-full border border-[#c89b6a]/30 bg-[#14100d]/60 text-center backdrop-blur-md transition-all duration-500 hover:border-[#c89b6a] hover:bg-[#c89b6a]/10 sm:w-64"
                >
                  <span className="font-display text-2xl italic text-[#e9d3a8] transition-transform duration-500 group-hover:scale-105">
                    Come sit
                    <br />
                    awhile
                  </span>
                  <span className="text-[0.6rem] font-bold uppercase tracking-[0.3em] text-[#a6947f]">
                    128 Roaster&apos;s Lane
                  </span>
                </a>
              </div>
            </div>
          </div>

          {/* progress rail */}
          <div className="mx-auto mt-10 flex w-full max-w-7xl items-center gap-5 px-8">
            <span className="font-mono text-[0.62rem] uppercase tracking-[0.24em] text-[#a6947f]">
              Drag the scroll
            </span>
            <div className="h-px flex-1 bg-[#c89b6a]/15">
              <div className="space-progress-fill h-full w-full origin-left scale-x-0 bg-gradient-to-r from-[#9a7248] to-[#e9d3a8]" />
            </div>
            <span className="font-mono text-[0.62rem] uppercase tracking-[0.24em] text-[#c89b6a]">
              98 seats
            </span>
          </div>
        </div>
      ) : (
        /* ——— Mobile vertical stack ——— */
        <div className="mt-16 flex flex-col gap-6 px-5 sm:px-8">
          {TILES.slice(0, 4).map((tile, i) => (
            <Reveal key={tile.caption} delay={i * 0.06} amount={0.2}>
              <Panel tile={tile} className="w-full" />
            </Reveal>
          ))}
        </div>
      )}
    </section>
  );
}
