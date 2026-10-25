"use client";

import { useState } from "react";
import {
  LogOut,
  Monitor,
  Radio,
  RotateCcw,
  Store,
  Trash2,
  Volume2,
  VolumeX,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useKDSStore } from "@/lib/kds-store";
import { useMenuAdminStore } from "@/lib/menu-admin-store";
import { useAuthStore } from "@/lib/auth-store";
import { useUIStore } from "@/lib/ui-store";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

export function Settings() {
  const { toast } = useToast();
  const settings = useKDSStore((s) => s.settings);
  const updateSettings = useKDSStore((s) => s.updateSettings);
  const clearCompleted = useKDSStore((s) => s.clearCompleted);
  const resetEdits = useMenuAdminStore((s) => s.resetEdits);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const exitPortal = useUIStore((s) => s.exitPortal);

  const [station, setStation] = useState("NOIRÉ · Bar 01");

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div>
        <p className="eyebrow">Settings</p>
        <h2 className="font-display mt-2 text-3xl font-medium text-[#f4eddf] sm:text-4xl">
          Tune the house.
        </h2>
      </div>

      {/* display */}
      <section className="rounded-2xl border border-[#c89b6a]/15 bg-[#14100d]/70 p-6" aria-label="Display settings">
        <h3 className="flex items-center gap-2.5 font-display text-lg text-[#f4eddf]">
          <Store className="h-4.5 w-4.5 text-[#c89b6a]" />
          Display identity
        </h3>
        <label
          htmlFor="station-name"
          className="mt-5 block text-[0.62rem] font-bold uppercase tracking-[0.24em] text-[#a6947f]"
        >
          Station name (shown on the KDS header)
        </label>
        <div className="mt-2.5 flex flex-col gap-2.5 sm:flex-row">
          <input
            id="station-name"
            value={station}
            onChange={(e) => setStation(e.target.value)}
            maxLength={32}
            className="h-12 flex-1 rounded-xl border border-[#c89b6a]/25 bg-[#0d0a08] px-4 text-sm text-[#f4eddf] outline-none focus:border-[#c89b6a]/70"
          />
          <button
            type="button"
            onClick={() =>
              toast({
                title: "Station name saved",
                description: `KDS will show “${station}”.`,
              })
            }
            className="h-12 rounded-xl bg-[#c89b6a] px-6 text-[0.62rem] font-bold uppercase tracking-[0.2em] text-[#14100d] transition-transform hover:scale-[1.02]"
          >
            Save
          </button>
        </div>
      </section>

      {/* feed & sound */}
      <section className="rounded-2xl border border-[#c89b6a]/15 bg-[#14100d]/70 p-6" aria-label="Feed and sound">
        <h3 className="flex items-center gap-2.5 font-display text-lg text-[#f4eddf]">
          <Radio className="h-4.5 w-4.5 text-[#c89b6a]" />
          Simulated feed & alerts
        </h3>
        <div className="mt-5 space-y-5">
          <Row
            title="Live order feed"
            desc="Demo orders stream in automatically, like a real service."
          >
            <Switch
              checked={settings.autoFeed}
              onCheckedChange={(v) => updateSettings({ autoFeed: v })}
              aria-label="Toggle live feed"
            />
          </Row>
          <Row
            title="Sound alerts"
            desc="Chime for new orders, warnings for late tickets."
          >
            <Switch
              checked={settings.sound}
              onCheckedChange={(v) => updateSettings({ sound: v })}
              aria-label="Toggle sound"
            />
          </Row>
          <Row
            title="New-ticket chime"
            desc={settings.sound ? "Currently enabled" : "Enable sound first"}
          >
            <button
              type="button"
              disabled={!settings.sound}
              onClick={() => import("@/lib/kds-sound").then((m) => m.kdsSound.newOrder())}
              className="inline-flex items-center gap-2 rounded-full border border-[#c89b6a]/35 px-4 py-2 text-[0.6rem] font-bold uppercase tracking-[0.18em] text-[#e9d3a8] transition-colors hover:border-[#c89b6a] disabled:opacity-40"
            >
              {settings.sound ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
              Test
            </button>
          </Row>

          <div className="grid gap-5 sm:grid-cols-2">
            <SliderRow
              label="Feed min interval"
              value={settings.feedMinSec}
              min={5}
              max={60}
              onChange={(v) =>
                updateSettings({ feedMinSec: Math.min(v, settings.feedMaxSec - 2) })
              }
            />
            <SliderRow
              label="Feed max interval"
              value={settings.feedMaxSec}
              min={8}
              max={120}
              onChange={(v) =>
                updateSettings({ feedMaxSec: Math.max(v, settings.feedMinSec + 2) })
              }
            />
          </div>
        </div>
      </section>

      {/* maintenance */}
      <section className="rounded-2xl border border-[#c89b6a]/15 bg-[#14100d]/70 p-6" aria-label="Maintenance">
        <h3 className="flex items-center gap-2.5 font-display text-lg text-[#f4eddf]">
          <RotateCcw className="h-4.5 w-4.5 text-[#c89b6a]" />
          Maintenance
        </h3>
        <div className="mt-5 grid gap-2.5 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => {
              clearCompleted();
              toast({ title: "Bumped tickets cleared", description: "The log is lighter now." });
            }}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#c89b6a]/30 px-4 py-3.5 text-[0.62rem] font-bold uppercase tracking-[0.18em] text-[#e9d3a8] transition-colors hover:border-[#c89b6a]"
          >
            <Trash2 className="h-4 w-4" />
            Clear bumped tickets
          </button>
          <button
            type="button"
            onClick={() => {
              resetEdits();
              toast({ title: "Menu edits reset", description: "Availability and prices restored." });
            }}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#c89b6a]/30 px-4 py-3.5 text-[0.62rem] font-bold uppercase tracking-[0.18em] text-[#e9d3a8] transition-colors hover:border-[#c89b6a]"
          >
            <RotateCcw className="h-4 w-4" />
            Reset menu manager
          </button>
        </div>
      </section>

      {/* account */}
      <section className="rounded-2xl border border-[#c89b6a]/15 bg-[#14100d]/70 p-6" aria-label="Account">
        <h3 className="flex items-center gap-2.5 font-display text-lg text-[#f4eddf]">
          <Monitor className="h-4.5 w-4.5 text-[#c89b6a]" />
          Signed in as
        </h3>
        <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <span className="grid h-11 w-11 place-items-center rounded-full bg-[#c89b6a]/15 font-mono text-sm font-bold text-[#e9d3a8]">
              {user?.initials}
            </span>
            <div>
              <p className="text-sm font-semibold text-[#f4eddf]">{user?.name}</p>
              <p className="font-mono text-[0.62rem] text-[#a6947f]">
                {user?.email} · {user?.role}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              logout();
              exitPortal();
            }}
            className={cn(
              "inline-flex items-center gap-2 rounded-xl border border-[#c2543e]/40 px-5 py-3",
              "text-[0.62rem] font-bold uppercase tracking-[0.2em] text-[#ff9d8a]",
              "transition-colors hover:bg-[#c2543e] hover:text-[#fff2ee]"
            )}
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </section>
    </div>
  );
}

function Row({
  title,
  desc,
  children,
}: {
  title: string;
  desc: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-[#c89b6a]/12 bg-[#0d0a08]/60 px-4 py-3.5">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-[#ece4d4]">{title}</p>
        <p className="mt-0.5 text-[0.72rem] text-[#a6947f]">{desc}</p>
      </div>
      {children}
    </div>
  );
}

function SliderRow({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="rounded-xl border border-[#c89b6a]/12 bg-[#0d0a08]/60 px-4 py-3.5">
      <div className="flex items-baseline justify-between">
        <p className="text-[0.62rem] font-bold uppercase tracking-[0.2em] text-[#a6947f]">
          {label}
        </p>
        <p className="font-mono text-sm font-bold tabular-nums text-[#e9d3a8]">
          {value}s
        </p>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value, 10))}
        aria-label={label}
        className="mt-2.5 w-full accent-[#c89b6a]"
      />
    </div>
  );
}
