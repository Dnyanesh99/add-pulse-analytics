import styled from "@emotion/styled";
import { css } from "@emotion/react";
import type { UiTheme } from "../theme";

export const Card = styled.div<{ hoverable?: boolean; theme?: UiTheme }>`
  background: ${props => props.theme?.card};
  border: 1px solid ${props => props.theme?.border};
  border-radius: 14px;
  box-shadow: ${props => props.theme?.shadow};
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  ${props => props.hoverable && css`
    cursor: pointer;
    &:hover {
      border-color: ${props.theme?.borderHover};
      box-shadow: ${props.theme?.shadowMd};
      transform: translateY(-4px);
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
