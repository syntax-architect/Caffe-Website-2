import type { Metadata, Viewport } from "next";
import { Fraunces, Manrope, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const fraunces = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

const manrope = Manrope({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  variable: "--font-kds",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://noire.coffee"),
  title: "NOIRÉ — Artisan Coffee House",
  description:
    "A sanctuary for slow mornings and honest craft. Single-origin espresso, small-batch roasts, and patisserie baked at dawn — served in the heart of the city since 2016.",
  keywords: [
    "artisan coffee",
    "specialty cafe",
    "single origin espresso",
    "coffee house",
    "patisserie",
    "NOIRÉ",
  ],
  authors: [{ name: "NOIRÉ Coffee House" }],
  openGraph: {
    title: "NOIRÉ — Artisan Coffee House",
    description:
      "Single-origin espresso, small-batch roasts, and patisserie baked at dawn.",
    siteName: "NOIRÉ",
    type: "website",
    images: [{ url: "/images/hero-main.jpg" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "NOIRÉ — Artisan Coffee House",
    description:
      "A sanctuary for slow mornings and honest craft. Est. 2016.",
  },
};

export const viewport: Viewport = {
  themeColor: "#0A0807",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${fraunces.variable} ${manrope.variable} ${jetbrains.variable} antialiased bg-background text-foreground overflow-x-clip`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
