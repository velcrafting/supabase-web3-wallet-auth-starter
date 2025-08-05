'use client';

import dynamic from 'next/dynamic';
import Header from './header';
import Footer from './footer';

const Web3Provider = dynamic(() => import('./web3-provider'), { ssr: false });

export default function ClientRoot({ children }: { children: React.ReactNode }) {
  return (
    <Web3Provider>
      <div className="flex flex-col min-h-[100dvh]">
        <Header />
        <div className="mt-14 flex flex-col flex-1">
          {children}
        </div>
        <Footer />
      </div>
    </Web3Provider>
  );
}