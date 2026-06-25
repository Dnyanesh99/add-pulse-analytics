import { css, keyframes } from "@emotion/react";
import type { Theme } from "./Theme";

// ── Keyframes ─────────────────────────────────────────────────────
export const fadeUp  = keyframes`from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}`;
export const pulse   = keyframes`0%,100%{opacity:1}50%{opacity:0.4}`;

export const bgShift = keyframes`
  0% { background-position: 0% 0%; }
  50% { background-position: 100% 100%; }
  100% { background-position: 0% 0%; }
`;

// ── Global Styles ─────────────────────────────────────────────────
export const GlobalStyles = (t: Theme) => css`
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,400&family=DM+Mono:wght@400;500&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }
  body {
    background-color: ${t.bg};
    background-image: 
      radial-gradient(at 0% 0%, ${t.accentBg} 0px, transparent 50%),
      radial-gradient(at 100% 0%, ${t.purpleBg} 0px, transparent 50%),
      radial-gradient(at 100% 100%, ${t.greenBg} 0px, transparent 50%),
      radial-gradient(at 0% 100%, ${t.amberBg} 0px, transparent 50%);
    background-attachment: fixed;
    background-size: 150% 150%;
    animation: ${bgShift} 30s ease-in-out infinite alternate;
    color: ${t.textPrimary};
    font-family: ${t.fontBody};
    font-size: 14px;
    line-height: 1.5;
    -webkit-font-smoothing: antialiased;
    transition: background-color 0.25s, color 0.25s;
  }
  ::-webkit-scrollbar { width: 5px; height: 5px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: ${t.border}; border-radius: 3px; }
`;