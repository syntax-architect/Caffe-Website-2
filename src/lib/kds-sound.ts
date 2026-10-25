"use client";

/**
 * Tiny WebAudio engine for KDS alerts — no audio files needed.
 * The AudioContext is created lazily and resumed on the first
 * user gesture to satisfy autoplay policies.
 */

let ctx: AudioContext | null = null;

function ensureCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    try {
      ctx = new AC();
    } catch {
      return null;
    }
  }
  if (ctx.state === "suspended") {
    void ctx.resume().catch(() => undefined);
  }
  return ctx;
}

if (typeof window !== "undefined") {
  const resume = () => ensureCtx();
  window.addEventListener("pointerdown", resume, { once: true, passive: true });
  window.addEventListener("keydown", resume, { once: true, passive: true });
}

function tone(freq: number, start: number, dur: number, gainPeak = 0.08, type: OscillatorType = "sine") {
  const c = ensureCtx();
  if (!c) return;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  const t0 = c.currentTime + start;
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.exponentialRampToValueAtTime(gainPeak, t0 + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(gain).connect(c.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.05);
}

export const kdsSound = {
  newOrder() {
    tone(880, 0, 0.14, 0.07);
    tone(1174.66, 0.14, 0.18, 0.07);
  },
  rush() {
    tone(988, 0, 0.09, 0.09, "square");
    tone(988, 0.12, 0.09, 0.09, "square");
    tone(1318.5, 0.24, 0.16, 0.09, "square");
  },
  warn() {
    tone(587.33, 0, 0.16, 0.06, "triangle");
  },
  late() {
    tone(311.13, 0, 0.22, 0.09, "sawtooth");
    tone(233.08, 0.24, 0.3, 0.09, "sawtooth");
  },
  bump() {
    tone(196, 0, 0.07, 0.06, "sine");
    tone(392, 0.05, 0.06, 0.045, "sine");
  },
  item() {
    tone(660, 0, 0.05, 0.035, "sine");
  },
};
