"use client";

import dynamic from "next/dynamic";
import Header from "./header";
import Footer from "./footer";

const Web3Provider = dynamic(() => import("@/components/web3/web3-provider"), { ssr: false });

export default function ClientRoot({ children }: { children: React.ReactNode }) {
  return (
    <Web3Provider>
      <div className="min-h-[100dvh] flex flex-col">
        <Header />
        <main className="flex-1 pt-14 overflow-hidden">
          {children}
        </main>
        <Footer />
      </div>
    </Web3Provider>
  );
}
