import type { PortfolioWidget, PortfolioWidgetProps } from "../types";

export const ChainsWidget: PortfolioWidget = {
  key: "chains",
  label: "Chains",
  requiresWallet: false,
  Component: ({ params }: PortfolioWidgetProps) => (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
      <h2 className="text-lg font-semibold mb-2">Chains</h2>
      <p className="text-sm text-muted-foreground">
        Wallets: {params.wallets.join(", ") || "none"}
      </p>
    </div>
  ),
};
