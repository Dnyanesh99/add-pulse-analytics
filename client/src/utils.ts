import type { ChartDataPoint } from "./types";

// Generate time-series data for 30 days (still useful for the trend chart placeholder)
export function genTimeSeries(base: number, days = 30, variance = 0.18): ChartDataPoint[] {
  const arr: ChartDataPoint[] = [];
  let v = base;
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    v = Math.round(v * (1 + (Math.random() - 0.45) * variance));
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    arr.push({
      date: d.toLocaleDateString("en-GB", { month: "short", day: "numeric" }),
      value: v,
    });
  }
  return arr;
}

export const fmtNum = (n: number): string => {
  if (n === undefined || n === null) return "0";
  return n >= 1_000_000 ? (n / 1_000_000).toFixed(2) + "M"
    : n >= 1_000   ? (n / 1_000).toFixed(1) + "K"
    : String(n);
};

export const fmtCTR = (c: { clicks: number; impressions: number }): string => {
  if (!c || !c.impressions) return "0.00%";
  return ((c.clicks / c.impressions) * 100).toFixed(2) + "%";
};

export const budgetPct = (c: { spend: number; dailyBudget: number }): number => {
  if (!c || !c.dailyBudget) return 0;
  return Math.min(100, Math.round((c.spend / c.dailyBudget) * 100));
};
