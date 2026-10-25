"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Plus, Minus, Trash2, ShoppingBag, MonitorDot, Receipt } from "lucide-react";
import { useCartStore } from "@/lib/cart-store";
import { useUIStore } from "@/lib/ui-store";
import { formatPrice } from "@/lib/cafe-data";
import { useToast } from "@/hooks/use-toast";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Order drawer — pickup ordering that lands directly on the kitchen
 * display. Checkout creates a live KDS ticket (channel WEB) and hands
 * the guest the ticket number.
 */
export function CartDrawer() {
  const open = useUIStore((s) => s.cartOpen);
  const setOpen = useUIStore((s) => s.setCartOpen);
  const openKDS = useUIStore((s) => s.openKDS);
  const { lines, add, increment, decrement, remove, clear, checkout, count, total } = useCartStore();
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [placed, setPlaced] = useState<number | null>(null);

  function handleCheckout() {
    const ticket = checkout(name.trim() || undefined);
    if (ticket) {
      setPlaced(ticket);
      toast({
        title: `Ticket #${ticket} sent to the kitchen`,
        description: "Track it live on the kitchen display.",
      });
    }
  }

  function handleClose() {
    setOpen(false);
    // keep the success panel until close animation ends, then reset
    window.setTimeout(() => setPlaced(null), 400);
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={handleClose}
            className="fixed inset-0 z-[120] bg-[#0a0807]/70 backdrop-blur-sm"
            aria-hidden
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.55, ease: EASE }}
            className="fixed inset-y-0 right-0 z-[130] flex w-full max-w-md flex-col border-l border-[#c89b6a]/20 bg-[#0d0a08]"
            role="dialog"
            aria-modal="true"
            aria-label="Your order"
          >
            {/* header */}
            <div className="flex items-center justify-between border-b border-[#c89b6a]/15 px-6 py-5">
              <div className="flex items-center gap-3">
                <span className="grid h-9 w-9 place-items-center rounded-full border border-[#c89b6a]/40 text-[#c89b6a]">
                  <ShoppingBag className="h-4 w-4" strokeWidth={1.75} />
                </span>
                <div>
                  <p className="font-display text-lg text-[#f4eddf]">Your order</p>
                  <p className="text-[0.6rem] uppercase tracking-[0.24em] text-[#a6947f]">
                    Pickup · ready in ~8 min
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleClose}
                aria-label="Close order drawer"
                className="grid h-10 w-10 place-items-center rounded-full border border-[#c89b6a]/30 text-[#f4eddf] transition-colors hover:border-[#c89b6a]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* body */}
            {placed !== null ? (
              <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
                <motion.div
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 220, damping: 18 }}
                  className="grid h-20 w-20 place-items-center rounded-full border border-[#c89b6a]/40 bg-[#c89b6a]/10 text-[#c89b6a]"
                >
                  <Receipt className="h-8 w-8" strokeWidth={1.5} />
                </motion.div>
                <p className="eyebrow mt-6">Ticket sent to the bar</p>
                <p className="font-display mt-3 text-5xl font-medium text-[#f4eddf]">
                  #{placed}
                </p>
                <p className="mt-4 max-w-xs text-sm leading-relaxed text-[#a6947f]">
                  The kitchen display is already lighting up. Watch your
                  ticket move from queued to ready in real time.
                </p>
                <div className="mt-8 flex w-full flex-col gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      handleClose();
                      openKDS();
                    }}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-[#c89b6a] px-6 py-4 text-xs font-bold uppercase tracking-[0.22em] text-[#14100d] transition-transform hover:scale-[1.02]"
                  >
                    <MonitorDot className="h-4 w-4" />
                    Watch it on the KDS
                  </button>
                  <button
                    type="button"
                    onClick={handleClose}
                    className="rounded-full border border-[#f4eddf]/20 px-6 py-4 text-xs font-bold uppercase tracking-[0.22em] text-[#f4eddf] transition-colors hover:border-[#e9d3a8]"
                  >
                    Keep browsing
                  </button>
                </div>
              </div>
            ) : lines.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
                <span className="grid h-16 w-16 place-items-center rounded-full border border-dashed border-[#c89b6a]/30 text-[#c89b6a]/60">
                  <ShoppingBag className="h-6 w-6" strokeWidth={1.5} />
                </span>
                <p className="font-display text-xl text-[#f4eddf]">Nothing here yet</p>
                <p className="max-w-xs text-sm leading-relaxed text-[#a6947f]">
                  Wander the menu and tap the little plus — your picks will
                  queue up here and land on the kitchen display.
                </p>
              </div>
            ) : (
              <>
                <div className="flex-1 space-y-4 overflow-y-auto px-6 py-6 [scrollbar-width:thin]">
                  {lines.map((l) => (
                    <div
                      key={l.id}
                      className="flex items-center gap-4 rounded-2xl border border-[#c89b6a]/12 bg-[#14100d]/70 p-3"
                    >
                      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl">
                        <img src={l.image} alt="" className="h-full w-full object-cover" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-display text-base text-[#f4eddf]">{l.name}</p>
                        <p className="text-xs text-[#a6947f]">${formatPrice(l.price)}</p>
                        <div className="mt-2 flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => decrement(l.id)}
                            aria-label={`Remove one ${l.name}`}
                            className="grid h-7 w-7 place-items-center rounded-full border border-[#c89b6a]/30 text-[#c89b6a] hover:bg-[#c89b6a]/10"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-6 text-center font-mono text-sm tabular-nums text-[#f4eddf]">
                            {l.qty}
                          </span>
                          <button
                            type="button"
                            onClick={() => increment(l.id)}
                            aria-label={`Add one ${l.name}`}
                            className="grid h-7 w-7 place-items-center rounded-full border border-[#c89b6a]/30 text-[#c89b6a] hover:bg-[#c89b6a]/10"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => remove(l.id)}
                            aria-label={`Remove ${l.name} entirely`}
                            className="ml-auto grid h-7 w-7 place-items-center rounded-full text-[#a6947f]/70 hover:text-[#b4543e]"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                      <p className="shrink-0 font-display text-lg text-[#e9d3a8]">
                        ${formatPrice(l.price * l.qty)}
                      </p>
                    </div>
                  ))}
                </div>

                {/* footer */}
                <div className="border-t border-[#c89b6a]/15 px-6 py-5">
                  <label htmlFor="cart-name" className="text-[0.6rem] font-bold uppercase tracking-[0.24em] text-[#a6947f]">
                    Name for the cup
                  </label>
                  <input
                    id="cart-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Amara"
                    maxLength={24}
                    className="mt-2 w-full rounded-xl border border-[#c89b6a]/25 bg-[#14100d] px-4 py-3 text-sm text-[#f4eddf] placeholder:text-[#a6947f]/50 focus:border-[#c89b6a] focus:outline-none"
                  />
                  <div className="mt-4 flex items-baseline justify-between">
                    <span className="text-xs uppercase tracking-[0.24em] text-[#a6947f]">
                      {count()} item{count() === 1 ? "" : "s"}
                    </span>
                    <span className="font-display text-2xl text-[#e9d3a8]">
                      ${formatPrice(total())}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleCheckout}
                    className="group relative mt-4 w-full overflow-hidden rounded-full bg-[#c89b6a] px-6 py-4 text-xs font-bold uppercase tracking-[0.24em] text-[#14100d] transition-transform hover:scale-[1.01]"
                  >
                    <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                    Send to the kitchen
                  </button>
                  <button
                    type="button"
                    onClick={clear}
                    className="mt-3 w-full text-center text-[0.65rem] uppercase tracking-[0.2em] text-[#a6947f]/70 transition-colors hover:text-[#b4543e]"
                  >
                    Clear order
                  </button>
                </div>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
