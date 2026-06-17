import styled from "@emotion/styled";
import { css } from "@emotion/react";
import type { UiTheme } from "../theme";

export const Card = styled.div<{ hoverable?: boolean; theme?: UiTheme }>`
  background: ${props => props.theme?.card};
  border: 1px solid ${props => props.theme?.border};
  border-radius: 14px;
  box-shadow: ${props => props.theme?.shadow};
  overflow: hidden;
  transition: box-shadow 0.2s, border-color 0.2s;
  ${props => props.hoverable && css`
    cursor: pointer;
    &:hover {
      border-color: ${props.theme?.borderHover};
      box-shadow: ${props.theme?.shadowMd};
    }
  `}
`;

export const CardHeader = styled.div<{ theme?: UiTheme }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid ${props => props.theme?.border};
`;

export const CardTitle = styled.h3<{ theme?: UiTheme }>`
  font-family: ${props => props.theme?.fontDisplay};
  font-size: 14px;
  font-weight: 600;
  color: ${props => props.theme?.textPrimary};
  letter-spacing: -0.2px;
  margin: 0;
`;

export const CardBody = styled.div<{ padding?: string; theme?: UiTheme; height?: string }>`
  padding: ${props => props.padding || "20px"};
  ${props => props.height && css`height: ${props.height};`}
`;
