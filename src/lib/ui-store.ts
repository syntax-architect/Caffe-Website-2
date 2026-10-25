"use client";

import { create } from "zustand";

export type AppView = "cafe" | "kds" | "staff" | "portal";

interface UIState {
  view: AppView;
  cartOpen: boolean;
  /** preloader finished — hero entrance may start */
  introDone: boolean;
  /** preloader has played once this session */
  introSeen: boolean;
  /** QR table context — set by scanning a table QR (hash #table=N) */
  table: number | null;
  setView: (v: AppView) => void;
  openKDS: () => void;
  exitKDS: () => void;
  openStaff: () => void;
  openPortal: () => void;
  exitPortal: () => void;
  setCartOpen: (open: boolean) => void;
  setIntroDone: () => void;
  setIntroSeen: () => void;
  setTable: (n: number | null) => void;
}

export const useUIStore = create<UIState>((set) => ({
  view: "cafe",
  cartOpen: false,
  introDone: false,
  introSeen: false,
  table: null,
  setView: (v) => set({ view: v }),
  openKDS: () => set({ view: "kds", cartOpen: false }),
  exitKDS: () => set({ view: "cafe" }),
  openStaff: () => set({ view: "staff", cartOpen: false }),
  openPortal: () => set({ view: "portal", cartOpen: false }),
  exitPortal: () => set({ view: "cafe" }),
  setCartOpen: (open) => set({ cartOpen: open }),
  setIntroDone: () => set({ introDone: true }),
  setIntroSeen: () => set({ introSeen: true }),
  setTable: (n) => set({ table: n }),
}));
