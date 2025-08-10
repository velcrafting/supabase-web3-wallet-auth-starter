'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { getChainName, shortenAddress } from '@/lib/utils';

interface Wallet {
  id: string;
  walletAddress: string;
  chainId: number;
}

const WalletsClient = ({ wallets }: { wallets: Wallet[] }) => {
  const router = useRouter();

  // Handle wallet removal
  const onRemove = async (id: string) => {
    const response = await fetch(`/api/wallets/${id}`, { method: 'DELETE' });
    if (response.ok) {
      router.refresh(); // Refresh the page to show updated list
    } else {
      console.error('Failed to remove wallet');
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
      <h3 className="font-semibold mb-2">Linked Wallets</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Connecting a new wallet will link it to your current profile.
      </p>
      <ul className="space-y-2">
        {wallets.length > 0 ? (
          wallets.map((w) => (
            <li key={w.id} className="text-sm flex items-center justify-between gap-2">
              <span>
                {getChainName(w.chainId)}: {shortenAddress(w.walletAddress)}
              </span>
              <Button variant="destructive" size="sm" onClick={() => onRemove(w.id)}>
                Remove wallet
              </Button>
            </li>
          ))
        ) : (
          <li className="text-sm text-muted-foreground">No wallets linked.</li>
        )}
      </ul>
      <div className="mt-4">
        <ConnectButton.Custom>
          {({ openConnectModal }) => (
            <Button onClick={openConnectModal}>Link wallet</Button>
          )}
        </ConnectButton.Custom>
      </div>
    </div>
  );
};

export default WalletsClient;
