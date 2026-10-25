"use client";

import { ArrowRight, CheckCheck, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { sortForGrid, type KDSOrder, type OrderStatus } from "@/lib/kds-store";
import { TicketCard } from "./ticket-card";

interface FlowBoardProps {
  orders: KDSOrder[];
  now: number;
  onAdvance: (id: string) => void;
  onRegress: (id: string) => void;
  onToggleItem: (orderId: string, itemId: string) => void;
  onOpen: (order: KDSOrder) => void;
}

const COLUMNS: { status: OrderStatus; title: string; accent: string }[] = [
  { status: "new", title: "Queued", accent: "text-[#e9d3a8]" },
  { status: "preparing", title: "In Progress", accent: "text-[#ecc571]" },
  { status: "ready", title: "Ready to Pass", accent: "text-[#8fc9a1]" },
];

export function FlowBoard({ orders, now, onAdvance, onRegress, onToggleItem, onOpen }: FlowBoardProps) {
  return (
    <div className="grid h-full grid-cols-1 gap-3 overflow-y-auto p-3 md:grid-cols-3 md:overflow-hidden">
      {COLUMNS.map((col) => {
        const list = sortForGrid(
          orders.filter((o) => o.status === col.status),
          now
        );
        return (
          <section
            key={col.status}
            className="flex min-h-[12rem] flex-col overflow-hidden rounded-xl border border-[#2a241d] bg-[#12100c]"
            aria-label={`${col.title} column`}
          >
            <header className="flex items-center justify-between border-b border-[#2a241d] px-4 py-2.5">
              <h3 className={cn("font-mono text-[0.68rem] font-bold uppercase tracking-[0.24em]", col.accent)}>
                {col.title}
              </h3>
              <span className="rounded-full bg-[#1f1a15] px-2 py-0.5 font-mono text-[0.64rem] font-bold tabular-nums text-[#a6947f]">
                {list.length}
              </span>
            </header>

            <div className="flex-1 space-y-2.5 overflow-y-auto p-2.5 [scrollbar-width:thin]">
              {list.length === 0 && (
                <p className="px-2 py-8 text-center font-mono text-[0.66rem] uppercase tracking-widest text-[#4a3f30]">
                  — clear —
                </p>
              )}
              {list.map((o) => (
                <div key={o.id} className="space-y-1">
                  <TicketCard
                    order={o}
                    now={now}
                    compact
                    onAdvance={onAdvance}
                    onToggleItem={onToggleItem}
                    onOpen={onOpen}
                  />
                  <div className="flex justify-end gap-1.5 pr-0.5">
                    <button
                      type="button"
                      onClick={() => onRegress(o.id)}
                      aria-label={`Send order ${o.number} back a stage`}
                      className="grid h-6 w-6 place-items-center rounded border border-[#2a241d] text-[#5c5142] transition-colors hover:border-[#4a3f30] hover:text-[#a6947f]"
                    >
                      <RotateCcw className="h-3 w-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onAdvance(o.id)}
                      aria-label={`Advance order ${o.number}`}
                      className="flex h-6 items-center gap-1 rounded border border-[#2a241d] px-2 font-mono text-[0.56rem] font-bold uppercase tracking-widest text-[#a6947f] transition-colors hover:border-[#c89b6a] hover:text-[#e9d3a8]"
                    >
                      {o.status === "ready" ? <CheckCheck className="h-3 w-3" /> : <ArrowRight className="h-3 w-3" />}
                      {o.status === "ready" ? "Bump" : "Advance"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
