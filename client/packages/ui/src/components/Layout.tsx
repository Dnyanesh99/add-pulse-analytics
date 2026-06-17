import styled from "@emotion/styled";
import type { UiTheme } from "../theme";

export interface BoxProps {
  padding?: string;
  margin?: string;
  background?: string;
  borderRadius?: string;
  border?: string;
  width?: string;
  height?: string;
  overflow?: string;
  theme?: UiTheme;
  gap?: string;
}

export const Box = styled.div<BoxProps>`
  padding: ${(p) => p.padding};
  margin: ${(p) => p.margin};
  background: ${(p) => p.background};
  border-radius: ${(p) => p.borderRadius};
  border: ${(p) => p.border};
  width: ${(p) => p.width};
  height: ${(p) => p.height};
  overflow: ${(p) => p.overflow};
  display: flex;
  flex-direction: column;
  gap: ${(p) => p.gap};
`;

export interface FlexProps extends BoxProps {
  align?: string;
  justify?: string;
  direction?: "row" | "column" | "row-reverse" | "column-reverse";
  wrap?: string;
  flex?: string | number;
}

export const Flex = styled.div<FlexProps>`
  display: flex;
  flex-direction: ${(p) => p.direction || "row"};
  align-items: ${(p) => p.align || "stretch"};
  justify-content: ${(p) => p.justify || "flex-start"};
  flex-wrap: ${(p) => p.wrap || "nowrap"};
  gap: ${(p) => p.gap || "0"};
  padding: ${(p) => p.padding};
  margin: ${(p) => p.margin};
  width: ${(p) => p.width};
  height: ${(p) => p.height};
  flex: ${(p) => p.flex};
`;

export const MonoText = styled.span<{ theme?: UiTheme; color?: string; size?: string }>`
  font-family: ${(p) => p.theme?.fontMono};
  font-size: ${(p) => p.size || "12px"};
  color: ${(p) => p.color || "inherit"};
`;
