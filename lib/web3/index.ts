import { siteConfig } from "@/lib/config";
import type { Chain } from "viem";

export const chains = siteConfig.supportedChains as unknown as Chain[];