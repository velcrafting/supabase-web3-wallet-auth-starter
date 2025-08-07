import WalletsClient from './wallets-client';
import { getWallets } from '@/lib/actions/wallet';

const DashboardWalletsPage = async () => {
  const { data: wallets } = await getWallets();
  return (
    <>
      <h1 className="text-2xl font-bold">Wallets</h1>
      <WalletsClient wallets={wallets ?? []} />
    </>
  );
};

export default DashboardWalletsPage;