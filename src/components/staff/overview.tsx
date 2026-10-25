"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  Banknote,
  QrCode,
  Radio,
  ShoppingBag,
  Timer,
  TrendingUp,
  UtensilsCrossed,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useKDSStore,
  activeOrders,
  ageTier,
  avgPrepSeconds,
  fmtClockS,
  type KDSOrder,
} from "@/lib/kds-store";
import { useAuthStore } from "@/lib/auth-store";
import { MENU } from "@/lib/cafe-data";
import { TicketCard } from "@/components/kds/ticket-card";

/* deterministic pseudo-random so the chart is stable between renders */
function seeded(n: number): number {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

const OPEN_HOUR = 7;
const CLOSE_HOUR = 19;

interface TabNav {
  (tab: "overview" | "kds" | "qr" | "orders" | "menu" | "settings"): void;
}

export function Overview({ go }: { go: TabNav }) {
  const orders = useKDSStore((s) => s.orders);
  const settings = useKDSStore((s) => s.settings);
  const updateSettings = useKDSStore((s) => s.updateSettings);
  const advance = useKDSStore((s) => s.advance);
  const toggleItem = useKDSStore((s) => s.toggleItem);
  const user = useAuthStore((s) => s.user);

  /* 1s clock so live ticket timers keep moving */
  const [clockNow, setClockNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setClockNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const stats = useMemo(() => {
    const act = activeOrders(orders);
    const midnight = new Date().setHours(0, 0, 0, 0);
    const doneToday = orders.filter(
      (o) => o.status === "done" && (o.doneAt ?? 0) >= midnight
    );
    const avg = avgPrepSeconds(orders);
    const revenue =
      doneToday.length * 14.2 + 128; // ticket average + morning base (demo math)
    return {
      active: act.length,
      late: act.filter((o) => ageTier(o, clockNow) === "late").length,
      doneToday: doneToday.length,
      avg,
      revenue,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orders]);

  const hourly = useMemo(() => {
    const cols: { h: number; v: number; live: boolean }[] = [];
    for (let h = OPEN_HOUR; h < CLOSE_HOUR; h++) {
      const base = 6 + Math.round(seeded(h) * 14);
      // lunch + morning peaks
      const peak =
        h === 8 || h === 9 ? 1.5 : h >= 12 && h <= 14 ? 1.7 : h === 18 ? 1.2 : 1;
      cols.push({ h, v: Math.round(base * peak), live: false });
    }
    const currentH = new Date().getHours();
    if (currentH >= OPEN_HOUR && currentH < CLOSE_HOUR) {
      const i = currentH - OPEN_HOUR;
      cols[i] = { ...cols[i], v: cols[i].v + 3, live: true };
    }
    return cols;
  }, []);

  const maxV = Math.max(...hourly.map((c) => c.v));

  const topItems = useMemo(() => {
    const count = new Map<string, number>();
    for (const o of orders) {
      for (const it of o.items) count.set(it.name, (count.get(it.name) ?? 0) + it.qty);
    }
    const fallback = MENU.slice(0, 5).map((m) => ({ name: m.name, n: 0 }));
    const rows = [...count.entries()]
      .map(([name, n]) => ({ name, n }))
      .sort((a, b) => b.n - a.n)
      .slice(0, 5);
    return rows.length >= 3 ? rows : fallback;
  }, [orders]);

  const liveStrip = useMemo(() => {
    return activeOrders(orders).slice(0, 3);
  }, [orders]);

  const maxTop = Math.max(1, ...topItems.map((t) => t.n));

  return (
    <div className="space-y-6">
      {/* greeting */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Shift overview</p>
          <h2 className="font-display mt-2 text-3xl font-medium text-[#f4eddf] sm:text-4xl">
            Good shift, {user?.name.split(" ")[0] ?? "chief"}.
          </h2>
          <p className="mt-2 text-sm text-[#a6947f]">
            Here&apos;s the house at a glance — live from the floor.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => go("kds")}
            className="inline-flex items-center gap-2 rounded-full bg-[#c89b6a] px-5 py-3 text-[0.62rem] font-bold uppercase tracking-[0.22em] text-[#14100d] transition-transform hover:scale-[1.02]"
          >
            Open kitchen display
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => go("qr")}
            className="inline-flex items-center gap-2 rounded-full border border-[#c89b6a]/35 px-5 py-3 text-[0.62rem] font-bold uppercase tracking-[0.22em] text-[#e9d3a8] transition-colors hover:border-[#c89b6a]"
          >
            <QrCode className="h-3.5 w-3.5" />
            QR table codes
          </button>
          <button
            type="button"
            onClick={() => updateSettings({ autoFeed: !settings.autoFeed })}
            className={cn(
              "inline-flex items-center gap-2 rounded-full border px-5 py-3 text-[0.62rem] font-bold uppercase tracking-[0.22em] transition-colors",
              settings.autoFeed
                ? "border-[#5f9c74]/50 bg-[#5f9c74]/10 text-[#8fc9a1]"
                : "border-[#c89b6a]/35 text-[#a6947f] hover:border-[#c89b6a]"
            )}
          >
            <Radio className="h-3.5 w-3.5" />
            {settings.autoFeed ? "Feed live" : "Feed paused"}
          </button>
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi
          icon={ShoppingBag}
          label="Orders today"
          value={String(stats.doneToday + stats.active)}
          delta="+18%"
        />
        <Kpi
          icon={Banknote}
          label="Revenue today"
          value={`$${stats.revenue.toFixed(0)}`}
          delta="+12%"
        />
        <Kpi
          icon={Timer}
          label="Active tickets"
          value={String(stats.active)}
          tone={stats.late > 0 ? "warn" : "ok"}
          sub={stats.late > 0 ? `${stats.late} running late` : "all on time"}
        />
        <Kpi
          icon={BadgeCheck}
          label="Avg prep"
          value={stats.avg === null ? "—" : fmtClockS(stats.avg * 1000)}
          delta="-0:14"
          sub="vs yesterday"
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.6fr_1fr]">
        {/* hourly chart */}
        <section className="rounded-2xl border border-[#c89b6a]/15 bg-[#14100d]/70 p-5 sm:p-6" aria-label="Orders by hour">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display text-lg text-[#f4eddf]">Orders by hour</h3>
              <p className="mt-0.5 text-[0.62rem] uppercase tracking-[0.22em] text-[#a6947f]">
                Service day · {String(OPEN_HOUR).padStart(2, "0")}:00 — {CLOSE_HOUR}:00
              </p>
            </div>
            <span className="flex items-center gap-1.5 rounded-full border border-[#5f9c74]/40 bg-[#5f9c74]/10 px-3 py-1 text-[0.58rem] font-bold uppercase tracking-widest text-[#8fc9a1]">
              <TrendingUp className="h-3 w-3" /> +12% WoW
            </span>
          </div>
          <div className="mt-6 flex h-44 items-end gap-[3px] sm:gap-1.5" role="img" aria-label="Bar chart of order volume per hour">
            {hourly.map((c) => (
              <div key={c.h} className="group relative flex flex-1 flex-col items-center gap-2">
                <span className="absolute -top-6 hidden rounded-md border border-[#c89b6a]/30 bg-[#0d0a08] px-1.5 py-0.5 font-mono text-[0.6rem] text-[#e9d3a8] group-hover:block">
                  {c.v}
                </span>
                <div
                  className={cn(
                    "w-full rounded-t-md transition-all duration-500",
                    c.live
                      ? "bg-gradient-to-t from-[#9a7248] to-[#e9d3a8] shadow-[0_0_18px_rgba(200,155,106,0.35)]"
                      : "bg-[#c89b6a]/25 group-hover:bg-[#c89b6a]/45"
                  )}
                  style={{ height: `${Math.max(8, (c.v / maxV) * 100)}%` }}
                />
                <span className="font-mono text-[0.55rem] text-[#5c5142]">
                  {String(c.h).padStart(2, "0")}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* top sellers */}
        <section className="rounded-2xl border border-[#c89b6a]/15 bg-[#14100d]/70 p-5 sm:p-6" aria-label="Top sellers">
          <h3 className="font-display text-lg text-[#f4eddf]">Top sellers</h3>
          <p className="mt-0.5 text-[0.62rem] uppercase tracking-[0.22em] text-[#a6947f]">
            Live from the board
          </p>
          <ul className="mt-5 space-y-3.5">
            {topItems.map((t, i) => (
              <li key={t.name} className="flex items-center gap-3.5">
                <span className="w-5 shrink-0 font-mono text-[0.62rem] text-[#5c5142]">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="min-w-0 flex-1 truncate text-sm text-[#ece4d4]">
                  {t.name}
                </span>
                <span className="h-1.5 w-16 overflow-hidden rounded-full bg-[#2a241d] sm:w-24">
                  <span
                    className="block h-full rounded-full bg-gradient-to-r from-[#9a7248] to-[#e9d3a8] transition-all duration-700"
                    style={{ width: `${t.n === 0 ? 6 : (t.n / maxTop) * 100}%` }}
                  />
                </span>
                <span className="w-6 shrink-0 text-right font-mono text-xs tabular-nums text-[#e9d3a8]">
                  {t.n}
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* live tickets */}
      <section className="rounded-2xl border border-[#c89b6a]/15 bg-[#14100d]/70 p-5 sm:p-6" aria-label="Live tickets">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display text-lg text-[#f4eddf]">On the board now</h3>
            <p className="mt-0.5 flex items-center gap-1.5 text-[0.62rem] uppercase tracking-[0.22em] text-[#a6947f]">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#5f9c74]" />
              Live · {stats.active} active ticket{stats.active === 1 ? "" : "s"}
            </p>
          </div>
          <button
            type="button"
            onClick={() => go("orders")}
            className="inline-flex items-center gap-1.5 text-[0.62rem] font-bold uppercase tracking-[0.22em] text-[#c89b6a] transition-colors hover:text-[#e9d3a8]"
          >
            All orders <ArrowRight className="h-3 w-3" />
          </button>
        </div>

        {liveStrip.length === 0 ? (
          <div className="mt-6 grid place-items-center rounded-xl border border-dashed border-[#c89b6a]/25 py-12 text-center">
            <UtensilsCrossed className="h-6 w-6 text-[#5c5142]" />
            <p className="mt-3 font-mono text-xs uppercase tracking-[0.3em] text-[#5c5142]">
              Board is clear — all caught up
            </p>
          </div>
        ) : (
          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {liveStrip.map((o: KDSOrder) => (
              <TicketCard
                key={o.id}
                order={o}
                now={clockNow}
                onAdvance={advance}
                onToggleItem={toggleItem}
                compact
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function Kpi({
  icon: Icon,
  label,
  value,
  delta,
  sub,
  tone = "ok",
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  delta?: string;
  sub?: string;
  tone?: "ok" | "warn";
}) {
  return (
    <div className="rounded-2xl border border-[#c89b6a]/15 bg-[#14100d]/70 p-5">
      <div className="flex items-center justify-between">
        <span className="grid h-9 w-9 place-items-center rounded-xl border border-[#c89b6a]/25 bg-[#0d0a08] text-[#c89b6a]">
          <Icon className="h-4 w-4" />
        </span>
        {delta && (
          <span className="rounded-full bg-[#5f9c74]/12 px-2 py-0.5 font-mono text-[0.58rem] font-bold text-[#8fc9a1]">
            {delta}
          </span>
        )}
      </div>
      <p className="mt-4 font-display text-3xl font-medium tabular-nums text-[#f4eddf]">
        {value}
      </p>
      <p className="mt-1 text-[0.6rem] font-bold uppercase tracking-[0.22em] text-[#a6947f]">
        {label}
      </p>
      {sub && (
        <p
          className={cn(
            "mt-1.5 font-mono text-[0.6rem]",
            tone === "warn" ? "text-[#ff9d8a]" : "text-[#5c5142]"
          )}
        >
          {sub}
        </p>
      )}
    </div>
  );
}
