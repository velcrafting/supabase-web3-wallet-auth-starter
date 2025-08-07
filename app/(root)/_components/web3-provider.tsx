"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { WagmiProvider, useAccount, useDisconnect, useSignMessage } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { createAppKit } from "@reown/appkit/react";
import { mainnet } from "@reown/appkit/networks";
import { wagmiAdapter, config, projectId } from "@/lib/web3/client";
import { useSession, AuthStatus } from "@/lib/hooks";
import { createSiweMessage } from "viem/siwe";

const appKit = createAppKit({
  adapters: [wagmiAdapter],
  networks: [mainnet],
  projectId,
  metadata: {
    name: "Battlechips",
    description: "Battlechips Web3 App",
    url: process.env.NODE_ENV === "development" ? "http://localhost:3000" : "https://battlechips.app",
    icons: ["https://battlechips.app/icon.png"],
  },
});

const Web3Provider = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const { data: session, setData: setSession, status, setStatus } = useSession();
  const [queryClient] = useState(() => new QueryClient());

  // 1) On mount, hydrate session from cookie via /api/auth/me
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setStatus("loading");
        const r = await fetch("/api/auth/me", { credentials: "include", cache: "no-store" });
        const raw = await r.text();
        const json = JSON.parse(raw || "{}");
        if (!cancelled) {
          if (json?.user) {
            setSession({ user: json.user });
            setStatus("authenticated");
          } else {
            setSession(null as any);
            setStatus("unauthenticated");
          }
        }
      } catch {
        if (!cancelled) {
          setSession(null as any);
          setStatus("unauthenticated");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [setSession, setStatus]);

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <SIWEHandler
            session={session}
            status={status}
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
  status,
  setSession,
  setStatus,
  router,
}: {
  session: any;
  status: AuthStatus;
  setSession: (data: any) => void;
  setStatus: React.Dispatch<React.SetStateAction<AuthStatus>>;
  router: any;
}) => {
  const { address, chainId, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { signMessageAsync } = useSignMessage();

  const hasRunForAddr = useRef<string | null>(null);

  // Reset the “has run” marker when address changes
  useEffect(() => {
    if (address && hasRunForAddr.current !== address) {
      hasRunForAddr.current = null;
    }
  }, [address]);

  useEffect(() => {
    // Gate SIWE:
    // - wait until /api/auth/me resolved (status !== "loading")
    // - only run if connected AND no app session
    if (status === "loading") return;
    if (!isConnected || !address || !chainId) return;
    if (session?.user) return; // we already have an app session, no SIWE
    if (hasRunForAddr.current === address) return;

    const runSIWE = async () => {
      try {
        hasRunForAddr.current = address;
        setStatus("loading");

        // 1) GET nonce (server sets HTTP-only cookie)
        const nRes = await fetch("/api/auth/nonce", {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        });
        const nRaw = await nRes.text();
        let nonceVal: string | undefined;
        try {
          nonceVal = JSON.parse(nRaw)?.nonce;
        } catch {
          throw new Error(`Nonce endpoint bad response ${nRes.status}`);
        }
        if (!nRes.ok || !nonceVal) throw new Error("Failed to obtain nonce");

        // 2) Create & sign SIWE message
        const message = createSiweMessage({
          domain: window.location.host,
          address,
          chainId,
          statement: "Sign in with Ethereum",
          uri: window.location.origin,
          version: "1",
          nonce: nonceVal,
        });
        const signature = await signMessageAsync({ message });

        // 3) Verify
        const res = await fetch("/api/wallets/link", {
          method: "POST",
          headers: { "content-type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ message, signature }),
        });
        const raw = await res.text();
        let data: any;
        try {
          data = JSON.parse(raw);
        } catch {
          throw new Error(`Server returned non-JSON ${res.status}`);
        }
        if (!res.ok) {
          throw new Error(data?.error ?? `HTTP ${res.status}`);
        }

        // 4) Update session from response (or do a quick /me fetch)
        setSession({ user: data.user });
        setStatus("authenticated");
        router.refresh();
      } catch (err) {
        console.error("SIWE error:", err);
        // keep wallet connected; just mark unauthenticated so user can retry
        setStatus("unauthenticated");
        hasRunForAddr.current = null; // allow retry
      }
    };

    runSIWE();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, address, chainId, status, session?.user]);

  return null;
};

export default Web3Provider;
