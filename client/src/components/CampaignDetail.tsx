import { useEffect, useMemo, useState } from "react";
import styled from "@emotion/styled";
import { keyframes, useTheme } from "@emotion/react";

import { useGetCampaignsQuery, useGetAlertsQuery, useDeleteAlertMutation, useToggleCampaignStatusMutation } from "../api/apiSlice";
import { SectionLabel, IconButton, Flex, Box } from "@adpulse/ui";
import { StatusPill } from "./StatusPill";
import { FunnelChart } from "./charts";
import { fmtNum, fmtCTR, genTimeSeries } from "../utils";
import { ReactECharts } from "./charts/EChartsCore";
import { useAppSelector } from "../store/store-hooks";
import { AlertModal } from "./AlertModal";
import type { ChartDataPoint, Alert } from "../types";
import { useParams, useNavigate } from "react-router-dom";

const slideIn = keyframes`from{transform:translateX(100%);opacity:0}to{transform:translateX(0);opacity:1}`;
const fadeIn  = keyframes`from{opacity:0}to{opacity:1}`;

const pulseAnimation = keyframes`
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.2); opacity: 0.7; }
  100% { transform: scale(1); opacity: 1; }
`;

const AlertIndicator = styled.div<{ triggered?: boolean }>`
  display: flex;
  align-items: center;
  gap: 4px;
  color: ${p => p.triggered ? p.theme.red : p.theme.amber};
  font-size: 14px;
  animation: ${p => p.triggered ? pulseAnimation : 'none'} 1.5s infinite ease-in-out;
`;

const AlertItem = styled.div`
  background: ${p => p.theme.bg};
  border: 1px solid ${p => p.theme.border};
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const AlertInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const AlertTitle = styled.div`
  font-size: 13px;
  font-weight: 600;
  color: ${p => p.theme.textPrimary};
`;

const AlertMeta = styled.div`
  font-size: 11px;
  color: ${p => p.theme.textMuted};
`;

const AlertActions = styled.div`
  display: flex;
  gap: 8px;
`;

const ActionBtn = styled.button<{ color?: string }>`
  background: transparent;
  border: none;
  color: ${p => p.color || p.theme.textMuted};
  cursor: pointer;
  padding: 4px;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  &:hover {
    background: ${p => p.theme.border};
    color: ${p => p.color || p.theme.textPrimary};
  }
`;

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,${(p) => p.theme.mode === "dark" ? 0.65 : 0.35});
  backdrop-filter: blur(3px);
  z-index: 300;
  animation: ${fadeIn} 0.2s ease both;
`;

const Panel = styled.div`
  position: fixed;
  top: 0; right: 0; bottom: 0;
  width: min(640px, 100vw);
  background: ${(p) => p.theme.surface};
  border-left: 1px solid ${(p) => p.theme.border};
  box-shadow: ${(p) => p.theme.shadowMd};
  display: flex;
  flex-direction: column;
  z-index: 301;
  animation: ${slideIn} 0.28s cubic-bezier(0.22, 1, 0.36, 1) both;
  overflow: hidden;
`;

const Header = styled.div`
  padding: 22px 24px 18px;
  border-bottom: 1px solid ${(p) => p.theme.border};
  background: ${(p) => p.theme.surface};
  flex-shrink: 0;
`;

const Body = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 22px 24px;
  -webkit-overflow-scrolling: touch;
`;

const Title = styled.h2`
  font-family: ${(p) => p.theme.fontDisplay};
  font-size: 18px;
  font-weight: 700;
  letter-spacing: -0.3px;
  color: ${(p) => p.theme.textPrimary};
  margin: 8px 0 4px;
`;

const Meta = styled.div`
  font-family: ${(p) => p.theme.fontMono};
  font-size: 11px;
  color: ${(p) => p.theme.textMuted};
`;

const MetricGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 20px;

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const MetricBox = styled.div`
  background: ${(p) => p.theme.bg};
  border: 1px solid ${(p) => p.theme.border};
  border-radius: 10px;
  padding: 14px 16px;
`;

const MetricLabel = styled.div`
  font-size: 10px;
  font-weight: 500;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  color: ${(p) => p.theme.textMuted};
  margin-bottom: 5px;
`;

const MetricValue = styled.div<{ color?: string }>`
  font-family: ${(p) => p.theme.fontMono};
  font-size: 22px;
  font-weight: 500;
  color: ${(p) => p.color || p.theme.textPrimary};
  letter-spacing: -0.5px;
