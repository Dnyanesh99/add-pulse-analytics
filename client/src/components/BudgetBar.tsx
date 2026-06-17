import type { FC } from "react";
import styled from "@emotion/styled";
import { keyframes } from "@emotion/react";
import { useTheme } from "@emotion/react";

const shimmer = keyframes`0%{transform:translateX(-100%)}100%{transform:translateX(200%)}`;

const Container = styled.div`
  min-width: 90px;
`;

const Track = styled.div`
  height: 4px;
  background: ${p => p.theme.border};
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 4px;
`;

const Fill = styled.div<{ pct: number; color: string }>`
  height: 100%;
  width: ${p => p.pct}%;
  background: ${p => p.color};
  border-radius: 2px;
  position: relative;
  overflow: hidden;
  transition: width 0.5s ease;
  &::after {
    content: '';
    position: absolute;
    top: 0; bottom: 0;
    width: 40%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent);
    animation: ${shimmer} 2s ease infinite;
  }
`;

const BudgetLabel = styled.div`
  font-family: ${p => p.theme.fontMono};
  font-size: 10px;
  color: ${p => p.theme.textMuted};
`;

interface BudgetBarProps {
  pct: number;
  spend: number;
  budget: number;
}

export const BudgetBar: FC<BudgetBarProps> = ({ pct, spend, budget }) => {
  const theme = useTheme();
  const color =
    pct >= 95 ? theme.red :
    pct >= 75 ? theme.amber :
    theme.green;

  return (
    <Container>
      <Track><Fill pct={pct} color={color} /></Track>
      <BudgetLabel>
        ${spend > 0 ? spend.toFixed(0) : "—"} / ${budget}
      </BudgetLabel>
    </Container>
  );
};

