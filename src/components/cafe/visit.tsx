"use client";

import { useState, useEffect, type FormEvent } from "react";
import {
  motion,
  useScroll,
  useMotionValueEvent,
  AnimatePresence,
} from "framer-motion";
import {
  MapPin,
  Clock,
  Phone,
  Mail,
  Instagram,
  Facebook,
  Twitter,
  ArrowUp,
  ArrowUpRight,
  Send,
  CheckCircle2,
  ChefHat,
  Coffee,
  QrCode,
} from "lucide-react";
import { SectionHeading } from "./section-heading";
import { Reveal } from "./reveal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useUIStore } from "@/lib/ui-store";

const HOURS = [
  { days: "Monday — Friday", time: "07:00 — 19:00" },
  { days: "Saturday", time: "08:00 — 20:00" },
  { days: "Sunday", time: "08:00 — 17:00" },
];

const TIME_SLOTS = [
  "08:00", "09:30", "11:00", "12:30", "14:00", "15:30", "17:00", "18:30",
];

function BackToTop() {
  const [show, setShow] = useState(false);
  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, "change", (y) => setShow(y > 900));

  return (
    <AnimatePresence>
      {show && (
        <motion.button
          initial={{ opacity: 0, y: 16, scale: 0.85 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.85 }}
          transition={{ duration: 0.3 }}
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="Back to top"
          className="glass fixed bottom-6 right-6 z-40 grid h-12 w-12 place-items-center rounded-full text-[#e9d3a8] transition-all duration-300 hover:border-[#c89b6a] hover:bg-[#c89b6a] hover:text-[#14100d]"
        >
          <ArrowUp className="h-5 w-5" strokeWidth={1.75} />
        </motion.button>
      )}
    </AnimatePresence>
  );
}

