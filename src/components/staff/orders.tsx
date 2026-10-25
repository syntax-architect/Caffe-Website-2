"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowDownLeft, ArrowUpRight, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useKDSStore,
  ageTier,
  fmtClockS,
  type KDSOrder,
  type OrderStatus,
} from "@/lib/kds-store";
import { kdsSound } from "@/lib/kds-sound";

type StatusFilter = "all" | OrderStatus;

const STATUS_PILL: Record<OrderStatus, string> = {
  new: "border-[#c89b6a]/40 bg-[#c89b6a]/12 text-[#e9d3a8]",
  preparing: "border-[#d9a441]/40 bg-[#d9a441]/12 text-[#ecc571]",
  ready: "border-[#5f9c74]/40 bg-[#5f9c74]/12 text-[#8fc9a1]",
  done: "border-[#4a3f30] bg-[#2a241d] text-[#8d7f6a]",
};

const STATUS_LABEL: Record<OrderStatus, string> = {
  new: "Queued",
  preparing: "Preparing",
  ready: "Ready",
  done: "Bumped",
};

const CHANNEL_BADGE: Record<string, string> = {
  WEB: "border-[#c89b6a]/40 text-[#e9d3a8]",
  POS: "border-[#7d6b55]/50 text-[#d8ccb8]",
  APP: "border-[#5f9c74]/40 text-[#8fc9a1]",
  UBER: "border-[#d9a441]/40 text-[#ecc571]",
  PHONE: "border-[#a6947f]/40 text-[#c9bba6]",
  QR: "border-[#8f7bd8]/45 text-[#b9aaf0]",
};

