"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Scroll-triggered lazy mounting.
 *
 * Children are only rendered once the placeholder drifts within
 * `rootMargin` of the viewport — below-fold sections cost zero JS,
 * zero layout and zero network until the guest actually approaches
 * them. Pairs with `next/dynamic` for real code-splitting.
 */

function SectionSkeleton({ minHeight, label }: { minHeight: string; label: string }) {
  return (
    <div
      aria-hidden
      data-lazy-skeleton={label}
      className="relative flex items-center justify-center overflow-hidden rounded-[2rem] border border-[#c89b6a]/10 bg-[#14100d]/40"
      style={{ minHeight }}
    >
      {/* shimmer sweep */}
      <span className="absolute inset-0 -translate-x-full animate-[skeleton-sweep_2.4s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-[#c89b6a]/6 to-transparent" />
      <div className="flex flex-col items-center gap-4">
        <span className="font-display text-sm italic tracking-[0.3em] text-[#c89b6a]/40">
          NOIRÉ
        </span>
        <span className="h-px w-16 bg-[#c89b6a]/20" />
        <span className="text-[0.55rem] font-bold uppercase tracking-[0.34em] text-[#a6947f]/50">
          {label}
        </span>
      </div>
    </div>
  );
}

interface LazySectionProps {
  children: ReactNode;
  /** Roughly matches the final section height so the swap is seamless */
  minHeight?: string;
  /** Accessible label shown on the skeleton */
  label: string;
  /** Start mounting when the section is this far from the viewport */
  rootMargin?: string;
}

export function LazySection({
  children,
  minHeight = "70svh",
  label,
  rootMargin = "1100px 0px",
}: LazySectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || mounted) return;

    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setMounted(true);
          io.disconnect();
        }
      },
      { rootMargin }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [mounted, rootMargin]);

  return (
    <div ref={ref} aria-busy={!mounted}>
      {mounted ? (
        children
      ) : (
        <SectionSkeleton minHeight={minHeight} label={label} />
      )}
    </div>
  );
}
