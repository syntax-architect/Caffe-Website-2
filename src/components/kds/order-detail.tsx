"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Flame, ShoppingBag, UtensilsCrossed, Bike, AlertTriangle, StickyNote } from "lucide-react";
import { cn } from "@/lib/utils";
import { fmtClockS, type KDSOrder } from "@/lib/kds-store";

const EASE = [0.22, 1, 0.36, 1] as const;

function fmtTime(ts?: number): string {
  if (!ts) return "—";
  return new Date(ts).toLocaleTimeString("en-GB", { hour12: false });
}

function TypeIcon({ type }: { type: KDSOrder["type"] }) {
  const cls = "h-4 w-4";
  if (type === "dine-in") return <UtensilsCrossed className={cls} />;
  if (type === "delivery") return <Bike className={cls} />;
  return <ShoppingBag className={cls} />;
}

interface OrderDetailProps {
  order: KDSOrder | null;
  now: number;
  onAdvance: (id: string) => void;
  onToggleItem: (orderId: string, itemId: string) => void;
  onClose: () => void;
}

export function OrderDetail({ order, now, onAdvance, onToggleItem, onClose }: OrderDetailProps) {
  useEffect(() => {
    if (!order) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [order, onClose]);

  const nextLabel =
    order?.status === "new" ? "Start prep" : order?.status === "preparing" ? "Mark ready" : order?.status === "ready" ? "Bump" : "Bumped";

  const timeline = order
    ? [
        { label: "Received", at: order.createdAt },
        { label: "Started", at: order.startedAt },
        { label: "Ready", at: order.readyAt },
        { label: "Bumped", at: order.doneAt },
      ]
    : [];

  return (
    <AnimatePresence>
      {order && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[150] bg-black/70 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden
          />
          <motion.div
            initial={{ opacity: 0, y: 26, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.98 }}
            transition={{ duration: 0.35, ease: EASE }}
            role="dialog"
            aria-modal="true"
            aria-label={`Order ${order.number} details`}
            className="fixed left-1/2 top-1/2 z-[160] w-[min(94vw,34rem)] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border border-[#3a3126] bg-[#131009] shadow-[0_40px_120px_-20px_rgba(0,0,0,0.9)]"
          >
            {/* header */}
            <div className="flex items-center justify-between border-b border-[#2a241d] bg-[#161310] px-5 py-4">
              <div className="flex items-center gap-3">
                <span className="font-mono text-2xl font-bold text-[#e9d3a8]">
                  #{order.number}
                </span>
                <span className="rounded border border-[#c89b6a]/40 bg-[#c89b6a]/15 px-2 py-0.5 font-mono text-[0.62rem] font-bold tracking-wider text-[#e9d3a8]">
                  {order.channel}
                </span>
                <span className="flex items-center gap-1.5 font-mono text-[0.68rem] uppercase tracking-wider text-[#8d7f6a]">
                  <TypeIcon type={order.type} /> {order.type}
                </span>
                {order.rush && (
                  <span className="flex items-center gap-1 rounded border border-[#c2543e]/45 bg-[#c2543e]/15 px-2 py-0.5 font-mono text-[0.6rem] font-bold text-[#ff9d8a]">
                    <Flame className="h-3 w-3" /> RUSH
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close details"
                className="grid h-9 w-9 place-items-center rounded-full border border-[#3a3126] text-[#a6947f] transition-colors hover:border-[#c89b6a] hover:text-[#e9d3a8]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="max-h-[52vh] overflow-y-auto px-5 py-4">
              {/* meta */}
              <div className="grid grid-cols-2 gap-3 font-mono text-[0.68rem] text-[#a6947f]">
                <p>Guest · <span className="text-[#ece4d4]">{order.customer}</span></p>
                <p className="text-right">Age · <span className="text-[#ece4d4]">{fmtClockS(now - order.createdAt)}</span></p>
                <p>Station · <span className="text-[#ece4d4]">{order.station}</span></p>
                <p className="text-right">Source · <span className="text-[#ece4d4]">{order.source === "web" ? "Website order" : "Simulated feed"}</span></p>
              </div>

              {order.allergy && (
                <div className="mt-4 flex items-center gap-2 rounded-lg border border-[#c2543e]/40 bg-[#c2543e]/12 px-3 py-2 font-mono text-[0.68rem] font-bold uppercase tracking-wider text-[#ff9d8a]">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  Allergy: {order.allergy}
                </div>
              )}
              {order.note && (
                <div className="mt-3 flex items-center gap-2 rounded-lg border border-[#d9a441]/30 bg-[#d9a441]/8 px-3 py-2 text-[0.72rem] italic text-[#ecc571]">
                  <StickyNote className="h-4 w-4 shrink-0" />
                  {order.note}
                </div>
              )}

              {/* items */}
              <ul className="mt-4 space-y-1">
                {order.items.map((item) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => onToggleItem(order.id, item.id)}
                      className={cn(
                        "flex w-full items-start gap-2 rounded-lg border border-[#2a241d] bg-[#161310] px-3 py-2 text-left transition-colors hover:border-[#4a3f30]",
                        item.done && "opacity-45"
                      )}
                    >
                      <span className="font-mono text-sm font-bold text-[#c89b6a]">{item.qty}×</span>
                      <span className="flex-1">
                        <span className={cn("block text-sm font-semibold text-[#ece4d4]", item.done && "line-through")}>
                          {item.name}
                          <span className="ml-2 rounded-sm bg-[#2a241d] px-1 font-mono text-[0.55rem] tracking-wider text-[#8d7f6a]">
                            {item.station}
                          </span>
                        </span>
                        {item.mods.length > 0 && (
                          <span className="mt-0.5 block font-mono text-[0.64rem] italic text-[#c89b6a]/85">
                            ↳ {item.mods.join(" · ")}
                          </span>
                        )}
                      </span>
                      <span className={cn("mt-0.5 font-mono text-[0.6rem] font-bold tracking-widest", item.done ? "text-[#8fc9a1]" : "text-[#5c5142]")}>
                        {item.done ? "DONE" : "WAIT"}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>

              {/* timeline */}
              <div className="mt-5 rounded-xl border border-[#2a241d] bg-[#161310] px-4 py-3">
                <p className="font-mono text-[0.6rem] font-bold uppercase tracking-[0.24em] text-[#8d7f6a]">
                  Ticket timeline
                </p>
                <ol className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-4">
                  {timeline.map((t) => (
                    <li key={t.label}>
                      <p className="font-mono text-[0.62rem] uppercase tracking-wider text-[#8d7f6a]">
                        {t.label}
                      </p>
                      <p className={cn("font-mono text-sm tabular-nums", t.at ? "text-[#e9d3a8]" : "text-[#4a3f30]")}>
                        {fmtTime(t.at)}
                      </p>
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            {/* actions */}
            <div className="flex items-center gap-3 border-t border-[#2a241d] bg-[#161310] px-5 py-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-full border border-[#3a3126] px-4 py-3 font-mono text-[0.66rem] font-bold uppercase tracking-widest text-[#a6947f] transition-colors hover:border-[#c89b6a] hover:text-[#e9d3a8]"
              >
                Back to board
              </button>
              <button
                type="button"
                onClick={() => {
                  onAdvance(order.id);
                  if (order.status !== "ready") onClose();
                }}
                disabled={order.status === "done"}
                className="flex-1 rounded-full bg-[#c89b6a] px-4 py-3 font-mono text-[0.66rem] font-bold uppercase tracking-widest text-[#14100d] transition-all hover:bg-[#e9d3a8] disabled:opacity-30"
              >
                {nextLabel}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
