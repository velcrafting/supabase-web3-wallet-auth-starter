import WalletsClient from './wallets-client';
import { getSession } from '@/lib/actions/auth/getSession';
import { getWallets } from '@/lib/actions/wallet';

const DashboardWalletsPage = async () => {
  const session = await getSession();

  if (!session) {
    return (
      <>
        <h1 className="text-2xl font-bold">Wallets</h1>
        <p className="text-sm text-muted-foreground">Please sign in to manage your wallets.</p>
      </>
    );
  }

  const { data: wallets } = await getWallets();

  return (
    <>
      <h1 className="text-2xl font-bold">Wallets</h1>
      <WalletsClient wallets={wallets ?? []} />
    </>
  );
};

export default DashboardWalletsPage;