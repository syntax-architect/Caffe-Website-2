"use client";

import { create } from "zustand";

export type AppView = "cafe" | "kds";

interface UIState {
  view: AppView;
  cartOpen: boolean;
  /** preloader finished — hero entrance may start */
  introDone: boolean;
  /** preloader has played once this session */
  introSeen: boolean;
  setView: (v: AppView) => void;
  openKDS: () => void;
  exitKDS: () => void;
  setCartOpen: (open: boolean) => void;
  setIntroDone: () => void;
  setIntroSeen: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  view: "cafe",
  cartOpen: false,
  introDone: false,
  introSeen: false,
  setView: (v) => set({ view: v }),
  openKDS: () => set({ view: "kds", cartOpen: false }),
  exitKDS: () => set({ view: "cafe" }),
  setCartOpen: (open) => set({ cartOpen: open }),
  setIntroDone: () => set({ introDone: true }),
  setIntroSeen: () => set({ introSeen: true }),
}));
