// app/(root)/dashboard/portfolio/page.tsx
import WalletPicker from "../../_components/wallet-picker";
import { PortfolioProvider } from "@/components/portfolio/context";
import { normalizeParams, type SP } from "@/components/portfolio/use-portfolio-params";
import { WIDGET_MAP, WIDGETS } from "@/components/portfolio/widget-registry";

export default async function PortfolioPage({
  searchParams,
}: { searchParams?: Promise<SP> }) {
  const sp = (await searchParams) ?? {};
  const { wallets, page, modules } = normalizeParams(sp);
  const params = { wallets, page };

  const list = modules.length
    ? modules.map((m) => WIDGET_MAP[m]).filter(Boolean)
    : WIDGETS;

  const visible = list
    .filter((w) => !!w && typeof w.Component === "function")
    .filter((w) => (w.requiresWallet ? wallets.length > 0 : true));

  return (
    <>
      <h1 className="text-2xl font-bold">Portfolio</h1>
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow space-y-6">
        <WalletPicker selected={wallets[0]} />
        <PortfolioProvider value={params}>
          <div className="grid gap-6 md:grid-cols-2">
            {visible.map((w) => (
              <w.Component key={w.key} params={params} />
            ))}
          </div>
        </PortfolioProvider>
      </div>
    </>
  );
}
