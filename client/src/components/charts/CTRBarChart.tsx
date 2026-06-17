import { useTheme } from "@emotion/react";
import type { FC } from "react";
import { StyledChart } from "./index";
import type { BreakdownData } from "../../types";

interface CTRBarChartProps {
  data: BreakdownData[];
}

export const CTRBarChart: FC<CTRBarChartProps> = ({ data }) => {
  const theme = useTheme();
  const ctrs = data.map((d) => (d.impressions > 0 ? +((d.clicks / d.impressions) * 100).toFixed(2) : 0));
  const max = ctrs.length > 0 ? Math.max(...ctrs) : 1;

  const option = {
    backgroundColor: "transparent",
    grid: { top: 8, right: 16, bottom: 8, left: 8, containLabel: true },
    tooltip: {
      trigger: "axis",
      backgroundColor: theme.card,
      borderColor: theme.border,
      textStyle: { color: theme.textPrimary, fontFamily: theme.fontMono, fontSize: 12 },
      formatter: (p: { name: string; value: number }[]) => `${p[0].name}<br/>CTR: <b>${p[0].value}%</b>`,
    },
    xAxis: { show: false },
    yAxis: {
      type: "category",
      data: data.map((d) => d.dimension),
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: theme.textSecondary, fontFamily: theme.fontBody, fontSize: 11 },
    },
    series: [
      {
        type: "bar",
        data: ctrs,
        barMaxWidth: 10,
        itemStyle: {
          borderRadius: [0, 4, 4, 0],
          color: (p: { value: number }) => {
            const ratio = p.value / max;
            if (ratio > 0.8) return theme.green;
            if (ratio > 0.5) return theme.accent;
            return theme.purple;
          },
        },
        label: {
          show: true,
          position: "right",
          fontFamily: theme.fontMono,
          fontSize: 10,
          color: theme.textSecondary,
          formatter: "{c}%",
        },
      },
    ],
  };

  return (
    <StyledChart
      option={option}
      height="220px"
      opts={{ renderer: "canvas" }}
    />
  );
};