export function Visit() {
  const { toast } = useToast();
  const openStaff = useUIStore((s) => s.openStaff);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  /* v5 — live open/closed pill (client-only so SSR markup stays stable) */
  const [openNow, setOpenNow] = useState<boolean | null>(null);
  useEffect(() => {
    // deferred so the effect body never sets state synchronously
    const t = window.setTimeout(() => {
      const d = new Date();
      const day = d.getDay(); // 0 = Sunday
      const h = d.getHours();
      const open =
        day === 0 ? h >= 8 && h < 17 : day === 6 ? h >= 8 && h < 20 : h >= 7 && h < 19;
      setOpenNow(open);
    }, 0);
    return () => window.clearTimeout(t);
  }, []);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [guests, setGuests] = useState("");

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !date || !time || !guests) {
      toast({
        title: "Almost there",
        description: "Please fill every field so we can hold the right table.",
        variant: "destructive",
      });
      return;
    }
    setSubmitting(true);
    // simulate maître d' confirmation
    setTimeout(() => {
      setSubmitting(false);
      setDone(true);
      toast({
        title: "Table held for you",
        description: `${name.trim().split(" ")[0]}, we'll see you ${date} at ${time} — party of ${guests}. Confirmation sent to ${email.trim()}.`,
      });
    }, 900);
  }

  return (
    <section
      id="visit"
      className="relative overflow-hidden py-24 sm:py-32 lg:py-40"
      aria-labelledby="visit-heading"
    >
      <div
        className="pointer-events-none absolute -right-40 bottom-0 h-[460px] w-[460px] rounded-full bg-[#c89b6a]/6 blur-[130px]"
        aria-hidden
      />

      <div className="mx-auto w-full max-w-7xl px-5 sm:px-8">
        <SectionHeading
          id="visit-heading"
          eyebrow="Find Us"
          title={
            <>
              The kettle is on.{" "}
              <em className="text-gold-gradient font-light italic">
                Come sit.
              </em>
            </>
          }
          description="We hold a few tables back every day for walk-ins, but the window seats go fast. Reserve yours, or just follow the smell of fresh roast down Roaster's Lane."
        />

        <div className="mt-16 grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
          {/* ——— Info column ——— */}
          <div className="space-y-5">
            <Reveal direction="right">
              <div className="group overflow-hidden rounded-3xl border border-[#c89b6a]/15 bg-[#14100d]/70 transition-colors duration-500 hover:border-[#c89b6a]/40">
                {/* v5 — stylized house map, drawn in CSS */}
                <div className="relative h-44 overflow-hidden border-b border-[#c89b6a]/10" aria-hidden>
                  <div className="absolute inset-0 bg-[#0d0a08]" />
                  {/* streets */}
                  <div className="absolute -inset-x-8 top-[30%] h-[2px] rotate-[9deg] bg-[#241b12]" />
                  <div className="absolute -inset-x-8 top-[64%] h-[3px] -rotate-[5deg] bg-[#2b2115]" />
                  <div className="absolute -inset-y-8 left-[26%] w-[2px] rotate-[12deg] bg-[#241b12]" />
                  <div className="absolute -inset-y-8 left-[74%] w-[3px] -rotate-[8deg] bg-[#2b2115]" />
                  {/* Roaster's Lane highlight */}
                  <div className="absolute left-0 top-[46%] h-px w-full bg-gradient-to-r from-transparent via-[#c89b6a]/40 to-transparent" />
                  {/* city blocks */}
                  <div className="absolute left-[12%] top-[14%] h-10 w-14 rounded-md border border-[#c89b6a]/10 bg-[#16110d]" />
                  <div className="absolute left-[32%] top-[66%] h-9 w-16 rounded-md border border-[#c89b6a]/10 bg-[#16110d]" />
                  <div className="absolute right-[8%] top-[12%] h-12 w-12 rounded-md border border-[#c89b6a]/10 bg-[#16110d]" />
                  {/* the pin */}
                  <div className="absolute left-[58%] top-[36%]">
                    <span className="absolute -inset-4 animate-ping rounded-full bg-[#c89b6a]/20" />
                    <span className="absolute -inset-1.5 rounded-full border border-[#c89b6a]/40" />
                    <span className="grid h-9 w-9 place-items-center rounded-full bg-[#c89b6a] text-[#14100d] shadow-[0_10px_30px_rgba(200,155,106,0.45)]">
                      <MapPin className="h-4 w-4" strokeWidth={2} />
                    </span>
                  </div>
                  <span className="absolute bottom-3 left-5 font-mono text-[0.55rem] uppercase tracking-[0.3em] text-[#a6947f]/80">
                    Old Mill District · PDX
                  </span>
                  <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-[#14100d] to-transparent" />
                </div>

                <div className="p-8 sm:p-9">
                  <div className="flex items-start gap-5">
                    <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-[#c89b6a]/25 bg-[#1c1611] text-[#c89b6a]">
                      <MapPin className="h-5 w-5" strokeWidth={1.5} />
                    </span>
                    <div>
                      <h3 className="font-display text-xl font-medium text-[#f4eddf]">
                        The House
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-[#a6947f]">
                        128 Roaster&apos;s Lane, Old Mill District
                        <br />
                        Portland, OR 97209
                      </p>
                      <a
                        href="https://maps.google.com/?q=Portland+OR"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.18em] text-[#c89b6a] transition-colors hover:text-[#e9d3a8]"
                      >
                        Get directions
                        <Send className="h-3 w-3" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>

            <Reveal direction="right" delay={0.1}>
              <div className="rounded-3xl border border-[#c89b6a]/15 bg-[#14100d]/70 p-8 sm:p-9">
                <div className="flex items-start gap-5">
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-[#c89b6a]/25 bg-[#1c1611] text-[#c89b6a]">
                    <Clock className="h-5 w-5" strokeWidth={1.5} />
                  </span>
                  <div className="w-full">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <h3 className="font-display text-xl font-medium text-[#f4eddf]">
                        Pouring Hours
                      </h3>
                      {openNow !== null && (
                        <span
                          className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-[0.58rem] font-bold uppercase tracking-[0.22em] ${
                            openNow
                              ? "border-[#8fbf8f]/35 bg-[#8fbf8f]/10 text-[#b8d8b8]"
                              : "border-[#c89b6a]/25 bg-[#14100d] text-[#a6947f]"
                          }`}
                          role="status"
                        >
                          <span className="relative flex h-1.5 w-1.5">
                            {openNow && (
                              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#8fbf8f] opacity-60" />
                            )}
                            <span
                              className={`relative inline-flex h-1.5 w-1.5 rounded-full ${
                                openNow ? "bg-[#8fbf8f]" : "bg-[#6b5a48]"
                              }`}
                            />
                          </span>
                          {openNow ? "Open now" : "Closed — see hours"}
                        </span>
                      )}
                    </div>
                    <dl className="mt-3 space-y-2.5">
                      {HOURS.map((h) => (
                        <div
                          key={h.days}
                          className="flex items-baseline justify-between gap-4 text-sm"
                        >
                          <dt className="text-[#a6947f]">{h.days}</dt>
                          <dd className="font-mono text-xs tracking-wide text-[#e9d3a8]">
                            {h.time}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                </div>
              </div>
            </Reveal>

            <Reveal direction="right" delay={0.2}>
              <div className="grid gap-5 sm:grid-cols-2">
                <a
                  href="tel:+15035550164"
                  className="group rounded-3xl border border-[#c89b6a]/15 bg-[#14100d]/70 p-6 transition-colors duration-300 hover:border-[#c89b6a]/45"
                >
                  <Phone className="h-5 w-5 text-[#c89b6a]" strokeWidth={1.5} />
                  <p className="mt-4 text-[0.62rem] font-bold uppercase tracking-[0.24em] text-[#a6947f]">
                    Call the bar
                  </p>
                  <p className="mt-1.5 text-sm font-semibold text-[#f4eddf] transition-colors group-hover:text-[#e9d3a8]">
                    (503) 555-0164
                  </p>
                </a>
                <a
                  href="mailto:hello@noire.coffee"
                  className="group rounded-3xl border border-[#c89b6a]/15 bg-[#14100d]/70 p-6 transition-colors duration-300 hover:border-[#c89b6a]/45"
                >
                  <Mail className="h-5 w-5 text-[#c89b6a]" strokeWidth={1.5} />
                  <p className="mt-4 text-[0.62rem] font-bold uppercase tracking-[0.24em] text-[#a6947f]">
                    Write to us
                  </p>
                  <p className="mt-1.5 text-sm font-semibold text-[#f4eddf] transition-colors group-hover:text-[#e9d3a8]">
                    hello@noire.coffee
                  </p>
                </a>
              </div>
            </Reveal>
          </div>

          {/* ——— Reservation form ——— */}
          <Reveal direction="left" delay={0.1}>
            <div className="relative overflow-hidden rounded-[2rem] border border-[#c89b6a]/25 bg-gradient-to-b from-[#1c1611] to-[#14100d] p-8 shadow-[0_50px_100px_-40px_rgba(0,0,0,0.9)] sm:p-10">
              <div
                className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-[#c89b6a]/10 blur-[80px]"
                aria-hidden
              />

              <div className="flex items-center justify-between gap-4">
                <h3 className="font-display text-2xl font-medium text-[#f4eddf] sm:text-3xl">
                  Reserve a table
                </h3>
                <span className="hidden rounded-full border border-[#c89b6a]/35 px-4 py-1.5 text-[0.6rem] font-bold uppercase tracking-[0.22em] text-[#c89b6a] sm:block">
                  No deposit
                </span>
              </div>
              <p className="mt-2 text-sm text-[#a6947f]">
                We&apos;ll hold your table for 15 minutes past the hour.
              </p>

              {done ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.94 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  className="mt-10 flex flex-col items-center rounded-3xl border border-[#c89b6a]/30 bg-[#14100d]/80 px-8 py-14 text-center"
                >
                  <span className="grid h-16 w-16 place-items-center rounded-full bg-[#c89b6a]/15 text-[#c89b6a]">
                    <CheckCircle2 className="h-8 w-8" strokeWidth={1.5} />
                  </span>
                  <p className="font-display mt-6 text-2xl font-medium text-[#f4eddf]">
                    See you soon, {name.trim().split(" ")[0]}.
                  </p>
                  <p className="mt-3 max-w-sm text-sm leading-relaxed text-[#a6947f]">
                    {date} at {time} · party of {guests}. A confirmation is on
                    its way to {email.trim()} — reply if anything changes.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setDone(false);
                      setName("");
                      setEmail("");
                      setDate("");
                      setTime("");
                      setGuests("");
                    }}
                    className="mt-8 rounded-full border-[#c89b6a]/40 bg-transparent text-xs font-bold uppercase tracking-[0.2em] text-[#e9d3a8] hover:border-[#c89b6a] hover:bg-[#c89b6a] hover:text-[#14100d]"
                  >
                    Book another
                  </Button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="mt-8 space-y-6" noValidate>
                  <div className="grid gap-6 sm:grid-cols-2">
                    <div className="space-y-2.5">
                      <Label htmlFor="res-name" className="text-[0.65rem] font-bold uppercase tracking-[0.22em] text-[#a6947f]">
                        Name
                      </Label>
                      <Input
                        id="res-name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Ada Marlowe"
                        autoComplete="name"
                        className="h-12 rounded-xl border-[#c89b6a]/25 bg-[#0a0807]/60 text-sm text-[#f4eddf] placeholder:text-[#a6947f]/50 focus-visible:ring-[#c89b6a]/50"
                      />
                    </div>
                    <div className="space-y-2.5">
                      <Label htmlFor="res-email" className="text-[0.65rem] font-bold uppercase tracking-[0.22em] text-[#a6947f]">
                        Email
                      </Label>
                      <Input
                        id="res-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        autoComplete="email"
                        className="h-12 rounded-xl border-[#c89b6a]/25 bg-[#0a0807]/60 text-sm text-[#f4eddf] placeholder:text-[#a6947f]/50 focus-visible:ring-[#c89b6a]/50"
                      />
                    </div>
                  </div>

                  <div className="grid gap-6 sm:grid-cols-3">
                    <div className="space-y-2.5">
                      <Label htmlFor="res-date" className="text-[0.65rem] font-bold uppercase tracking-[0.22em] text-[#a6947f]">
                        Date
                      </Label>
                      <Input
                        id="res-date"
                        type="date"
                        value={date}
                        min={new Date().toISOString().split("T")[0]}
                        onChange={(e) => setDate(e.target.value)}
                        className="h-12 rounded-xl border-[#c89b6a]/25 bg-[#0a0807]/60 text-sm text-[#f4eddf] focus-visible:ring-[#c89b6a]/50 [color-scheme:dark]"
                      />
                    </div>
                    <div className="space-y-2.5">
                      <Label className="text-[0.65rem] font-bold uppercase tracking-[0.22em] text-[#a6947f]">
                        Time
                      </Label>
                      <Select value={time} onValueChange={setTime}>
                        <SelectTrigger
                          className="h-12 w-full rounded-xl border-[#c89b6a]/25 bg-[#0a0807]/60 text-sm text-[#f4eddf] focus:ring-[#c89b6a]/50"
                          aria-label="Select time"
                        >
                          <SelectValue placeholder="—" />
                        </SelectTrigger>
                        <SelectContent className="border-[#c89b6a]/25 bg-[#181310] text-[#f4eddf]">
                          {TIME_SLOTS.map((t) => (
                            <SelectItem
                              key={t}
                              value={t}
                              className="focus:bg-[#c89b6a] focus:text-[#14100d]"
                            >
                              {t}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2.5">
                      <Label className="text-[0.65rem] font-bold uppercase tracking-[0.22em] text-[#a6947f]">
                        Guests
                      </Label>
                      <Select value={guests} onValueChange={setGuests}>
                        <SelectTrigger
                          className="h-12 w-full rounded-xl border-[#c89b6a]/25 bg-[#0a0807]/60 text-sm text-[#f4eddf] focus:ring-[#c89b6a]/50"
                          aria-label="Select guest count"
                        >
                          <SelectValue placeholder="—" />
                        </SelectTrigger>
                        <SelectContent className="border-[#c89b6a]/25 bg-[#181310] text-[#f4eddf]">
                          {["1", "2", "3", "4", "5", "6+"].map((g) => (
                            <SelectItem
                              key={g}
                              value={g}
                              className="focus:bg-[#c89b6a] focus:text-[#14100d]"
                            >
                              {g}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={submitting}
                    className="group relative h-14 w-full overflow-hidden rounded-full bg-[#c89b6a] text-xs font-bold uppercase tracking-[0.24em] text-[#14100d] transition-transform duration-300 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-70"
                  >
                    <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                    {submitting ? "Holding your table…" : "Hold my table"}
                  </Button>
                </form>
              )}
            </div>
          </Reveal>
        </div>
      </div>

      {/* ——— Staff portal strip: the house runs on rails ——— */}
      <div className="mx-auto w-full max-w-7xl px-5 pb-20 sm:px-8">
        <Reveal>
          <button
            type="button"
            onClick={openStaff}
            data-cursor="Enter"
            className="group relative flex w-full flex-col gap-6 overflow-hidden rounded-3xl border border-[#c89b6a]/20 bg-gradient-to-br from-[#171210] via-[#100d0a] to-[#0a0807] p-7 text-left transition-colors duration-500 hover:border-[#c89b6a]/50 sm:p-9 lg:flex-row lg:items-center lg:justify-between"
          >
            <span
              className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-[#c89b6a]/10 blur-[90px] transition-opacity duration-700 group-hover:opacity-100 sm:opacity-60"
              aria-hidden
            />
            <div className="relative flex items-start gap-5">
              <span className="hidden h-14 w-14 shrink-0 place-items-center rounded-2xl border border-[#c89b6a]/35 bg-[#14100d] text-[#c89b6a] transition-transform duration-500 group-hover:scale-105 sm:grid">
                <ChefHat className="h-6 w-6" strokeWidth={1.5} />
              </span>
              <div>
                <p className="flex items-center gap-2 text-[0.6rem] font-bold uppercase tracking-[0.28em] text-[#c89b6a]">
                  Staff access
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute h-full w-full animate-ping rounded-full bg-[#7da26b] opacity-70" />
                    <span className="relative h-1.5 w-1.5 rounded-full bg-[#7da26b]" />
                  </span>
                </p>
                <p className="font-display mt-2 text-2xl font-medium leading-snug text-[#f4eddf] sm:text-[1.75rem]">
                  Running the floor? Enter the{" "}
                  <em className="text-gold-gradient font-light italic">Staff Portal</em>
                </p>
                <p className="mt-2 max-w-xl text-sm leading-relaxed text-[#a6947f]">
                  Kitchen display, QR table ordering, live tickets and menu control —
                  one sign-in for the whole shift.
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  {["Live KDS board", "QR ordering", "Ticket log", "Menu manager"].map((c) => (
                    <span
                      key={c}
                      className="rounded-full border border-[#c89b6a]/20 bg-[#14100d]/60 px-3 py-1.5 text-[0.58rem] font-bold uppercase tracking-[0.18em] text-[#a6947f]"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <span className="relative inline-flex shrink-0 items-center gap-3 self-start rounded-full bg-[#c89b6a] px-7 py-4 text-[0.65rem] font-bold uppercase tracking-[0.24em] text-[#14100d] transition-transform duration-300 group-hover:scale-[1.03] group-active:scale-[0.98] lg:self-center">
              <QrCode className="h-4 w-4" strokeWidth={2} />
              Staff sign-in
              <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </span>
          </button>
        </Reveal>
      </div>

      <BackToTop />
    </section>
  );
}

export function Footer() {
  const { toast } = useToast();
  const [nl, setNl] = useState("");
  const openKDS = useUIStore((s) => s.openKDS);
  const openStaff = useUIStore((s) => s.openStaff);
  const setCartOpen = useUIStore((s) => s.setCartOpen);

  return (
    <footer className="relative mt-auto border-t border-[#c89b6a]/15 bg-[#080605]">
      <div className="mx-auto w-full max-w-7xl px-5 py-16 sm:px-8 sm:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.3fr_1fr_1fr]">
          {/* Brand + newsletter */}
          <div>
            <a href="#top" className="flex items-center gap-2.5" aria-label="NOIRÉ home">
              <span className="grid h-9 w-9 place-items-center rounded-full border border-[#c89b6a]/40 bg-[#14100d] text-[#c89b6a]">
                <Coffee className="h-4 w-4" strokeWidth={1.75} />
              </span>
              <span className="font-display text-xl font-semibold tracking-[0.18em] text-[#f4eddf]">
                NOIRÉ<span className="text-[#c89b6a]">.</span>
              </span>
            </a>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-[#a6947f]">
              A sanctuary for slow mornings and honest craft. Roasted, poured
              and baked under one roof since 2016.
            </p>
            <form
              className="mt-7 flex max-w-sm gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                if (!nl.includes("@")) {
                  toast({
                    title: "That email looks off",
                    description: "Double-check it and try again?",
                    variant: "destructive",
                  });
                  return;
                }
                toast({
                  title: "Welcome to the inner circle",
                  description: "First pour notes and roast drops land monthly.",
                });
                setNl("");
              }}
            >
              <label htmlFor="newsletter" className="sr-only">
                Email for the newsletter
              </label>
              <Input
                id="newsletter"
                type="email"
                value={nl}
                onChange={(e) => setNl(e.target.value)}
                placeholder="Email for roast drops"
                className="h-11 rounded-full border-[#c89b6a]/25 bg-[#14100d]/70 text-sm text-[#f4eddf] placeholder:text-[#a6947f]/50 focus-visible:ring-[#c89b6a]/50"
              />
              <Button
                type="submit"
                size="icon"
                aria-label="Subscribe"
                className="h-11 w-11 shrink-0 rounded-full bg-[#c89b6a] text-[#14100d] hover:bg-[#e9d3a8]"
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>

          {/* Explore */}
          <nav aria-label="Footer">
            <h3 className="text-[0.65rem] font-bold uppercase tracking-[0.3em] text-[#c89b6a]">
              Explore
            </h3>
            <ul className="mt-5 space-y-3.5">
              {[
                { label: "The Craft", href: "#craft" },
                { label: "Menu", href: "#menu" },
                { label: "The Space", href: "#space" },
                { label: "Reviews", href: "#reviews" },
                { label: "Reservations", href: "#visit" },
              ].map((l) => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    className="text-sm text-[#a6947f] transition-colors duration-300 hover:text-[#e9d3a8]"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
              <li>
                <button
                  type="button"
                  onClick={() => setCartOpen(true)}
                  className="text-sm text-[#a6947f] transition-colors duration-300 hover:text-[#e9d3a8]"
                >
                  Order pickup
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={openKDS}
                  className="group flex items-center gap-2 text-sm text-[#a6947f] transition-colors duration-300 hover:text-[#e9d3a8]"
                >
                  Kitchen Display (KDS)
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute h-full w-full animate-ping rounded-full bg-[#7da26b] opacity-70" />
                    <span className="relative h-1.5 w-1.5 rounded-full bg-[#7da26b]" />
                  </span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={openStaff}
                  className="text-sm text-[#a6947f] transition-colors duration-300 hover:text-[#e9d3a8]"
                >
                  Staff Portal
                </button>
              </li>
            </ul>
          </nav>

          {/* Connect */}
          <div>
            <h3 className="text-[0.65rem] font-bold uppercase tracking-[0.3em] text-[#c89b6a]">
              Connect
            </h3>
            <ul className="mt-5 space-y-3.5">
              {[
                { icon: Instagram, label: "Instagram", handle: "@noire.coffee" },
                { icon: Facebook, label: "Facebook", handle: "NOIRÉ Coffee House" },
                { icon: Twitter, label: "Twitter", handle: "@noirecoffee" },
              ].map((s) => (
                <li key={s.label}>
                  <a
                    href="#top"
                    className="group flex items-center gap-3 text-sm text-[#a6947f] transition-colors duration-300 hover:text-[#e9d3a8]"
                  >
                    <span className="grid h-9 w-9 place-items-center rounded-full border border-[#c89b6a]/25 transition-all duration-300 group-hover:border-[#c89b6a] group-hover:bg-[#c89b6a] group-hover:text-[#14100d]">
                      <s.icon className="h-4 w-4" strokeWidth={1.5} />
                    </span>
                    <span>
                      <span className="block font-semibold text-[#f4eddf]">
                        {s.label}
                      </span>
                      <span className="text-xs">{s.handle}</span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Giant wordmark */}
        <div className="mt-16 select-none overflow-hidden border-t border-[#c89b6a]/10 pt-10" aria-hidden>
          <p className="font-display text-center text-[clamp(4rem,14vw,11rem)] font-semibold leading-none tracking-[0.08em] text-[#f4eddf]/5">
            NOIRÉ
          </p>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-4 text-xs text-[#a6947f]/70 sm:flex-row">
          <p>© {new Date().getFullYear()} NOIRÉ Coffee House. Brewed with patience.</p>
          <p className="font-mono tracking-wider">
            45.5152° N · 122.6784° W
          </p>
        </div>
      </div>
    </footer>
  );
}
