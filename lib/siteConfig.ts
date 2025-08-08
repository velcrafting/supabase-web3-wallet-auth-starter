export const siteConfig = {
  name: "Web3 Sample App",
  description:
    "Experience decentralized applications. Connect your wallet and explore the future of the web.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  icon: "/icon.png",
  copyright: `© ${new Date().getFullYear()} Web3 Sample App. All rights reserved.`,
};

export const walletKitMetadata = {
  name: siteConfig.name,
  description: siteConfig.description,
  url: siteConfig.url,
  icons: [siteConfig.icon],
};
