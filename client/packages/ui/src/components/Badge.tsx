import styled from "@emotion/styled";
import type { UiTheme } from "../theme";

export const Badge = styled.span<{ bg?: string; color?: string; border?: string; theme?: UiTheme }>`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-family: ${props => props.theme?.fontMono};
  font-size: 11px;
  font-weight: 500;
  padding: 3px 9px;
  border-radius: 5px;
  background: ${props => props.bg || props.theme?.accentBg};
  color: ${props => props.color || props.theme?.accent};
  border: 1px solid ${props => props.border || (props.color || props.theme?.accent) + "30"};
  white-space: nowrap;
`;
