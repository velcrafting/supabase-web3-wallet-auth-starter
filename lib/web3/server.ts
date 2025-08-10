import { createConfig } from "wagmi";
import { createClient, http, publicActions, type Chain } from "viem";
import { siteConfig } from "@/lib/config";

const serverConfig = createConfig({
  chains: siteConfig.supportedChains as unknown as [Chain, ...Chain[]],
  client({ chain }) {
    return createClient({ chain, transport: http() });
  },
});

export const publicClient = serverConfig.getClient().extend(publicActions);