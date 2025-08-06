'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { WagmiProvider, useAccount, useDisconnect, useSignMessage } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { createAppKit } from '@reown/appkit/react';
import { mainnet } from '@reown/appkit/networks';
import { wagmiAdapter, config, projectId } from '@/lib/web3/client';
import { useSession, AuthStatus } from '@/lib/hooks';
import { nonce } from "@/lib/actions/auth/nonce";
import { verify } from "@/lib/actions/auth/verify";
import { createSiweMessage } from 'viem/siwe';

const appKit = createAppKit({
  adapters: [wagmiAdapter],
  networks: [mainnet],
  projectId,
  metadata: {
    name: 'Battlechips',
    description: 'Battlechips Web3 App',
    url: process.env.NODE_ENV === 'development'
      ? 'http://localhost:3000'
      : 'https://battlechips.app',
    icons: ['https://battlechips.app/icon.png'],
  },
});

const Web3Provider = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const { data: session, setData: setSession, status, setStatus } = useSession();
  const [queryClient] = useState(() => new QueryClient());

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <SIWEHandler
            session={session}
            setSession={setSession}
            setStatus={setStatus}
            router={router}
          />
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};

const SIWEHandler = ({
  session,
  setSession,
  setStatus,
  router,
}: {
  session: any;
  setSession: (data: any) => void;
  setStatus: React.Dispatch<React.SetStateAction<AuthStatus>>;
  router: any;
}) => {
  const { address, chainId, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { signMessageAsync } = useSignMessage();
  const hasRun = useRef(false);

  useEffect(() => {
    if (!isConnected || hasRun.current || session !== undefined) return;

    const runSIWE = async () => {
      try {
        hasRun.current = true;
        setStatus('loading');

        const nonceValue = await nonce();
        if (!nonceValue?.data?.nonce) {
          console.error('❌ Failed to fetch nonce:', nonceValue);
          disconnect();
          return;
        }

        const message = createSiweMessage({
          domain: window.location.host,
          address: address!,
          chainId: chainId!,
          statement: 'Sign in with Ethereum',
          uri: window.location.origin,
          version: '1',
          nonce: nonceValue.data.nonce,
        });

        const signature = await signMessageAsync({ message });
        const res = await verify({ message, signature });

        if (res?.error || !res?.data) {
          console.error('❌ Verify failed:', res.error);
          disconnect();
          return;
        }

        setSession(res.data);
        router.refresh();
      } catch (err) {
        console.error('❌ SIWE error:', err);
        disconnect();
      }
    };

    runSIWE();
  }, [isConnected, session, address, chainId]);

  return null;
};

export default Web3Provider;