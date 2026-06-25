import styled from "@emotion/styled";
import { useAppSelector } from "../../store/store-hooks";
import { StatCard } from "@adpulse/ui";
import { fmtNum, fmtCTR } from "../../utils";
import { useTheme } from "@emotion/react";

const StatsGridWrapper = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
  margin-bottom: 24px;

  @media (max-width: 1000px) { grid-template-columns: repeat(2, 1fr); }
  @media (max-width: 500px)  { grid-template-columns: 1fr; }
`;

export const StatsGrid = () => {
  const metrics = useAppSelector((s) => s.metrics);
  const theme = useTheme();

  return (
    <StatsGridWrapper>
      <StatCard
        delay="0s"
        label="Total impressions"
        value={fmtNum(metrics.totalImpressions)}
        delta="Live" deltaPositive accent={theme.accent} icon="📡"
      />
      <StatCard
        delay="0.06s"
        label="Total clicks"
        value={fmtNum(metrics.totalClicks)}
        delta="Live" deltaPositive accent={theme.green} icon="🖱️"
      />
      <StatCard
        delay="0.12s"
        label="Avg CTR"
        value={fmtCTR({ clicks: metrics.totalClicks, impressions: metrics.totalImpressions })}
        delta="Live" accent={theme.amber} icon="📈"
      />
      <StatCard
        delay="0.18s"
        label="Conversions"
        value={fmtNum(metrics.totalConversions)}
        delta="Live" deltaPositive accent={theme.purple} icon="🎯"
      />
    </StatsGridWrapper>
  );
};
