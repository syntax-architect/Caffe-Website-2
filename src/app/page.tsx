import { Navbar } from "@/components/cafe/navbar";
import { Hero } from "@/components/cafe/hero";
import { Story } from "@/components/cafe/story";
import { MenuSection } from "@/components/cafe/menu-section";
import { Gallery } from "@/components/cafe/gallery";
import { Testimonials } from "@/components/cafe/testimonials";
import { Visit, Footer } from "@/components/cafe/visit";
import { CursorGlow } from "@/components/cafe/cursor-glow";

export default function Home() {
  return (
    <div className="grain relative min-h-screen bg-background font-sans text-foreground">
      {/* Skip link for a11y */}
      <a
        href="#craft"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-[#c89b6a] focus:px-5 focus:py-2.5 focus:text-xs focus:font-bold focus:uppercase focus:tracking-widest focus:text-[#14100d]"
      >
        Skip to content
      </a>

      <CursorGlow />
      <Navbar />

      <main className="relative">
        {/* 01 — Hero */}
        <Hero />
        {/* 02 — The Craft */}
        <Story />
        {/* 03 — The Menu */}
        <MenuSection />
        {/* 04 — The Space */}
        <Gallery />
        {/* 05 — Reviews */}
        <Testimonials />
        {/* 06 — Find Us */}
        <Visit />
      </main>

      <Footer />
    </div>
  );
}
