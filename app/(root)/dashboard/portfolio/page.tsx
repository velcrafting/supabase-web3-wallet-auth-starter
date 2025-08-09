// app/(dashboard)/portfolio/page.tsx
import WalletPicker from "../../_components/wallet-picker";
import PortfolioActivity from "../../_components/portfolio-activity";

export default async function PortfolioPage({
  searchParams,
}: {
  searchParams?: Promise<{ wallet?: string; page?: string }>;
}) {
  const sp = (await searchParams) ?? {};
  const wallet = sp.wallet as `0x${string}` | undefined;
  const page = Number(sp.page ?? "1") || 1;

  return (
    <>
      <h1 className="text-2xl font-bold">Portfolio</h1>

      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow space-y-6">
        <WalletPicker selected={wallet} />
        <PortfolioActivity wallet={wallet} page={page} />
      </div>
    </>
  );
}
