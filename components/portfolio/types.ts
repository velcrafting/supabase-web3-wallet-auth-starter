// components/portfolio/types.ts
export type Hex = `0x${string}`;

export type PortfolioParams = {
  wallets: Hex[];
  page: number;
};

export type PortfolioWidgetProps = {
  params: PortfolioParams;
  className?: string;
};

export type PortfolioWidget = {
  /** unique id */
  key: string;
  /** human label for toggles */
  label: string;
  /** optional min data requirement */
  requiresWallet?: boolean;
  /** server or client component */
  Component: (p: PortfolioWidgetProps) => JSX.Element;
};
