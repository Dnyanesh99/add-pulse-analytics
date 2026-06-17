import type { FC } from "react";
import { useTheme } from "@emotion/react";
import { StyledChart } from "./index";
import type { ChartDataPoint } from "../../types";

interface TrendChartProps {
  impressionData: ChartDataPoint[];
  clickData: ChartDataPoint[];
}

export const TrendChart: FC<TrendChartProps> = ({ impressionData, clickData }) => {
  const theme = useTheme();
  const isDark = theme.mode === "dark";

  const option = {
    backgroundColor: "transparent",
    animation: true,
    animationDuration: 800,
    grid: { top: 30, right: 30, bottom: 40, left: 56, containLabel: false },
    tooltip: {
      trigger: "axis",
      backgroundColor: theme.card,
      borderColor: theme.border,
      borderWidth: 1,
      textStyle: { color: theme.textPrimary, fontFamily: theme.fontMono, fontSize: 11 },
      axisPointer: { lineStyle: { color: theme.border } },
    },
    legend: {
      top: 0,
      right: 0,
      textStyle: { color: theme.textSecondary, fontFamily: theme.fontBody, fontSize: 10 },
      icon: "circle",
      itemWidth: 8,
      itemHeight: 8,
    },
    xAxis: {
      type: "category",
      data: impressionData.map((d) => d.date),
      axisLine: { lineStyle: { color: theme.border } },
      axisTick: { show: false },
      axisLabel: {
        color: theme.textMuted,
        fontFamily: theme.fontMono,
        fontSize: 9,
        interval: 0,
        formatter: (val: string) => val.split("-").slice(1).join("/"),
      },
      splitLine: { show: false },
    },
    yAxis: [
      {
        type: "value",
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: { lineStyle: { color: theme.border, type: "dashed" } },
        axisLabel: {
          color: theme.textMuted,
          fontFamily: theme.fontMono,
          fontSize: 9,
          formatter: (v: number) =>
            v >= 1e6 ? (v / 1e6).toFixed(1) + "M" : v >= 1e3 ? (v / 1e3).toFixed(0) + "K" : v,
        },
      },
      {
        type: "value",
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: { show: false },
        axisLabel: {
          color: theme.textMuted,
          fontFamily: theme.fontMono,
          fontSize: 9,
          formatter: (v: number) => (v >= 1e3 ? (v / 1e3).toFixed(0) + "K" : v),
        },
      },
    ],
    series: [
      {
        name: "Impressions",
        type: "line",
        yAxisIndex: 0,
        data: impressionData.map((d) => d.value),
        smooth: 0.4,
        showSymbol: true,
        symbol: "circle",
        symbolSize: 6,
        lineStyle: { color: theme.accent, width: 2.5 },
        itemStyle: { color: theme.accent },
        areaStyle: {
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: theme.accent + "25" },
              { offset: 1, color: theme.accent + "00" },
            ],
          },
        },
      },
      {
        name: "Clicks",
        type: "line",
        yAxisIndex: 1,
        data: clickData.map((d) => d.value),
        smooth: 0.4,
        showSymbol: true,
        symbol: "circle",
        symbolSize: 6,
        lineStyle: { color: theme.green, width: 2.5 },
        itemStyle: { color: theme.green },
        areaStyle: {
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: theme.green + "20" },
              { offset: 1, color: theme.green + "00" },
            ],
          },
        },
      },
    ],
  };

  return (
    <StyledChart
      option={option}
      height="220px"
      opts={{ renderer: "canvas" }}
      theme={isDark ? "dark" : undefined}
    />
  );
};