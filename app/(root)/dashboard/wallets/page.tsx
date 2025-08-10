import WalletsClient from './wallets-client';
import { getWallets } from '@/lib/actions/wallet';
import { useSession } from '@/lib/hooks';

const DashboardWalletsPage = async () => {
  const { data: session } = useSession(); // Get session

  if (!session) {
    return (
      <>
        <h1 className="text-2xl font-bold">Wallets</h1>
        <p className="text-sm text-muted-foreground">Please sign in to manage your wallets.</p>
      </>
    );
  }

  // Fetch wallets from the server-side
  const { data: wallets } = await getWallets();
  
  return (
    <>
      <h1 className="text-2xl font-bold">Wallets</h1>
      <WalletsClient wallets={wallets ?? []} />
    </>
  );
};

export default DashboardWalletsPage;
