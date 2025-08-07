'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Button } from '@/components/ui/button';
import { getChainName, shortenAddress } from '@/lib/utils';

interface Wallet {
  id: string;
  walletAddress: string;
  chainId: number;
}

const WalletsClient = ({ wallets }: { wallets: Wallet[] }) => {
  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
      <h3 className="font-semibold mb-4">Linked Wallets</h3>
      <ul className="space-y-2">
        {wallets.length > 0 ? (
          wallets.map((w) => (
            <li key={w.id} className="text-sm">
              {getChainName(w.chainId)}: {shortenAddress(w.walletAddress)}
            </li>
          ))
        ) : (
          <li className="text-sm text-muted-foreground">No wallets linked.</li>
        )}
      </ul>
      <div className="mt-4">
        <ConnectButton.Custom>
          {({ openConnectModal }) => (
            <Button onClick={openConnectModal}>Add Wallet</Button>
          )}
        </ConnectButton.Custom>
      </div>
    </div>
  );
};

export default WalletsClient;