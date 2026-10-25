"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Hand } from "lucide-react";
import { gsap } from "@/components/gsap/gsap-provider";
import { MENU, formatPrice } from "@/lib/cafe-data";
import { cn } from "@/lib/utils";

/**
 * Signature Roulette — v4 3D showcase.
 *
 * A true CSS-3D ring (preserve-3d) of eight signature builds. It
 * auto-rotates, reacts to drag with inertia on both mouse and touch
 * (vertical page scroll still passes through on mobile), and lights
 * the card currently facing the guest. Prev/next buttons give it a
 * keyboard-accessible path.
 */

const PICK_IDS = [
  "noir",
  "kyoto",
  "tonic",
  "basque",
  "siphon",
  "cortado",
  "affogato",
  "coldbrew",
];

const PANEL_ART = [
  "linear-gradient(140deg,#3d2a16 0%,#1a120b 70%)",
  "linear-gradient(140deg,#241a10 0%,#100c08 70%)",
  "linear-gradient(140deg,#40301c 0%,#1c140c 70%)",
  "linear-gradient(140deg,#2c2013 0%,#14100a 70%)",
  "linear-gradient(140deg,#46331d 0%,#1e1610 70%)",
  "linear-gradient(140deg,#26190f 0%,#120e09 70%)",
  "linear-gradient(140deg,#3a2b18 0%,#181009 70%)",
  "linear-gradient(140deg,#302214 0%,#16110b 70%)",
];

const N = PICK_IDS.length;
const STEP = 360 / N;

const ITEMS = PICK_IDS.map((id, i) => {
  const item = MENU.find((m) => m.id === id) ?? MENU[0];
  return { ...item, art: PANEL_ART[i % PANEL_ART.length], no: i + 1 };
});

interface Dims {
  w: number;
  h: number;
  r: number;
}

function computeDims(): Dims {
  const vw = typeof window === "undefined" ? 1280 : window.innerWidth;
  const w = vw < 640 ? 158 : vw < 1024 ? 198 : 232;
  const h = vw < 640 ? 236 : vw < 1024 ? 276 : 316;
  const gap = vw < 640 ? 20 : 30;
  const r = Math.round((w + gap) / 2 / Math.tan(Math.PI / N));
  return { w, h, r };
}

