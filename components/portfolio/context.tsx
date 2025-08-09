// components/portfolio/context.tsx
"use client";
import { createContext, useContext } from "react";
import type { PortfolioParams } from "./types";

const Ctx = createContext<PortfolioParams | null>(null);

export function PortfolioProvider({
  value,
  children,
}: {
  value: PortfolioParams;
  children: React.ReactNode;
}) {
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function usePortfolio() {
  const v = useContext(Ctx);
  if (!v) throw new Error("PortfolioProvider missing");
  return v;
}
