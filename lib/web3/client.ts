import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { cookieStorage, createStorage } from 'wagmi';
import { mainnet } from '@reown/appkit/networks';

export const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!;
if (!projectId) throw new Error('Missing WalletConnect Project ID');

const networks = [mainnet];

export const wagmiAdapter = new WagmiAdapter({
  projectId,
  networks,
  storage: createStorage({ storage: cookieStorage }),
  ssr: true,
});

export const config = wagmiAdapter.wagmiConfig;