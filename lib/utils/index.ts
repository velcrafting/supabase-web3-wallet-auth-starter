import { clsx, type ClassValue } from "clsx";
import { decodeJwt } from "jose";
import { twMerge } from "tailwind-merge";
import { mainnet, sepolia } from "viem/chains";
import type { SupabaseToken } from "@/lib/supabase";
import { siteConfig } from "@/lib/config";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getChainName(chainId: string | number) {
  return (
    siteConfig.appKitChains.find(
      (c) => c.id === chainId || c.id === Number(chainId)
    )?.name ?? "Unknown"
  );
}

export function shortenAddress(address: string): string {
  if (!/^0x[a-fA-F0-9]{40}$/.test(address)) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function decode(accessToken: string) {
  try {
    return decodeJwt<SupabaseToken>(accessToken);
  } catch {
    return null;
  }
}

export function generateDegenerateUsername(walletAddress: string): string {
  const adjectives = [
    "rekt","degen","flashy","rugged","diamond","paperhands","bullish",
    "fomo","slurping","saucy","giga","stinky","based","leverage"
  ];
  const animals = [
    "ape","whale","shrimp","penguin","frog","goblin","unicorn",
    "dino","monkey","panda","fartdust"
  ];
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const animal = animals[Math.floor(Math.random() * animals.length)];
  const suffix = walletAddress.slice(-4).toLowerCase();
  return `${adj}-${animal}-${suffix}`;
}
