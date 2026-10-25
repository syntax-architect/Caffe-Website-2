"use client";

import { AnimatePresence, motion } from "framer-motion";
import { QrCode, X } from "lucide-react";
import { useUIStore } from "@/lib/ui-store";
import { GsapSmoother } from "@/components/gsap/gsap-provider";
import { Preloader } from "./preloader";
import { CustomCursor } from "./custom-cursor";
import { Navbar } from "./navbar";
import { CartDrawer } from "./cart-drawer";
import { Hero } from "./hero";
import { Story } from "./story";
import { MenuSection } from "./menu-section";
import { Gallery } from "./gallery";
import { Testimonials } from "./testimonials";
import { Visit, Footer } from "./visit";

/**
 * Floating QR-table context pill — appears when a guest arrives via a
 * table QR code (#table=N) so the whole site knows who's ordering.
 */
function TableBanner() {
  const table = useUIStore((s) => s.table);
  const setTable = useUIStore((s) => s.setTable);
  const setCartOpen = useUIStore((s) => s.setCartOpen);

  return (
    <AnimatePresence>
      {table !== null && (
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 24, scale: 0.94 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="fixed bottom-5 left-1/2 z-[110] -translate-x-1/2"
          role="status"
        >
          <div className="flex items-center gap-3 rounded-full border border-[#c89b6a]/40 bg-[#14100d]/90 py-2.5 pl-4 pr-2 shadow-[0_18px_50px_-12px_rgba(0,0,0,0.85)] backdrop-blur-md">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#c89b6a]/15 text-[#c89b6a]">
              <QrCode className="h-4 w-4" strokeWidth={1.75} />
            </span>
            <p className="whitespace-nowrap text-xs text-[#f4eddf]">
              <span className="font-bold tracking-wide">
                Table {String(table).padStart(2, "0")}
              </span>
              <span className="text-[#a6947f]"> — ordering from your seat</span>
            </p>
            <button
              type="button"
              onClick={() => setCartOpen(true)}
              className="rounded-full bg-[#c89b6a] px-4 py-2 text-[0.58rem] font-bold uppercase tracking-[0.18em] text-[#14100d] transition-transform hover:scale-[1.04]"
            >
              Menu
            </button>
            <button
              type="button"
              onClick={() => setTable(null)}
              aria-label="Exit table ordering mode"
              className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-[#a6947f] transition-colors hover:text-[#f4eddf]"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** The full NOIRÉ website — GSAP-smoothed, pinned, animated. */
export function CafeSite() {
  const introSeen = useUIStore((s) => s.introSeen);
  const setIntroSeen = useUIStore((s) => s.setIntroSeen);
  const setIntroDone = useUIStore((s) => s.setIntroDone);

  return (
    <div className="grain relative min-h-screen bg-background font-sans text-foreground">
      {/* Skip link for a11y */}
      <a
        href="#craft"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-[#c89b6a] focus:px-5 focus:py-2.5 focus:text-xs focus:font-bold focus:uppercase focus:tracking-widest focus:text-[#14100d]"
      >
        Skip to content
      </a>

      {!introSeen && (
        <Preloader
          onDone={() => {
            setIntroSeen();
            setIntroDone();
          }}
        />
      )}
      <CustomCursor />
      <Navbar />
      <CartDrawer />
      <TableBanner />

      <GsapSmoother>
        <main className="relative">
          {/* 01 — Hero */}
          <Hero />
          {/* 02 — The Craft + pinned chapter sequence */}
          <Story />
          {/* 03 — The Menu */}
          <MenuSection />
          {/* 04 — The Space (pinned horizontal) */}
          <Gallery />
          {/* 05 — Reviews */}
          <Testimonials />
          {/* 06 — Find Us */}
          <Visit />
        </main>

        <Footer />
      </GsapSmoother>
    </div>
  );
}
