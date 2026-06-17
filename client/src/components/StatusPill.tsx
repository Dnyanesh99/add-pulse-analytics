import type { FC, ReactNode } from "react";
import type { Theme } from "../Theme";
import type { CampaignStatus } from "../types";
import { StatusPill as SharedStatusPill } from "@adpulse/ui";
import { useTheme } from "@emotion/react";

const statusMap: Record<CampaignStatus, { key: "green" | "amber" | "red" }> = {
  active: { key: "green" },
  paused: { key: "amber" },
  ended:  { key: "red"   },
  draft:  { key: "amber" },
};

interface StatusPillProps {
  status: CampaignStatus;
  children?: ReactNode;
}

export const StatusPill: FC<StatusPillProps> = ({ status, children }) => {
  const theme = useTheme() as Theme;
  const s = statusMap[status] || statusMap.ended;
  const color = theme[s.key] as string;
  const bg = theme[`${s.key}Bg` as keyof Theme] as string;

  return (
    <SharedStatusPill 
      status={status} 
      color={color} 
      bg={bg} 
      active={status === "active"}
    >
      {children}
    </SharedStatusPill>
  );
};
