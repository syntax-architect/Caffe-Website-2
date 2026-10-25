"use client";

import { Check, Flame, ShoppingBag, UtensilsCrossed, Bike, AlertTriangle, StickyNote } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  ageTier,
  fmtClockS,
  type KDSOrder,
  type OrderStatus,
} from "@/lib/kds-store";

const TIER = {
  fresh: {
    bar: "border-l-[#5f9c74]",
    time: "text-[#8fc9a1] bg-[#5f9c74]/12 border-[#5f9c74]/35",
    status: "bg-[#5f9c74]/15 text-[#8fc9a1] border-[#5f9c74]/40",
    btn: "bg-[#5f9c74] text-[#0c120e] hover:bg-[#6fb184]",
  },
  warn: {
    bar: "border-l-[#d9a441]",
    time: "text-[#ecc571] bg-[#d9a441]/12 border-[#d9a441]/35",
    status: "bg-[#d9a441]/15 text-[#ecc571] border-[#d9a441]/40",
    btn: "bg-[#d9a441] text-[#171204] hover:bg-[#e5b558]",
  },
  late: {
    bar: "border-l-[#c2543e]",
    time: "text-[#ff9d8a] bg-[#c2543e]/15 border-[#c2543e]/40",
    status: "bg-[#c2543e]/18 text-[#ff9d8a] border-[#c2543e]/45",
    btn: "bg-[#c2543e] text-[#fff2ee] hover:bg-[#d4664f]",
  },
} as const;

const STATUS_LABEL: Record<OrderStatus, string> = {
  new: "QUEUED",
  preparing: "PREPARING",
  ready: "READY",
  done: "BUMPED",
};

const NEXT_LABEL: Record<OrderStatus, string> = {
  new: "Start prep",
  preparing: "Mark ready",
  ready: "Bump",
  done: "—",
};

const CHANNEL_STYLE: Record<string, string> = {
  WEB: "bg-[#c89b6a]/15 text-[#e9d3a8] border-[#c89b6a]/40",
  POS: "bg-[#7d6b55]/20 text-[#d8ccb8] border-[#7d6b55]/50",
  APP: "bg-[#5f9c74]/15 text-[#8fc9a1] border-[#5f9c74]/40",
  UBER: "bg-[#d9a441]/15 text-[#ecc571] border-[#d9a441]/40",
  PHONE: "bg-[#a6947f]/15 text-[#c9bba6] border-[#a6947f]/40",
};

function TypeIcon({ type }: { type: KDSOrder["type"] }) {
  const cls = "h-3.5 w-3.5";
  if (type === "dine-in") return <UtensilsCrossed className={cls} />;
  if (type === "delivery") return <Bike className={cls} />;
  return <ShoppingBag className={cls} />;
}

interface TicketCardProps {
  order: KDSOrder;
  now: number;
  onAdvance: (id: string) => void;
  onToggleItem: (orderId: string, itemId: string) => void;
  onOpen?: (order: KDSOrder) => void;
  compact?: boolean;
}

