// api/index.ts — Optimized API client for AdPulse

import type { Campaign, TimeSeriesData, BreakdownData, BreakdownDimension, Alert } from "../types";
import axiosInstance from "./axiosInstance";

export const campaignApi = {
  /** Fetches all campaigns with their current metrics merged. */
  async getAllWithMetrics(): Promise<Campaign[]> {
    const res = await axiosInstance.get<Campaign[]>("/campaigns/with-metrics");
    return res.data;
  },

  /** Updates campaign metadata (name, status, budget). */
  async update(id: string, data: Partial<Campaign>): Promise<Campaign> {
    const res = await axiosInstance.put<Campaign>(`/campaigns/${id}`, data);
    return res.data;
  },

  /** Toggles campaign status between active and paused. */
  async toggleStatus(id: string, currentStatus: string): Promise<Campaign> {
    const newStatus = currentStatus === "active" ? "paused" : "active";
    return this.update(id, { status: newStatus as Campaign["status"] });
  },

};

export const analyticsApi = {
  /** Fetches historical metrics for the trend chart. */
  async getTimeSeries(days: number = 30): Promise<TimeSeriesData[]> {
    const res = await axiosInstance.get<TimeSeriesData[]>("/analytics/time-series", {
      params: { days }
    });
    return res.data;
  },

  /** Fetches a generic breakdown of metrics by dimension. */
  async getBreakdown(dimension: BreakdownDimension): Promise<BreakdownData[]> {
    const res = await axiosInstance.get<BreakdownData[]>(`/analytics/breakdown/${dimension}`);
    return res.data;
  },

  /** Fetches top performing campaigns by metric. */
  async getTopPerformers(metric: string = "conversions", limit: number = 10): Promise<Campaign[]> {
    const res = await axiosInstance.get<Campaign[]>("/analytics/top-performers", {
      params: { metric, limit }
    });
    return res.data;
  }
};

export const alertsApi = {
  async getAll(): Promise<Alert[]> {
    const res = await axiosInstance.get<Alert[]>("/alerts");
    return res.data;
  },
  async create(data: Partial<Alert>): Promise<Alert> {
    const res = await axiosInstance.post<Alert>("/alerts", data);
    return res.data;
  },
  async update(id: string, data: Partial<Alert>): Promise<Alert> {
    const res = await axiosInstance.put<Alert>(`/alerts/${id}`, data);
    return res.data;
  },
  async delete(id: string): Promise<void> {
    await axiosInstance.delete(`/alerts/${id}`);
  }
};
