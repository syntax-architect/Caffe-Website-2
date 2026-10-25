"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles, ArrowUpRight, Plus, Check } from "lucide-react";
import { gsap } from "@/components/gsap/gsap-provider";
import { SectionHeading } from "./section-heading";
import { Reveal } from "./reveal";
import { TiltCard } from "./tilt-card";
import { cn } from "@/lib/utils";
import { CATEGORIES, MENU, formatPrice, type Category } from "@/lib/cafe-data";
import { useCartStore } from "@/lib/cart-store";
import { useUIStore } from "@/lib/ui-store";

export function MenuSection() {
  const [active, setActive] = useState<Category>("espresso");
  const [justAdded, setJustAdded] = useState<string | null>(null);
  const add = useCartStore((s) => s.add);
  const setCartOpen = useUIStore((s) => s.setCartOpen);

  /* ——— Cursor-following image preview ——— */
  const previewRef = useRef<HTMLDivElement>(null);
  const [preview, setPreview] = useState<{ img: string; name: string } | null>(null);

  useEffect(() => {
    const el = previewRef.current;
    if (!el) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;
    const xTo = gsap.quickTo(el, "x", { duration: 0.55, ease: "power3" });
    const yTo = gsap.quickTo(el, "y", { duration: 0.55, ease: "power3" });
    const move = (e: PointerEvent) => {
      xTo(e.clientX);
      yTo(e.clientY);
    };
    window.addEventListener("pointermove", move, { passive: true });
    return () => window.removeEventListener("pointermove", move);
  }, [preview]);

  function handleAdd(id: string) {
    const item = MENU.find((m) => m.id === id);
    if (!item) return;
    add(item);
    setJustAdded(id);
    window.setTimeout(() => setJustAdded((cur) => (cur === id ? null : cur)), 900);
  }

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

      {/* floating preview that trails the cursor over menu rows */}
      <div
        ref={previewRef}
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-40 hidden -translate-x-1/2 -translate-y-[110%] [@media(pointer:fine)]:block"
      >
        <AnimatePresence>
          {preview && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, rotate: -4 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.85, rotate: 3 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="relative h-44 w-36 overflow-hidden rounded-2xl border border-[#c89b6a]/40 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)]"
            >
              <Image
                src={preview.img}
                alt=""
                fill
                sizes="144px"
                className="object-cover"
              />
              <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#0a0807]/85 to-transparent px-3 pb-2 pt-6 text-[0.58rem] font-bold uppercase tracking-[0.18em] text-[#e9d3a8]">
                {preview.name}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

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
              {MENU.filter((m) => m.category === active).map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.06 + i * 0.05, duration: 0.5 }}
                  className="group relative rounded-2xl px-4 py-5 transition-colors duration-300 hover:bg-[#14100d]/80"
                  onPointerEnter={() =>
                    setPreview({ img: item.image, name: item.name })
                  }
                  onPointerLeave={() => setPreview(null)}
                >
                  <div className="flex items-baseline">
                    <h3 className="font-display text-lg font-medium text-[#f4eddf] transition-colors duration-300 group-hover:text-[#e9d3a8] sm:text-xl">
                      {item.name}
                    </h3>
                    <span className="dot-leader" aria-hidden />
                    <span className="font-display shrink-0 text-lg text-[#c89b6a]">
                      <span className="mr-0.5 text-xs align-top">$</span>
                      {formatPrice(item.price)}
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

                  {/* add to order */}
                  <button
                    type="button"
                    onClick={() => handleAdd(item.id)}
                    aria-label={`Add ${item.name} to your order`}
                    className={cn(
                      "absolute right-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full border transition-all duration-300",
                      justAdded === item.id
                        ? "border-[#7da26b] bg-[#7da26b] text-[#14100d]"
                        : "border-[#c89b6a]/35 bg-[#0d0a08] text-[#c89b6a] hover:border-[#c89b6a] hover:bg-[#c89b6a] hover:text-[#14100d] sm:opacity-0 sm:group-hover:opacity-100"
                    )}
                  >
                    {justAdded === item.id ? (
                      <Check className="h-4 w-4" strokeWidth={2.5} />
                    ) : (
                      <Plus className="h-4 w-4" strokeWidth={2} />
                    )}
                  </button>
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
                    <span className="font-display text-2xl text-[#c89b6a]">$7.5</span>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-[#a6947f]">
                    The pairing that built our reputation — a 72-hour
                    croissant against a double ristretto. Butter meets
                    bitter; everyone wins.
                  </p>
                  <div className="mt-6 flex flex-wrap items-center gap-4">
                    <button
                      type="button"
                      onClick={() => {
                        const pair = MENU.find((m) => m.id === "croissant");
                        const noir = MENU.find((m) => m.id === "noir");
                        if (pair) add(pair);
                        if (noir) add(noir);
                        setCartOpen(true);
                      }}
                      className="inline-flex items-center gap-2 rounded-full bg-[#c89b6a] px-5 py-3 text-[0.65rem] font-bold uppercase tracking-[0.2em] text-[#14100d] transition-all duration-300 hover:scale-[1.03]"
                    >
                      <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
                      Add the pairing
                    </button>
                    <a
                      href="#visit"
                      className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.22em] text-[#e9d3a8] transition-all duration-300 hover:gap-3.5 hover:text-[#c89b6a]"
                    >
                      Reserve a table
                      <ArrowUpRight className="h-4 w-4" />
                    </a>
                  </div>
                </div>
              </article>
            </TiltCard>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