export function Orders() {
  const orders = useKDSStore((s) => s.orders);
  const advance = useKDSStore((s) => s.advance);
  const regress = useKDSStore((s) => s.regress);
  const settings = useKDSStore((s) => s.settings);

  const [now, setNow] = useState(() => Date.now());
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [channel, setChannel] = useState<string>("all");
  const [q, setQ] = useState("");

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const counts = useMemo(() => {
    const c: Record<StatusFilter, number> = {
      all: orders.length,
      new: 0,
      preparing: 0,
      ready: 0,
      done: 0,
    };
    for (const o of orders) c[o.status] += 1;
    return c;
  }, [orders]);

  const channels = useMemo(
    () => ["all", ...new Set(orders.map((o) => o.channel))],
    [orders]
  );

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return orders
      .filter((o) => (filter === "all" ? true : o.status === filter))
      .filter((o) => (channel === "all" ? true : o.channel === channel))
      .filter((o) =>
        needle
          ? String(o.number).includes(needle) ||
            o.customer.toLowerCase().includes(needle) ||
            o.items.some((i) => i.name.toLowerCase().includes(needle))
          : true
      )
      .sort((a, b) => b.createdAt - a.createdAt);
  }, [orders, filter, channel, q]);

  const act = (o: KDSOrder, dir: 1 | -1) => {
    if (dir === 1) advance(o.id);
    else regress(o.id);
    if (settings.sound) kdsSound.bump();
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Order log</p>
          <h2 className="font-display mt-2 text-3xl font-medium text-[#f4eddf] sm:text-4xl">
            Every ticket, one timeline.
          </h2>
        </div>
        <label className="relative w-full sm:w-72">
          <span className="sr-only">Search orders</span>
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#a6947f]/60" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Ticket #, guest or item…"
            className="h-11 w-full rounded-full border border-[#c89b6a]/25 bg-[#14100d]/80 pl-10 pr-4 text-sm text-[#f4eddf] placeholder:text-[#a6947f]/50 outline-none focus:border-[#c89b6a]/70"
          />
        </label>
      </div>

      {/* filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Status filter">
          {(
            [
              ["all", "All"],
              ["new", "Queued"],
              ["preparing", "Preparing"],
              ["ready", "Ready"],
              ["done", "Bumped"],
            ] as [StatusFilter, string][]
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={filter === id}
              onClick={() => setFilter(id)}
              className={cn(
                "rounded-full border px-4 py-2 text-[0.6rem] font-bold uppercase tracking-[0.18em] transition-colors",
                filter === id
                  ? "border-[#c89b6a] bg-[#c89b6a] text-[#14100d]"
                  : "border-[#c89b6a]/20 text-[#a6947f] hover:border-[#c89b6a]/50 hover:text-[#e9d3a8]"
              )}
            >
              {label}
              <span className="ml-1.5 font-mono opacity-70">{counts[id]}</span>
            </button>
          ))}
        </div>

        <div className="ml-auto flex gap-1.5" role="tablist" aria-label="Channel filter">
          {channels.map((c) => (
            <button
              key={c}
              type="button"
              role="tab"
              aria-selected={channel === c}
              onClick={() => setChannel(c)}
              className={cn(
                "rounded-full border px-3.5 py-2 font-mono text-[0.58rem] font-bold uppercase tracking-widest transition-colors",
                channel === c
                  ? "border-[#e9d3a8] bg-[#e9d3a8]/10 text-[#f4eddf]"
                  : "border-[#c89b6a]/15 text-[#5c5142] hover:text-[#a6947f]"
              )}
            >
              {c === "all" ? "Any ch." : c}
            </button>
          ))}
        </div>
      </div>

      {/* table */}
      <div className="overflow-hidden rounded-2xl border border-[#c89b6a]/15 bg-[#14100d]/70">
        <div className="max-h-[62vh] overflow-y-auto [scrollbar-width:thin]" role="region" aria-label="Orders list">
          <table className="w-full min-w-[720px] border-collapse text-left text-sm">
            <thead className="sticky top-0 z-10 bg-[#0d0b08]">
              <tr className="border-b border-[#c89b6a]/15 text-[0.58rem] uppercase tracking-[0.2em] text-[#5c5142]">
                <th scope="col" className="px-4 py-3 font-bold">Ticket</th>
                <th scope="col" className="px-4 py-3 font-bold">Guest</th>
                <th scope="col" className="px-4 py-3 font-bold">Items</th>
                <th scope="col" className="px-4 py-3 font-bold">Placed</th>
                <th scope="col" className="px-4 py-3 font-bold">Age</th>
                <th scope="col" className="px-4 py-3 font-bold">Status</th>
                <th scope="col" className="px-4 py-3 text-right font-bold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-14 text-center">
                    <p className="font-mono text-xs uppercase tracking-[0.3em] text-[#4a3f30]">
                      No tickets match this view
                    </p>
                  </td>
                </tr>
              )}
              {rows.map((o) => {
                const tier = ageTier(o, now);
                const isLate = tier === "late" && o.status !== "done";
                return (
                  <tr
                    key={o.id}
                    className="border-b border-[#c89b6a]/8 transition-colors last:border-0 hover:bg-[#1c1611]/60"
                  >
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-[#ece4d4]">#{o.number}</span>
                        <span
                          className={cn(
                            "rounded border px-1.5 py-px font-mono text-[0.55rem] font-bold tracking-wider",
                            CHANNEL_BADGE[o.channel]
                          )}
                        >
                          {o.channel}
                        </span>
                        {o.table ? (
                          <span className="rounded border border-[#8f7bd8]/45 px-1.5 py-px font-mono text-[0.55rem] font-bold text-[#b9aaf0]">
                            T{String(o.table).padStart(2, "0")}
                          </span>
                        ) : null}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="block max-w-[9rem] truncate text-[#d8ccb8]">{o.customer}</span>
                      <span className="block text-[0.62rem] capitalize text-[#5c5142]">{o.type}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="block max-w-[15rem] truncate text-[0.78rem] text-[#a6947f]">
                        {o.items.map((i) => `${i.qty}× ${i.name}`).join(", ")}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 font-mono text-[0.72rem] tabular-nums text-[#a6947f]">
                      {new Date(o.createdAt).toLocaleTimeString("en-GB", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={cn(
                          "font-mono text-[0.72rem] font-bold tabular-nums",
                          isLate
                            ? "text-[#ff9d8a]"
                            : tier === "warn"
                              ? "text-[#ecc571]"
                              : "text-[#8fc9a1]"
                        )}
                      >
                        {fmtClockS(now - o.createdAt)}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={cn(
                          "rounded-full border px-2.5 py-1 text-[0.58rem] font-bold uppercase tracking-widest",
                          STATUS_PILL[o.status]
                        )}
                      >
                        {STATUS_LABEL[o.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => act(o, -1)}
                          disabled={o.status === "new"}
                          title="Send back a step"
                          aria-label={`Send ticket ${o.number} back a step`}
                          className="grid h-8 w-8 place-items-center rounded-lg border border-[#c89b6a]/20 text-[#a6947f] transition-colors hover:border-[#c89b6a]/60 hover:text-[#e9d3a8] disabled:opacity-25"
                        >
                          <ArrowDownLeft className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => act(o, 1)}
                          disabled={o.status === "done"}
                          title="Advance one step"
                          aria-label={`Advance ticket ${o.number}`}
                          className="grid h-8 w-8 place-items-center rounded-lg bg-[#c89b6a] text-[#14100d] transition-transform hover:scale-105 disabled:opacity-25"
                        >
                          <ArrowUpRight className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
