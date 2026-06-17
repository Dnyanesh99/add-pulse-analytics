import { useTheme } from "@emotion/react";
import type { FC } from "react";
import { StyledChart } from "./index";
import type { Campaign } from "../../types";
import { fmtNum } from "../../utils";

interface FunnelChartProps {
  campaign: Campaign;
}

export const FunnelChart: FC<FunnelChartProps> = ({ campaign }) => {
  const theme = useTheme();
  const stages = [
    { name: "Impressions", value: campaign.impressions, color: theme.accent },
    { name: "Clicks", value: campaign.clicks, color: theme.green },
    { name: "Conversions", value: campaign.conversions, color: theme.amber },
  ];
  const max = campaign.impressions || 1;

  const option = {
    backgroundColor: "transparent",
    grid: { top: 8, right: 80, bottom: 8, left: 16, containLabel: true },
    tooltip: {
      trigger: "item",
      backgroundColor: theme.card,
      borderColor: theme.border,
      textStyle: { color: theme.textPrimary, fontFamily: theme.fontMono, fontSize: 12 },
    },
    xAxis: {
      type: "value",
      max,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { show: false },
      splitLine: { show: false },
    },
    yAxis: {
      type: "category",
      data: stages.map((s) => s.name).reverse(),
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: theme.textSecondary, fontFamily: theme.fontBody, fontSize: 12 },
    },
    series: [
      {
        type: "bar",
        data: stages
          .map((s) => ({
            value: s.value,
            itemStyle: { color: s.color, borderRadius: [0, 6, 6, 0] },
          }))
          .reverse(),
        barWidth: 14,
        label: {
          show: true,
          position: "right",
          fontFamily: theme.fontMono,
          fontSize: 11,
          color: theme.textSecondary,
          formatter: (p: { value: number }) => fmtNum(p.value),
        },
      },
    ],
  };

  return (
    <StyledChart
      option={option}
      height="130px"
      opts={{ renderer: "canvas" }}
    />
  );
};