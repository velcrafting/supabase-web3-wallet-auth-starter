// components/portfolio/use-portfolio-params.ts
import { cache } from "react";

const isHexAddress = (s: string): s is `0x${string}` =>
  /^0x[a-fA-F0-9]{40}$/.test(s);

export type SP = { wallet?: string | string[]; page?: string; modules?: string };

export const normalizeParams = cache((sp: SP | undefined) => {
  const wallets = !sp?.wallet
    ? []
    : [...new Set((Array.isArray(sp.wallet) ? sp.wallet : sp.wallet.split(","))
        .map(w => w.trim().toLowerCase())
        .filter(isHexAddress))];

  const n = Number(sp?.page ?? "1");
  const page = Number.isFinite(n) && n > 0 ? Math.floor(n) : 1;

  const modules = (sp?.modules ?? "")
    .split(",")
    .map(s => s.trim())
    .filter(Boolean);

  return { wallets, page, modules };
});
