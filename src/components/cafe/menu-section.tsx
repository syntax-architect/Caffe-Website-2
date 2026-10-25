"use client";

import { useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles, ArrowUpRight } from "lucide-react";
import { SectionHeading } from "./section-heading";
import { Reveal } from "./reveal";
import { TiltCard } from "./tilt-card";
import { cn } from "@/lib/utils";

type Category = "espresso" | "brews" | "patisserie";

const CATEGORIES: { id: Category; label: string; hint: string }[] = [
  { id: "espresso", label: "Espresso Bar", hint: "Pulled to 25 seconds" },
  { id: "brews", label: "Slow Brews", hint: "Steeped, not rushed" },
  { id: "patisserie", label: "Patisserie", hint: "Baked at 5 AM" },
];

interface Item {
  name: string;
  note: string;
  price: string;
  tag?: string;
}

const MENU: Record<Category, Item[]> = {
  espresso: [
    { name: "The Noir", note: "Double ristretto, cocoa nib, sea salt", price: "4.5", tag: "House icon" },
    { name: "Honey Cortado", note: "Single-origin espresso, raw honey, silk milk", price: "5.0" },
    { name: "Black Forest Flat White", note: "Cherry-infused espresso, velvet microfoam", price: "5.5", tag: "Winter" },
    { name: "Espresso Tonic", note: "Yirgacheffe shot, artisan tonic, burnt orange", price: "6.0" },
    { name: "Affogato Noir", note: "Vanilla bean gelato drowned in espresso", price: "6.5" },
    { name: "Caffè Crème", note: "Long extraction, chantilly, nutmeg", price: "4.8" },
  ],
  brews: [
    { name: "Siphon Theatre", note: "Tableside vacuum brew, floral & theatrical", price: "9.0", tag: "Tableside" },
    { name: "Chemex for Two", note: "600ml slow pour, shared ritual", price: "11.0" },
    { name: "Cold Brew Noir", note: "18-hour steep, black cherry finish", price: "5.5" },
    { name: "Kyoto Drip", note: "Ice-dripped for 8 hours, wine-like clarity", price: "8.5", tag: "Limited" },
    { name: "Matcha Ceremony", note: "Ceremonial-grade, whisked to order", price: "6.5" },
    { name: "Chai Reverie", note: "House-ground spice, slow-simmered milk", price: "5.8" },
  ],
  patisserie: [
    { name: "Croissant au Beurre", note: "72-hour laminated, French butter", price: "4.2", tag: "Baked daily" },
    { name: "Pain au Chocolat", note: "Dual batons of 70% Guanaja", price: "4.6" },
    { name: "Burnt Basque Cheesecake", note: "Caramelised top, molten heart", price: "7.0" },
    { name: "Cardamom Knot", note: "Brioche, cardamom sugar, orange zest", price: "4.8" },
    { name: "Pistachio Éclair", note: "Sicilian pistachio crème, gold leaf", price: "6.2", tag: "Signature" },
    { name: "Seasonal Galette", note: "Ask the counter — always local fruit", price: "5.4" },
  ],
};

