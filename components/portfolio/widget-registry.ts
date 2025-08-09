// components/portfolio/widget-registry.ts
import type { PortfolioWidget } from "./types";
import { ActivityWidget } from "./widgets/Activity";
import { HoldingsWidget } from "./widgets/Holdings";
import { ChainsWidget } from "./widgets/Chains";
import { NetWorthWidget } from "./widgets/NetWorth";

export const WIDGETS: PortfolioWidget[] = [
  ActivityWidget,
  HoldingsWidget,
  ChainsWidget,
  NetWorthWidget,
];

export const WIDGET_MAP = Object.fromEntries(WIDGETS.map(w => [w.key, w]));
