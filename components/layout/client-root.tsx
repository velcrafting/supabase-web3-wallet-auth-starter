"use client";

import dynamic from "next/dynamic";
import { ThemeProvider, useTheme } from "next-themes";
import { useEffect } from "react";
import { siteConfig } from "@/lib/config";
import Header from "./header";
import Footer from "./footer";

const Web3Provider = dynamic(
  () => import("@/components/web3/web3-provider"),
  { ssr: false }
);

function hexToHsl(hex: string) {
  let r = 0,
    g = 0,
    b = 0;
  if (hex.length === 4) {
    r = parseInt(hex[1] + hex[1], 16);
    g = parseInt(hex[2] + hex[2], 16);
    b = parseInt(hex[3] + hex[3], 16);
  } else {
    r = parseInt(hex.slice(1, 3), 16);
    g = parseInt(hex.slice(3, 5), 16);
    b = parseInt(hex.slice(5, 7), 16);
  }
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }
  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(
    l * 100
  )}%`;
}

function ThemedLayout({ children }: { children: React.ReactNode }) {
  const { resolvedTheme } = useTheme();
  const mode = resolvedTheme === "dark" ? "dark" : "light";
  const colors = siteConfig.theme.brandColors[mode];
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--brand-primary", hexToHsl(colors.primary));
    root.style.setProperty("--brand-accent", hexToHsl(colors.accent));
    root.style.setProperty("--brand-font", siteConfig.theme.fontFamily);
  }, [colors]);
  return (
    <div className="min-h-[100dvh] flex flex-col">
      <Header />
      <main className="flex-1 pt-14 overflow-hidden">{children}</main>
      <Footer />
    </div>
  );
}

export default function ClientRoot({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme={siteConfig.theme.defaultTheme}
      enableSystem
    >
      <Web3Provider>
        <ThemedLayout>{children}</ThemedLayout>
      </Web3Provider>
    </ThemeProvider>
  );
}