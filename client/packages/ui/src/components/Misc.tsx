import styled from "@emotion/styled";
import type { UiTheme } from "../theme";

export const SectionLabel = styled.div<{ theme?: UiTheme }>`
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.09em;
  text-transform: uppercase;
  color: ${(p) => p.theme?.textMuted};
  margin-bottom: 12px;
`;

export const FilterTab = styled.button<{ active?: boolean; theme?: UiTheme }>`
  font-family: ${(p) => p.theme?.fontBody};
  font-size: 13px;
  padding: 6px 14px;
  border-radius: 7px;
  border: 1px solid ${(p) => p.active ? p.theme?.accent + "60" : "transparent"};
  background: ${(p) => p.active ? p.theme?.accentBg : "transparent"};
  color: ${(p) => p.active ? p.theme?.accent : p.theme?.textSecondary};
  cursor: pointer;
  transition: all 0.15s;
  font-weight: ${(p) => p.active ? 500 : 400};
  &:hover { background: ${(p) => p.theme?.cardHover}; color: ${(p) => p.theme?.textPrimary}; }
`;

export const Divider = styled.div<{ my?: string; theme?: UiTheme }>`
  height: 1px;
  background: ${(p) => p.theme?.border};
  margin: ${(p) => p.my || "16px"} 0;
`;
