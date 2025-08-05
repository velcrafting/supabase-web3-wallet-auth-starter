import { createConfig } from "wagmi";
import { createClient, http, publicActions } from "viem";
import { mainnet } from 'wagmi/chains';

const serverConfig = createConfig({
  chains: [mainnet],
  client({ chain }) {
    return createClient({ chain, transport: http() })
  },
});

export const publicClient = serverConfig.getClient().extend(publicActions);