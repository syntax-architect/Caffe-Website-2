"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { MENU, KITCHEN_ONLY } from "./cafe-data";

/* ————————— Types ————————— */

export type OrderStatus = "new" | "preparing" | "ready" | "done";
export type OrderChannel = "WEB" | "POS" | "APP" | "UBER" | "PHONE" | "QR";
export type OrderType = "dine-in" | "takeout" | "delivery";
export type Station = "BAR" | "KITCHEN";

export interface KDSItem {
  id: string;
  name: string;
  qty: number;
  mods: string[];
  station: Station;
  done: boolean;
}

export interface KDSOrder {
  id: string;
  number: number;
  channel: OrderChannel;
  type: OrderType;
  station: Station;
  items: KDSItem[];
  status: OrderStatus;
  createdAt: number;
  startedAt?: number;
  readyAt?: number;
  doneAt?: number;
  note?: string;
  allergy?: string;
  rush: boolean;
  customer: string;
  source: "sim" | "web";
  /** dine-in table number (QR table orders + POS dine-in) */
  table?: number;
  /** lateness tiers already alerted, so sounds don't loop */
  alerted: ("warn" | "late")[];
}

export interface KDSSettings {
  sound: boolean;
  autoFeed: boolean;
  feedMinSec: number;
  feedMaxSec: number;
}

interface KDSState {
  orders: KDSOrder[];
  nextNumber: number;
  settings: KDSSettings;
  lastBumped: KDSOrder | null;

  createWebOrder: (
    lines: { id: string; name: string; qty: number }[],
    customer?: string,
    opts?: { table?: number }
  ) => number | null;
  injectSimOrder: (ageMinutes?: number) => void;
  advance: (id: string) => void;
  regress: (id: string) => void;
  toggleItem: (orderId: string, itemId: string) => void;
  bumpAllReady: () => void;
  recall: () => void;
  clearCompleted: () => void;
  updateSettings: (patch: Partial<KDSSettings>) => void;
}

/* ————————— Simulation helpers ————————— */

const CUSTOMERS = [
  "Amara C.", "Jonas R.", "Sofia M.", "Dev P.", "Elena V.", "Marcus W.",
  "Linh T.", "Harold K.", "Nina F.", "Theo B.", "Iris K.", "Omar D.",
  "Priya S.", "Lucas M.", "Greta L.", "Felix A.", "Mona Z.", "Ravi N.",
];

const CHANNELS: { c: OrderChannel; w: number }[] = [
  { c: "POS", w: 5 }, { c: "APP", w: 3 }, { c: "QR", w: 2.5 }, { c: "WEB", w: 2 }, { c: "UBER", w: 1.5 }, { c: "PHONE", w: 1 },
];

const MODS_POOL: Record<string, string[]> = {
  BAR: ["Oat milk", "Extra shot", "Decaf", "Half-sweet", "Extra hot", "Iced", "No sugar", "Cinnamon dust"],
  KITCHEN: ["Warmed", "Cut in half", "Extra butter", "Side of jam", "No nuts", "Well toasted"],
};

const NOTES_POOL = [
  "Regular's usual",
  "Rush — meeting at 9",
  "Extra napkins please",
  "To stay, window seat",
  "Birthday — candle please",
  "Double cup, very hot",
];

const ALLERGY_POOL = ["Severe nut allergy", "Gluten intolerance", "Dairy allergy", "Latex-free packaging"];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function weightedChannel(): OrderChannel {
  const total = CHANNELS.reduce((n, x) => n + x.w, 0);
  let r = Math.random() * total;
  for (const { c, w } of CHANNELS) {
    r -= w;
    if (r <= 0) return c;
  }
  return "POS";
}

let idSeq = 0;
function uid(): string {
  idSeq += 1;
  return `k${Date.now().toString(36)}-${idSeq}`;
}

