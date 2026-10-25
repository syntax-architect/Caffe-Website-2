"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { SectionHeading } from "./section-heading";
import { Reveal } from "./reveal";

interface Tile {
  src: string;
  alt: string;
  caption: string;
  sub: string;
  span: string; // tailwind col-span classes
  ratio: string; // aspect ratio
  speed: [number, number]; // parallax y range
}

const TILES: Tile[] = [
  {
    src: "/images/interior-main.jpg",
    alt: "The main room of NOIRÉ with warm ambient lighting and wooden furniture",
    caption: "The Long Room",
    sub: "Where mornings linger",
    span: "md:col-span-7",
    ratio: "aspect-[16/10]",
    speed: [40, -40],
  },
  {
    src: "/images/barista-alt.jpg",
    alt: "Barista crafting a pour-over at the counter",
    caption: "The Pour Bar",
    sub: "Eight seats, front row",
    span: "md:col-span-5",
    ratio: "aspect-[4/5]",
    speed: [90, -60],
  },
  {
    src: "/images/beans-spoon.jpg",
    alt: "Roasted beans resting after the morning roast",
    caption: "The Roastery",
    sub: "Fires at 5 AM",
    span: "md:col-span-5",
    ratio: "aspect-[4/5]",
    speed: [70, -70],
  },
  {
    src: "/images/interior-square.jpg",
    alt: "Sunlit corner seating with plants and ceramics",
    caption: "The Conservatory",
    sub: "Plants & patience",
    span: "md:col-span-7",
    ratio: "aspect-[16/10]",
    speed: [30, -30],
  },
];

function ParallaxTile({ tile, index }: { tile: Tile; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], tile.speed);

  return (
    <Reveal delay={index * 0.08} amount={0.2} className={tile.span}>
      <figure
        ref={ref}
        className="group relative overflow-hidden rounded-[1.75rem] border border-[#c89b6a]/15"
      >
        <motion.div style={{ y }} className="will-transform">
          <div className={`relative ${tile.ratio} -my-[8%]`}>
            <Image
              src={tile.src}
              alt={tile.alt}
              fill
              sizes="(min-width: 768px) 45vw, 92vw"
              className="object-cover transition-transform duration-[1.6s] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.07]"
            />
          </div>
        </motion.div>

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
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="h-4 w-4"
            >
              <path d="M7 17L17 7M17 7H8M17 7v9" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </figcaption>
      </figure>
    </Reveal>
  );
}

export function Gallery() {
  return (
    <section
      id="space"
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

        <div className="mt-16 grid gap-6 md:grid-cols-12">
          {TILES.map((tile, i) => (
            <ParallaxTile key={tile.caption} tile={tile} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
