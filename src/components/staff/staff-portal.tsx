"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowUpRight,
  ChefHat,
  Coffee,
  LayoutDashboard,
  LogOut,
  Menu as MenuIcon,
  QrCode,
  ReceiptText,
  Settings as SettingsIcon,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/lib/auth-store";
import { useUIStore } from "@/lib/ui-store";
import { KDSApp } from "@/components/kds/kds-app";
import { Overview } from "./overview";
import { QrOrdering } from "./qr-ordering";
import { Orders } from "./orders";
import { MenuManager } from "./menu-manager";
import { Settings } from "./settings";

type Tab = "overview" | "kds" | "qr" | "orders" | "menu" | "settings";

const NAV: { id: Tab; label: string; icon: React.ComponentType<{ className?: string; strokeWidth?: number }>; hint: string }[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard, hint: "Shift at a glance" },
  { id: "kds", label: "Kitchen · KDS", icon: ChefHat, hint: "Live ticket board" },
  { id: "qr", label: "QR Ordering", icon: QrCode, hint: "Table codes" },
  { id: "orders", label: "Orders", icon: ReceiptText, hint: "Full ticket log" },
  { id: "menu", label: "Menu Manager", icon: Coffee, hint: "86 & pricing" },
  { id: "settings", label: "Settings", icon: SettingsIcon, hint: "Station & feed" },
];

const EASE = [0.22, 1, 0.36, 1] as const;