export function SignatureRing() {
  const stageRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const angleRef = useRef(0);
  const velRef = useRef(0);
  const draggingRef = useRef(false);
  const inViewRef = useRef(false);
  const frontRef = useRef(-1);
  const [dims, setDims] = useState<Dims | null>(null);

  /* ——— responsive radius ——— */
  useEffect(() => {
    let raf = 0;
    const apply = () => {
      window.clearTimeout(raf);
      raf = window.setTimeout(() => setDims(computeDims()), 120);
    };
    // initial measure — deferred so it isn't a sync setState in effect
    const t0 = window.setTimeout(() => setDims(computeDims()), 0);
    window.addEventListener("resize", apply, { passive: true });
    return () => {
      window.clearTimeout(t0);
      window.clearTimeout(raf);
      window.removeEventListener("resize", apply);
    };
  }, []);

  /* ——— motion engine: auto-rotate + inertia + front-card focus ——— */
  useEffect(() => {
    const stage = stageRef.current;
    const ring = ringRef.current;
    if (!stage || !ring) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const setRingY = gsap.quickSetter(ring, "rotateY", "deg");
    const auto = { speed: reduce ? 0 : 0.055, paused: false };

    // only burn frames while the ring is actually on screen
    const io = new IntersectionObserver(
      (entries) => {
        inViewRef.current = entries.some((e) => e.isIntersecting);
      },
      { rootMargin: "120px 0px" }
    );
    io.observe(stage);

    const tick = () => {
      if (!inViewRef.current) return;
      if (!draggingRef.current && !auto.paused) {
        if (Math.abs(velRef.current) > 0.02) {
          angleRef.current += velRef.current;
          velRef.current *= 0.945;
        } else {
          angleRef.current += auto.speed;
        }
      }
      setRingY(angleRef.current);

      // light the panel facing the guest
      const norm = (((-angleRef.current % 360) + 360) % 360);
      const idx = Math.round(norm / STEP) % N;
      if (idx !== frontRef.current) {
        const panels = ring.children;
        for (let i = 0; i < panels.length; i++) {
          panels[i].classList.toggle("ring-front", i === idx);
        }
        frontRef.current = idx;
      }
    };
    gsap.ticker.add(tick);

    /* drag — mouse + touch, with vertical scroll passthrough (pan-y) */
    let lastX = 0;
    let lastT = 0;

    const down = (e: PointerEvent) => {
      draggingRef.current = true;
      velRef.current = 0;
      lastX = e.clientX;
      lastT = performance.now();
      stage.setPointerCapture?.(e.pointerId);
    };
    const move = (e: PointerEvent) => {
      if (!draggingRef.current) return;
      const now = performance.now();
      const dt = Math.max(1, now - lastT);
      const dx = e.clientX - lastX;
      angleRef.current += dx * 0.28;
      velRef.current = gsap.utils.clamp(-7, 7, ((dx * 0.28) / dt) * 16.7);
      lastX = e.clientX;
      lastT = now;
    };
    const up = () => {
      draggingRef.current = false;
    };

    stage.addEventListener("pointerdown", down);
    stage.addEventListener("pointermove", move, { passive: true });
    stage.addEventListener("pointerup", up);
    stage.addEventListener("pointercancel", up);

    // pause the idle spin while the guest is inspecting (desktop)
    const enter = () => {
      if (window.matchMedia("(pointer: fine)").matches) auto.paused = true;
    };
    const leave = () => {
      auto.paused = false;
    };
    stage.addEventListener("pointerenter", enter);
    stage.addEventListener("pointerleave", leave);

    /* exposed spin helper for the buttons */
    const spin = (dir: 1 | -1) => {
      const target = (Math.round(angleRef.current / STEP) + dir) * STEP;
      auto.paused = true;
      gsap.to(angleRef, {
        current: target,
        duration: 0.85,
        ease: "power3.out",
        onUpdate: () => {
          // angleRef.current is mutated through the generic object —
          // gsap tweens the `current` prop on the ref object itself
        },
        onComplete: () => {
          auto.paused = false;
        },
      });
    };
    stage.dataset.spin = "true";
    (
      stage as HTMLDivElement & { __spin?: (dir: 1 | -1) => void }
    ).__spin = spin;

    return () => {
      gsap.ticker.remove(tick);
      io.disconnect();
      stage.removeEventListener("pointerdown", down);
      stage.removeEventListener("pointermove", move);
      stage.removeEventListener("pointerup", up);
      stage.removeEventListener("pointercancel", up);
      stage.removeEventListener("pointerenter", enter);
      stage.removeEventListener("pointerleave", leave);
    };
  }, []);

  const press = (dir: 1 | -1) => {
    const stage = stageRef.current as
      | (HTMLDivElement & { __spin?: (dir: 1 | -1) => void })
      | null;
    stage?.__spin?.(dir);
  };

  return (
    <div className="relative mt-20 sm:mt-24">
      {/* band header */}
      <div className="flex flex-col items-center text-center">
        <div className="flex items-center gap-4">
          <span className="h-px w-10 bg-gradient-to-r from-transparent to-[#c89b6a]" aria-hidden />
          <p className="eyebrow">Signature Roulette</p>
          <span className="h-px w-10 bg-gradient-to-l from-transparent to-[#c89b6a]" aria-hidden />
        </div>
        <h3 className="font-display mt-5 max-w-xl text-balance text-3xl font-medium leading-tight text-[#f4eddf] sm:text-4xl">
          Spin the <em className="text-gold-gradient font-light italic">collection</em>
        </h3>
        <p className="mt-3 max-w-md text-pretty text-sm leading-relaxed text-[#a6947f]">
          Eight builds that made the house. Drag the ring — or let it
          drift — and stop on whatever catches your eye.
        </p>
      </div>

      {/* 3D stage */}
      <div
        ref={stageRef}
        role="group"
        aria-roledescription="carousel"
        aria-label="Signature drinks — drag to spin, or use the arrows"
        className="ring-stage relative mt-10 h-[340px] cursor-grab touch-pan-y select-none active:cursor-grabbing sm:h-[420px] lg:h-[460px]"
        style={{ touchAction: "pan-y" }}
        data-cursor="Drag"
      >
        <div className="perspective-1200 absolute inset-0">
          <div
            className="ring-tilt absolute inset-0"
            style={{ transform: "rotateX(-8deg)", transformStyle: "preserve-3d" }}
          >
            <div
              ref={ringRef}
              className="absolute inset-0"
              style={{ transformStyle: "preserve-3d", willChange: "transform" }}
            >
              {ITEMS.map((item, i) => (
                <figure
                  key={item.id}
                  className={cn(
                    "ring-panel absolute left-1/2 top-1/2 overflow-hidden rounded-3xl border border-[#c89b6a]/20 will-transform",
                    dims ? "opacity-100" : "opacity-0"
                  )}
                  style={{
                    width: dims?.w ?? 200,
                    height: dims?.h ?? 280,
                    marginLeft: -(dims?.w ?? 200) / 2,
                    marginTop: -(dims?.h ?? 280) / 2,
                    background: item.art,
                    transform: dims
                      ? `translateZ(0px) rotateY(${i * STEP}deg) translateZ(${dims.r}px)`
                      : undefined,
                  }}
                >
                  {/* giant watermark initial */}
                  <span
                    className="font-display pointer-events-none absolute -right-3 -top-6 select-none text-[7rem] font-light leading-none text-[#f4eddf]/6"
                    aria-hidden
                  >
                    {item.name.charAt(0)}
                  </span>
                  {/* sheen */}
                  <span
                    className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_28%_18%,rgba(233,211,168,0.14),transparent_55%)]"
                    aria-hidden
                  />
                  <figcaption className="absolute inset-x-0 bottom-0 flex h-1/2 flex-col justify-end gap-1.5 p-5">
                    <p className="font-mono text-[0.55rem] uppercase tracking-[0.3em] text-[#c89b6a]">
                      No. {String(item.no).padStart(2, "0")}
                    </p>
                    <p className="font-display text-xl font-medium italic leading-tight text-[#f4eddf]">
                      {item.name}
                    </p>
                    <p className="line-clamp-1 text-[0.65rem] leading-snug text-[#a6947f]">
                      {item.note}
                    </p>
                    <p className="mt-1 font-display text-lg text-[#e9d3a8]">
                      <span className="mr-0.5 align-top text-[0.6rem]">$</span>
                      {formatPrice(item.price)}
                    </p>
                  </figcaption>
                  <span
                    className="steam absolute left-1/2 top-[26%] h-10 w-16 -translate-x-1/2"
                    aria-hidden
                  >
                    <span />
                    <span />
                    <span />
                  </span>
                </figure>
              ))}
            </div>
          </div>
        </div>

        {/* floor shadow */}
        <div
          className="pointer-events-none absolute bottom-6 left-1/2 h-10 w-[62%] -translate-x-1/2 rounded-[100%] bg-black/60 blur-2xl"
          aria-hidden
        />
      </div>

      {/* controls */}
      <div className="mt-8 flex items-center justify-center gap-5">
        <button
          type="button"
          onClick={() => press(-1)}
          aria-label="Spin to previous drink"
          className="grid h-12 w-12 place-items-center rounded-full border border-[#c89b6a]/30 text-[#e9d3a8] transition-all duration-300 hover:border-[#c89b6a] hover:bg-[#c89b6a]/10 active:scale-95"
        >
          <ChevronLeft className="h-5 w-5" strokeWidth={1.75} />
        </button>
        <span className="inline-flex items-center gap-2 font-mono text-[0.58rem] uppercase tracking-[0.26em] text-[#a6947f]">
          <Hand className="h-3.5 w-3.5" strokeWidth={1.75} />
          Drag to spin
        </span>
        <button
          type="button"
          onClick={() => press(1)}
          aria-label="Spin to next drink"
          className="grid h-12 w-12 place-items-center rounded-full border border-[#c89b6a]/30 text-[#e9d3a8] transition-all duration-300 hover:border-[#c89b6a] hover:bg-[#c89b6a]/10 active:scale-95"
        >
          <ChevronRight className="h-5 w-5" strokeWidth={1.75} />
        </button>
      </div>
    </div>
  );
}
