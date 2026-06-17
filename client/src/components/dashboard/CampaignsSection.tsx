import { useMemo } from "react";
import styled from "@emotion/styled";
import { useAppDispatch, useAppSelector } from "../../store/store-hooks";
import { setFilter } from "../../store";
import { useGetCampaignsQuery, useGetBreakdownQuery } from "../../api/apiSlice";
import { Card, CardHeader, CardTitle, CardBody, FilterTab, Badge, Box, MonoText } from "@adpulse/ui";
import { CampaignTable } from "../CampaignTable";
import { CTRBarChart, DeviceChart } from "../charts";
import { fmtNum } from "../../utils";
import type { CampaignFilter } from "../../types";

const BottomRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 280px;
  gap: 14px;
  align-items: start;

  @media (max-width: 1050px) { grid-template-columns: 1fr; }
`;

const FiltersRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
`;

const CountryRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 0;
  border-bottom: 1px solid ${(p) => p.theme.border};
  &:last-child { border-bottom: none; }
`;

const CountryBar = styled.div`
  flex: 1;
  height: 4px;
  background: ${(p) => p.theme.border};
  border-radius: 2px;
  overflow: hidden;
`;

const CountryFill = styled.div<{ w: number }>`
  height: 100%;
  width: ${(p) => p.w}%;
  background: ${(p) => p.theme.accent};
  border-radius: 2px;
  transition: width 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
`;

const SideColumn = styled(Box)`
  @media (max-width: 1050px) {
    width: 100%;
  }
`;

const DeviceLegend = styled.div`
  margin-top: 10px;
  display: flex;
  justify-content: center;
  gap: 8px;
  flex-wrap: wrap;
`;

const LegendItem = styled.div`
  font-size: 10px;
  color: ${p => p.theme.textSecondary};
  display: flex;
  align-items: center;
  gap: 4px;
`;

const LegendDot = styled.div`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: ${p => p.theme.accent};
`;

const CountryName = styled.span`
  font-size: 12px;
  color: ${p => p.theme.textSecondary};
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const CountryValue = styled(MonoText)`
  width: 40px;
  text-align: right;
  color: ${p => p.theme.textMuted};
`;

export const CampaignsSection = () => {
  const dispatch = useAppDispatch();
  const { filter } = useAppSelector((s) => s.campaigns);
  
  // RTK Query Hooks
  const { data: allCampaigns = [] } = useGetCampaignsQuery();
  const { data: devices = [] } = useGetBreakdownQuery("device");
  const { data: countries = [] } = useGetBreakdownQuery("country");

  const filteredCampaigns = useMemo(() => {
    if (filter === "all") return allCampaigns;
    return allCampaigns.filter((c) => c.status === filter);
  }, [allCampaigns, filter]);

  const maxImpr = useMemo(() => {
    return countries.length > 0 ? Math.max(...countries.map((d) => d.impressions)) : 1;
  }, [countries]);

  return (
    <BottomRow>
      <Card>
        <CardHeader>
          <CardTitle>All Campaigns</CardTitle>
          <FiltersRow>
            {["all", "active", "paused", "ended"].map((f) => (
              <FilterTab
                key={f}
                active={filter === f}
                onClick={() => dispatch(setFilter(f as CampaignFilter))}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </FilterTab>
            ))}
          </FiltersRow>
        </CardHeader>
        <CampaignTable campaigns={filteredCampaigns} />
      </Card>

      <SideColumn gap="14px">
        <Card>
          <CardHeader>
            <CardTitle>By Device</CardTitle>
          </CardHeader>
          <CardBody padding="8px 12px 12px" height="220px">
            <DeviceChart data={devices} />
            <DeviceLegend>
              {devices.map((d) => (
                <LegendItem key={d.dimension}>
                  <LegendDot />
                  <MonoText size="10px">
                    {d.dimension}: {fmtNum(d.impressions)}
                  </MonoText>
                </LegendItem>
              ))}
            </DeviceLegend>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>CTR Distribution</CardTitle>
          </CardHeader>
          <CardBody padding="8px 12px 12px">
            <CTRBarChart data={countries} />
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Countries</CardTitle>
            <Badge>{countries.length}</Badge>
          </CardHeader>
          <CardBody padding="8px 18px 12px">
            {countries.slice(0, 6).map((d) => (
              <CountryRow key={d.dimension}>
                <CountryName>{d.dimension}</CountryName>
                <CountryBar>
                  <CountryFill w={Math.round((d.impressions / maxImpr) * 100)} />
                </CountryBar>
                <CountryValue size="10px">
                  {fmtNum(d.impressions)}
                </CountryValue>
              </CountryRow>
            ))}
          </CardBody>
        </Card>
      </SideColumn>
    </BottomRow>
  );
};

