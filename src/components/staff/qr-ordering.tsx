"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import {
  Check,
  Copy,
  Download,
  ExternalLink,
  Loader2,
  Printer,
  QrCode,
  ScanLine,
  ShoppingBag,
  Smartphone,
} from "lucide-react";
import QRCode from "qrcode";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const TABLES = Array.from({ length: 12 }, (_, i) => i + 1);
const SIZES = [
  { id: "s", label: "Small", px: 320 },
  { id: "m", label: "Medium", px: 512 },
  { id: "l", label: "Large", px: 768 },
] as const;

/* deterministic mock scan counts so the UI feels alive but stable */
function scansFor(table: number): number {
  return 4 + ((table * 7 + 3) % 13);
}

function tableUrl(table: number): string {
  if (typeof window === "undefined") return `https://noire.coffee/#table=${table}`;
  return `${window.location.origin}/#table=${table}`;
}

async function makeQR(text: string, px: number): Promise<string> {
  return QRCode.toDataURL(text, {
    width: px,
    margin: 2,
    errorCorrectionLevel: "M",
    color: { dark: "#14100d", light: "#f4eddf" },
  });
}

export function QrOrdering() {
  const { toast } = useToast();
  const [table, setTable] = useState(1);
  const [size, setSize] = useState<(typeof SIZES)[number]["id"]>("m");
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  const px = SIZES.find((s) => s.id === size)!.px;
  const url = useMemo(() => tableUrl(table), [table]);

  useEffect(() => {
    let alive = true;
    setDataUrl(null);
    makeQR(url, px).then((d) => {
      if (alive) setDataUrl(d);
    });
    return () => {
      alive = false;
    };
  }, [url, px]);

  function download() {
    if (!dataUrl) return;
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `noire-table-${String(table).padStart(2, "0")}.png`;
    a.click();
    toast({
      title: "QR card downloaded",
      description: `Table ${table} — drop it into a stand and you're live.`,
    });
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
      toast({ title: "Link copied", description: url });
    } catch {
      toast({
        title: "Couldn't copy",
        description: "Your browser blocked clipboard access.",
        variant: "destructive",
      });
    }
  }

  async function printSheet(tables: number[]) {
    setBusy(true);
    try {
      const urls = await Promise.all(
        tables.map(async (t) => ({
          t,
          src: await makeQR(tableUrl(t), 420),
        }))
      );
      const w = window.open("", "_blank", "width=900,height=1200");
      if (!w) {
        toast({
          title: "Popup blocked",
          description: "Allow popups to print QR table cards.",
          variant: "destructive",
        });
        return;
      }
      const cards = urls
        .map(
          ({ t, src }) => `
          <figure>
            <img src="${src}" alt="Table ${t} QR" />
            <figcaption>
              <strong>NOIRÉ · Table ${String(t).padStart(2, "0")}</strong>
              <span>Scan to order at your table</span>
            </figcaption>
          </figure>`
        )
        .join("");
      w.document.write(`<!doctype html><html><head><title>NOIRÉ — QR table cards</title>
        <style>
          body{font-family:Georgia,serif;background:#f4eddf;color:#14100d;margin:0;padding:32px;}
          h1{letter-spacing:.14em;font-size:20px;text-transform:uppercase;text-align:center;margin:0 0 4px;}
          p.sub{text-align:center;color:#7d6b55;font-size:12px;margin:0 0 28px;letter-spacing:.2em;text-transform:uppercase;}
          .grid{display:grid;grid-template-columns:repeat(3,1fr);gap:22px;}
          figure{margin:0;background:#fff;border:1px solid #d8ccb8;border-radius:14px;padding:18px;text-align:center;page-break-inside:avoid;}
          img{width:70%;max-width:220px;image-rendering:pixelated;}
          figcaption{margin-top:10px;display:flex;flex-direction:column;gap:2px;}
          figcaption strong{font-size:14px;letter-spacing:.08em;}
          figcaption span{font-size:10px;color:#7d6b55;letter-spacing:.12em;text-transform:uppercase;}
          @media print{ body{padding:0;background:#fff;} }
        </style></head><body>
        <h1>NOIRÉ · QR Table Cards</h1>
        <p class="sub">Print · trim · stand them up — guests scan and order</p>
        <div class="grid">${cards}</div>
        <script>window.onload=function(){setTimeout(function(){window.print();},350);}<\/script>
        </body></html>`);
      w.document.close();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow">QR table ordering</p>
        <h2 className="font-display mt-2 text-3xl font-medium text-[#f4eddf] sm:text-4xl">
          Every table, one scan away.
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#a6947f]">
          Generate a branded code per table. Guests scan, land on the menu with
          their table locked in, and their tickets arrive on the kitchen display
          tagged with the table number — no app, no queue at the counter.
        </p>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_1.1fr]">
        {/* ——— controls ——— */}
        <section className="rounded-2xl border border-[#c89b6a]/15 bg-[#14100d]/70 p-5 sm:p-6">
          <h3 className="font-display text-lg text-[#f4eddf]">1 · Pick the table</h3>
          <div className="mt-4 grid grid-cols-4 gap-2 sm:grid-cols-6 xl:grid-cols-4">
            {TABLES.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTable(t)}
                aria-pressed={table === t}
                className={cn(
                  "group relative grid h-14 place-items-center rounded-xl border font-mono text-sm font-bold transition-all duration-200",
                  table === t
                    ? "border-[#c89b6a] bg-[#c89b6a] text-[#14100d] shadow-[0_8px_24px_-8px_rgba(200,155,106,0.6)]"
                    : "border-[#c89b6a]/20 bg-[#0d0a08] text-[#a6947f] hover:border-[#c89b6a]/60 hover:text-[#e9d3a8]"
                )}
              >
                {String(t).padStart(2, "0")}
                {scansFor(t) > 10 && (
                  <span
                    className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full border-2 border-[#14100d] bg-[#5f9c74]"
                    title="Busy table today"
                  />
                )}
              </button>
            ))}
          </div>

          <h3 className="font-display mt-7 text-lg text-[#f4eddf]">2 · Card size</h3>
          <div className="mt-3 flex gap-2">
            {SIZES.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setSize(s.id)}
                aria-pressed={size === s.id}
                className={cn(
                  "flex-1 rounded-xl border px-3 py-2.5 text-[0.62rem] font-bold uppercase tracking-[0.18em] transition-colors",
                  size === s.id
                    ? "border-[#c89b6a] bg-[#c89b6a]/15 text-[#e9d3a8]"
                    : "border-[#c89b6a]/20 text-[#a6947f] hover:border-[#c89b6a]/50"
                )}
              >
                {s.label}
                <span className="mt-0.5 block font-mono text-[0.55rem] normal-case tracking-normal text-[#5c5142]">
                  {s.px}px
                </span>
              </button>
            ))}
          </div>

          <h3 className="font-display mt-7 text-lg text-[#f4eddf]">3 · Ship it</h3>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={download}
              disabled={!dataUrl}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#c89b6a] px-4 py-3 text-[0.62rem] font-bold uppercase tracking-[0.18em] text-[#14100d] transition-transform hover:scale-[1.02] disabled:opacity-50"
            >
              <Download className="h-4 w-4" />
              PNG
            </button>
            <button
              type="button"
              onClick={copyLink}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#c89b6a]/35 px-4 py-3 text-[0.62rem] font-bold uppercase tracking-[0.18em] text-[#e9d3a8] transition-colors hover:border-[#c89b6a]"
            >
              {copied ? <Check className="h-4 w-4 text-[#8fc9a1]" /> : <Copy className="h-4 w-4" />}
              {copied ? "Copied" : "Copy link"}
            </button>
            <button
              type="button"
              onClick={() => printSheet([table])}
              disabled={busy}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#c89b6a]/35 px-4 py-3 text-[0.62rem] font-bold uppercase tracking-[0.18em] text-[#e9d3a8] transition-colors hover:border-[#c89b6a] disabled:opacity-50"
            >
              <Printer className="h-4 w-4" />
              Print card
            </button>
            <button
              type="button"
              onClick={() => printSheet(TABLES)}
              disabled={busy}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#c89b6a]/35 px-4 py-3 text-[0.62rem] font-bold uppercase tracking-[0.18em] text-[#e9d3a8] transition-colors hover:border-[#c89b6a] disabled:opacity-50"
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Printer className="h-4 w-4" />}
              All 12
            </button>
          </div>
        </section>

        {/* ——— preview ——— */}
        <section className="relative overflow-hidden rounded-2xl border border-[#c89b6a]/15 bg-gradient-to-b from-[#1c1611] to-[#14100d] p-6 sm:p-8">
          <div
            className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-[#c89b6a]/10 blur-[70px]"
            aria-hidden
          />
          <div className="flex items-center justify-between">
            <h3 className="font-display text-lg text-[#f4eddf]">Live preview</h3>
            <span className="rounded-full border border-[#c89b6a]/35 px-3 py-1 font-mono text-[0.58rem] uppercase tracking-widest text-[#c89b6a]">
              Table {String(table).padStart(2, "0")}
            </span>
          </div>

          <div className="mt-6 flex justify-center">
            <div className="shine relative w-full max-w-[260px] rounded-[1.4rem] border border-[#c89b6a]/30 bg-[#f4eddf] p-5 text-center shadow-[0_40px_80px_-30px_rgba(0,0,0,0.9)]">
              <p className="font-display text-sm font-semibold tracking-[0.22em] text-[#14100d]">
                NOIRÉ<span className="text-[#9a7248]">.</span>
              </p>
              <p className="mt-0.5 text-[0.55rem] font-bold uppercase tracking-[0.3em] text-[#9a7248]">
                Table {String(table).padStart(2, "0")} · Scan to order
              </p>
              <div className="mt-4 grid min-h-[190px] place-items-center">
                {dataUrl ? (
                   
                  <img
                    src={dataUrl}
                    alt={`QR code linking to the NOIRÉ menu for table ${table}`}
                    className="w-full max-w-[190px] rounded-lg"
                  />
                ) : (
                  <Loader2 className="h-6 w-6 animate-spin text-[#9a7248]" />
                )}
              </div>
              <p className="mt-3 border-t border-[#14100d]/15 pt-3 text-[0.6rem] font-semibold uppercase tracking-[0.2em] text-[#7d6b55]">
                Fresh coffee, zero queue
              </p>
            </div>
          </div>

          <p className="mt-5 break-all rounded-xl border border-[#c89b6a]/15 bg-[#0d0a08] px-4 py-2.5 text-center font-mono text-[0.62rem] text-[#a6947f]">
            {url}
          </p>

          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            {[
              { icon: ScanLine, k: "Scans today", v: String(scansFor(table)) },
              { icon: Smartphone, k: "Orders from QR", v: String(2 + (table % 5)) },
              { icon: ExternalLink, k: "Lands on", v: "Menu · locked" },
            ].map((s) => (
              <div key={s.k} className="rounded-xl border border-[#c89b6a]/15 bg-[#0d0a08]/70 px-2 py-3">
                <s.icon className="mx-auto h-4 w-4 text-[#c89b6a]" />
                <p className="mt-1.5 font-mono text-sm font-bold text-[#ece4d4]">{s.v}</p>
                <p className="text-[0.52rem] font-bold uppercase tracking-[0.16em] text-[#5c5142]">
                  {s.k}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* ——— how it works ——— */}
      <section className="rounded-2xl border border-[#c89b6a]/15 bg-[#14100d]/70 p-5 sm:p-6">
        <h3 className="font-display text-lg text-[#f4eddf]">How the loop works</h3>
        <ol className="mt-5 grid gap-4 sm:grid-cols-3">
          {[
            {
              icon: QrCode,
              t: "Guest scans",
              d: "The table card opens the NOIRÉ menu with the table number locked in — no typing, no app.",
            },
            {
              icon: ShoppingBag,
              t: "Order lands on the KDS",
              d: "A purple QR ticket with the table tag appears on the kitchen board the second it's sent.",
            },
            {
              icon: Check,
              t: "You bump it ready",
              d: "Run the ticket like any other — the guest sees their number rise on the board from their seat.",
            },
          ].map((s, i) => (
            <li key={s.t} className="relative rounded-xl border border-[#c89b6a]/15 bg-[#0d0a08]/70 p-5">
              <span className="absolute right-4 top-3 font-display text-3xl font-light text-[#f4eddf]/10">
                0{i + 1}
              </span>
              <span className="grid h-10 w-10 place-items-center rounded-xl border border-[#c89b6a]/30 bg-[#14100d] text-[#c89b6a]">
                <s.icon className="h-4.5 w-4.5" strokeWidth={1.5} />
              </span>
              <p className="font-display mt-3.5 text-base text-[#f4eddf]">{s.t}</p>
              <p className="mt-1.5 text-[0.8rem] leading-relaxed text-[#a6947f]">{s.d}</p>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
