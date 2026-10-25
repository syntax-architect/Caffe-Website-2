"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface MenuAdminState {
  /** item ids marked 86'd / sold out */
  soldOut: Record<string, boolean>;
  /** price overrides used by the portal's menu manager */
  priceOverrides: Record<string, number>;
  toggleSoldOut: (id: string) => void;
  setPrice: (id: string, price: number) => void;
  resetEdits: () => void;
}

export const useMenuAdminStore = create<MenuAdminState>()(
  persist(
    (set) => ({
      soldOut: {},
      priceOverrides: {},
      toggleSoldOut: (id) =>
        set((s) => ({ soldOut: { ...s.soldOut, [id]: !s.soldOut[id] } })),
      setPrice: (id, price) =>
        set((s) => ({
          priceOverrides: { ...s.priceOverrides, [id]: Math.max(0, price) },
        })),
      resetEdits: () => set({ soldOut: {}, priceOverrides: {} }),
    }),
    {
      name: "noire-menu-admin-v1",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
