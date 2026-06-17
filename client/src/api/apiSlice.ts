import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { Campaign, TimeSeriesData, BreakdownData, BreakdownDimension, Alert } from "../types";
import toast from "react-hot-toast";

const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:8081") + "/api/v1";

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE,
    prepareHeaders: (headers) => {
      headers.set("Content-Type", "application/json");
      return headers;
    },
  }),
  tagTypes: ["Campaign", "Metrics", "Alert"],
  endpoints: (builder) => ({
    // --- Campaigns ---
    getCampaigns: builder.query<Campaign[], void>({
      query: () => "/campaigns/with-metrics",
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Campaign" as const, id })),
              { type: "Campaign", id: "LIST" },
            ]
          : [{ type: "Campaign", id: "LIST" }],
    }),

    updateCampaign: builder.mutation<Campaign, { id: string; data: Partial<Campaign> }>({
      query: ({ id, data }) => ({
        url: `/campaigns/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (_, __, { id }) => [{ type: "Campaign", id }],
      async onQueryStarted({ id, data }, { dispatch, queryFulfilled }) {
        // Optimistic Update
        const patchResult = dispatch(
          apiSlice.util.updateQueryData("getCampaigns", undefined, (draft) => {
            const campaign = draft.find((c) => c.id === id);
            if (campaign) {
              Object.assign(campaign, data);
            }
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
          toast.error("Failed to update campaign.");
        }
      },
    }),

    toggleCampaignStatus: builder.mutation<Campaign, { id: string; currentStatus: string }>({
      query: ({ id, currentStatus }) => {
        const newStatus = currentStatus === "active" ? "paused" : "active";
        return {
          url: `/campaigns/${id}`,
          method: "PUT",
          body: { status: newStatus },
        };
      },
      invalidatesTags: (_, __, { id }) => [{ type: "Campaign", id }],
    }),

    // --- Analytics ---
    getTimeSeries: builder.query<TimeSeriesData[], number | void>({
      query: (days = 30) => ({
        url: "/analytics/time-series",
        params: { days },
      }),
    }),

    getBreakdown: builder.query<BreakdownData[], BreakdownDimension>({
      query: (dimension) => `/analytics/breakdown/${dimension}`,
    }),

    getTopPerformers: builder.query<Campaign[], { metric?: string; limit?: number } | void>({
      query: (params) => ({
        url: "/analytics/top-performers",
        params: {
          metric: params?.metric || "conversions",
          limit: params?.limit || 10,
        },
      }),
    }),

    // --- Alerts ---
    getAlerts: builder.query<Alert[], void>({
      query: () => "/alerts",
      providesTags: ["Alert"],
    }),

    createAlert: builder.mutation<Alert, Partial<Alert>>({
      query: (data) => ({
        url: "/alerts",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Alert"],
    }),

    updateAlert: builder.mutation<Alert, { id: string; data: Partial<Alert> }>({
      query: ({ id, data }) => ({
        url: `/alerts/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Alert"],
    }),

    deleteAlert: builder.mutation<void, string>({
      query: (id) => ({
        url: `/alerts/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Alert"],
    }),
  }),
});

export const {
  useGetCampaignsQuery,
  useUpdateCampaignMutation,
  useToggleCampaignStatusMutation,
  useGetTimeSeriesQuery,
  useGetBreakdownQuery,
  useGetTopPerformersQuery,
  useGetAlertsQuery,
  useCreateAlertMutation,
  useUpdateAlertMutation,
  useDeleteAlertMutation,
} = apiSlice;
