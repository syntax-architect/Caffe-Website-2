"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useUIStore } from "@/lib/ui-store";
import { CafeSite } from "@/components/cafe/cafe-site";
import { KDSApp } from "@/components/kds/kds-app";

export default function Home() {
  const view = useUIStore((s) => s.view);
  const setView = useUIStore((s) => s.setView);

  /* ——— deep-link sync: /#kds opens the kitchen display ——— */
  useEffect(() => {
    const apply = () => {
      setView(window.location.hash === "#kds" ? "kds" : "cafe");
    };
    apply();
    window.addEventListener("hashchange", apply);
    return () => window.removeEventListener("hashchange", apply);
  }, [setView]);

  /* ——— lock page scroll while the KDS board is open ——— */
  useEffect(() => {
    document.body.style.overflow = view === "kds" ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [view]);

  return (
    <AnimatePresence mode="wait" initial={false}>
      {view === "cafe" ? (
        <motion.div
          key="cafe"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.28 } }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          <CafeSite />
        </motion.div>
      ) : (
        <motion.div
          key="kds"
          initial={{ opacity: 0, scale: 0.985 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.99, transition: { duration: 0.24 } }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="h-[100svh]"
        >
          <KDSApp />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
