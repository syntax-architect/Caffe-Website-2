"use client";

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
