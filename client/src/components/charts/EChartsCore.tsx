import ReactEChartsCore from "echarts-for-react/lib/core";
import * as echarts from "echarts/core";
import {
  BarChart,
  LineChart,
  PieChart,
  FunnelChart
} from "echarts/charts";
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent
} from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";
import type { FC, ComponentType } from "react";
import type { EChartsReactProps } from "echarts-for-react";

// Register the required components
echarts.use([
  BarChart,
  LineChart,
  PieChart,
  FunnelChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent,
  CanvasRenderer
]);

/**
 * Robustly extract the React component from the module.
 * Handles ESM/CJS interop and Vite/Rollup chunking variations.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getEChartsComponent = (mod: any): ComponentType<EChartsReactProps> | null => {
  if (!mod) return null;
  // If it's the component itself
  if (typeof mod === 'function') return mod;
  // If it's wrapped in a .default property (CommonJS interop)
  if (mod.default && typeof mod.default === 'function') return mod.default;
  // If it's the module object itself (sometimes happens in certain build setups)
  if (mod.default && mod.default.default) return mod.default.default;
  return mod;
};

const ResolvedComponent = getEChartsComponent(ReactEChartsCore);

export const ReactECharts: FC<EChartsReactProps> = (props) => {
  if (!ResolvedComponent) return null;
  const Component = ResolvedComponent;
  return <Component echarts={echarts} {...props} />;
};