export function StaffPortal() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const setLastTab = useAuthStore((s) => s.setLastTab);
  const lastTab = useAuthStore((s) => s.lastTab);
  const exitPortal = useUIStore((s) => s.exitPortal);
  const openKDS = useUIStore((s) => s.openKDS);

  const [tab, setTab] = useState<Tab>(
    (["overview", "qr", "orders", "menu", "settings"].includes(lastTab)
      ? lastTab
      : "overview") as Tab
  );
  const [drawer, setDrawer] = useState(false);
  const [clock, setClock] = useState(() => new Date());

  useEffect(() => {
    const t = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const go = (t: Tab) => {
    setTab(t);
    setLastTab(t);
    setDrawer(false);
  };

  const signOut = () => {
    logout();
    exitPortal();
  };

  const navList = (
    <nav aria-label="Portal sections" className="flex flex-1 flex-col gap-1 px-3">
      {NAV.map((n) => (
        <button
          key={n.id}
          type="button"
          onClick={() => go(n.id)}
          aria-current={tab === n.id ? "page" : undefined}
          className={cn(
            "group flex items-center gap-3.5 rounded-xl px-3.5 py-3 text-left transition-all duration-250",
            tab === n.id
              ? "border border-[#c89b6a]/40 bg-[#c89b6a]/12 text-[#f4eddf]"
              : "border border-transparent text-[#a6947f] hover:bg-[#1c1611] hover:text-[#e9d3a8]"
          )}
        >
          <span
            className={cn(
              "grid h-9 w-9 shrink-0 place-items-center rounded-lg border transition-colors",
              tab === n.id
                ? "border-[#c89b6a]/60 bg-[#c89b6a]/15 text-[#c89b6a]"
                : "border-[#c89b6a]/15 bg-[#0d0a08] text-[#8d7f6a] group-hover:text-[#c89b6a]"
            )}
          >
            <n.icon className="h-4 w-4" strokeWidth={1.75} />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-[0.8rem] font-bold uppercase tracking-[0.14em]">
              {n.label}
            </span>
            <span className="block truncate text-[0.6rem] text-[#5c5142]">{n.hint}</span>
          </span>
        </button>
      ))}
    </nav>
  );

  const userCard = (
    <div className="border-t border-[#c89b6a]/15 p-3">
      <div className="flex items-center gap-3 rounded-xl bg-[#0d0a08] px-3 py-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#c89b6a]/15 font-mono text-xs font-bold text-[#e9d3a8]">
          {user?.initials}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[0.8rem] font-semibold text-[#f4eddf]">{user?.name}</p>
          <p className="truncate font-mono text-[0.58rem] uppercase tracking-wider text-[#5c5142]">
            {user?.role} · on shift
          </p>
        </div>
        <button
          type="button"
          onClick={signOut}
          aria-label="Sign out"
          title="Sign out"
          className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-[#8d7f6a] transition-colors hover:bg-[#c2543e]/15 hover:text-[#ff9d8a]"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
      <button
        type="button"
        onClick={exitPortal}
        className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-[#c89b6a]/20 px-3 py-2.5 text-[0.6rem] font-bold uppercase tracking-[0.2em] text-[#a6947f] transition-colors hover:border-[#c89b6a]/60 hover:text-[#e9d3a8]"
      >
        View website
        <ArrowUpRight className="h-3 w-3" />
      </button>
    </div>
  );

  const brand = (
    <div className="flex items-center gap-2.5 px-6 py-6">
      <span className="grid h-9 w-9 place-items-center rounded-full border border-[#c89b6a]/40 bg-[#14100d] text-[#c89b6a]">
        <Coffee className="h-4 w-4" strokeWidth={1.75} />
      </span>
      <div className="leading-tight">
        <p className="font-display text-lg font-semibold tracking-[0.18em] text-[#f4eddf]">
          NOIRÉ<span className="text-[#c89b6a]">.</span>
        </p>
        <p className="font-mono text-[0.55rem] uppercase tracking-[0.3em] text-[#5c5142]">
          Staff OS · v3
        </p>
      </div>
    </div>
  );

  return (
    <div className="flex h-[100svh] overflow-hidden bg-[#0d0b08] text-[#ece4d4]">
      {/* ——— desktop sidebar ——— */}
      <aside className="hidden w-68 shrink-0 flex-col border-r border-[#c89b6a]/12 bg-[#0f0c09] lg:flex xl:w-72">
        {brand}
        {navList}
        {userCard}
      </aside>

      {/* ——— mobile drawer ——— */}
      <AnimatePresence>
        {drawer && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={() => setDrawer(false)}
              className="fixed inset-0 z-[200] bg-[#0a0807]/70 backdrop-blur-sm lg:hidden"
              aria-hidden
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.45, ease: EASE }}
              className="fixed inset-y-0 left-0 z-[210] flex w-72 flex-col border-r border-[#c89b6a]/15 bg-[#0f0c09] lg:hidden"
              role="dialog"
              aria-modal="true"
              aria-label="Portal navigation"
            >
              <div className="flex items-center justify-between pr-3">
                {brand}
                <button
                  type="button"
                  onClick={() => setDrawer(false)}
                  aria-label="Close navigation"
                  className="grid h-10 w-10 place-items-center rounded-full border border-[#c89b6a]/25 text-[#f4eddf]"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              {navList}
              {userCard}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ——— main column ——— */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* mobile topbar */}
        <header className="flex items-center gap-3 border-b border-[#c89b6a]/12 bg-[#0f0c09] px-4 py-3 lg:hidden">
          <button
            type="button"
            onClick={() => setDrawer(true)}
            aria-label="Open navigation"
            aria-expanded={drawer}
            className="grid h-10 w-10 place-items-center rounded-xl border border-[#c89b6a]/25 text-[#f4eddf]"
          >
            <MenuIcon className="h-4.5 w-4.5" />
          </button>
          <div className="min-w-0 flex-1 leading-tight">
            <p className="truncate font-display text-base font-semibold tracking-[0.14em] text-[#f4eddf]">
              Staff OS
            </p>
            <p className="truncate font-mono text-[0.55rem] uppercase tracking-[0.24em] text-[#5c5142]">
              {NAV.find((n) => n.id === tab)?.label}
            </p>
          </div>
          <span className="grid h-9 w-9 place-items-center rounded-full bg-[#c89b6a]/15 font-mono text-[0.65rem] font-bold text-[#e9d3a8]">
            {user?.initials}
          </span>
        </header>

        {tab === "kds" ? (
          /* KDS takes the full remaining column — it ships its own chrome */
          <div className="min-h-0 flex-1">
            <KDSApp onExit={() => go("overview")} />
          </div>
        ) : (
          <>
            {/* desktop sub-header */}
            <div className="hidden items-center justify-between border-b border-[#c89b6a]/12 bg-[#0f0c09] px-7 py-4 lg:flex">
              <div>
                <p className="text-[0.6rem] font-bold uppercase tracking-[0.26em] text-[#c89b6a]">
                  {NAV.find((n) => n.id === tab)?.hint}
                </p>
                <p className="mt-0.5 font-mono text-[0.62rem] text-[#5c5142]">
                  {clock.toLocaleDateString("en-GB", {
                    weekday: "long",
                    day: "2-digit",
                    month: "short",
                  })}{" "}
                  ·{" "}
                  {clock.toLocaleTimeString("en-GB", { hour12: false })}
                </p>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="flex items-center gap-1.5 rounded-full border border-[#5f9c74]/40 bg-[#5f9c74]/10 px-3 py-1.5 text-[0.58rem] font-bold uppercase tracking-widest text-[#8fc9a1]">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#5f9c74]" />
                  Systems nominal
                </span>
                <button
                  type="button"
                  onClick={() => openKDS()}
                  title="Pop the KDS out to the full-screen website view"
                  className="rounded-full border border-[#c89b6a]/25 px-4 py-1.5 text-[0.58rem] font-bold uppercase tracking-widest text-[#a6947f] transition-colors hover:border-[#c89b6a] hover:text-[#e9d3a8]"
                >
                  Pop-out KDS
                </button>
              </div>
            </div>

            <main
              key={tab}
              className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6 lg:p-7 [scrollbar-width:thin]"
            >
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: EASE }}
              >
                {tab === "overview" && <Overview go={go} />}
                {tab === "qr" && <QrOrdering />}
                {tab === "orders" && <Orders />}
                {tab === "menu" && <MenuManager />}
                {tab === "settings" && <Settings />}
              </motion.div>
            </main>
          </>
        )}
      </div>
    </div>
  );
}
