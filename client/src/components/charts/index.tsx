import styled from "@emotion/styled";
import { ReactECharts } from "./EChartsCore";
import type { EChartsReactProps } from "echarts-for-react";

export { DeviceChart } from './DeviceChart';
export { TrendChart } from './TrendChart';
export { CTRBarChart } from './CTRBarChart';
export { FunnelChart } from './FunnelChart';
export { ReactECharts } from './EChartsCore';

const ChartWrapper = styled.div<{ height?: string }>`
  height: ${p => p.height || "220px"};
  width: 100%;
  & > div {
    height: 100% !important;
    width: 100% !important;
  }
`;

export const StyledChart = (props: EChartsReactProps & { height?: string }) => {
  const { height, ...rest } = props;
  return (
    <ChartWrapper height={height}>
      <ReactECharts {...rest} />
    </ChartWrapper>
  );
};



