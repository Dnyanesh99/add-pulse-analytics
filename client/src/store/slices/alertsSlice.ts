import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { TriggeredAlert } from "../../types";

interface AlertsState {
  triggeredAlerts: TriggeredAlert[];
}

const initialState: AlertsState = {
  triggeredAlerts: [],
};

const alertsSlice = createSlice({
  name: "alerts",
  initialState,
  reducers: {
    setTriggeredAlerts: (state, action: PayloadAction<TriggeredAlert[]>) => {
      state.triggeredAlerts = action.payload;
    },
    dismissAlert: (state, action: PayloadAction<string>) => {
      state.triggeredAlerts = state.triggeredAlerts.filter(a => a.alertId !== action.payload);
    }
  },
});

export const { setTriggeredAlerts, dismissAlert } = alertsSlice.actions;
export default alertsSlice.reducer;
