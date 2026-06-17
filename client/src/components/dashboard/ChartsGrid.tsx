import { useMemo } from "react";
import styled from "@emotion/styled";
import { useGetTimeSeriesQuery } from "../../api/apiSlice";
import { Card, CardBody, CardHeader, CardTitle, Badge } from "@adpulse/ui";
import { TrendChart } from "../charts";
import { Leaderboard } from "./Leaderboard";

const ChartsRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 260px;
  gap: 14px;
  margin-bottom: 20px;

  @media (max-width: 900px) { 
    grid-template-columns: 1fr;
  }
`;

const TrendCard = styled(Card)`
  overflow: hidden;
  min-height: 0;
`;

const ChartBody = styled(CardBody)`
  height: 220px;
  box-sizing: content-box;
`;

export const ChartsGrid = () => {
  // RTK Query Hook with 7-day default
  const { data: historical = [], isFetching } = useGetTimeSeriesQuery(7);

  const impressionSeries = useMemo(() => 
    historical.map(d => ({ date: d.day, value: d.impressions })), 
  [historical]);

  const clickSeries = useMemo(() => 
    historical.map(d => ({ date: d.day, value: d.clicks })), 
  [historical]);

  return (
    <ChartsRow>
      <TrendCard>
        <CardHeader>
          <CardTitle>Performance Trend {historical.length > 0 ? `(${historical.length}d)` : ""}</CardTitle>
          <Badge>{isFetching ? "Loading..." : "Live"}</Badge>
        </CardHeader>
        <ChartBody padding="10px 12px 12px">
          <TrendChart impressionData={impressionSeries} clickData={clickSeries} />
        </ChartBody>
      </TrendCard>

      <Leaderboard />
    </ChartsRow>
  );
};

