package com.adpulse.analytics.service;

import com.adpulse.analytics.entity.Alert;
import com.adpulse.analytics.entity.Campaign;
import com.adpulse.analytics.repository.CampaignRepository;
import com.adpulse.analytics.repository.MetricsRepository;
import edu.umd.cs.findbugs.annotations.SuppressFBWarnings;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

@Service
@EnableScheduling
@SuppressFBWarnings("EI_EXPOSE_REP2")
public class MetricsBroadcastService {

  private final MetricsRepository metricsRepository;
  private final CampaignRepository campaignRepository;
  private final AlertCacheService alertCacheService;
  private final SimpMessagingTemplate messagingTemplate;

  public MetricsBroadcastService(
      MetricsRepository metricsRepository,
      CampaignRepository campaignRepository,
      AlertCacheService alertCacheService,
      SimpMessagingTemplate messagingTemplate) {
    this.metricsRepository = metricsRepository;
    this.campaignRepository = campaignRepository;
    this.alertCacheService = alertCacheService;
    this.messagingTemplate = messagingTemplate;
  }

  // Executes every 1000ms (1 second)
  @Scheduled(fixedRate = 1000)
  public void broadcastMetrics() {
    try {
      List<Map<String, Object>> liveMetrics = metricsRepository.getLiveCampaignMetrics();
      
      // 1. Broadcast Metrics (Standard Flow)
      Map<String, Object> metricsPayload =
          Map.of(
              "campaigns", liveMetrics,
              "timestamp", System.currentTimeMillis());

      messagingTemplate.convertAndSend("/topic/metrics", metricsPayload);

      // 2. Alert Evaluation Flow
      evaluateAlerts(liveMetrics);

    } catch (Exception e) {
      System.err.println("Broadcast cycle failed: " + e.getMessage());
    }
  }

  private void evaluateAlerts(List<Map<String, Object>> metrics) {
    Map<UUID, List<Alert>> activeAlertsMap = alertCacheService.getActiveAlerts();
    if (activeAlertsMap.isEmpty()) return;

    List<Campaign> campaigns = campaignRepository.findAll();
    Map<UUID, Campaign> campaignMetadata = campaigns.stream()
        .collect(Collectors.toMap(Campaign::getId, c -> c));

    List<Map<String, Object>> triggeredNow = new ArrayList<>();

    for (Map<String, Object> m : metrics) {
      UUID campaignId = UUID.fromString(m.get("campaign_id").toString());
      List<Alert> alerts = activeAlertsMap.get(campaignId);
      if (alerts == null) continue;

      Campaign meta = campaignMetadata.get(campaignId);
      if (meta == null) continue;

      for (Alert alert : alerts) {
        double value = getValueForMetric(alert.getMetric().name(), m, meta);
        boolean isTriggered = checkCondition(value, alert.getOperator().name(), alert.getThreshold());

        if (isTriggered) {
          Map<String, Object> alertEvent = new HashMap<>();
          alertEvent.put("alertId", alert.getId());
          alertEvent.put("campaignId", campaignId);
          alertEvent.put("campaignName", meta.getName());
          alertEvent.put("title", alert.getTitle());
          alertEvent.put("metric", alert.getMetric());
          alertEvent.put("value", value);
          alertEvent.put("threshold", alert.getThreshold());
          
          triggeredNow.add(alertEvent);
        }
      }
    }

    if (!triggeredNow.isEmpty()) {
      messagingTemplate.convertAndSend("/topic/alerts", triggeredNow);
    }
  }

  private double getValueForMetric(String metric, Map<String, Object> metrics, Campaign meta) {
    switch (metric) {
      case "spend_pct":
        double spend = ((Number) metrics.getOrDefault("spend", 0.0)).doubleValue();
        double budget = meta.getDailyBudget().doubleValue();
        return budget > 0 ? (spend / budget) : 0;
      case "ctr":
        return ((Number) metrics.getOrDefault("ctr", 0.0)).doubleValue();
      case "conversions":
        return ((Number) metrics.getOrDefault("conversions", 0)).doubleValue();
      case "clicks":
        return ((Number) metrics.getOrDefault("clicks", 0)).doubleValue();
      default:
        return 0;
    }
  }

  private boolean checkCondition(double value, String operator, double threshold) {
    switch (operator) {
      case "greater_than": return value >= threshold;
      case "less_than": return value <= threshold;
      case "equal_to": return Math.abs(value - threshold) < 0.0001;
      default: return false;
    }
  }
}
