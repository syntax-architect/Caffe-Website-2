"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/components/gsap/gsap-provider";

/**
 * Premium two-part cursor: an instant gold dot + a lagging ring that
 * morphs over interactive elements, shows labels ("View", "Drag"),
 * and keeps the ambient glow. Only on pointer-fine devices; native
 * cursor is hidden via a body class after first move so a JS failure
 * never leaves the user cursor-less.
 */
export function CustomCursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);
  const glow = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ringX = gsap.quickTo(ring.current, "x", { duration: 0.45, ease: "power3" });
    const ringY = gsap.quickTo(ring.current, "y", { duration: 0.45, ease: "power3" });
    const dotX = gsap.quickTo(dot.current, "x", { duration: 0.08, ease: "power2" });
    const dotY = gsap.quickTo(dot.current, "y", { duration: 0.08, ease: "power2" });
    const glowX = gsap.quickTo(glow.current, "x", { duration: 0.9, ease: "power2" });
    const glowY = gsap.quickTo(glow.current, "y", { duration: 0.9, ease: "power2" });

    let shown = false;
    const move = (e: PointerEvent) => {
      if (!shown) {
        shown = true;
        document.body.classList.add("custom-cursor-on");
        gsap.to([dot.current, ring.current, glow.current], { opacity: 1, duration: 0.3 });
      }
      dotX(e.clientX);
      dotY(e.clientY);
      ringX(e.clientX);
      ringY(e.clientY);
      glowX(e.clientX);
      glowY(e.clientY);
    };

    const onOver = (e: Event) => {
      const el = e.target as HTMLElement;
      if (!el?.closest) return;
      const labelled = el.closest<HTMLElement>("[data-cursor]");
      const interactive = el.closest('a, button, [role="button"], input, textarea, select, label, [data-cursor-hover]');

      if (labelled) {
        const text = labelled.dataset.cursor || "";
        if (label.current) label.current.textContent = text;
        ring.current?.classList.add("cursor-ring--label");
        dot.current?.classList.add("cursor-dot--hide");
        ring.current?.classList.add("cursor-ring--big");
        return;
      }
      if (interactive) {
        ring.current?.classList.add("cursor-ring--big");
        ring.current?.classList.add("cursor-ring--active");
      }
    };

    const onOut = (e: Event) => {
      const el = e.target as HTMLElement;
      if (!el?.closest) return;
      const to = e.relatedTarget as HTMLElement | null;
      if (to && (to.closest?.('[data-cursor], a, button, [role="button"], input, textarea, select, label') as HTMLElement)?.closest?.("[data-cursor]")) return;
      ring.current?.classList.remove("cursor-ring--label", "cursor-ring--big", "cursor-ring--active");
      dot.current?.classList.remove("cursor-dot--hide");
    };

    const down = () => ring.current?.classList.add("cursor-ring--down");
    const up = () => ring.current?.classList.remove("cursor-ring--down");

    window.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("mouseover", onOver);
    document.addEventListener("mouseout", onOut);
    window.addEventListener("pointerdown", down);
    window.addEventListener("pointerup", up);

    return () => {
      document.body.classList.remove("custom-cursor-on");
      window.removeEventListener("pointermove", move);
      document.removeEventListener("mouseover", onOver);
      document.removeEventListener("mouseout", onOut);
      window.removeEventListener("pointerdown", down);
      window.removeEventListener("pointerup", up);
    };
  }, []);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[190] hidden [@media(pointer:fine)]:block">
      {/* ambient glow */}
      <div
        ref={glow}
        className="cursor-glow absolute left-0 top-0 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-0 mix-blend-screen"
        style={{
          background:
            "radial-gradient(circle, rgba(200,155,106,0.13) 0%, rgba(200,155,106,0.045) 35%, transparent 65%)",
        }}
      />
      {/* trailing ring */}
      <div ref={ring} className="cursor-ring absolute left-0 top-0 opacity-0">
        <span
          ref={label}
          className="cursor-ring-label absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 select-none text-[0.55rem] font-bold uppercase tracking-[0.2em] text-[#14100d] opacity-0"
        />
      </div>
      {/* instant dot */}
      <div ref={dot} className="cursor-dot absolute left-0 top-0 opacity-0" />
    </div>
  );
}
