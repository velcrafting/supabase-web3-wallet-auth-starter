import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { SolanaAdapter } from '@reown/appkit-adapter-solana';
import { cookieStorage, createStorage } from 'wagmi';
import { siteConfig } from '@/lib/config';

export const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!;
if (!projectId) throw new Error('Missing WalletConnect Project ID');

const networks = siteConfig.supportedChains;

export const wagmiAdapter = new WagmiAdapter({
  projectId,
  networks,
  storage: createStorage({ storage: cookieStorage }),
  ssr: true,
});

export const solanaAdapter = new SolanaAdapter();

export const config = wagmiAdapter.wagmiConfig;