export function TicketCard({
  order,
  now,
  onAdvance,
  onToggleItem,
  onOpen,
  compact = false,
}: TicketCardProps) {
  const tier = ageTier(order, now);
  const t = TIER[tier];
  const ageMs = now - order.createdAt;
  const doneCount = order.items.filter((i) => i.done).length;
  const isLate = tier === "late" && order.status !== "done";

  return (
    <article
      className={cn(
        "group relative flex select-none flex-col overflow-hidden rounded-lg border border-[#2a241d] bg-[#161310] text-left shadow-[0_10px_30px_-12px_rgba(0,0,0,0.7)] transition-transform duration-200 will-transform",
        "hover:-translate-y-0.5 hover:border-[#4a3f30]",
        t.bar,
        isLate && "kds-late-pulse",
        compact ? "text-[0.78rem]" : "text-sm"
      )}
    >
      {/* ——— header ——— */}
      <header
        className="flex cursor-pointer items-center gap-2 border-b border-[#2a241d] px-3 py-2"
        onClick={() => onOpen?.(order)}
      >
        <span className={cn("font-mono text-base font-bold tabular-nums", compact && "text-sm")}>
          #{order.number}
        </span>
        <span className={cn("rounded border px-1.5 py-px font-mono text-[0.58rem] font-bold tracking-wider", CHANNEL_STYLE[order.channel])}>
          {order.channel}
        </span>
        <span className="flex items-center gap-1 font-mono text-[0.62rem] uppercase tracking-wider text-[#8d7f6a]">
          <TypeIcon type={order.type} />
          {order.type === "dine-in" ? "dine" : order.type.slice(0, 4)}
        </span>
        {order.rush && (
          <span className="flex items-center gap-0.5 rounded border border-[#c2543e]/45 bg-[#c2543e]/15 px-1.5 py-px font-mono text-[0.58rem] font-bold text-[#ff9d8a]" title="Rush order">
            <Flame className="h-3 w-3" /> RUSH
          </span>
        )}
        <span
          className={cn(
            "ml-auto rounded border px-1.5 py-0.5 font-mono text-[0.7rem] font-bold tabular-nums",
            t.time,
            isLate && "animate-pulse"
          )}
        >
          {fmtClockS(ageMs)}
        </span>
      </header>

      {/* ——— allergy / note banners ——— */}
      {order.allergy && (
        <div className="flex items-center gap-1.5 border-b border-[#c2543e]/30 bg-[#c2543e]/12 px-3 py-1 font-mono text-[0.6rem] font-bold uppercase tracking-wider text-[#ff9d8a]">
          <AlertTriangle className="h-3 w-3 shrink-0" />
          Allergy: {order.allergy}
        </div>
      )}
      {order.note && (
        <div className="flex items-center gap-1.5 border-b border-[#d9a441]/25 bg-[#d9a441]/8 px-3 py-1 text-[0.62rem] italic text-[#ecc571]">
          <StickyNote className="h-3 w-3 shrink-0" />
          {order.note}
        </div>
      )}

      {/* ——— items ——— */}
      <ul className="flex-1 space-y-0.5 px-1.5 py-1.5">
        {order.items.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              onClick={() => onToggleItem(order.id, item.id)}
              className={cn(
                "flex w-full items-start gap-1.5 rounded px-1.5 py-1 text-left transition-colors hover:bg-[#1f1a15]",
                item.done && "opacity-45"
              )}
              aria-pressed={item.done}
              aria-label={`Toggle ${item.name} done`}
            >
              <span
                className={cn(
                  "mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-sm border transition-colors",
                  item.done
                    ? "border-[#5f9c74] bg-[#5f9c74] text-[#0c120e]"
                    : "border-[#4a3f30] text-transparent"
                )}
              >
                <Check className="h-2.5 w-2.5" strokeWidth={3.5} />
              </span>
              <span className="min-w-0 flex-1">
                <span className={cn("flex items-baseline gap-1.5 font-semibold text-[#ece4d4]", item.done && "line-through")}>
                  <span className="font-mono text-[#c89b6a]">{item.qty}×</span>
                  <span className="truncate">{item.name}</span>
                  {item.station === "KITCHEN" && (
                    <span className="ml-auto shrink-0 rounded-sm bg-[#2a241d] px-1 font-mono text-[0.55rem] tracking-wider text-[#8d7f6a]">
                      KIT
                    </span>
                  )}
                </span>
                {item.mods.length > 0 && (
                  <span className="mt-0.5 block font-mono text-[0.62rem] italic leading-snug text-[#c89b6a]/85">
                    ↳ {item.mods.join(" · ")}
                  </span>
                )}
              </span>
            </button>
          </li>
        ))}
      </ul>

      {/* ——— footer ——— */}
      <footer className="flex items-center gap-2 border-t border-[#2a241d] px-2.5 py-2">
        <span className={cn("rounded border px-1.5 py-0.5 font-mono text-[0.56rem] font-bold tracking-widest", t.status)}>
          {STATUS_LABEL[order.status]}
        </span>
        <span className="font-mono text-[0.58rem] tabular-nums text-[#5c5142]">
          {doneCount}/{order.items.length} items
        </span>
        {order.customer && !compact && (
          <span className="ml-auto max-w-[7rem] truncate font-mono text-[0.58rem] text-[#5c5142]">
            {order.customer}
          </span>
        )}
        <button
          type="button"
          onClick={() => onAdvance(order.id)}
          className={cn(
            "ml-auto rounded px-3 py-1.5 font-mono text-[0.62rem] font-bold uppercase tracking-widest transition-colors active:scale-95",
            order.status === "done" && "pointer-events-none opacity-30",
            t.btn,
            compact && "ml-auto"
          )}
        >
          {NEXT_LABEL[order.status]}
        </button>
      </footer>
    </article>
  );
}