function makeSimItems(): KDSItem[] {
  const n = 1 + Math.floor(Math.random() * 4); // 1..4 line items
  const items: KDSItem[] = [];
  const used = new Set<string>();
  for (let i = 0; i < n; i++) {
    const fromKitchen = Math.random() < 0.35;
    const pool = fromKitchen
      ? KITCHEN_ONLY.map((k) => ({ id: k.id, name: k.name, station: "KITCHEN" as Station }))
      : MENU.map((m) => ({ id: m.id, name: m.name, station: m.station }));
    const it = pick(pool);
    if (used.has(it.id)) continue;
    used.add(it.id);
    const mods: string[] = [];
    if (Math.random() < 0.45) mods.push(pick(MODS_POOL[it.station]));
    if (Math.random() < 0.18) mods.push(pick(MODS_POOL[it.station]));
    items.push({
      id: it.id,
      name: it.name,
      qty: Math.random() < 0.22 ? 2 : 1,
      mods: [...new Set(mods)],
      station: it.station,
      done: false,
    });
  }
  return items;
}

function dominantStation(items: KDSItem[]): Station {
  const bar = items.filter((i) => i.station === "BAR").length;
  return bar >= items.length - bar ? "BAR" : "KITCHEN";
}

function orderType(channel: OrderChannel): OrderType {
  if (channel === "UBER") return "delivery";
  if (channel === "QR") return "dine-in";
  if (channel === "POS") return Math.random() < 0.6 ? "dine-in" : "takeout";
  return Math.random() < 0.75 ? "takeout" : "delivery";
}

function randomTable(): number {
  return 1 + Math.floor(Math.random() * 12);
}

function randomCustomer(): string {
  return pick(CUSTOMERS);
}

/* ————————— Store ————————— */

export const useKDSStore = create<KDSState>()(
  persist(
    (set, get) => ({
      orders: [],
      nextNumber: 101,
      lastBumped: null,
      settings: { sound: true, autoFeed: true, feedMinSec: 14, feedMaxSec: 34 },

      createWebOrder: (lines, customer, opts) => {
        if (lines.length === 0) return null;
        const num = get().nextNumber;
        const items: KDSItem[] = lines.map((l) => {
          const meta = MENU.find((m) => m.id === l.id);
          return {
            id: l.id,
            name: l.name,
            qty: l.qty,
            mods: [],
            station: meta?.station ?? "BAR",
            done: false,
          };
        });
        const table = opts?.table;
        const order: KDSOrder = {
          id: uid(),
          number: num,
          channel: table ? "QR" : "WEB",
          type: table ? "dine-in" : "takeout",
          station: dominantStation(items),
          items,
          status: "new",
          createdAt: Date.now(),
          rush: false,
          customer: customer ?? (table ? `Table ${table}` : "Web guest"),
          source: "web",
          table,
          alerted: [],
        };
        set((s) => ({ orders: [order, ...s.orders], nextNumber: s.nextNumber + 1 }));
        return num;
      },

      injectSimOrder: (ageMinutes) => {
        const items = makeSimItems();
        const channel = weightedChannel();
        const table = channel === "QR" ? randomTable() : undefined;
        const rush = Math.random() < 0.14;
        const allergy = Math.random() < 0.09 ? pick(ALLERGY_POOL) : undefined;
        const note = !allergy && Math.random() < 0.2 ? pick(NOTES_POOL) : undefined;
        const ageMs = ageMinutes ? ageMinutes * 60_000 : 0;
        const order: KDSOrder = {
          id: uid(),
          number: get().nextNumber,
          channel,
          type: orderType(channel),
          station: dominantStation(items),
          items,
          status: "new",
          createdAt: Date.now() - ageMs,
          note,
          allergy,
          rush,
          customer: channel === "QR" ? `Table ${table ?? randomTable()}` : randomCustomer(),
          source: "sim",
          table: channel === "QR" ? (table ?? randomTable()) : orderType(channel) === "dine-in" && channel === "POS" ? randomTable() : undefined,
          alerted: [],
        };
        set((s) => ({ orders: [order, ...s.orders], nextNumber: s.nextNumber + 1 }));
      },

      advance: (id) =>
        set((s) => ({
          orders: s.orders.map((o) => {
            if (o.id !== id) return o;
            const now = Date.now();
            if (o.status === "new")
              return { ...o, status: "preparing", startedAt: now } as KDSOrder;
            if (o.status === "preparing")
              return { ...o, status: "ready", readyAt: now } as KDSOrder;
            if (o.status === "ready") {
              return { ...o, status: "done", doneAt: now } as KDSOrder;
            }
            return o;
          }),
          lastBumped:
            s.orders.find((o) => o.id === id)?.status === "ready"
              ? s.orders.find((o) => o.id === id) ?? s.lastBumped
              : s.lastBumped,
        })),

      regress: (id) =>
        set((s) => ({
          orders: s.orders.map((o) => {
            if (o.id !== id) return o;
            if (o.status === "preparing") return { ...o, status: "new", startedAt: undefined } as KDSOrder;
            if (o.status === "ready") return { ...o, status: "preparing", readyAt: undefined } as KDSOrder;
            if (o.status === "done") return { ...o, status: "ready", doneAt: undefined } as KDSOrder;
            return o;
          }),
        })),

      toggleItem: (orderId, itemId) =>
        set((s) => ({
          orders: s.orders.map((o) =>
            o.id === orderId
              ? {
                  ...o,
                  items: o.items.map((i) =>
                    i.id === itemId ? { ...i, done: !i.done } : i
                  ),
                }
              : o
          ),
        })),

      bumpAllReady: () =>
        set((s) => {
          const now = Date.now();
          const ready = s.orders.filter((o) => o.status === "ready");
          return {
            orders: s.orders.map((o) =>
              o.status === "ready" ? ({ ...o, status: "done", doneAt: now } as KDSOrder) : o
            ),
            lastBumped: ready[ready.length - 1] ?? s.lastBumped,
          };
        }),

      recall: () =>
        set((s) => {
          const lb = s.lastBumped;
          if (!lb) return {};
          return {
            orders: s.orders.map((o) =>
              o.id === lb.id
                ? ({ ...o, status: "ready", doneAt: undefined } as KDSOrder)
                : o
            ),
            lastBumped: null,
          };
        }),

      clearCompleted: () =>
        set((s) => ({ orders: s.orders.filter((o) => o.status !== "done") })),

      updateSettings: (patch) =>
        set((s) => ({ settings: { ...s.settings, ...patch } })),
    }),
    {
      name: "noire-kds-v1",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ orders: s.orders, nextNumber: s.nextNumber, settings: s.settings }),
    }
  )
);

