import { useMemo, useRef } from "react";
import type { FC } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { keyframes } from "@emotion/react";
import styled from "@emotion/styled";
import { useAppSelector, useAppDispatch } from "../store/store-hooks";
import { setSort, selectCampaign } from "../store";
import { budgetPct, fmtCTR, fmtNum } from "../utils";
import { BudgetBar } from "./BudgetBar";
import { StatusPill } from "./StatusPill";
import { MonoText } from "@adpulse/ui";
import type { Campaign, CampaignSortKey, Alert } from "../types";
import { useGetAlertsQuery } from "../api/apiSlice";
import { useTheme } from "@emotion/react";

const fadeUp = keyframes`from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}`;

const Wrap = styled.div`
  width: 100%;
  height: 100%;
  overflow: hidden;
`;

const TableScroll = styled.div`
  width: 100%;
  min-height: 450px;
  max-height: 75vh;
  overflow: auto;
  -webkit-overflow-scrolling: touch;
  will-change: transform;
  background: ${(p) => p.theme.card};

  @media (max-width: 768px) {
    min-height: 320px;
    max-height: 60vh;
  }
`;

const TableContent = styled.div<{ height: number }>`
  min-width: fit-content;
  position: relative;
  min-height: 100%;
  height: ${(p) => p.height}px;
`;

const Thead = styled.div<{ cols: string }>`
  display: grid;
  grid-template-columns: ${(p) => p.cols};
  border-bottom: 1px solid ${(p) => p.theme.border};
  position: sticky;
  top: 0;
  z-index: 10;
  background: ${(p) => p.theme.card};
`;

const Th = styled.div<{ sortable?: boolean }>`
  padding: 12px 16px;
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  color: ${(p) => p.theme.textMuted};
  cursor: ${(p) => (p.sortable ? "pointer" : "default")};
  user-select: none;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: color 0.15s;
  white-space: nowrap;
  background: ${(p) => p.theme.card};
  &:hover {
    color: ${(p) => (p.sortable ? p.theme.textSecondary : p.theme.textMuted)};
  }
`;

const VirtualList = styled.div`
  position: relative;
  width: 100%;
`;

const Row = styled.div<{ cols: string; idx: number; top: number; height: number }>`
  display: grid;
  grid-template-columns: ${(p) => p.cols};
  border-bottom: 1px solid ${(p) => p.theme.border};
  cursor: pointer;
  transition: background 0.12s;
  animation: ${fadeUp} 0.25s ease both;
  animation-delay: ${(p) => Math.min(p.idx * 30, 200)}ms;
  position: absolute;
  left: 0;
  width: 100%;
  background: ${(p) => p.theme.card};
  will-change: transform, top;
  top: ${(p) => p.top}px;
  height: ${(p) => p.height}px;

  &:hover {
    background: ${(p) => p.theme.cardHover};
  }
`;

const Cell = styled.div<{ color?: string }>`
  padding: 13px 16px;
  font-size: 13px;
  color: ${(p) => p.color || p.theme.textPrimary};
  display: flex;
  align-items: center;
  overflow: hidden;
  white-space: nowrap;
`;

const OverflowDiv = styled.div`
  overflow: hidden;
`;

const CampaignName = styled.div`
  font-size: 13px;
  font-weight: 500;
  color: ${(p) => p.theme.textPrimary};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 2px;
`;

const CampaignMeta = styled.div`
  font-family: ${(p) => p.theme.fontMono};
  font-size: 10px;
  color: ${(p) => p.theme.textMuted};
`;

const pulseAnimation = keyframes`
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.2); opacity: 0.7; }
  100% { transform: scale(1); opacity: 1; }
`;

const AlertIndicator = styled.div<{ triggered?: boolean }>`
  display: flex;
  align-items: center;
  gap: 4px;
  color: ${p => p.triggered ? p.theme.red : p.theme.amber};
  font-size: 12px;
  animation: ${p => p.triggered ? pulseAnimation : 'none'} 1.5s infinite ease-in-out;
`;

const AlertCount = styled.span`
  font-size: 10px;
  font-weight: 700;
  margin-left: -1px;
`;

const EmptyCell = styled.span`
  opacity: 0.2;
`;

const SortIcon = styled.span<{ active?: boolean }>`
  font-size: 10px;
  opacity: ${(p) => (p.active ? 1 : 0.3)};
  color: ${(p) => (p.active ? p.theme.accent : "inherit")};
`;

const COLS = "minmax(180px,2fr) 90px 80px 110px 110px 80px 130px";

interface Header {
  key: CampaignSortKey | "alerts";
  label: string;
  sortable: boolean;
}

const HEADERS: Header[] = [
  { key: "name", label: "Campaign", sortable: true },
  { key: "status", label: "Status", sortable: false },
  { key: "alerts", label: "Alerts", sortable: false },
  { key: "impressions", label: "Impressions", sortable: true },
  { key: "clicks", label: "Clicks", sortable: true },
  { key: "ctr", label: "CTR", sortable: true },
  { key: "spend", label: "Budget", sortable: true },
];