`;

const NewAlertBtn = styled.button`
  background: ${p => p.theme.accentBg};
  color: ${p => p.theme.accent};
  border: 1px solid ${p => p.theme.accent}30;
  border-radius: 6px;
  padding: 4px 10px;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: opacity 0.15s;
  &:hover { opacity: 0.85; }
`;

const StatusBtn = styled.button<{ active: boolean }>`
  background: ${p => p.active ? p.theme.amberBg : p.theme.greenBg};
  color: ${p => p.active ? p.theme.amber : p.theme.green};
  border: 1px solid ${p => p.active ? p.theme.amber : p.theme.green}40;
  border-radius: 6px;
  padding: 4px 10px;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.15s;
  &:hover { opacity: 0.85; }
`;

const AlertCountText = styled.span`
  margin-left: 2px;
`;

const ChartWrapper = styled.div<{ padding?: string }>`
  background: ${p => p.theme.bg};
  border: 1px solid ${p => p.theme.border};
  border-radius: 10px;
  padding: ${p => p.padding || "14px 16px"};
  margin-bottom: 20px;
`;

export const CampaignDetail = () => {
  const theme = useTheme();
  const { id: selectedId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const role = useAppSelector((s) => (s as any).auth?.role);
  
  // RTK Query Hooks
  const { data: allCampaigns = [] } = useGetCampaignsQuery();
  const { data: allAlerts = [] } = useGetAlertsQuery();
  const [deleteAlert] = useDeleteAlertMutation();
  const [toggleStatus] = useToggleCampaignStatusMutation();

  const campaign = useMemo(() => 
    allCampaigns.find(c => c.id === selectedId),
  [allCampaigns, selectedId]);

  const { triggeredAlerts } = useAppSelector((s) => s.alerts);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [editingAlert, setEditingAlert] = useState<Alert | undefined>(undefined);

  // Filter alerts for this campaign
  const currentAlerts = useMemo(() => 
    allAlerts.filter(a => a.campaignId === selectedId),
  [allAlerts, selectedId]);

  // Close on Escape
  useEffect(() => {
    if (!selectedId) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") navigate("/campaigns"); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [selectedId, navigate]);

  const impressions = campaign?.impressions || 0;
  
  const sparkData = useMemo(() => genTimeSeries(impressions / 30, 30, 0.2), [impressions]);

  // 30-day trend chart option
  const trendOption = useMemo(() => ({
    backgroundColor: "transparent",
    grid: { top: 10, right: 10, bottom: 24, left: 10, containLabel: true },
    tooltip: {
      trigger: "axis",
      backgroundColor: theme.card,
      borderColor: theme.border,
      textStyle: { color: theme.textPrimary, fontFamily: theme.fontMono, fontSize: 11 },
    },
    xAxis: {
      type: "category",
      data: sparkData.map((d: ChartDataPoint) => d.date),
      axisLine: { lineStyle: { color: theme.border } },
      axisTick: { show: false },
      axisLabel: { color: theme.textMuted, fontSize: 10, fontFamily: theme.fontMono, interval: 6 },
    },
    yAxis: {
      type: "value",
      axisLine: { show: false }, axisTick: { show: false },
      splitLine: { lineStyle: { color: theme.border, type: "dashed" } },
      axisLabel: {
        color: theme.textMuted, fontSize: 10, fontFamily: theme.fontMono,
        formatter: (v: number) => v >= 1e6 ? (v / 1e6).toFixed(1) + "M" : v >= 1e3 ? (v / 1e3).toFixed(0) + "K" : v,
      },
    },
    series: [{
      type: "line",
      data: sparkData.map((d: ChartDataPoint) => d.value),
      smooth: 0.4,
      symbol: "none",
      lineStyle: { color: theme.accent, width: 2 },
      areaStyle: {
        color: {
          type: "linear", x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [{ offset: 0, color: theme.accent + "40" }, { offset: 1, color: theme.accent + "00" }],
        },
      },
    }],
  }), [sparkData, theme]);

  if (!campaign) return null;

  const ctrVal  = fmtCTR(campaign);
  const cvr     = campaign.clicks > 0 ? ((campaign.conversions / campaign.clicks) * 100).toFixed(2) : "0.00";
  const isTriggered = triggeredAlerts.some(a => a.campaignId === campaign.id);
  const alertCount = currentAlerts.length;
  const isActive = campaign.status === 'active';

  const handleEdit = (alert: Alert) => {
    setEditingAlert(alert);
    setShowAlertModal(true);
  };

  const handleCloseModal = () => {
    setShowAlertModal(false);
    setEditingAlert(undefined);
  };

  return (
    <>
      <Overlay onClick={() => navigate("/campaigns")}>
        <Panel onClick={(e) => e.stopPropagation()}>
        <Header>
          <Flex justify="space-between" align="flex-start" margin="0 0 12px">
            <Flex align="center" gap="10px">
              <StatusPill status={campaign.status} />
              {role === 'ROLE_ADMIN' && (
                <>
                  <StatusBtn 
                    active={isActive} 
                    onClick={() => toggleStatus({ id: campaign.id, currentStatus: campaign.status })}
                  >
                    {isActive ? "⏸ PAUSE" : "▶️ RESUME"}
                  </StatusBtn>
                  <NewAlertBtn onClick={() => setShowAlertModal(true)}>
                    🔔 NEW ALERT
                  </NewAlertBtn>
                </>
              )}
            </Flex>
            <Flex align="center" gap="12px">
              {alertCount > 0 && (
                <AlertIndicator triggered={isTriggered}>
                  🔔 <AlertCountText>{alertCount}</AlertCountText>
                </AlertIndicator>
              )}
              <IconButton onClick={() => navigate("/campaigns")} aria-label="Close">✕</IconButton>
            </Flex>
          </Flex>
          <Title>{campaign.name}</Title>
          <Meta>ID: {campaign.id} · {campaign.currency || 'USD'}</Meta>
        </Header>

        <Body>
          {/* Key metrics */}
          <SectionLabel>Performance</SectionLabel>
          <MetricGrid>
            <MetricBox>
              <MetricLabel>Impressions</MetricLabel>
              <MetricValue>{fmtNum(campaign.impressions)}</MetricValue>
            </MetricBox>
            <MetricBox>
              <MetricLabel>Clicks</MetricLabel>
              <MetricValue color={theme.accent}>{fmtNum(campaign.clicks)}</MetricValue>
            </MetricBox>
            <MetricBox>
              <MetricLabel>CTR</MetricLabel>
              <MetricValue color={parseFloat(ctrVal) > 4 ? theme.green : theme.amber}>{ctrVal}</MetricValue>
            </MetricBox>
            <MetricBox>
              <MetricLabel>Conversions</MetricLabel>
              <MetricValue color={theme.green}>{fmtNum(campaign.conversions)}</MetricValue>
            </MetricBox>
            <MetricBox>
              <MetricLabel>CVR</MetricLabel>
              <MetricValue color={theme.purple}>{cvr}%</MetricValue>
            </MetricBox>
            <MetricBox>
              <MetricLabel>Spend</MetricLabel>
              <MetricValue>${campaign.spend.toFixed(2)}</MetricValue>
            </MetricBox>
          </MetricGrid>

          {/* Active Alerts */}
          {alertCount > 0 && (
            <>
              <SectionLabel>Active Alerts ({alertCount})</SectionLabel>
              <Box margin="0 0 20px" gap="10px">
                {currentAlerts.map((alert: Alert) => (
                  <AlertItem key={alert.id}>
                    <AlertInfo>
                      <AlertTitle>{alert.title}</AlertTitle>
                      <AlertMeta>
                        {alert.metric} {alert.operator.replace('_', ' ')} {alert.metric === 'spend_pct' ? (alert.threshold * 100).toFixed(0) + '%' : alert.threshold}
                      </AlertMeta>
                    </AlertInfo>
                    {role === 'ROLE_ADMIN' && (
                      <AlertActions>
                        <ActionBtn onClick={() => handleEdit(alert)}>✎</ActionBtn>
                        <ActionBtn color={theme.red} onClick={() => deleteAlert(alert.id)}>✕</ActionBtn>
                      </AlertActions>
                    )}
                  </AlertItem>
                ))}
              </Box>
            </>
          )}

          {/* Funnel */}
          <SectionLabel>Conversion funnel</SectionLabel>
          <ChartWrapper>
            <FunnelChart campaign={campaign} />
          </ChartWrapper>

          {/* 30-day trend */}
          <SectionLabel>30-day impression trend</SectionLabel>
          <ChartWrapper padding="14px 10px 10px">
            <ReactECharts option={trendOption} style={{ height: 160, width: "100%" }} opts={{ renderer: "canvas" }} />
          </ChartWrapper>
        </Body>
      </Panel>
    </Overlay>
      {showAlertModal && campaign && (
        <AlertModal 
          campaignId={campaign.id} 
          onClose={handleCloseModal} 
          editAlert={editingAlert}
        />
      )}
    </>
  );
}

