import { configureStore } from "@reduxjs/toolkit";
import { apiSlice } from "../api/apiSlice";
import themeReducer from "./slices/themeSlice";
import metricsReducer from "./slices/metricsSlice";
import campaignsReducer from "./slices/campaignsSlice";
import alertsReducer from "./slices/alertsSlice";
import authReducer from "./slices/authSlice";

export const store = configureStore({
  reducer: {
    [apiSlice.reducerPath]: apiSlice.reducer,
    theme: themeReducer,
    metrics: metricsReducer,
    campaigns: campaignsReducer,
    alerts: alertsReducer,
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Re-export actions and selectors for convenience
export * from "./slices/themeSlice";
export * from "./slices/metricsSlice";
export * from "./slices/campaignsSlice";
export * from "./slices/alertsSlice";
export * from "./slices/authSlice";
