"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { ArrowDown, Star, MapPin } from "lucide-react";
import { gsap } from "@/components/gsap/gsap-provider";
import { TiltCard } from "./tilt-card";
import { Magnetic } from "./magnetic";
import { useUIStore } from "@/lib/ui-store";

const MARQUEE_ITEMS = [
  "Single Origin",
  "Small-Batch Roasts",
  "Baked at Dawn",
  "Direct Trade",
  "Est. 2016",
  "Slow Mornings",
];

/** Split a line into masked words for a staggered 3D rise. */
function MaskedWords({
  words,
  lineClass = "",
}: {
  words: React.ReactNode[];
  lineClass?: string;
}) {
  return (
    <span className={`block overflow-hidden pb-[0.1em] -mb-[0.1em] ${lineClass}`}>
      {words.map((w, i) => (
        <span key={i} className="inline-block overflow-hidden align-bottom" aria-hidden>
          <span className="hero-word mr-[0.24em] inline-block will-change-transform">
            {w}
          </span>
        </span>
      ))}
    </span>
  );
}

export function Hero() {
  const root = useRef<HTMLElement>(null);
  const introDone = useUIStore((s) => s.introDone);

  /* ——— Scroll sequence: layered depth as the hero exits ——— */
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to(".hero-bg", {
        yPercent: 16,
        scale: 1.22,
        ease: "none",
        scrollTrigger: {
          trigger: root.current,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });
      gsap.to(".hero-content", {
        yPercent: -14,
        opacity: 0,
        scale: 0.94,
        ease: "none",
        scrollTrigger: {
          trigger: root.current,
          start: "12% top",
          end: "78% top",
          scrub: true,
        },
      });
      gsap.to(".hero-card-col", {
        yPercent: 10,
        rotateX: 8,
        opacity: 0,
        ease: "none",
        scrollTrigger: {
          trigger: root.current,
          start: "top top",
          end: "70% top",
          scrub: true,
        },
      });
      gsap.to(".hero-cue", {
        opacity: 0,
        ease: "none",
        scrollTrigger: {
          trigger: root.current,
          start: "top top",
          end: "18% top",
          scrub: true,
        },
      });
    }, root);
    return () => ctx.revert();
  }, []);

  /* ——— Entrance timeline once the preloader lifts ——— */
  useEffect(() => {
    if (!introDone) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      gsap.set(
        [
          ".hero-badge", ".hero-word", ".hero-copy", ".hero-ctas",
          ".hero-stats", ".hero-card-col", ".hero-cue", ".hero-marquee",
        ],
        { clearProps: "all", opacity: 1 }
      );
      return;
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power4.out" } });
      tl.fromTo(
        ".hero-badge",
        { y: 26, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.9 },
        0.05
      )
        .fromTo(
          ".hero-word",
          { yPercent: 118, rotateX: -55, opacity: 0 },
          {
            yPercent: 0,
            rotateX: 0,
            opacity: 1,
            duration: 1.25,
            stagger: 0.075,
            transformOrigin: "50% 100% -20px",
          },
          0.12
        )
        .fromTo(".hero-copy", { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 1 }, 0.62)
        .fromTo(".hero-ctas > *", { y: 26, opacity: 0 }, { y: 0, opacity: 1, duration: 0.85, stagger: 0.1 }, 0.78)
        .fromTo(".hero-stats > *", { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, stagger: 0.09 }, 0.95)
        .fromTo(
          ".hero-card-col",
          { y: 90, rotate: 5, opacity: 0 },
          { y: 0, rotate: 0, opacity: 1, duration: 1.5, ease: "power3.out" },
          0.5
        )
        .fromTo(".hero-cue", { opacity: 0 }, { opacity: 1, duration: 1 }, 1.7)
        .fromTo(".hero-marquee", { yPercent: 100 }, { yPercent: 0, duration: 1, ease: "power3.out" }, 1.1);

      // rotating seal on the card
      gsap.to(".hero-seal svg", { rotate: 360, duration: 22, ease: "none", repeat: -1 });
      // gentle float for glass badges
      gsap.to(".float-a", { y: -12, duration: 2.6, ease: "sine.inOut", repeat: -1, yoyo: true });
      gsap.to(".float-b", { y: 10, duration: 3.2, ease: "sine.inOut", repeat: -1, yoyo: true, delay: 0.8 });
    }, root);
    return () => ctx.revert();
  }, [introDone]);

  /* ——— Pointer depth: 3D micro-parallax on the visual card ——— */
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;
    const ctx = gsap.context(() => {
      const rx = gsap.quickTo(".hero-depth", "rotationY", { duration: 0.9, ease: "power3" });
      const ry = gsap.quickTo(".hero-depth", "rotationX", { duration: 0.9, ease: "power3" });
      const bx = gsap.quickTo(".hero-beans", "x", { duration: 1.2, ease: "power2" });
      const move = (e: PointerEvent) => {
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        rx(px * 7);
        ry(-py * 6);
        bx(px * -26);
      };
      el.addEventListener("pointermove", move, { passive: true });
      return () => el.removeEventListener("pointermove", move);
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section
      id="top"
      ref={root}
      className="relative flex min-h-[100svh] flex-col overflow-hidden"
      aria-label="Welcome to NOIRÉ"
    >
      {/* ——— Parallax backdrop ——— */}
      <div className="hero-bg absolute inset-0 will-transform" aria-hidden>
        <Image
          src="/images/hero-bg.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        {/* floating beans (ScrollSmoother data-speed drift) */}
        <div className="hero-beans absolute right-[12%] top-[18%] h-10 w-10 rotate-12 rounded-full bg-[radial-gradient(circle_at_35%_30%,#6b4f33,#241a10_70%)] opacity-70 shadow-[0_18px_30px_rgba(0,0,0,0.5)]" data-speed="0.85" />
        <div className="hero-beans absolute right-[30%] top-[62%] h-6 w-6 -rotate-12 rounded-full bg-[radial-gradient(circle_at_35%_30%,#6b4f33,#241a10_70%)] opacity-50 shadow-[0_12px_22px_rgba(0,0,0,0.5)]" data-speed="1.18" />
        <div className="hero-beans absolute left-[8%] bottom-[16%] hidden h-8 w-8 rotate-45 rounded-full bg-[radial-gradient(circle_at_35%_30%,#6b4f33,#241a10_70%)] opacity-40 lg:block" data-speed="1.08" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-r from-[#0a0807]/92 via-[#0a0807]/68 to-[#0a0807]/30" aria-hidden />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0807] via-transparent to-[#0a0807]/78" aria-hidden />

      {/* ——— Content ——— */}
      <div className="hero-content relative z-10 mx-auto grid w-full max-w-7xl flex-1 items-center gap-14 px-5 pb-24 pt-36 sm:px-8 lg:grid-cols-[1.15fr_0.85fr] lg:gap-8 lg:pt-40">
        {/* Left: copy */}
        <div className="max-w-3xl">
          <div className="hero-badge mb-8 inline-flex items-center gap-3 rounded-full border border-[#c89b6a]/30 bg-[#14100d]/50 py-2 pl-3 pr-5 opacity-0 backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#c89b6a] opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#c89b6a]" />
            </span>
            <span className="text-[0.68rem] font-bold uppercase tracking-[0.32em] text-[#e9d3a8]">
              Now pouring · Winter roast
            </span>
          </div>

          <h1
            aria-label="Where coffee becomes ritual."
            className="perspective-1200 font-display text-[clamp(3.2rem,9.5vw,7.5rem)] font-medium leading-[0.98] tracking-[-0.02em] text-[#f4eddf]"
          >
            <MaskedWords words={[<span key="w">Where</span>, <span key="c">coffee</span>]} />
            <MaskedWords
              words={[
                <span key="b">becomes</span>,
                <em key="r" className="text-gold-gradient font-light italic">ritual.</em>,
              ]}
            />
          </h1>

          <p className="hero-copy mt-8 max-w-xl text-pretty text-base font-medium leading-relaxed text-[#d8ccb8] opacity-0 sm:text-lg">
            Twelve single origins, one obsessive pursuit. We roast in tiny
            batches at dawn, pull every shot to 25 golden seconds, and serve
            it in a room built for lingering.
          </p>

          <div className="hero-ctas mt-12 flex flex-wrap items-center gap-4">
            <Magnetic>
              <a
                href="#menu"
                className="group relative inline-flex items-center gap-3 overflow-hidden rounded-full bg-[#c89b6a] px-8 py-4 text-xs font-bold uppercase tracking-[0.22em] text-[#14100d] transition-transform duration-300 hover:scale-[1.03] active:scale-[0.98]"
              >
                <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                Explore the menu
              </a>
            </Magnetic>
            <Magnetic>
              <a
                href="#visit"
                className="inline-flex items-center gap-3 rounded-full border border-[#f4eddf]/25 px-8 py-4 text-xs font-bold uppercase tracking-[0.22em] text-[#f4eddf] backdrop-blur-sm transition-all duration-300 hover:border-[#e9d3a8] hover:text-[#e9d3a8]"
              >
                <MapPin className="h-4 w-4" strokeWidth={1.75} />
                Find the house
              </a>
            </Magnetic>
          </div>

          {/* Stats */}
          <dl className="hero-stats mt-14 grid max-w-lg grid-cols-3 gap-6 border-t border-[#f4eddf]/10 pt-8 opacity-0">
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
          </dl>
        </div>

        {/* Right: 3D tilt card */}
        <div className="hero-card-col relative mx-auto hidden w-full max-w-sm will-transform opacity-0 sm:block lg:max-w-md">
          <div className="hero-depth perspective-1200">
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
                    <span className="font-display text-2xl text-[#e9d3a8]">$4.5</span>
                  </div>
                </div>
              </div>

              {/* rotating seal */}
              <div className="hero-seal preserve-3d absolute -right-7 -top-9 z-20" aria-hidden>
                <div className="relative grid h-24 w-24 place-items-center rounded-full border border-[#c89b6a]/35 bg-[#14100d]/85 backdrop-blur-md">
                  <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full">
                    <defs>
                      <path id="hero-seal-circle" d="M 50,50 m -34,0 a 34,34 0 1,1 68,0 a 34,34 0 1,1 -68,0" />
                    </defs>
                    <text className="fill-[#c89b6a] text-[9px] font-semibold uppercase tracking-[0.22em]">
                      <textPath href="#hero-seal-circle">
                        est 2016 · slow mornings ·
                      </textPath>
                    </text>
                  </svg>
                  <Star className="h-5 w-5 fill-[#c89b6a] text-[#c89b6a]" />
                </div>
              </div>

              {/* floating badge — rating */}
              <div className="float-a glass absolute -left-5 top-1/3 z-20 flex items-center gap-3 rounded-2xl px-4 py-3 sm:-left-10" style={{ transform: "translateZ(60px)" }}>
                <span className="grid h-9 w-9 place-items-center rounded-full bg-[#c89b6a]/15 text-[#c89b6a]">
                  <Star className="h-4 w-4 fill-[#c89b6a]" />
                </span>
                <div>
                  <p className="text-sm font-bold leading-none text-[#f4eddf]">4.9 / 5</p>
                  <p className="mt-1 text-[0.6rem] uppercase tracking-[0.2em] text-[#a6947f]">
                    2,400 reviews
                  </p>
                </div>
              </div>

              {/* floating badge — origin */}
              <div className="float-b glass preserve-3d absolute -bottom-6 right-4 z-20 rounded-2xl px-4 py-3" style={{ transform: "translateZ(40px)" }}>
                <p className="text-[0.6rem] font-bold uppercase tracking-[0.24em] text-[#c9bba6]">
                  This week&apos;s lot
                </p>
                <p className="font-display mt-1 text-base italic text-[#f4eddf]">
                  Yirgacheffe · Ethiopia
                </p>
              </div>
            </TiltCard>
          </div>
        </div>
      </div>

      {/* ——— Scroll cue ——— */}
      <a
        href="#craft"
        className="hero-cue absolute bottom-24 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-3 text-[#a6947f] opacity-0 transition-colors hover:text-[#e9d3a8] lg:flex"
        aria-label="Scroll to our story"
      >
        <span className="text-[0.6rem] font-bold uppercase tracking-[0.34em]">Scroll</span>
        <span className="relative flex h-10 w-6 items-start justify-center rounded-full border border-current pt-2">
          <span className="animate-scroll-dot h-1.5 w-1.5 rounded-full bg-current" />
        </span>
        <ArrowDown className="h-3 w-3" />
      </a>

      {/* ——— Marquee strip ——— */}
      <div className="hero-marquee relative z-10 overflow-hidden border-y border-[#c89b6a]/15 bg-[#0a0807]/80 py-4 backdrop-blur-md">
        <div className="marquee-track" style={{ ["--marquee-duration" as string]: "34s" }}>
          {[0, 1].map((dup) => (
            <div key={dup} className="flex shrink-0 items-center" aria-hidden={dup === 1}>
              {MARQUEE_ITEMS.map((item) => (
                <span key={`${dup}-${item}`} className="flex items-center gap-8 pr-8 sm:gap-12 sm:pr-12">
                  <span className="font-display whitespace-nowrap text-sm italic tracking-wide text-[#e9d3a8]/85 sm:text-base">
                    {item}
                  </span>
                  <span className="h-1.5 w-1.5 rotate-45 bg-[#c89b6a]/60" aria-hidden />
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
