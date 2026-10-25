"use client";

import { useEffect, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useScroll,
} from "framer-motion";
import { Coffee, Menu, X, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const LINKS = [
  { label: "The Craft", href: "#craft" },
  { label: "Menu", href: "#menu" },
  { label: "The Space", href: "#space" },
  { label: "Reviews", href: "#reviews" },
  { label: "Find Us", href: "#visit" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);
  const { scrollY, scrollYProgress } = useScroll();

  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    setScrolled(y > 24);
    // hide when scrolling down past hero, show when scrolling up
    setHidden(y > prev && y > 480 && !open);
  });

  // lock body scroll when mobile menu open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: hidden ? -110 : 0, opacity: 1 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-[background,border-color,padding] duration-500",
          scrolled
            ? "glass border-b py-3"
            : "border-b border-transparent bg-transparent py-5"
        )}
      >
        {/* scroll progress */}
        <motion.span
          style={{ scaleX: scrollYProgress }}
          className="absolute inset-x-0 top-0 h-[2px] origin-left bg-gradient-to-r from-[#9a7248] via-[#e9d3a8] to-[#c89b6a]"
          aria-hidden
        />

        <nav
          className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 sm:px-8"
          aria-label="Primary"
        >
          {/* Brand */}
          <a
            href="#top"
            className="group flex items-center gap-2.5"
            aria-label="NOIRÉ home"
          >
            <span className="grid h-9 w-9 place-items-center rounded-full border border-[#c89b6a]/40 bg-[#14100d]/60 text-[#c89b6a] transition-all duration-500 group-hover:rotate-[20deg] group-hover:border-[#c89b6a] group-hover:bg-[#c89b6a] group-hover:text-[#14100d]">
              <Coffee className="h-4 w-4" strokeWidth={1.75} />
            </span>
            <span className="font-display text-xl font-semibold tracking-[0.18em] text-[#f4eddf]">
              NOIRÉ<span className="text-[#c89b6a]">.</span>
            </span>
          </a>

          {/* Desktop links */}
          <ul className="hidden items-center gap-8 lg:flex">
            {LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="group relative text-[0.8rem] font-semibold uppercase tracking-[0.22em] text-[#a6947f] transition-colors duration-300 hover:text-[#f4eddf]"
                >
                  {link.label}
                  <span className="absolute -bottom-1.5 left-0 h-px w-full origin-left scale-x-0 bg-gradient-to-r from-[#c89b6a] to-[#e9d3a8] transition-transform duration-400 group-hover:scale-x-100" />
                </a>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-3">
            <Button
              asChild
              size="sm"
              className="hidden rounded-full border border-[#c89b6a]/50 bg-transparent px-6 font-body text-xs font-bold uppercase tracking-[0.2em] text-[#e9d3a8] shadow-none transition-all duration-400 hover:border-[#c89b6a] hover:bg-[#c89b6a] hover:text-[#14100d] sm:inline-flex"
            >
              <a href="#visit">
                Reserve
                <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
              </a>
            </Button>

            {/* Mobile toggle */}
            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-label="Open menu"
              aria-expanded={open}
              className="grid h-11 w-11 place-items-center rounded-full border border-[#c89b6a]/30 text-[#f4eddf] transition-colors hover:border-[#c89b6a] lg:hidden"
            >
              <Menu className="h-5 w-5" strokeWidth={1.5} />
            </button>
          </div>
        </nav>
      </motion.header>

      {/* Mobile full-screen menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="fixed inset-0 z-[60] flex flex-col bg-[#0a0807]/97 backdrop-blur-2xl lg:hidden"
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
          >
            <div className="flex items-center justify-between px-5 py-5 sm:px-8">
              <span className="font-display text-xl font-semibold tracking-[0.18em] text-[#f4eddf]">
                NOIRÉ<span className="text-[#c89b6a]">.</span>
              </span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="grid h-11 w-11 place-items-center rounded-full border border-[#c89b6a]/30 text-[#f4eddf] transition-colors hover:border-[#c89b6a]"
              >
                <X className="h-5 w-5" strokeWidth={1.5} />
              </button>
            </div>

            <nav className="flex flex-1 flex-col justify-center px-8" aria-label="Mobile">
              <ul className="space-y-2">
                {LINKS.map((link, i) => (
                  <motion.li
                    key={link.href}
                    initial={{ opacity: 0, x: -32 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + i * 0.07, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <a
                      href={link.href}
                      onClick={() => setOpen(false)}
                      className="group flex items-baseline gap-4 py-3"
                    >
                      <span className="font-mono text-xs text-[#c89b6a]/70">
                        0{i + 1}
                      </span>
                      <span className="font-display text-4xl font-medium text-[#f4eddf] transition-colors group-hover:text-[#e9d3a8] sm:text-5xl">
                        {link.label}
                      </span>
                    </a>
                  </motion.li>
                ))}
              </ul>
            </nav>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="px-8 pb-10"
            >
              <p className="text-xs uppercase tracking-[0.3em] text-[#a6947f]">
                128 Roaster&apos;s Lane · Open daily 7–19
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
