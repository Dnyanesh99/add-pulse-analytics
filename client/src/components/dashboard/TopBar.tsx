import styled from "@emotion/styled";
import { keyframes } from "@emotion/react";
import { useAppDispatch, useAppSelector } from "../../store/store-hooks";
import { toggleTheme } from "../../store";
import { IconButton } from "@adpulse/ui";
import { fmtNum } from "../../utils";

const pulse = keyframes`0%,100%{opacity:1}50%{opacity:0.35}`;

const TopBarWrapper = styled.header`
  height: 58px;
  background: ${(p) => p.theme.card};
  border-bottom: 1px solid ${(p) => p.theme.border};
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px 0 24px;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: ${(p) => p.theme.shadow};
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  background: ${(p) => p.theme.surface};
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
`;

const Logo = styled.div`
  font-family: ${(p) => p.theme.fontDisplay};
  font-size: 18px;
  font-weight: 800;
  letter-spacing: -0.5px;
  color: ${(p) => p.theme.textPrimary};
  display: flex;
  align-items: center;
  gap: 8px;

  span { color: ${(p) => p.theme.accent}; }
`;

const LogoDot = styled.div`
  width: 8px; height: 8px;
  border-radius: 50%;
  background: ${(p) => p.theme.accent};
  animation: ${pulse} 2s ease-in-out infinite;
`;

const TopRight = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const LivePill = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: ${(p) => p.theme.fontMono};
  font-size: 12px;
  color: ${(p) => p.theme.green};
  background: ${(p) => p.theme.greenBg};
  border: 1px solid ${(p) => p.theme.green}30;
  padding: 5px 12px;
  border-radius: 6px;

  @media (max-width: 600px) { display: none; }
`;

const LiveDot = styled.div`
  width: 6px; height: 6px;
  border-radius: 50%;
  background: ${(p) => p.theme.green};
  animation: ${pulse} 1.8s ease-in-out infinite;
`;

import { logout } from "../../store";
import { useNavigate } from "react-router-dom";

export const TopBar = () => {
  const dispatch = useAppDispatch();
  const themeMode = useAppSelector((s) => s.theme.mode);
  const metrics = useAppSelector((s) => s.metrics);
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <TopBarWrapper>
      <Logo>
        <LogoDot />
        Ad<span>Pulse</span>
      </Logo>
      <TopRight>
        <LivePill>
          <LiveDot />
          {fmtNum(metrics.totalImpressions)} impressions
        </LivePill>
        <IconButton
          onClick={() => dispatch(toggleTheme())}
          aria-label="Toggle theme"
        >
          {themeMode === "dark" ? "☀️" : "🌙"}
        </IconButton>
        <IconButton onClick={handleLogout} aria-label="Logout">
          🚪
        </IconButton>
      </TopRight>
    </TopBarWrapper>
  );
};
