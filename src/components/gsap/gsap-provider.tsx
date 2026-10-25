"use client";

import { useEffect, useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, ScrollSmoother);
}

export { gsap, ScrollTrigger, ScrollSmoother };

let smootherInstance: ScrollSmoother | null = null;

export function getSmoother(): ScrollSmoother | null {
  return smootherInstance;
}

/**
 * Mounts the ScrollSmoother wrapper/content scaffold, registers GSAP
 * plugins, normalises anchor navigation through the smoother, and
 * exposes the singleton for sections that need programmatic scrolling.
 *
 * Fixed elements (nav, cursor, drawers) MUST live outside this wrapper.
 */
export function GsapSmoother({ children }: { children: ReactNode }) {
  const hydrated = useRef(false);

  useEffect(() => {
    if (hydrated.current) return;
    hydrated.current = true;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    smootherInstance = ScrollSmoother.create({
      wrapper: "#smooth-wrapper",
      content: "#smooth-content",
      smooth: reduce ? false : 1.15,
      smoothTouch: false,
      effects: reduce ? false : true,
      normalizeScroll: false,
    });

    // Route in-page anchors through the smoother so pinned sections behave.
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement)?.closest?.('a[href^="#"]') as HTMLAnchorElement | null;
      if (!a) return;
      const hash = a.getAttribute("href");
      if (!hash || hash === "#" || hash === "#kds") return;
      const target = document.querySelector(hash);
      if (!target) return;
      e.preventDefault();
      if (smootherInstance) {
        smootherInstance.scrollTo(target, true, "top 72px");
        history.replaceState(null, "", hash);
      }
    };
    document.addEventListener("click", onClick);

    const onResize = () => ScrollTrigger.refresh();
    window.addEventListener("orientationchange", onResize);

    // let images/fonts settle before measuring pins
    const t = setTimeout(() => ScrollTrigger.refresh(), 600);
    if (document.fonts?.ready) void document.fonts.ready.then(() => ScrollTrigger.refresh());

    return () => {
      clearTimeout(t);
      document.removeEventListener("click", onClick);
      window.removeEventListener("orientationchange", onResize);
      smootherInstance?.kill();
      smootherInstance = null;
      hydrated.current = false;
    };
  }, []);

  return (
    <div id="smooth-wrapper">
      <div id="smooth-content">{children}</div>
    </div>
  );
}