/* ————————— Derived helpers (pure, used by components) ————————— */

export const ACTIVE_STATUSES: OrderStatus[] = ["new", "preparing", "ready"];

export function activeOrders(orders: KDSOrder[]): KDSOrder[] {
  return orders.filter((o) => o.status !== "done");
}

/** Sort: late first, then rush, then oldest first. */
export function sortForGrid(orders: KDSOrder[], now: number): KDSOrder[] {
  const rank = (o: KDSOrder) => {
    const age = (now - o.createdAt) / 60_000;
    const late = age > 10 ? 0 : age > 5 ? 1 : 2;
    const statusW = o.status === "ready" ? 1 : 0;
    return late * 100 + statusW * 10 - (o.rush ? 5 : 0);
  };
  return [...orders].sort((a, b) => rank(a) - rank(b) || a.createdAt - b.createdAt);
}

export type AgeTier = "fresh" | "warn" | "late";

export function ageTier(o: KDSOrder, now: number): AgeTier {
  const mins = (now - o.createdAt) / 60_000;
  if (o.status === "ready") {
    return mins > 14 ? "late" : mins > 9 ? "warn" : "fresh";
  }
  return mins > 10 ? "late" : mins > 5 ? "warn" : "fresh";
}

export function fmtClock(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function fmtClockS(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

/** Average kitchen time for orders completed in the last 2 hours. */
export function avgPrepSeconds(orders: KDSOrder[]): number | null {
  const now = Date.now();
  const done = orders.filter(
    (o) => o.status === "done" && o.startedAt && now - (o.doneAt ?? 0) < 2 * 3600_000
  );
  if (done.length === 0) return null;
  const total = done.reduce((n, o) => n + ((o.doneAt ?? 0) - (o.startedAt ?? o.createdAt)), 0);
  return Math.round(total / done.length / 1000);
}