interface CampaignTableProps {
  campaigns: Campaign[];
}

export const CampaignTable: FC<CampaignTableProps> = ({ campaigns }) => {
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const { sortKey, sortDir } = useAppSelector((s) => s.campaigns);
  const { triggeredAlerts } = useAppSelector((s) => s.alerts);
  const { data: allAlerts = [] } = useGetAlertsQuery();
  const parentRef = useRef<HTMLDivElement>(null);

  const campaignAlertsGrouped = useMemo(() => {
    const grouped: Record<string, Alert[]> = {};
    allAlerts.forEach(a => {
      if (!grouped[a.campaignId]) grouped[a.campaignId] = [];
      grouped[a.campaignId].push(a);
    });
    return grouped;
  }, [allAlerts]);

  const sorted = useMemo(() => {
    return [...campaigns].sort((a, b) => {
      let av: string | number = a[sortKey as keyof Campaign] ?? 0;
      let bv: string | number = b[sortKey as keyof Campaign] ?? 0;

      if (sortKey === "ctr") {
        av = a.impressions > 0 ? a.clicks / a.impressions : 0;
        bv = b.impressions > 0 ? b.clicks / b.impressions : 0;
      }

      if (typeof av === "string" && typeof bv === "string") {
        return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
      }

      const numA = av as number;
      const numB = bv as number;
      return sortDir === "asc" ? numA - numB : numB - numA;
    });
  }, [campaigns, sortKey, sortDir]);

  // eslint-disable-next-line react-hooks/incompatible-library
  const rowVirtualizer = useVirtualizer({
    count: sorted.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 58,
    overscan: 12,
  });

  const handleSort = (key: CampaignSortKey) => dispatch(setSort(key));
  const handleSelect = (c: Campaign) => dispatch(selectCampaign(c.id));

  return (
    <Wrap>
      <TableScroll ref={parentRef}>
        <TableContent height={rowVirtualizer.getTotalSize() + 42}>
          <Thead cols={COLS}>
            {HEADERS.map((header) => (
              <Th
                key={header.key}
                sortable={header.sortable}
                onClick={() => header.sortable && handleSort(header.key as CampaignSortKey)}
              >
                {header.label}
                {header.sortable && (
                  <SortIcon active={sortKey === header.key}>
                    {sortKey === header.key
                      ? sortDir === "desc"
                        ? "↓"
                        : "↑"
                      : "↕"}
                  </SortIcon>
                )}
              </Th>
            ))}
          </Thead>

          <VirtualList>
            {rowVirtualizer.getVirtualItems().map((vRow) => {
              const c = sorted[vRow.index];
              if (!c) return null;
              const pct = budgetPct(c);
              const ctrVal = c.impressions > 0 ? (c.clicks / c.impressions) * 100 : 0;
              const isTriggered = triggeredAlerts.some(a => a.campaignId === c.id);
              const alertCount = campaignAlertsGrouped[c.id]?.length || 0;

              return (
                <Row
                  key={c.id}
                  cols={COLS}
                  idx={vRow.index}
                  top={vRow.start + 42}
                  height={vRow.size}
                  onClick={() => handleSelect(c)}
                >
                  <Cell>
                    <OverflowDiv>
                      <CampaignName>{c.name}</CampaignName>
                      <CampaignMeta>{c.currency || 'USD'}</CampaignMeta>
                    </OverflowDiv>
                  </Cell>
                  <Cell>
                    <StatusPill status={c.status} />
                  </Cell>
                  <Cell>
                    {alertCount > 0 ? (
                      <AlertIndicator 
                        triggered={isTriggered}
                        title={isTriggered ? "Active Alert Triggered!" : `${alertCount} Alerts Configured`}
                      >
                        🔔
                        <AlertCount>{alertCount}</AlertCount>
                      </AlertIndicator>
                    ) : (
                      <EmptyCell>—</EmptyCell>
                    )}
                  </Cell>
                  <Cell color={theme.textPrimary}>
                    <MonoText size="13px">{fmtNum(c.impressions)}</MonoText>
                  </Cell>
                  <Cell color={theme.accent}>
                    <MonoText size="13px">{fmtNum(c.clicks)}</MonoText>
                  </Cell>
                  <Cell color={ctrVal > 4 ? theme.green : ctrVal > 2 ? theme.amber : theme.textSecondary}>
                    <MonoText size="13px">{fmtCTR(c)}</MonoText>
                  </Cell>
                  <Cell>
                    <BudgetBar pct={pct} spend={c.spend} budget={c.dailyBudget} />
                  </Cell>
                </Row>
              );
            })}
          </VirtualList>
        </TableContent>
      </TableScroll>
    </Wrap>
  );
};


