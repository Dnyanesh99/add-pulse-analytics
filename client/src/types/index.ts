// types/index.ts

export type CampaignStatus = "active" | "paused" | "ended" | "draft";

export interface Campaign {
  id: string;
  name: string;
  status: CampaignStatus;
  dailyBudget: number;
  totalBudget?: number;
  currency?: string;
  impressions: number;
  clicks: number;
  conversions: number;
  spend: number;
  conversion_value: number;
  ecpm: number;
  cpc: number;
  cpa: number;
  roas: number;
  ctr: number;
  // Metadata for filtering/sorting
  country?: string;
  device?: string;
}

export interface DeviceData {
  name: string;
  value: number;
  color?: string;
}

export interface CountryData {
  country: string;
  impressions: number;
  clicks: number;
  flag?: string;
}

export interface MetricsPayload {
  campaigns: Array<{
    campaign_id: string;
    impressions: number;
    clicks: number;
    conversions: number;
    spend: number;
    conversion_value: number;
    ecpm: number;
    cpc: number;
    cpa: number;
    roas: number;
    ctr: number;
  }>;
  timestamp: number;
}

export type SortDir = "asc" | "desc";
export type CampaignFilter = "all" | CampaignStatus;
export type CampaignSortKey = keyof Campaign | "ctr";

export interface ChartDataPoint {
  date: string;
  value: number;
}

export interface TimeSeriesData {
  day: string;
  impressions: number;
  clicks: number;
  conversions: number;
  spend: number;
  conversion_value: number;
  ecpm: number;
  cpc: number;
  cpa: number;
  roas: number;
  ctr: number;
}

export type BreakdownDimension = "device" | "country";

export interface BreakdownData {
  dimension: string;
  impressions: number;
  clicks: number;
  conversions: number;
  spend: number;
  conversion_value: number;
  ecpm: number;
  cpc: number;
  cpa: number;
  roas: number;
  ctr: number;
}

export interface Alert {
  id: string;
  campaignId: string;
  title: string;
  metric: "spend_pct" | "ctr" | "conversions" | "clicks";
  operator: "greater_than" | "less_than" | "equal_to";
  threshold: number;
  isActive: boolean;
  expiryAt?: string;
}

export interface TriggeredAlert {
  alertId: string;
  campaignId: string;
  campaignName: string;
  title: string;
  metric: string;
  currentValue: number;
  threshold: number;
  timestamp: string;
}
