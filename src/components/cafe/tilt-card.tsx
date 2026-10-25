"use client";

import { useRef, type ReactNode } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  type MotionStyle,
} from "framer-motion";
import { cn } from "@/lib/utils";

interface TiltCardProps {
  children: ReactNode;
  className?: string;
  /** max rotation in degrees */
  intensity?: number;
  /** enable glare highlight */
  glare?: boolean;
  scale?: number;
  style?: MotionStyle;
}

/**
 * Physics-smoothed 3D tilt card that follows the pointer.
 * Children can use `translateZ()` utilities for parallax depth.
 */
export function TiltCard({
  children,
  className,
  intensity = 10,
  glare = true,
  scale = 1.02,
  style,
}: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);

  const px = useMotionValue(0.5); // 0..1 pointer position
  const py = useMotionValue(0.5);

  const spring = { stiffness: 220, damping: 24, mass: 0.6 };
  const sx = useSpring(px, spring);
  const sy = useSpring(py, spring);

  const rotateX = useTransform(sy, [0, 1], [intensity, -intensity]);
  const rotateY = useTransform(sx, [0, 1], [-intensity, intensity]);

  const glareX = useTransform(sx, [0, 1], ["-40%", "40%"]);
  const glareY = useTransform(sy, [0, 1], ["-40%", "40%"]);

  function handleMove(e: React.PointerEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el || e.pointerType === "touch") return;
    const rect = el.getBoundingClientRect();
    px.set((e.clientX - rect.left) / rect.width);
    py.set((e.clientY - rect.top) / rect.height);
  }

  function handleLeave() {
    px.set(0.5);
    py.set(0.5);
  }

  return (
    <div
      ref={ref}
      className={cn("perspective-1200", className)}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
    >
      <motion.div
        style={{
          rotateX,
          rotateY,
          ...style,
        }}
        whileHover={{ scale }}
        transition={{ type: "spring", stiffness: 260, damping: 22 }}
        className="preserve-3d will-transform group relative h-full w-full"
      >
        {children}
        {glare && (
          <motion.div
            aria-hidden
            className="pointer-events-none absolute inset-0 z-10 overflow-hidden rounded-[inherit]"
          >
            <motion.div
              className="absolute left-1/2 top-1/2 h-[160%] w-[160%] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-0 transition-opacity duration-500 group-hover:opacity-100"
              style={{
                x: glareX,
                y: glareY,
                background:
                  "radial-gradient(circle, rgba(244,231,200,0.16) 0%, transparent 55%)",
              }}
            />
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
