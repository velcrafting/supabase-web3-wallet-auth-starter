import {
  mainnet,
  sepolia,
  polygon,
  arbitrum,
  base,
  optimism,
} from "@reown/appkit/networks";
import type { AppKitNetwork } from "@reown/appkit/networks";

export const supportedChains: [AppKitNetwork, ...AppKitNetwork[]] = [
  mainnet,
  sepolia,
  polygon,
  arbitrum,
  base,
  optimism,
];


export const siteConfig = {
  name: "Web3 Sample App",
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
    social: {
    twitter: "https://twitter.com/yourhandle",
    github: "https://github.com/yourorg",
    website: "https://yourwebsite.com",
  },
  footerMessage: "Built with love for the decentralized web.",
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