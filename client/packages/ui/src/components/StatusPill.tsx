import { useTheme } from "@emotion/react";
import type { FC, ReactNode } from "react";
import styled from "@emotion/styled";
import { css } from "@emotion/react";
import type { UiTheme } from "../theme";
import { pulse } from "../animations";

const Pill = styled.span<{ color: string; bg: string }>`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-family: ${props => props.theme.fontMono};
  font-size: 11px;
  font-weight: 500;
  padding: 3px 9px;
  border-radius: 5px;
  background: ${props => props.bg};
  color: ${props => props.color};
  border: 1px solid ${props => props.color}30;
  text-transform: capitalize;
`;

const Dot = styled.div<{ active: boolean }>`
  width: 5px; height: 5px;
  border-radius: 50%;
  background: currentColor;
  flex-shrink: 0;
  ${props => props.active && css`animation: ${pulse} 1.8s ease-in-out infinite;`}
`;

interface StatusPillProps {
  status: string;
  color: string;
  bg: string;
  active?: boolean;
  children?: ReactNode;
  theme?: UiTheme;
}

export const StatusPill: FC<StatusPillProps> = ({ status, color, bg, active, children, theme: manualTheme }) => {
  const emotionTheme = useTheme() as UiTheme;
  const theme = manualTheme || emotionTheme;

  return (
    <Pill color={color} bg={bg} theme={theme}>
      <Dot active={!!active} />
      {children || status}
    </Pill>
  );
};
