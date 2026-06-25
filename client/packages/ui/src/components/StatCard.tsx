import { useTheme } from "@emotion/react";
import type { FC, ReactNode } from "react";
import styled from "@emotion/styled";
import type { UiTheme } from "../theme";
import { fadeUp } from "../animations";

const StatWrap = styled.div<{ delay: string }>`
  background: ${props => props.theme.card};
  border: 1px solid ${props => props.theme.border};
  border-radius: 14px;
  padding: 20px 22px;
  box-shadow: ${props => props.theme.shadow};
  animation: ${fadeUp} 0.4s ease both;
  animation-delay: ${props => props.delay};
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  &:hover {
    box-shadow: ${props => props.theme.shadowMd};
    border-color: ${props => props.theme.borderHover};
    transform: translateY(-4px);
  }
`;

const StatAccent = styled.div<{ color: string }>`
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 3px;
  background: ${props => props.color};
  opacity: 0.8;
`;

const HeaderWrap = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 14px;
`;

const IconWrap = styled.div<{ bg: string }>`
  width: 32px; height: 32px;
  border-radius: 8px;
  background: ${props => props.bg};
  display: flex; align-items: center; justify-content: center;
  font-size: 16px;
`;

const StatLabel = styled.div<{ color: string }>`
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  color: ${props => props.color};
`;

const StatValue = styled.div<{ fontMono: string; color: string; delay: string }>`
  font-family: ${props => props.fontMono};
  font-size: 28px;
  font-weight: 500;
  color: ${props => props.color};
  letter-spacing: -1px;
  line-height: 1;
  text-align: center;
  margin-bottom: 6px;
  animation: ${fadeUp} 0.3s ease both;
  animation-delay: ${props => props.delay};
`;

const Delta = styled.div<{ color: string; fontMono: string }>`
  font-size: 12px;
  font-family: ${props => props.fontMono};
  color: ${props => props.color};
  position: absolute;
  top: 15px;
  right: 15px;
`;

interface StatCardProps {
  label: string;
  value: string | number;
  delta?: string;
  deltaPositive?: boolean;
  accent?: string;
  icon?: string;
  delay?: string;
  children?: ReactNode;
  theme?: UiTheme; // Kept for compatibility but now optional
}

export const StatCard: FC<StatCardProps> = ({
  label, value, delta, deltaPositive, accent, icon, delay = "0s", children, theme: manualTheme
}) => {
  const emotionTheme = useTheme() as UiTheme;
  const theme = manualTheme || emotionTheme;

  return (
    <StatWrap delay={delay}>
      <StatAccent color={accent || theme.accent} />
      <HeaderWrap>
        {icon && <IconWrap bg={accent ? accent + "18" : theme.accentBg}>{icon}</IconWrap>}
        <StatLabel color={theme.textMuted}>{label}</StatLabel>
      </HeaderWrap>
      {delta && <Delta color={deltaPositive ? theme.green : theme.red} fontMono={theme.fontMono}>{delta}</Delta>}
      <StatValue fontMono={theme.fontMono} color={theme.textPrimary} delay={delay}>{value}</StatValue>
      {children}
    </StatWrap>
  );
};
