"use client";

import { useEffect } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

/**
 * Ambient gold glow that trails the cursor.
 * Visibility is handled purely by CSS media queries:
 * only shown on pointer-fine devices without reduced-motion preference.
 */
export function CursorGlow() {
  const x = useMotionValue(-600);
  const y = useMotionValue(-600);

  const sx = useSpring(x, { stiffness: 120, damping: 22, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 120, damping: 22, mass: 0.4 });

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;

    const move = (e: PointerEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
    };
    window.addEventListener("pointermove", move, { passive: true });
    return () => window.removeEventListener("pointermove", move);
  }, [x, y]);

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[80] hidden h-[480px] w-[480px] rounded-full opacity-40 mix-blend-screen [@media(pointer:fine)]:block [@media(prefers-reduced-motion:reduce)]:hidden"
      style={{
        x: sx,
        y: sy,
        translateX: "-50%",
        translateY: "-50%",
        background:
          "radial-gradient(circle, rgba(200,155,106,0.14) 0%, rgba(200,155,106,0.05) 35%, transparent 65%)",
      }}
    />
  );
}
