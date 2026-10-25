"use client";

import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Coffee,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Lock,
  Mail,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useUIStore } from "@/lib/ui-store";
import { useAuthStore, DEMO_ACCOUNTS } from "@/lib/auth-store";
import { cn } from "@/lib/utils";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Staff portal sign-in — split-screen gate.
 * Demo credentials are surfaced as one-tap chips for reviewers.
 */
export function StaffLogin() {
  const exitPortal = useUIStore((s) => s.exitPortal);
  const openPortal = useUIStore((s) => s.openPortal);
  const login = useAuthStore((s) => s.login);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError("Enter both your staff email and password.");
      return;
    }
    setBusy(true);
    setError(null);
    // simulated auth latency for a real handshake feel
    window.setTimeout(() => {
      const res = login(email, password);
      setBusy(false);
      if (res.ok) {
        openPortal();
      } else {
        setError(res.error ?? "Sign-in failed.");
      }
    }, 650);
  }

  function fillDemo(i: number) {
    setEmail(DEMO_ACCOUNTS[i].email);
    setPassword(DEMO_ACCOUNTS[i].password);
    setError(null);
  }

  return (
    <div className="relative flex min-h-[100svh] bg-[#0a0807] text-[#f4eddf]">
      {/* ——— brand panel ——— */}
      <div className="relative hidden w-[46%] flex-col justify-between overflow-hidden border-r border-[#c89b6a]/15 lg:flex">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url(/images/interior-main.jpg)" }}
          aria-hidden
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0807]/95 via-[#0a0807]/75 to-[#0a0807]/40" aria-hidden />
        <div
          className="pointer-events-none absolute -left-24 bottom-0 h-[420px] w-[420px] rounded-full bg-[#c89b6a]/10 blur-[120px]"
          aria-hidden
        />

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE }}
          className="relative z-10 flex items-center gap-2.5 px-12 pt-12"
        >
          <span className="grid h-10 w-10 place-items-center rounded-full border border-[#c89b6a]/40 bg-[#14100d]/70 text-[#c89b6a]">
            <Coffee className="h-[1.1rem] w-[1.1rem]" strokeWidth={1.75} />
          </span>
          <span className="font-display text-xl font-semibold tracking-[0.18em]">
            NOIRÉ<span className="text-[#c89b6a]">.</span>
          </span>
          <span className="ml-3 rounded-full border border-[#c89b6a]/35 bg-[#14100d]/60 px-3 py-1 text-[0.58rem] font-bold uppercase tracking-[0.28em] text-[#c89b6a]">
            Staff Portal
          </span>
        </motion.div>

        <motion.blockquote
          initial={{ opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15, ease: EASE }}
          className="relative z-10 px-12 pb-16"
        >
          <p className="font-display text-[2rem] font-light italic leading-snug text-[#f4eddf]">
            &ldquo;The room runs on ritual — and now, on{" "}
            <span className="text-gold-gradient not-italic">rails</span>.&rdquo;
          </p>
          <footer className="mt-6 flex items-center gap-4">
            <span className="h-px w-10 bg-[#c89b6a]/60" aria-hidden />
            <p className="text-[0.62rem] font-bold uppercase tracking-[0.3em] text-[#a6947f]">
              House operating system · v4
            </p>
          </footer>

          <div className="mt-10 grid grid-cols-3 gap-3">
            {[
              { k: "Live tickets", v: "Realtime" },
              { k: "QR tables", v: "01–12" },
              { k: "Uptime", v: "99.98%" },
            ].map((s) => (
              <div key={s.k} className="glass rounded-2xl px-4 py-3.5">
                <p className="font-display text-lg text-[#e9d3a8]">{s.v}</p>
                <p className="mt-0.5 text-[0.55rem] font-bold uppercase tracking-[0.22em] text-[#a6947f]">
                  {s.k}
                </p>
              </div>
            ))}
          </div>
        </motion.blockquote>
      </div>

      {/* ——— form panel ——— */}
      <div className="relative flex flex-1 items-center justify-center px-5 py-12 sm:px-10">
        <div
          className="pointer-events-none absolute right-0 top-0 h-[380px] w-[380px] rounded-full bg-[#c89b6a]/6 blur-[110px]"
          aria-hidden
        />

        <motion.div
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.1, ease: EASE }}
          className="w-full max-w-md"
        >
          <button
            type="button"
            onClick={exitPortal}
            className="mb-10 inline-flex items-center gap-2 text-[0.62rem] font-bold uppercase tracking-[0.26em] text-[#a6947f] transition-colors hover:text-[#e9d3a8]"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to the house
          </button>

          <div className="mb-2 flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-xl border border-[#c89b6a]/35 bg-[#14100d] text-[#c89b6a]">
              <Lock className="h-4 w-4" strokeWidth={1.75} />
            </span>
            <p className="eyebrow">Staff access only</p>
          </div>
          <h1 className="font-display text-4xl font-medium leading-tight sm:text-[2.75rem]">
            Sign in to the{" "}
            <em className="text-gold-gradient font-light italic">portal</em>
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-[#a6947f]">
            Kitchen display, QR table ordering, live orders and menu control —
            one door for the whole shift.
          </p>

          <form onSubmit={submit} className="mt-9 space-y-5" noValidate>
            <div className="space-y-2">
              <label
                htmlFor="staff-email"
                className="text-[0.62rem] font-bold uppercase tracking-[0.24em] text-[#a6947f]"
              >
                Staff email
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#a6947f]/60" />
                <input
                  id="staff-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError(null);
                  }}
                  placeholder="you@noire.coffee"
                  className="h-[3.25rem] w-full rounded-xl border border-[#c89b6a]/25 bg-[#14100d]/80 py-3.5 pl-11 pr-4 text-sm text-[#f4eddf] placeholder:text-[#a6947f]/45 outline-none transition-colors focus:border-[#c89b6a]/70 focus:ring-2 focus:ring-[#c89b6a]/25"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="staff-password"
                className="text-[0.62rem] font-bold uppercase tracking-[0.24em] text-[#a6947f]"
              >
                Password
              </label>
              <div className="relative">
                <KeyRound className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#a6947f]/60" />
                <input
                  id="staff-password"
                  type={showPw ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError(null);
                  }}
                  placeholder="••••••••"
                  className="h-[3.25rem] w-full rounded-xl border border-[#c89b6a]/25 bg-[#14100d]/80 py-3.5 pl-11 pr-12 text-sm text-[#f4eddf] placeholder:text-[#a6947f]/45 outline-none transition-colors focus:border-[#c89b6a]/70 focus:ring-2 focus:ring-[#c89b6a]/25"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  aria-label={showPw ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-lg text-[#a6947f]/70 transition-colors hover:text-[#e9d3a8]"
                >
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                role="alert"
                className="rounded-xl border border-[#c2543e]/40 bg-[#c2543e]/10 px-4 py-3 text-xs font-semibold text-[#ff9d8a]"
              >
                {error}
              </motion.p>
            )}

            <button
              type="submit"
              disabled={busy}
              className="group relative flex h-[3.25rem] w-full items-center justify-center gap-3 overflow-hidden rounded-full bg-[#c89b6a] px-6 text-xs font-bold uppercase tracking-[0.26em] text-[#14100d] transition-transform duration-300 hover:scale-[1.015] active:scale-[0.99] disabled:opacity-70"
            >
              <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 group-hover:translate-x-full" aria-hidden />
              {busy ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Verifying…
                </>
              ) : (
                <>
                  <ShieldCheck className="h-4 w-4" />
                  Enter the portal
                </>
              )}
            </button>
          </form>

          {/* demo accounts */}
          <div className="mt-9 rounded-2xl border border-dashed border-[#c89b6a]/30 bg-[#14100d]/40 p-5">
            <p className="flex items-center gap-2 text-[0.6rem] font-bold uppercase tracking-[0.26em] text-[#c89b6a]">
              <Sparkles className="h-3.5 w-3.5" />
              Demo access — one tap
            </p>
            <div className="mt-4 grid gap-2.5">
              {DEMO_ACCOUNTS.map((a, i) => (
                <button
                  key={a.email}
                  type="button"
                  onClick={() => fillDemo(i)}
                  className={cn(
                    "group flex items-center gap-3.5 rounded-xl border border-[#c89b6a]/20 bg-[#0d0a08]/80 px-4 py-3 text-left transition-all duration-300",
                    "hover:border-[#c89b6a]/60 hover:bg-[#1c1611]"
                  )}
                >
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#c89b6a]/15 font-mono text-xs font-bold text-[#e9d3a8]">
                    {a.name.split(" ").map((p) => p[0]).join("")}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-[#f4eddf]">
                      {a.name}
                    </span>
                    <span className="block truncate font-mono text-[0.62rem] text-[#a6947f]">
                      {a.email} · {a.password}
                    </span>
                  </span>
                  <span className="shrink-0 rounded-full border border-[#c89b6a]/35 px-2.5 py-1 text-[0.55rem] font-bold uppercase tracking-[0.2em] text-[#c89b6a]">
                    {a.role}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
