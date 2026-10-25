"use client";

import { useEffect } from "react";
import dynamic from "next/dynamic";
import { AnimatePresence, motion } from "framer-motion";
import { useUIStore, type AppView } from "@/lib/ui-store";
import { useAuthStore } from "@/lib/auth-store";
import { CafeSite } from "@/components/cafe/cafe-site";

/* ——— v4 lazy loading: staff-side apps are code-split out of the
   initial guest bundle and stream in on first navigation ——— */
const ViewLoader = () => (
  <div className="grid h-[100svh] place-items-center bg-[#0a0807]">
    <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-[#c89b6a]" />
  </div>
);

const KDSApp = dynamic(
  () => import("@/components/kds/kds-app").then((m) => m.KDSApp),
  { loading: () => <ViewLoader /> }
);
const StaffLogin = dynamic(
  () => import("@/components/staff/staff-login").then((m) => m.StaffLogin),
  { loading: () => <ViewLoader /> }
);
const StaffPortal = dynamic(
  () => import("@/components/staff/staff-portal").then((m) => m.StaffPortal),
  { loading: () => <ViewLoader /> }
);

const VIEW_HASH: Record<AppView, string> = {
  cafe: "",
  kds: "#kds",
  staff: "#staff",
  portal: "#portal",
};

function viewFromHash(hash: string): AppView {
  if (hash.startsWith("#kds")) return "kds";
  if (hash.startsWith("#portal")) return "portal";
  if (hash.startsWith("#staff")) return "staff";
  return "cafe";
}

export default function Home() {
  const view = useUIStore((s) => s.view);
  const setView = useUIStore((s) => s.setView);
  const table = useUIStore((s) => s.table);
  const setTable = useUIStore((s) => s.setTable);
  const user = useAuthStore((s) => s.user);

  /* ——— hash deep-links: #kds · #staff · #portal · #table=N ——— */
  useEffect(() => {
    const apply = () => {
      const h = window.location.hash;
      const m = h.match(/^#table=(\d{1,2})/);
      if (m) {
        const n = Math.min(99, Math.max(1, parseInt(m[1], 10)));
        setTable(n);
        setView("cafe");
        return;
      }
      // keep the QR table context across in-page anchor navigation
      // (#menu, #craft…) — only a clean URL ends table mode
      if (h === "" || h === "#") setTable(null);
      setView(viewFromHash(h));
    };
    apply();
    window.addEventListener("hashchange", apply);
    return () => window.removeEventListener("hashchange", apply);
  }, [setView, setTable]);

  /* ——— keep the URL bar in sync with programmatic view changes ——— */
  useEffect(() => {
    const want = VIEW_HASH[view];
    const cur = window.location.hash;
    if (view === "cafe") {
      const t = table ? `#table=${table}` : "";
      if (cur !== t) history.replaceState(null, "", t || window.location.pathname);
    } else if (cur !== want) {
      history.replaceState(null, "", want);
    }
  }, [view, table]);

  /* ——— auth guard: #portal requires a signed-in staff member ——— */
  useEffect(() => {
    if (view === "portal" && !user) setView("staff");
    // already signed in? the Staff button drops you straight into the portal
    if (view === "staff" && user) setView("portal");
  }, [view, user, setView]);

  /* ——— lock page scroll while an app view is open ——— */
  useEffect(() => {
    document.body.style.overflow = view === "kds" || view === "portal" ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [view]);

  return (
    <AnimatePresence mode="wait" initial={false}>
      {view === "cafe" ? (
        <motion.div
          key="cafe"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.28 } }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          <CafeSite />
        </motion.div>
      ) : view === "kds" ? (
        <motion.div
          key="kds"
          initial={{ opacity: 0, scale: 0.985 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.99, transition: { duration: 0.24 } }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="h-[100svh]"
        >
          <KDSApp />
        </motion.div>
      ) : view === "staff" ? (
        <motion.div
          key="staff"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10, transition: { duration: 0.24 } }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="min-h-[100svh]"
        >
          <StaffLogin />
        </motion.div>
      ) : (
        <motion.div
          key="portal"
          initial={{ opacity: 0, scale: 0.988 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.99, transition: { duration: 0.24 } }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="h-[100svh]"
        >
          <StaffPortal />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
