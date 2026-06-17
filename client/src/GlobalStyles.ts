import { css, keyframes } from "@emotion/react";
import type { Theme } from "./Theme";

// ── Keyframes ─────────────────────────────────────────────────────
export const fadeUp  = keyframes`from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}`;
export const pulse   = keyframes`0%,100%{opacity:1}50%{opacity:0.4}`;

// ── Global Styles ─────────────────────────────────────────────────
export const GlobalStyles = (t: Theme) => css`
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,400&family=DM+Mono:wght@400;500&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }
  body {
    background: ${t.bg};
    color: ${t.textPrimary};
    font-family: ${t.fontBody};
    font-size: 14px;
    line-height: 1.5;
    -webkit-font-smoothing: antialiased;
    transition: background 0.25s, color 0.25s;
  }
  ::-webkit-scrollbar { width: 5px; height: 5px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: ${t.border}; border-radius: 3px; }
`;