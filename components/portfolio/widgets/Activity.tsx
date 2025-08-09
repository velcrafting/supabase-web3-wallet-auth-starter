// components/portfolio/widgets/Activity.tsx
import type { PortfolioWidget, PortfolioWidgetProps } from "../types";

// was "@/app/(dashboard)/_components/portfolio-activity"
import PortfolioActivity from "../portfolio-activity"; // <-- correct

export const ActivityWidget: PortfolioWidget = {
  key: "activity",
  label: "Activity",
  requiresWallet: false,
  Component: ({ params }: PortfolioWidgetProps) => (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
      <h2 className="text-lg font-semibold mb-2">Recent activity</h2>
      <PortfolioActivity wallets={params.wallets} page={params.page} />
    </div>
  ),
};
