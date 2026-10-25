"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowDown, Star, MapPin } from "lucide-react";
import { TiltCard } from "./tilt-card";

const EASE = [0.22, 1, 0.36, 1] as const;

const MARQUEE_ITEMS = [
  "Single Origin",
  "Small-Batch Roasts",
  "Baked at Dawn",
  "Direct Trade",
  "Est. 2016",
  "Slow Mornings",
];

function HeadlineLine({
  children,
  delay,
}: {
  children: React.ReactNode;
  delay: number;
}) {
  return (
    <span className="block overflow-hidden pb-[0.08em] -mb-[0.08em]">
      <motion.span
        className="block"
        initial={{ y: "110%" }}
        animate={{ y: 0 }}
        transition={{ duration: 1.1, delay, ease: EASE }}
      >
        {children}
      </motion.span>
    </span>
  );
}

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  // layered parallax
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "22%"]);
  const bgScale = useTransform(scrollYProgress, [0, 1], [1.05, 1.18]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "38%"]);
  const cardY = useTransform(scrollYProgress, [0, 1], ["0%", "-14%"]);
  const fade = useTransform(scrollYProgress, [0, 0.75], [1, 0]);

  return (
    <section
      id="top"
      ref={ref}
      className="relative flex min-h-[100svh] flex-col overflow-hidden"
      aria-label="Welcome to NOIRÉ"
    >
      {/* ——— Parallax backdrop ——— */}
      <motion.div style={{ y: bgY, scale: bgScale }} className="absolute inset-0">
        <Image
          src="/images/hero-bg.jpg"
          alt="Dark moody espresso with latte art on a walnut table"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-r from-[#0a0807]/92 via-[#0a0807]/68 to-[#0a0807]/30" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0807] via-transparent to-[#0a0807]/78" />

      {/* ——— Content ——— */}
      <motion.div
        style={{ y: contentY, opacity: fade }}
        className="relative z-10 mx-auto grid w-full max-w-7xl flex-1 items-center gap-14 px-5 pb-24 pt-36 sm:px-8 lg:grid-cols-[1.15fr_0.85fr] lg:gap-8 lg:pt-40"
      >
        {/* Left: copy */}
        <div className="max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15, ease: EASE }}
            className="mb-8 inline-flex items-center gap-3 rounded-full border border-[#c89b6a]/30 bg-[#14100d]/50 py-2 pl-3 pr-5 backdrop-blur-md"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#c89b6a] opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#c89b6a]" />
            </span>
            <span className="text-[0.68rem] font-bold uppercase tracking-[0.32em] text-[#e9d3a8]">
              Now pouring · Winter roast
            </span>
          </motion.div>

          <h1 className="font-display text-[clamp(3.2rem,9.5vw,7.5rem)] font-medium leading-[0.98] tracking-[-0.02em] text-[#f4eddf]">
            <HeadlineLine delay={0.25}>Where coffee</HeadlineLine>
            <HeadlineLine delay={0.37}>
              becomes{" "}
              <em className="text-gold-gradient font-light italic">
                ritual.
              </em>
            </HeadlineLine>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.65, ease: EASE }}
            className="mt-8 max-w-xl text-pretty text-base font-medium leading-relaxed text-[#d8ccb8] sm:text-lg"
          >
            Twelve single origins, one obsessive pursuit. We roast in tiny
            batches at dawn, pull every shot to 25 golden seconds, and serve
            it in a room built for lingering.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.8, ease: EASE }}
            className="mt-12 flex flex-wrap items-center gap-4"
          >
            <a
              href="#menu"
              className="group relative inline-flex items-center gap-3 overflow-hidden rounded-full bg-[#c89b6a] px-8 py-4 text-xs font-bold uppercase tracking-[0.22em] text-[#14100d] transition-transform duration-300 hover:scale-[1.03] active:scale-[0.98]"
            >
              <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
              Explore the menu
            </a>
            <a
              href="#visit"
              className="inline-flex items-center gap-3 rounded-full border border-[#f4eddf]/25 px-8 py-4 text-xs font-bold uppercase tracking-[0.22em] text-[#f4eddf] backdrop-blur-sm transition-all duration-300 hover:border-[#e9d3a8] hover:text-[#e9d3a8]"
            >
              <MapPin className="h-4 w-4" strokeWidth={1.75} />
              Find the house
            </a>
          </motion.div>

          {/* Stats */}
          <motion.dl
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.95, ease: EASE }}
            className="mt-14 grid max-w-lg grid-cols-3 gap-6 border-t border-[#f4eddf]/10 pt-8"
          >
            {[
              { value: "12", label: "Single origins" },
              { value: "240k", label: "Cups poured" },
              { value: "4.9", label: "Guest rating" },
            ].map((s) => (
              <div key={s.label}>
                <dt className="sr-only">{s.label}</dt>
                <dd className="font-display text-3xl font-medium text-[#e9d3a8] sm:text-4xl">
                  {s.value}
                </dd>
                <dd className="mt-1 text-[0.65rem] font-semibold uppercase tracking-[0.24em] text-[#a6947f]">
                  {s.label}
                </dd>
              </div>
            ))}
          </motion.dl>
        </div>

        {/* Right: 3D tilt card */}
        <motion.div
          style={{ y: cardY }}
          initial={{ opacity: 0, y: 60, rotate: 4 }}
          animate={{ opacity: 1, y: 0, rotate: 0 }}
          transition={{ duration: 1.2, delay: 0.5, ease: EASE }}
          className="relative mx-auto hidden w-full max-w-sm will-transform sm:block lg:max-w-md"
        >
          <TiltCard intensity={9} className="group">
            <div className="shine relative overflow-hidden rounded-[2rem] border border-[#c89b6a]/25 shadow-[0_60px_120px_-30px_rgba(0,0,0,0.85)]">
              <div className="relative aspect-[4/5]">
                <Image
                  src="/images/hero-card.jpg"
                  alt="Signature espresso served at NOIRÉ"
                  fill
                  priority
                  sizes="(min-width: 1024px) 32rem, 28rem"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0807]/85 via-transparent to-transparent" />

                {/* steam over the cup */}
                <div className="steam absolute left-1/2 top-[16%] h-16 w-24 -translate-x-1/2" aria-hidden>
                  <span />
                  <span />
                  <span />
                </div>

                <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between">
                  <div>
                    <p className="text-[0.6rem] font-bold uppercase tracking-[0.3em] text-[#c89b6a]">
                      Barista&apos;s choice
                    </p>
                    <p className="font-display mt-1 text-2xl italic text-[#f4eddf]">
                      The Noir Espresso
                    </p>
                  </div>
                  <span className="font-display text-2xl text-[#e9d3a8]">
                    $4.5
                  </span>
                </div>
              </div>
            </div>

            {/* floating badge — rating */}
            <motion.div
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="glass absolute -right-5 -top-6 z-20 flex items-center gap-3 rounded-2xl px-4 py-3 sm:-right-8"
              style={{ transform: "translateZ(60px)" }}
            >
              <span className="grid h-9 w-9 place-items-center rounded-full bg-[#c89b6a]/15 text-[#c89b6a]">
                <Star className="h-4 w-4 fill-[#c89b6a]" />
              </span>
              <div>
                <p className="text-sm font-bold leading-none text-[#f4eddf]">
                  4.9 / 5
                </p>
                <p className="mt-1 text-[0.6rem] uppercase tracking-[0.2em] text-[#a6947f]">
                  2,400 reviews
                </p>
              </div>
            </motion.div>

            {/* floating badge — origin */}
            <div className="preserve-3d absolute -left-5 top-1/2 z-20 -translate-y-1/2 sm:-left-10">
              <motion.div
                animate={{ y: [0, 12, 0] }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1,
                }}
                className="glass rounded-2xl px-4 py-3"
                style={{ transform: "translateZ(40px)" }}
              >
                <p className="text-[0.6rem] font-bold uppercase tracking-[0.24em] text-[#c9bba6]">
                  This week&apos;s lot
                </p>
                <p className="font-display mt-1 text-base italic text-[#f4eddf]">
                  Yirgacheffe · Ethiopia
                </p>
              </motion.div>
            </div>
          </TiltCard>
        </motion.div>
      </motion.div>

      {/* ——— Scroll cue ——— */}
      <motion.a
        href="#craft"
        style={{ opacity: fade }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6, duration: 0.8 }}
        className="absolute bottom-24 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-3 text-[#a6947f] transition-colors hover:text-[#e9d3a8] lg:flex"
        aria-label="Scroll to our story"
      >
        <span className="text-[0.6rem] font-bold uppercase tracking-[0.34em]">
          Scroll
        </span>
        <span className="relative flex h-10 w-6 items-start justify-center rounded-full border border-current pt-2">
          <span className="animate-scroll-dot h-1.5 w-1.5 rounded-full bg-current" />
        </span>
        <ArrowDown className="h-3 w-3" />
      </motion.a>

      {/* ——— Marquee strip ——— */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.3, duration: 1 }}
        className="relative z-10 border-y border-[#c89b6a]/15 bg-[#0a0807]/80 py-4 backdrop-blur-md"
      >
        <div className="marquee-track" style={{ ["--marquee-duration" as string]: "34s" }}>
          {[0, 1].map((dup) => (
            <div key={dup} className="flex shrink-0 items-center" aria-hidden={dup === 1}>
              {MARQUEE_ITEMS.map((item) => (
                <span
                  key={`${dup}-${item}`}
                  className="flex items-center gap-8 pr-8 sm:gap-12 sm:pr-12"
                >
                  <span className="font-display whitespace-nowrap text-sm italic tracking-wide text-[#e9d3a8]/85 sm:text-base">
                    {item}
                  </span>
                  <span className="h-1.5 w-1.5 rotate-45 bg-[#c89b6a]/60" aria-hidden />
                </span>
              ))}
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
