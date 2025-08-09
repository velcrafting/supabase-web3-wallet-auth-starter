import type { PortfolioWidget, PortfolioWidgetProps } from "../types";

export const NetWorthWidget: PortfolioWidget = {
  key: "networth",
  label: "Net worth",
  requiresWallet: true,
  Component: ({ params }: PortfolioWidgetProps) => (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
      <h2 className="text-lg font-semibold mb-2">Net worth</h2>
      <p className="text-sm text-muted-foreground">
        Compute server-side with a prices cache for {params.wallets.length} wallet(s).
      </p>
    </div>
  ),
};
