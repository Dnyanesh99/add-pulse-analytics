import { useMemo } from "react";
import { Global } from "@emotion/react";
import styled from "@emotion/styled";
import { 
  useGetCampaignsQuery,
  useGetTimeSeriesQuery,
  useGetBreakdownQuery,
  useGetAlertsQuery 
} from "../api/apiSlice";
import { useAppSelector } from "../store/store-hooks";
import { GlobalStyles, fadeUp } from "../GlobalStyles";
import { useWebSocket } from "../hooks/useWebSocket";

// Modular Components
import { TopBar } from "../components/dashboard/TopBar";
import { AlertBanner } from "../components/AlertBanner";
import { StatsGrid } from "../components/dashboard/StatsGrid";
import { MapSection } from "../components/dashboard/MapSection";
import { DataGrid } from "../components/dashboard/DataGrid";
import { Outlet } from "react-router-dom";

// ── Layout ────────────────────────────────────────────────────────
const Shell = styled.div`
  min-height: 100vh;
  background: ${(p) => p.theme.bg};
  transition: background 0.25s;
`;

const Content = styled.main`
  max-width: 1280px;
  width: 100%;
  margin: 0 auto;
  padding: 24px 20px 40px;

  @media (max-width: 768px) { padding: 16px 12px 32px; }
`;

const PageHead = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 22px;
  flex-wrap: wrap;
  gap: 12px;
  animation: ${fadeUp} 0.3s ease both;
`;

const PageTitle = styled.h1`
  font-family: ${(p) => p.theme.fontDisplay};
  font-size: 24px;
  font-weight: 700;
  letter-spacing: -0.5px;
  color: ${(p) => p.theme.textPrimary};
  margin-bottom: 3px;
`;

const PageSub = styled.p`
  font-size: 13px;
  color: ${(p) => p.theme.textSecondary};
`;

export function AdPulseDashboard() {
  const metrics = useAppSelector((s) => s.metrics);
  
  // 1. RTK Query Hooks (Centralized Fetching & Caching)
  const { data: allCampaigns = [] } = useGetCampaignsQuery();
  
  // Prefetch analytics data (results will be cached for sub-components)
  useGetTimeSeriesQuery(7);
  useGetBreakdownQuery("device");
  useGetBreakdownQuery("country");
  useGetAlertsQuery();

  // 2. Real-time WebSocket Logic (Now updates RTK Query cache)
  useWebSocket();

  const activeCount = useMemo(() => 
    allCampaigns.filter(c => c.status === "active").length, 
  [allCampaigns]);

  return (
    <>
      <Global styles={GlobalStyles} />
      <Shell>
        <TopBar />
        <AlertBanner />

        <Content>
          <PageHead>
            <div>
              <PageTitle>Campaigns</PageTitle>
              <PageSub>
                Real-time overview · {activeCount} active · {metrics.lastUpdated ? 'Live' : 'Syncing...'}
              </PageSub>
            </div>
          </PageHead>

          <StatsGrid />
          <MapSection />
          <DataGrid />
        </Content>

        <Outlet />
      </Shell>
    </>
  );
}
