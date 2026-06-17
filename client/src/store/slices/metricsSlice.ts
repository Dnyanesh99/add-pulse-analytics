import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { MetricsPayload } from "../../types";

interface MetricsState {
  totalImpressions: number;
  totalClicks: number;
  totalConversions: number;
  lastUpdated: number | null;
}

const initialState: MetricsState = {
  totalImpressions: 0,
  totalClicks: 0,
  totalConversions: 0,
  lastUpdated: null,
};

const metricsSlice = createSlice({
  name: "metrics",
  initialState,
  reducers: {
    updateGlobalMetrics(state, action: PayloadAction<MetricsPayload>) {
      const { campaigns, timestamp } = action.payload;

      // Calculate totals from individual campaign metrics
      let impressions = 0;
      let clicks = 0;
      let conversions = 0;

      campaigns.forEach((c) => {
        impressions += c.impressions;
        clicks += c.clicks;
        conversions += c.conversions;
      });

      state.totalImpressions = impressions;
      state.totalClicks = clicks;
      state.totalConversions = conversions;
      state.lastUpdated = timestamp;
    },
  },
});

export const { updateGlobalMetrics } = metricsSlice.actions;
export default metricsSlice.reducer;
