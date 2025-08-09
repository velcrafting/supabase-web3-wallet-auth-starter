// app/(dashboard)/portfolio/page.tsx
import WalletPicker from "../../_components/wallet-picker";
import PortfolioActivity from "../../_components/portfolio-activity";

type SP = { wallet?: string | string[]; page?: string };

const isHexAddress = (s: string): s is `0x${string}` =>
  /^0x[a-fA-F0-9]{40}$/.test(s);

function normalizeWallets(input?: string | string[]): `0x${string}`[] {
  if (!input) return [];
  const list = Array.isArray(input) ? input : input.split(",");
  return [...new Set(list.map((w) => w.trim().toLowerCase()).filter(isHexAddress))];
}

export default async function PortfolioPage({
  searchParams,
}: {
  searchParams: Promise<SP>;
}) {
  const sp = (await searchParams) ?? {};
  const wallets = normalizeWallets(sp.wallet);
  const page = (() => {
    const n = Number(sp.page ?? "1");
    return Number.isFinite(n) && n > 0 ? Math.floor(n) : 1;
  })();

  return (
    <>
      <h1 className="text-2xl font-bold">Portfolio</h1>

      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow space-y-6">
        <WalletPicker selected={wallets[0]} />
        <PortfolioActivity wallets={wallets} page={page} />
      </div>
    </>
  );
}
