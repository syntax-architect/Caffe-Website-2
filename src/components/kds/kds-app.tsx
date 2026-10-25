"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Activity,
  AlarmClockOff,
  BadgeCheck,
  Columns3,
  LayoutGrid,
  Maximize2,
  Minimize2,
  Radio,
  RotateCcw,
  Timer,
  Volume2,
  VolumeX,
  X,
  CheckCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useKDSStore,
  activeOrders,
  sortForGrid,
  ageTier,
  avgPrepSeconds,
  fmtClockS,
  type KDSOrder,
} from "@/lib/kds-store";
import { kdsSound } from "@/lib/kds-sound";
import { useUIStore } from "@/lib/ui-store";
import { TicketCard } from "./ticket-card";
import { FlowBoard } from "./flow-board";
import { OrderDetail } from "./order-detail";

type StationFilter = "ALL" | "BAR" | "KITCHEN";
type KDSViewMode = "grid" | "flow";

/**
 * NOIRÉ KDS — full kitchen display frontend.
 * Live ticket grid + kanban flow, station filters, item check-off,
 * bump/recall, tier alarms, simulated order feed, keyboard-first UX.
 */
export function KDSApp() {
  const orders = useKDSStore((s) => s.orders);
  const settings = useKDSStore((s) => s.settings);
  const advance = useKDSStore((s) => s.advance);
  const regress = useKDSStore((s) => s.regress);
  const toggleItem = useKDSStore((s) => s.toggleItem);
  const recall = useKDSStore((s) => s.recall);
  const bumpAllReady = useKDSStore((s) => s.bumpAllReady);
  const clearCompleted = useKDSStore((s) => s.clearCompleted);
  const updateSettings = useKDSStore((s) => s.updateSettings);
  const injectSimOrder = useKDSStore((s) => s.injectSimOrder);
  const exitKDS = useUIStore((s) => s.exitKDS);

  const [now, setNow] = useState(() => Date.now());
  const [viewMode, setViewMode] = useState<KDSViewMode>("grid");
  const [station, setStation] = useState<StationFilter>("ALL");
  const [detail, setDetail] = useState<KDSOrder | null>(null);
  const [fullscreen, setFullscreen] = useState(false);
  const [flash, setFlash] = useState(false);

  const alerted = useRef<Map<string, "warn" | "late">>(new Map());
  const seeded = useRef(false);

  /* ——— clock tick ——— */
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  /* ——— seed a believable board on first open ——— */
  useEffect(() => {
    if (seeded.current) return;
    seeded.current = true;
    const s = useKDSStore.getState();
    const existing = activeOrders(s.orders).length;
    if (existing < 4) {
      const ages = [11, 6, 3, 1];
      for (let i = existing; i < 4; i++) {
        s.injectSimOrder(ages[i]);
      }
    }
  }, []);

  /* ——— simulated live feed (async loop, no self-referencing callbacks) ——— */
  useEffect(() => {
    if (!settings.autoFeed) return;
    let alive = true;
    void (async () => {
      while (alive) {
        const s = useKDSStore.getState().settings;
        const delay =
          (s.feedMinSec + Math.random() * (s.feedMaxSec - s.feedMinSec)) * 1000;
        await new Promise((r) => setTimeout(r, delay));
        if (!alive) return;
        const st = useKDSStore.getState();
        if (st.settings.autoFeed && activeOrders(st.orders).length < 12) {
          st.injectSimOrder();
          setFlash(true);
          window.setTimeout(() => setFlash(false), 1200);
          if (st.settings.sound) kdsSound.newOrder();
        }
      }
    })();
    return () => {
      alive = false;
    };
  }, [settings.autoFeed]);

  /* ——— tier alarms (warn → late) ——— */
  useEffect(() => {
    for (const o of orders) {
      if (o.status === "done") {
        alerted.current.delete(o.id);
        continue;
      }
      const tier = ageTier(o, now);
      const prev = alerted.current.get(o.id);
      if (tier === "late" && prev !== "late") {
        alerted.current.set(o.id, "late");
        if (settings.sound) kdsSound.late();
      } else if (tier === "warn" && !prev) {
        alerted.current.set(o.id, "warn");
        if (settings.sound) kdsSound.warn();
      }
    }
  }, [now, orders, settings.sound]);

  /* ——— keyboard shortcuts ——— */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      const k = e.key.toLowerCase();
      if (k === "g") setViewMode("grid");
      else if (k === "f") setViewMode("flow");
      else if (k === "n") updateSettings({ autoFeed: !settings.autoFeed });
      else if (k === "m") updateSettings({ sound: !settings.sound });
      else if (k === "r") { recall(); if (settings.sound) kdsSound.item(); }
      else if (k === "b") { bumpAllReady(); if (settings.sound) kdsSound.bump(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [settings.autoFeed, settings.sound, updateSettings, recall, bumpAllReady]);

  /* ——— derived data ——— */
  const filtered = useMemo(
    () => orders.filter((o) => o.status !== "done" && (station === "ALL" || o.station === station)),
    [orders, station]
  );
  const gridOrders = useMemo(() => sortForGrid(filtered, now), [filtered, now]);

  const stats = useMemo(() => {
    const act = activeOrders(orders);
    const late = act.filter((o) => ageTier(o, now) === "late").length;
    const ready = act.filter((o) => o.status === "ready").length;
    const avg = avgPrepSeconds(orders);
    const midnight = new Date().setHours(0, 0, 0, 0);
    const doneToday = orders.filter((o) => o.status === "done" && (o.doneAt ?? 0) >= midnight).length;
    return { active: act.length, late, ready, avg, doneToday };
  }, [orders, now]);

  const handleAdvance = useCallback(
    (id: string) => {
      advance(id);
      if (settings.sound) kdsSound.bump();
    },
    [advance, settings.sound]
  );
  const handleToggleItem = useCallback(
    (orderId: string, itemId: string) => {
      toggleItem(orderId, itemId);
      if (settings.sound) kdsSound.item();
    },
    [toggleItem, settings.sound]
  );

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        setFullscreen(true);
      } else {
        await document.exitFullscreen();
        setFullscreen(false);
      }
    } catch {
      /* unsupported — ignore */
    }
  };

  const clock = new Date(now).toLocaleTimeString("en-GB", { hour12: false });

  return (
    <div className="kds-root flex h-[100svh] flex-col overflow-hidden bg-[#0d0b08] font-mono text-[#ece4d4]">
      {/* ——— header ——— */}
      <header className="relative z-20 flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-[#2a241d] bg-[#131009] px-3 py-2 sm:px-4">
        {/* brand + live */}
        <div className="flex items-center gap-2.5">
          <span className={cn("grid h-8 w-8 place-items-center rounded-md border text-[0.7rem] font-bold", flash ? "animate-pulse border-[#c89b6a] bg-[#c89b6a]/25 text-[#e9d3a8]" : "border-[#c89b6a]/50 bg-[#c89b6a]/10 text-[#c89b6a]")}>
            KDS
          </span>
          <div className="leading-tight">
            <p className="text-[0.7rem] font-bold uppercase tracking-[0.22em]">NOIRÉ Kitchen</p>
            <p className="flex items-center gap-1.5 text-[0.58rem] uppercase tracking-widest text-[#5c5142]">
              <span className={cn("h-1.5 w-1.5 rounded-full", settings.autoFeed ? "animate-pulse bg-[#5f9c74]" : "bg-[#5c5142]")} />
              {settings.autoFeed ? "Feed live" : "Feed paused"}
            </p>
          </div>
        </div>

        {/* station filter */}
        <div className="flex overflow-hidden rounded-md border border-[#2a241d]" role="tablist" aria-label="Station filter">
          {(["ALL", "BAR", "KITCHEN"] as StationFilter[]).map((s) => (
            <button
              key={s}
              role="tab"
              aria-selected={station === s}
              onClick={() => setStation(s)}
              className={cn(
                "px-2.5 py-1.5 font-mono text-[0.6rem] font-bold uppercase tracking-widest transition-colors",
                station === s ? "bg-[#c89b6a] text-[#14100d]" : "text-[#8d7f6a] hover:bg-[#1f1a15] hover:text-[#ece4d4]"
              )}
            >
              {s}
            </button>
          ))}
        </div>

        {/* view toggle */}
        <div className="flex overflow-hidden rounded-md border border-[#2a241d]" role="tablist" aria-label="Board layout">
          {(
            [
              { id: "grid" as KDSViewMode, icon: LayoutGrid, label: "Grid" },
              { id: "flow" as KDSViewMode, icon: Columns3, label: "Flow" },
            ]
          ).map((v) => (
            <button
              key={v.id}
              role="tab"
              aria-selected={viewMode === v.id}
              onClick={() => setViewMode(v.id)}
              title={`${v.label} view (${v.id === "grid" ? "G" : "F"})`}
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1.5 font-mono text-[0.6rem] font-bold uppercase tracking-widest transition-colors",
                viewMode === v.id ? "bg-[#c89b6a] text-[#14100d]" : "text-[#8d7f6a] hover:bg-[#1f1a15] hover:text-[#ece4d4]"
              )}
            >
              <v.icon className="h-3.5 w-3.5" />
              {v.label}
            </button>
          ))}
        </div>

        {/* clock */}
        <p className="ml-auto hidden font-mono text-lg font-bold tabular-nums tracking-wider text-[#e9d3a8] sm:block" aria-label="Current time">
          {clock}
        </p>

        {/* controls */}
        <div className="flex items-center gap-1.5">
          <HeaderBtn
            active={settings.autoFeed}
            onClick={() => updateSettings({ autoFeed: !settings.autoFeed })}
            title={`Simulated feed (${settings.autoFeed ? "on" : "off"}) — N`}
          >
            <Radio className="h-4 w-4" />
            <span className="hidden text-[0.58rem] font-bold uppercase tracking-widest lg:inline">Feed</span>
          </HeaderBtn>
          <HeaderBtn
            active={settings.sound}
            onClick={() => updateSettings({ sound: !settings.sound })}
            title={`Sound alerts (${settings.sound ? "on" : "off"}) — M`}
          >
            {settings.sound ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            <span className="hidden text-[0.58rem] font-bold uppercase tracking-widest lg:inline">Sound</span>
          </HeaderBtn>
          <HeaderBtn onClick={toggleFullscreen} title="Fullscreen">
            {fullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </HeaderBtn>
          <HeaderBtn onClick={exitKDS} title="Exit to website" danger>
            <X className="h-4 w-4" />
            <span className="hidden text-[0.58rem] font-bold uppercase tracking-widest lg:inline">Exit</span>
          </HeaderBtn>
        </div>
      </header>

      {/* ——— stats strip ——— */}
      <div className="grid grid-cols-3 gap-px border-b border-[#2a241d] bg-[#2a241d] sm:grid-cols-5" role="status" aria-label="Kitchen statistics">
        <StatTile icon={Activity} label="Active" value={stats.active} />
        <StatTile icon={AlarmClockOff} label="Late" value={stats.late} tone={stats.late > 0 ? "late" : "default"} />
        <StatTile icon={Timer} label="Ready" value={stats.ready} tone={stats.ready > 0 ? "ready" : "default"} />
        <StatTile
          icon={BadgeCheck}
          label="Avg prep"
          value={stats.avg === null ? "—" : fmtClockS(stats.avg * 1000)}
        />
        <StatTile icon={CheckCheck} label="Done today" value={stats.doneToday} className="hidden sm:flex" />
      </div>

      {/* ——— board ——— */}
      <main className="relative min-h-0 flex-1">
        {viewMode === "grid" ? (
          <div className="h-full overflow-y-auto p-3 [scrollbar-width:thin]">
            {gridOrders.length === 0 ? (
              <div className="grid h-full place-items-center">
                <div className="text-center">
                  <p className="font-mono text-sm uppercase tracking-[0.3em] text-[#4a3f30]">
                    All clear — no open tickets
                  </p>
                  <p className="mt-2 font-mono text-[0.62rem] uppercase tracking-widest text-[#332b22]">
                    {settings.autoFeed ? "New orders arrive automatically" : "Feed paused — press N to resume"}
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,270px),1fr))] gap-3 xl:grid-cols-[repeat(auto-fill,minmax(min(100%,300px),1fr))]">
                {gridOrders.map((o) => (
                  <TicketCard
                    key={o.id}
                    order={o}
                    now={now}
                    onAdvance={handleAdvance}
                    onToggleItem={handleToggleItem}
                    onOpen={setDetail}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <FlowBoard
            orders={filtered}
            now={now}
            onAdvance={handleAdvance}
            onRegress={regress}
            onToggleItem={handleToggleItem}
            onOpen={setDetail}
          />
        )}
      </main>

      {/* ——— footer ——— */}
      <footer className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-[#2a241d] bg-[#131009] px-3 py-2 sm:px-4">
        <p className="flex items-center gap-1.5 text-[0.58rem] uppercase tracking-widest text-[#5c5142]">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#5f9c74]" />
          Simulated feed · localStorage persisted
        </p>
        <p className="hidden font-mono text-[0.56rem] uppercase tracking-widest text-[#3f362b] md:block">
          G grid · F flow · N feed · M sound · R recall · B bump ready
        </p>
        <div className="ml-auto flex items-center gap-2">
          <FooterBtn onClick={() => { recall(); if (settings.sound) kdsSound.item(); }} icon={RotateCcw} label="Recall last" />
          <FooterBtn
            onClick={() => { bumpAllReady(); if (settings.sound) kdsSound.bump(); }}
            icon={CheckCheck}
            label={`Bump ready (${stats.ready})`}
            disabled={stats.ready === 0}
          />
          <FooterBtn onClick={clearCompleted} icon={X} label="Clear bumped" />
        </div>
      </footer>

      {/* ——— order detail ——— */}
      <OrderDetail
        order={detail}
        now={now}
        onAdvance={handleAdvance}
        onToggleItem={handleToggleItem}
        onClose={() => setDetail(null)}
      />
    </div>
  );
}

function HeaderBtn({
  children,
  onClick,
  title,
  active,
  danger,
}: {
  children: React.ReactNode;
  onClick: () => void;
  title: string;
  active?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-label={title}
      className={cn(
        "flex h-8 items-center gap-1.5 rounded-md border px-2 transition-colors",
        active
          ? "border-[#5f9c74]/50 bg-[#5f9c74]/12 text-[#8fc9a1]"
          : danger
            ? "border-[#2a241d] text-[#8d7f6a] hover:border-[#c2543e]/60 hover:text-[#ff9d8a]"
            : "border-[#2a241d] text-[#8d7f6a] hover:border-[#c89b6a]/60 hover:text-[#e9d3a8]"
      )}
    >
      {children}
    </button>
  );
}

function StatTile({
  icon: Icon,
  label,
  value,
  tone = "default",
  className,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number | string;
  tone?: "default" | "late" | "ready";
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-3 bg-[#131009] px-3 py-2 sm:px-4", className)}>
      <Icon
        className={cn(
          "h-4 w-4",
          tone === "late" ? "text-[#ff9d8a]" : tone === "ready" ? "text-[#8fc9a1]" : "text-[#8d7f6a]"
        )}
      />
      <div className="leading-tight">
        <p className="font-mono text-base font-bold tabular-nums text-[#ece4d4] sm:text-lg">{value}</p>
        <p className="text-[0.55rem] uppercase tracking-widest text-[#5c5142]">{label}</p>
      </div>
    </div>
  );
}

function FooterBtn({
  onClick,
  icon: Icon,
  label,
  disabled,
}: {
  onClick: () => void;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex items-center gap-1.5 rounded-md border border-[#2a241d] px-2.5 py-1.5 font-mono text-[0.58rem] font-bold uppercase tracking-widest text-[#8d7f6a] transition-colors hover:border-[#c89b6a]/60 hover:text-[#e9d3a8] disabled:opacity-30"
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </button>
  );
}
