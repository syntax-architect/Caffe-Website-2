"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { cn } from "@/lib/utils";
import { Reveal } from "./reveal";

interface SectionHeadingProps {
  eyebrow: string;
  title: React.ReactNode;
  description?: string;
  align?: "left" | "center";
  className?: string;
  id?: string;
}

/** Editorial section heading with eyebrow rule + display serif title. */
export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  className,
  id,
}: SectionHeadingProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const lineScale = useTransform(scrollYProgress, [0.1, 0.5], [0, 1]);

  return (
    <div
      ref={ref}
      className={cn(
        "max-w-2xl",
        align === "center" && "mx-auto text-center",
        className
      )}
    >
      <Reveal amount={0.6}>
        <div
          className={cn(
            "flex items-center gap-4",
            align === "center" && "justify-center"
          )}
        >
          <motion.span
            style={{ scaleX: lineScale }}
            className="h-px w-10 origin-left bg-gradient-to-r from-transparent to-[#c89b6a]"
            aria-hidden
          />
          <p className="eyebrow" id={id}>
            {eyebrow}
          </p>
          <motion.span
            style={{ scaleX: lineScale }}
            className="h-px w-10 origin-right bg-gradient-to-l from-transparent to-[#c89b6a]"
            aria-hidden
          />
        </div>
      </Reveal>

      <Reveal delay={0.08}>
        <h2 className="font-display mt-6 text-balance text-4xl font-medium leading-[1.05] tracking-tight text-[#f4eddf] sm:text-5xl lg:text-6xl">
          {title}
        </h2>
      </Reveal>

      {description && (
        <Reveal delay={0.16}>
          <p className="mt-6 text-pretty text-base leading-relaxed text-[#a6947f] sm:text-lg">
            {description}
          </p>
        </Reveal>
      )}
    </div>
  );
}
