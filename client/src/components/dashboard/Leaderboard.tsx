import { useState } from "react";
import styled from "@emotion/styled";
import { useGetTopPerformersQuery } from "../../api/apiSlice";
import { Card, CardHeader, CardTitle, CardBody } from "@adpulse/ui";
import { fmtNum } from "../../utils";
import { StatusPill } from "../StatusPill";
import type { Campaign } from "../../types";
import { useTheme } from "@emotion/react";

const LeaderboardWrapper = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  
  & > div {
    flex: 1;
    display: flex;
    flex-direction: column;
  }
`;

const PerformerRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid ${props => props.theme.border};
  &:last-child {
    border-bottom: none;
  }
`;

const CampaignInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const CampaignName = styled.span`
  font-weight: 600;
  font-size: 14px;
  color: ${props => props.theme.textPrimary};
`;

const MetricValue = styled.span<{ accent?: string }>`
  font-family: ${props => props.theme.fontMono};
  font-weight: 700;
  font-size: 15px;
  color: ${props => props.accent || props.theme.textPrimary};
`;

const SelectMetric = styled.select`
  background: ${props => props.theme.bgSecondary};
  color: ${props => props.theme.textPrimary};
  border: 1px solid ${props => props.theme.border};
  border-radius: 6px;
  padding: 4px 8px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  outline: none;
  &:focus {
    border-color: ${props => props.theme.accent};
  }
`;

const StatePlaceholder = styled.div`
  padding: 20px;
  text-align: center;
  opacity: 0.5;
`;

const METRICS = [
  { label: "Conversions", value: "conversions", icon: "🎯" },
  { label: "CTR", value: "ctr", icon: "📈" },
  { label: "Impressions", value: "impressions", icon: "📡" },
  { label: "Clicks", value: "clicks", icon: "🖱️" },
  { label: "ROAS", value: "roas", icon: "💰" },
  { label: "Spend", value: "spend", icon: "💸" },
];

export const Leaderboard = () => {
  const [selectedMetric, setSelectedMetric] = useState("conversions");
  const theme = useTheme();

  // RTK Query Hook with polling instead of manual setInterval
  const { data: topPerformers = [], isFetching } = useGetTopPerformersQuery(
    { metric: selectedMetric, limit: 5 },
    { pollingInterval: 30000 }
  );

  const getMetricDisplay = (campaign: Campaign) => {
    const val = campaign[selectedMetric as keyof Campaign] as number;
    if (selectedMetric === "ctr") return (val * 100).toFixed(2) + "%";
    if (selectedMetric === "roas") return val.toFixed(2) + "x";
    if (["spend", "conversion_value"].includes(selectedMetric)) return "$" + fmtNum(val);
    return fmtNum(val);
  };

  const currentMetric = METRICS.find(m => m.value === selectedMetric);

  return (
    <LeaderboardWrapper>
      <Card>
        <CardHeader>
          <CardTitle>Top Performers {currentMetric?.icon}</CardTitle>
          <SelectMetric 
            value={selectedMetric} 
            onChange={(e) => setSelectedMetric(e.target.value)}
          >
            {METRICS.map(m => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </SelectMetric>
        </CardHeader>
        <CardBody padding="0 20px">
          {isFetching && topPerformers.length === 0 ? (
            <StatePlaceholder>Loading...</StatePlaceholder>
          ) : topPerformers.length === 0 ? (
            <StatePlaceholder>No data available</StatePlaceholder>
          ) : (
            topPerformers.map((campaign, idx) => (
              <PerformerRow key={campaign.id} data-cy="performer-row">
                <CampaignInfo>
                  <CampaignName>{idx + 1}. {campaign.name}</CampaignName>
                  <StatusPill status={campaign.status} />
                </CampaignInfo>
                <MetricValue accent={theme.accent}>
                  {getMetricDisplay(campaign)}
                </MetricValue>
              </PerformerRow>
            ))
          )}
        </CardBody>
      </Card>
    </LeaderboardWrapper>
  );
};

