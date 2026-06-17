import styled from "@emotion/styled";
import type { UiTheme } from "../theme";

export const IconButton = styled.button<{ theme?: UiTheme }>`
  width: 34px; height: 34px;
  border-radius: 8px;
  border: 1px solid ${props => props.theme?.border};
  background: ${props => props.theme?.card};
  color: ${props => props.theme?.textSecondary};
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  font-size: 16px;
  transition: all 0.15s;
  &:hover { 
    background: ${props => props.theme?.cardHover}; 
    color: ${props => props.theme?.textPrimary}; 
    border-color: ${props => props.theme?.borderHover}; 
  }
`;
