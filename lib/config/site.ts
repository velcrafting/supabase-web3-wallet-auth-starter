import {
  mainnet,
  sepolia,
  polygon,
  arbitrum,
  base,
  optimism,
  solana,
} from "@reown/appkit/networks";
import type { AppKitNetwork } from "@reown/appkit/networks";
import { defineChain } from "viem";

export const sei = defineChain({
  id: 1329,
  name: "Sei Network",
  nativeCurrency: { name: "Sei", symbol: "SEI", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://evm-rpc.sei-apis.com"] },
    public: { http: ["https://evm-rpc.sei-apis.com"] },
  },
  blockExplorers: {
    default: { name: "Seitrace", url: "https://seitrace.com" },
  },
});

export const supportedChains: [AppKitNetwork, ...AppKitNetwork[]] = [
  mainnet,
  sepolia,
  polygon,
  arbitrum,
  base,
  optimism,
  sei,
];

export const appKitChains: [AppKitNetwork, ...AppKitNetwork[]] = [
  ...supportedChains,
  solana,
];


export const siteConfig = {
  name: "Supabase x ReOwn Boilerplate",
  description:
    "Experience decentralized applications. Connect your wallet and explore the future of the web.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  icon: "/icon.png",
  theme: {
    fontFamily: "Inter, sans-serif",
    logo: "/logo.svg",
    defaultTheme: "system",
    brandColors: {
      light: {
        primary: "#4f46e5",
        accent: "#10b981",
      },
      dark: {
        primary: "#818cf8",
        accent: "#34d399",
      },
    },
  },
  navigation: [
    { label: "Home", href: "/" },
    { label: "Portfolio", href: "/portfolio" },
  ],
  supportedChains,
  appKitChains,
  social: {
    twitter: "https://twitter.com/velcrafting",
    github: "https://github.com/velcrafting/",
    website: "https://www.velcrafting.com/",
  },
  footerMessage: "Built with love for the decentralized web, by Vel.",
  copyright: `© ${new Date().getFullYear()} Web3 Sample App. All rights reserved.`,
};

export const walletKitMetadata = {
  name: siteConfig.name,
  description: siteConfig.description,
  url: siteConfig.url,
  icons: [siteConfig.icon],
};

export const authConfig = {
  siweStatement: `Sign in to ${siteConfig.name}`,
  signOut: `Sign out of ${siteConfig.name}`,
  connectWallet: "Connect Wallet",
  loading: "Loading..",
};