// components/portfolio/widgets/Holdings.tsx
"use client";
import type { PortfolioWidget } from "../types";
import { usePortfolio } from "../context";

function HoldingsInner() {
  const { wallets } = usePortfolio();
  // Fetch holdings by wallets with your client hook or SWR
  // const { data, isLoading } = useHoldings(wallets)
  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
      <h2 className="text-lg font-semibold mb-2">Holdings</h2>
      {/* render table or skeleton */}
      <div className="text-sm text-muted-foreground">
        Demo. Wire your data hook here.
      </div>
    </div>
  );
}

export const HoldingsWidget: PortfolioWidget = {
  key: "holdings",
  label: "Holdings",
  requiresWallet: true,
  Component: () => <HoldingsInner />,
};
