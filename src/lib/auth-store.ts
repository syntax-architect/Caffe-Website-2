"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type StaffRole = "manager" | "barista";

export interface StaffUser {
  name: string;
  email: string;
  role: StaffRole;
  initials: string;
  loginAt: number;
}

interface AuthState {
  user: StaffUser | null;
  /** last portal tab, so a re-login returns where you left off */
  lastTab: string;
  login: (email: string, password: string) => { ok: boolean; error?: string };
  logout: () => void;
  setLastTab: (tab: string) => void;
}

/** Demo roster — frontend only. Shown on the login screen for reviewers. */
export const DEMO_ACCOUNTS: {
  email: string;
  password: string;
  name: string;
  role: StaffRole;
  title: string;
}[] = [
  {
    email: "ava@noire.coffee",
    password: "noire2026",
    name: "Ava Laurent",
    role: "manager",
    title: "General Manager",
  },
  {
    email: "liam@noire.coffee",
    password: "noire2026",
    name: "Liam Okafor",
    role: "barista",
    title: "Head Barista",
  },
];

function initialsOf(name: string): string {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      lastTab: "overview",

      login: (email, password) => {
        const e = email.trim().toLowerCase();
        const acct = DEMO_ACCOUNTS.find((a) => a.email === e);
        if (!acct) {
          return { ok: false, error: "No staff account with that email." };
        }
        if (acct.password !== password) {
          return { ok: false, error: "Incorrect password — try again." };
        }
        set({
          user: {
            name: acct.name,
            email: acct.email,
            role: acct.role,
            initials: initialsOf(acct.name),
            loginAt: Date.now(),
          },
        });
        return { ok: true };
      },

      logout: () => set({ user: null }),

      setLastTab: (tab) => set({ lastTab: tab }),
    }),
    {
      name: "noire-staff-v1",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ user: s.user, lastTab: s.lastTab }),
    }
  )
);