export function MenuSection() {
  const [active, setActive] = useState<Category>("espresso");

  return (
    <section
      id="menu"
      className="relative overflow-hidden bg-[#0d0a08] py-24 sm:py-32 lg:py-40"
      aria-labelledby="menu-heading"
    >
      {/* ambient glows */}
      <div
        className="pointer-events-none absolute -right-40 top-0 h-[520px] w-[520px] rounded-full bg-[#c89b6a]/7 blur-[130px]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -left-52 bottom-0 h-[420px] w-[420px] rounded-full bg-[#9a7248]/6 blur-[120px]"
        aria-hidden
      />

      <div className="mx-auto w-full max-w-7xl px-5 sm:px-8">
        <div className="flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-end">
          <SectionHeading
            id="menu-heading"
            eyebrow="The Menu"
            title={
              <>
                Chosen slowly,{" "}
                <em className="text-gold-gradient font-light italic">
                  savoured shorter
                </em>
              </>
            }
            description="Everything here is made to be drunk in the room it was made for. Prices are honest, portions are generous, and the menu changes when the seasons do."
          />
        </div>

        {/* ——— Tabs ——— */}
        <Reveal delay={0.1} className="mt-14">
          <div
            role="tablist"
            aria-label="Menu categories"
            className="flex flex-wrap gap-3"
          >
            {CATEGORIES.map((cat) => {
              const selected = active === cat.id;
              return (
                <button
                  key={cat.id}
                  role="tab"
                  aria-selected={selected}
                  aria-controls={`panel-${cat.id}`}
                  id={`tab-${cat.id}`}
                  type="button"
                  onClick={() => setActive(cat.id)}
                  className={cn(
                    "group relative overflow-hidden rounded-full border px-6 py-3.5 text-left transition-all duration-400 sm:px-7",
                    selected
                      ? "border-[#c89b6a] bg-[#c89b6a] text-[#14100d]"
                      : "border-[#c89b6a]/25 bg-[#14100d]/60 text-[#a6947f] hover:border-[#c89b6a]/60 hover:text-[#f4eddf]"
                  )}
                >
                  <span className="block text-xs font-bold uppercase tracking-[0.2em]">
                    {cat.label}
                  </span>
                  <span
                    className={cn(
                      "mt-0.5 block text-[0.62rem] italic",
                      selected ? "text-[#14100d]/70" : "text-[#a6947f]/70"
                    )}
                  >
                    {cat.hint}
                  </span>
                </button>
              );
            })}
          </div>
        </Reveal>

        {/* ——— Menu grid + featured card ——— */}
        <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_380px] lg:gap-14">
          {/* items */}
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              id={`panel-${active}`}
              role="tabpanel"
              aria-labelledby={`tab-${active}`}
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="grid gap-x-12 gap-y-2 sm:grid-cols-2"
            >
              {MENU[active].map((item, i) => (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.06 + i * 0.05, duration: 0.5 }}
                  className="group rounded-2xl px-4 py-5 transition-colors duration-300 hover:bg-[#14100d]/80"
                >
                  <div className="flex items-baseline">
                    <h3 className="font-display text-lg font-medium text-[#f4eddf] transition-colors duration-300 group-hover:text-[#e9d3a8] sm:text-xl">
                      {item.name}
                    </h3>
                    <span className="dot-leader" aria-hidden />
                    <span className="font-display shrink-0 text-lg text-[#c89b6a]">
                      <span className="mr-0.5 text-xs align-top">$</span>
                      {item.price}
                    </span>
                  </div>
                  <div className="mt-1.5 flex items-center gap-3">
                    <p className="text-sm leading-relaxed text-[#a6947f]">
                      {item.note}
                    </p>
                    {item.tag && (
                      <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-[#c89b6a]/35 px-2.5 py-0.5 text-[0.58rem] font-bold uppercase tracking-[0.16em] text-[#c89b6a]">
                        <Sparkles className="h-2.5 w-2.5" />
                        {item.tag}
                      </span>
                    )}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>

          {/* featured tilt card */}
          <Reveal direction="left" delay={0.15} className="lg:sticky lg:top-28 lg:self-start">
            <TiltCard intensity={8}>
              <article className="shine group relative overflow-hidden rounded-[2rem] border border-[#c89b6a]/25 bg-[#14100d]">
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image
                    src="/images/pastry-main.jpg"
                    alt="Fresh pastries served on ceramic at NOIRÉ"
                    fill
                    sizes="(min-width: 1024px) 24rem, 92vw"
                    className="object-cover transition-transform duration-[1.4s] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#14100d] via-transparent to-transparent" />
                  <span className="absolute left-5 top-5 rounded-full bg-[#0a0807]/70 px-4 py-1.5 text-[0.6rem] font-bold uppercase tracking-[0.26em] text-[#e9d3a8] backdrop-blur-md">
                    Barista pairs it with
                  </span>
                </div>
                <div className="p-7">
                  <div className="flex items-baseline justify-between gap-4">
                    <h3 className="font-display text-2xl font-medium text-[#f4eddf]">
                      Croissant &amp; The Noir
                    </h3>
                    <span className="font-display text-2xl text-[#c89b6a]">
                      $7.5
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-[#a6947f]">
                    The pairing that built our reputation — a 72-hour
                    croissant against a double ristretto. Butter meets
                    bitter; everyone wins.
                  </p>
                  <a
                    href="#visit"
                    className="mt-6 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.22em] text-[#e9d3a8] transition-all duration-300 hover:gap-3.5 hover:text-[#c89b6a]"
                  >
                    Reserve a table
                    <ArrowUpRight className="h-4 w-4" />
                  </a>
                </div>
              </article>
            </TiltCard>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
