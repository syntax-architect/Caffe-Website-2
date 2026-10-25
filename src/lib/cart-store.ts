"use client";

import { create } from "zustand";
import { MENU_BY_ID, type MenuItem } from "./cafe-data";
import { useKDSStore } from "./kds-store";
import { useUIStore } from "./ui-store";

export interface CartLine {
  id: string;
  name: string;
  price: number;
  image: string;
  qty: number;
}

interface CartState {
  lines: CartLine[];
  lastOrderId: number | null;
  add: (item: MenuItem) => void;
  increment: (id: string) => void;
  decrement: (id: string) => void;
  remove: (id: string) => void;
  clear: () => void;
  count: () => number;
  total: () => number;
  /** Sends the cart to the kitchen — creates a live KDS ticket. */
  checkout: (customer?: string) => number | null;
}

export const useCartStore = create<CartState>((set, get) => ({
  lines: [],
  lastOrderId: null,

  add: (item) =>
    set((s) => {
      const found = s.lines.find((l) => l.id === item.id);
      const lines = found
        ? s.lines.map((l) => (l.id === item.id ? { ...l, qty: l.qty + 1 } : l))
        : [...s.lines, { id: item.id, name: item.name, price: item.price, image: item.image, qty: 1 }];
      return { lines };
    }),

  increment: (id) =>
    set((s) => ({
      lines: s.lines.map((l) => (l.id === id ? { ...l, qty: l.qty + 1 } : l)),
    })),

  decrement: (id) =>
    set((s) => ({
      lines: s.lines
        .map((l) => (l.id === id ? { ...l, qty: l.qty - 1 } : l))
        .filter((l) => l.qty > 0),
    })),

  remove: (id) => set((s) => ({ lines: s.lines.filter((l) => l.id !== id) })),
  clear: () => set({ lines: [] }),

  count: () => get().lines.reduce((n, l) => n + l.qty, 0),
  total: () => get().lines.reduce((n, l) => n + l.qty * l.price, 0),

  checkout: (customer) => {
    const { lines } = get();
    if (lines.length === 0) return null;
    const kds = useKDSStore.getState();
    const table = useUIStore.getState().table ?? undefined;
    const orderId = kds.createWebOrder(
      lines.map((l) => ({ id: l.id, name: l.name, qty: l.qty })),
      customer,
      { table }
    );
    if (orderId !== null) set({ lines: [], lastOrderId: orderId });
    return orderId;
  },
}));

/** Helper for menu rows without dragging the whole item object around. */
export function menuItemById(id: string): MenuItem | undefined {
  return MENU_BY_ID.get(id);
}
