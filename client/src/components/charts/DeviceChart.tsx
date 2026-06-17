import { useTheme } from "@emotion/react";
import { StyledChart } from "./index";
import type { BreakdownData } from "../../types";

interface DeviceChartProps {
  data: BreakdownData[];
}

export function DeviceChart({ data }: DeviceChartProps) {
  const theme = useTheme();
  const fallbackColors = [theme.accent, theme.green, theme.amber, theme.purple];
  
  const option = {
    backgroundColor: "transparent",
    animation: true,
    tooltip: {
      trigger: "item",
      backgroundColor: theme.card,
      borderColor: theme.border,
      textStyle: { color: theme.textPrimary, fontFamily: theme.fontMono, fontSize: 12 },
      formatter: "{b}: {c}",
    },
    legend: { show: false },
    series: [
      {
        type: "pie",
        radius: ["52%", "78%"],
        center: ["50%", "52%"],
        avoidLabelOverlap: true,
        itemStyle: { borderRadius: 4, borderColor: theme.card, borderWidth: 2 },
        label: { show: false },
        emphasis: {
          scale: true,
          scaleSize: 6,
          label: {
            show: true,
            fontSize: 12,
            fontWeight: 600,
            fontFamily: theme.fontMono,
            color: theme.textPrimary,
            formatter: "{b}\n{c}",
          },
        },
        data: data.map((d, i) => ({
          name: d.dimension,
          value: d.impressions,
          itemStyle: { color: fallbackColors[i % fallbackColors.length] },
        })),
      },
    ],
  };

  return (
    <StyledChart
      option={option}
      height="180px"
      opts={{ renderer: "canvas" }}
    />
  );
}

