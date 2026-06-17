import { useEffect } from "react";
import { Client } from "@stomp/stompjs";
import { useAppDispatch } from "../store/store-hooks";
import { updateGlobalMetrics, setTriggeredAlerts } from "../store";
import { apiSlice } from "../api/apiSlice";
import type { MetricsPayload, TriggeredAlert } from "../types";

export const useWebSocket = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const apiBase = import.meta.env.VITE_API_URL || "http://localhost:8081";
    // Convert http(s) to ws(s) for the brokerURL
    const wsUrl = apiBase.replace(/^http/, "ws") + "/ws-analytics";

    const stompClient = new Client({
      brokerURL: wsUrl,
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        stompClient.subscribe("/topic/metrics", (message) => {
          try {
            const payload: MetricsPayload = JSON.parse(message.body);
            
            // 1. Update Legacy Redux state (for backward compatibility if needed)
            dispatch(updateGlobalMetrics(payload));

            // 2. Update RTK Query Cache (The New Single Source of Truth)
            dispatch(
              apiSlice.util.updateQueryData("getCampaigns", undefined, (draft) => {
                payload.campaigns.forEach((m) => {
                  const campaign = draft.find((c) => c.id === m.campaign_id);
                  if (campaign) {
                    campaign.impressions = m.impressions;
                    campaign.clicks = m.clicks;
                    campaign.conversions = m.conversions;
                    campaign.spend = m.spend;
                    campaign.conversion_value = m.conversion_value;
                    campaign.ecpm = m.ecpm;
                    campaign.cpc = m.cpc;
                    campaign.cpa = m.cpa;
                    campaign.roas = m.roas;
                  }
                });
              })
            );
          } catch (error) {
            console.error("Failed to parse WebSocket message:", error);
          }
        });

        stompClient.subscribe("/topic/alerts", (message) => {
          try {
            const payload: TriggeredAlert[] = JSON.parse(message.body);
            dispatch(setTriggeredAlerts(payload));
          } catch (error) {
            console.error("Failed to parse alerts message:", error);
          }
        });
      },
      onStompError: (frame) => {
        console.error("Broker reported error: " + frame.headers["message"]);
        console.error("Additional details: " + frame.body);
      },
    });

    stompClient.activate();

    return () => {
      stompClient.deactivate();
    };
  }, [dispatch]);
};
