"use client";

import { useState } from "react";
import { RotateCcw, Search, UtensilsCrossed } from "lucide-react";
import { cn } from "@/lib/utils";
import { MENU, CATEGORIES, formatPrice, type MenuItem } from "@/lib/cafe-data";
import { useMenuAdminStore } from "@/lib/menu-admin-store";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

export function MenuManager() {
  const { toast } = useToast();
  const soldOut = useMenuAdminStore((s) => s.soldOut);
  const priceOverrides = useMenuAdminStore((s) => s.priceOverrides);
  const toggleSoldOut = useMenuAdminStore((s) => s.toggleSoldOut);
  const setPrice = useMenuAdminStore((s) => s.setPrice);
  const resetEdits = useMenuAdminStore((s) => s.resetEdits);

  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("all");

  const priceOf = (m: MenuItem) => priceOverrides[m.id] ?? m.price;
  const available = MENU.filter((m) => !soldOut[m.id]).length;

  const rows = MENU.filter((m) => (cat === "all" ? true : m.category === cat)).filter(
    (m) => (q.trim() ? m.name.toLowerCase().includes(q.trim().toLowerCase()) : true)
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Menu manager</p>
          <h2 className="font-display mt-2 text-3xl font-medium text-[#f4eddf] sm:text-4xl">
            Run the board, 86 in a tap.
          </h2>
          <p className="mt-2 text-sm text-[#a6947f]">
            {available} of {MENU.length} items available · price edits apply to
            new tickets only.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="relative">
            <span className="sr-only">Search menu items</span>
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#a6947f]/60" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Filter items…"
              className="h-11 w-full rounded-full border border-[#c89b6a]/25 bg-[#14100d]/80 pl-10 pr-4 text-sm text-[#f4eddf] placeholder:text-[#a6947f]/50 outline-none focus:border-[#c89b6a]/70 sm:w-60"
            />
          </label>
          <button
            type="button"
            onClick={() => {
              resetEdits();
              toast({ title: "Menu restored", description: "All edits cleared." });
            }}
            className="inline-flex h-11 items-center gap-2 rounded-full border border-[#c89b6a]/25 px-4 text-[0.6rem] font-bold uppercase tracking-[0.2em] text-[#a6947f] transition-colors hover:border-[#c89b6a] hover:text-[#e9d3a8]"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Category filter">
        {[{ id: "all", label: "All" }, ...CATEGORIES].map((c) => (
          <button
            key={c.id}
            type="button"
            role="tab"
            aria-selected={cat === c.id}
            onClick={() => setCat(c.id)}
            className={cn(
              "rounded-full border px-4 py-2 text-[0.6rem] font-bold uppercase tracking-[0.18em] transition-colors",
              cat === c.id
                ? "border-[#c89b6a] bg-[#c89b6a] text-[#14100d]"
                : "border-[#c89b6a]/20 text-[#a6947f] hover:border-[#c89b6a]/50 hover:text-[#e9d3a8]"
            )}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {rows.map((m) => {
          const out = !!soldOut[m.id];
          return (
            <article
              key={m.id}
              className={cn(
                "group flex gap-4 rounded-2xl border p-4 transition-all duration-300",
                out
                  ? "border-[#c2543e]/30 bg-[#c2543e]/[0.04]"
                  : "border-[#c89b6a]/15 bg-[#14100d]/70 hover:border-[#c89b6a]/40"
              )}
            >
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-[#c89b6a]/15">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={m.image}
                  alt={m.name}
                  className={cn(
                    "h-full w-full object-cover transition-all duration-500",
                    out && "grayscale opacity-50"
                  )}
                />
                {out && (
                  <span className="absolute inset-0 grid place-items-center bg-[#0a0807]/40 font-mono text-[0.6rem] font-bold uppercase tracking-[0.2em] text-[#ff9d8a]">
                    86&apos;d
                  </span>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="truncate font-display text-base text-[#f4eddf]">
                      {m.name}
                    </h3>
                    <p className="truncate text-[0.68rem] text-[#a6947f]">{m.note}</p>
                  </div>
                  <span className="shrink-0 rounded-full border border-[#c89b6a]/25 px-2 py-0.5 font-mono text-[0.55rem] uppercase tracking-wider text-[#5c5142]">
                    {m.station}
                  </span>
                </div>

                <div className="mt-3 flex items-center justify-between gap-3">
                  <label className="flex items-center gap-2 text-[0.6rem] font-bold uppercase tracking-[0.16em] text-[#a6947f]">
                    <Switch
                      checked={!out}
                      onCheckedChange={() => toggleSoldOut(m.id)}
                      aria-label={`${m.name} availability`}
                    />
                    {out ? "Sold out" : "Available"}
                  </label>

                  <div className="flex items-center gap-1 rounded-lg border border-[#c89b6a]/20 bg-[#0d0a08] px-2 py-1">
                    <span className="font-mono text-xs text-[#5c5142]">$</span>
                    <input
                      type="number"
                      min={0}
                      step={0.1}
                      value={priceOf(m)}
                      onChange={(e) => setPrice(m.id, parseFloat(e.target.value) || 0)}
                      aria-label={`${m.name} price`}
                      className="w-14 bg-transparent text-right font-mono text-sm tabular-nums text-[#e9d3a8] outline-none"
                    />
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {rows.length === 0 && (
        <div className="grid place-items-center rounded-2xl border border-dashed border-[#c89b6a]/25 py-16 text-center">
          <UtensilsCrossed className="h-6 w-6 text-[#5c5142]" />
          <p className="mt-3 font-mono text-xs uppercase tracking-[0.3em] text-[#5c5142]">
            Nothing matches “{q}”
          </p>
        </div>
      )}

      <p className="text-center font-mono text-[0.6rem] uppercase tracking-[0.22em] text-[#5c5142]">
        Prices shown in USD · e.g. {formatPrice(4.5)} formatting preview
      </p>
    </div>
  );
}
