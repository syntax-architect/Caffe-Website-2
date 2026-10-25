"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { gsap } from "@/components/gsap/gsap-provider";
import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  eyebrow: string;
  title: ReactNode;
  description?: string;
  align?: "left" | "center";
  className?: string;
  id?: string;
}

/** Editorial section heading — GSAP scrubbed rules + masked title rise. */
export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  className,
  id,
}: SectionHeadingProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduce) return;

      gsap.fromTo(
        ".sh-rule",
        { scaleX: 0 },
        {
          scaleX: 1,
          duration: 1.1,
          ease: "power3.out",
          stagger: 0.08,
          scrollTrigger: { trigger: ref.current, start: "top 82%", once: true },
        }
      );

      gsap.fromTo(
        ".sh-title",
        { yPercent: 112, rotateX: -18 },
        {
          yPercent: 0,
          rotateX: 0,
          duration: 1.25,
          ease: "power4.out",
          transformOrigin: "50% 100%",
          scrollTrigger: { trigger: ref.current, start: "top 82%", once: true },
        }
      );

      if (description) {
        gsap.fromTo(
          ".sh-desc",
          { y: 26, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 1,
            ease: "power3.out",
            scrollTrigger: { trigger: ref.current, start: "top 76%", once: true },
          }
        );
      }
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={ref}
      className={cn(
        "max-w-2xl",
        align === "center" && "mx-auto text-center",
        className
      )}
    >
      <div
        className={cn("flex items-center gap-4", align === "center" && "justify-center")}
      >
        <span className="sh-rule h-px w-10 origin-right bg-gradient-to-r from-transparent to-[#c89b6a]" aria-hidden />
        <p className="eyebrow" id={id}>
          {eyebrow}
        </p>
        <span className="sh-rule h-px w-10 origin-left bg-gradient-to-l from-transparent to-[#c89b6a]" aria-hidden />
      </div>

      <div className="perspective-1200 overflow-hidden pb-[0.12em] -mb-[0.12em]">
        <h2 className="sh-title font-display mt-6 text-balance text-4xl font-medium leading-[1.05] tracking-tight text-[#f4eddf] will-transform sm:text-5xl lg:text-6xl">
          {title}
        </h2>
      </div>

      {description && (
        <p className="sh-desc mt-6 text-pretty text-base leading-relaxed text-[#a6947f] sm:text-lg">
          {description}
        </p>
      )}
    </div>
  );
}
