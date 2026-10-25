"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "@/components/gsap/gsap-provider";

/**
 * Cinematic preloader — percentage counter, brand reveal, curtain wipe.
 * Runs once per cafe-view mount; signals completion via onDone so the
 * hero entrance timeline can start exactly as the curtain lifts.
 */
export function Preloader({ onDone }: { onDone?: () => void }) {
  const root = useRef<HTMLDivElement>(null);
  const [pct, setPct] = useState(0);
  const doneRef = useRef(onDone);
  useEffect(() => {
    doneRef.current = onDone;
  }, [onDone]);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      // external-system updates only — no cascading renders
      if (root.current) root.current.style.display = "none";
      doneRef.current?.();
      return;
    }

    const ctx = gsap.context(() => {
      const counter = { v: 0 };
      const tl = gsap.timeline({
        onComplete: () => {
          if (root.current) root.current.style.display = "none";
          doneRef.current?.();
        },
      });

      tl.set(root.current, { display: "flex" })
        .to(".pre-brand span", {
          y: 0,
          opacity: 1,
          stagger: 0.05,
          duration: 0.9,
          ease: "power4.out",
        })
        .to(
          counter,
          {
            v: 100,
            duration: 1.7,
            ease: "power2.inOut",
            onUpdate: () => setPct(Math.round(counter.v)),
          },
          0.2
        )
        .to(".pre-fill", { scaleX: 1, duration: 1.7, ease: "power2.inOut" }, 0.2)
        .to(".pre-brand span", {
          y: -14,
          opacity: 0,
          stagger: 0.03,
          duration: 0.5,
          ease: "power2.in",
        })
        .to(".pre-meta, .pre-count, .pre-bar", { opacity: 0, duration: 0.4 }, "<")
        // curtain lift
        .to(".pre-panel", {
          scaleY: 0,
          transformOrigin: "top center",
          duration: 1.05,
          stagger: 0.07,
          ease: "power4.inOut",
        })
        .set(root.current, { pointerEvents: "none" });
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={root}
      className="fixed inset-0 z-[200] hidden flex-col items-center justify-center bg-[#0a0807]"
      role="status"
      aria-label="Loading NOIRÉ"
    >
      {/* curtain panels */}
      <div className="pointer-events-none absolute inset-0 flex" aria-hidden>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="pre-panel h-full flex-1 bg-[#0d0a08]" />
        ))}
      </div>

      <div className="pre-brand relative z-10 flex overflow-hidden font-display text-4xl font-medium tracking-[0.28em] text-[#f4eddf] sm:text-5xl">
        {"NOIRÉ".split("").map((ch, i) => (
          <span key={i} className="inline-block translate-y-full opacity-0">
            {ch}
          </span>
        ))}
        <span className="inline-block translate-y-full opacity-0 text-[#c89b6a]">.</span>
      </div>

      <p className="pre-meta relative z-10 mt-4 text-[0.6rem] font-bold uppercase tracking-[0.42em] text-[#a6947f]">
        Artisan Coffee House — Est. 2016
      </p>

      <div className="pre-bar relative z-10 mt-10 h-px w-48 overflow-hidden bg-[#c89b6a]/15">
        <div className="pre-fill h-full w-full origin-left scale-x-0 bg-gradient-to-r from-[#9a7248] to-[#e9d3a8]" />
      </div>

      <p className="pre-count relative z-10 mt-4 font-mono text-xs tabular-nums text-[#c89b6a]">
        {String(pct).padStart(3, "0")}%
      </p>
    </div>
  );
}
