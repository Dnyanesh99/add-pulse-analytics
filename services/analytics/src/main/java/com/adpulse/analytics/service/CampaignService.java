package com.adpulse.analytics.service;

import com.adpulse.analytics.entity.Campaign;
import com.adpulse.analytics.repository.CampaignRepository;
import edu.umd.cs.findbugs.annotations.SuppressFBWarnings;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@SuppressFBWarnings("EI_EXPOSE_REP2")
public class CampaignService {

  private final CampaignRepository campaignRepository;
  private final StringRedisTemplate redisTemplate;
  private final com.adpulse.analytics.repository.MetricsRepository metricsRepository;

  private static final String ACTIVE_CAMPAIGNS_KEY = "campaign:active";

  public List<Campaign> getAllCampaigns() {
    return campaignRepository.findAll();
  }

  /** Merges campaign metadata with live metrics from ClickHouse. */
  public List<Map<String, Object>> getAllCampaignsWithMetrics() {
    List<Campaign> campaigns = campaignRepository.findAll();
    List<Map<String, Object>> metrics = metricsRepository.getLiveCampaignMetrics();

    Map<String, Map<String, Object>> metricsMap =
        metrics.stream()
            .collect(
                Collectors.toMap(
                    m -> m.get("campaign_id").toString(), m -> m, (existing, replacement) -> existing));

    return campaigns.stream()
        .map(
            c -> {
              Map<String, Object> map = new HashMap<>();
              map.put("id", c.getId());
              map.put("name", c.getName());
              map.put("status", c.getStatus());
              map.put("dailyBudget", c.getDailyBudget());
              map.put("totalBudget", c.getTotalBudget());
              map.put("currency", c.getCurrency());

              Map<String, Object> m = metricsMap.getOrDefault(c.getId().toString(), Map.of());
              map.put("impressions", m.getOrDefault("impressions", 0));
              map.put("clicks", m.getOrDefault("clicks", 0));
              map.put("conversions", m.getOrDefault("conversions", 0));
              map.put("spend", m.getOrDefault("spend", 0.0));

              return map;
            })
        .collect(Collectors.toList());
  }

  @Transactional
  public Campaign createCampaign(Campaign campaign) {
    Campaign saved = campaignRepository.save(campaign);
    syncToRedis(saved);
    return saved;
  }

  @Transactional
  public Campaign updateCampaign(UUID id, Campaign details) {
    Campaign campaign =
        campaignRepository
            .findById(id)
            .orElseThrow(() -> new RuntimeException("Campaign not found"));

    campaign.setName(details.getName());
    campaign.setStatus(details.getStatus());
    campaign.setDailyBudget(details.getDailyBudget());
    campaign.setTotalBudget(details.getTotalBudget());
    campaign.setStartDate(details.getStartDate());
    campaign.setEndDate(details.getEndDate());

    Campaign saved = campaignRepository.save(campaign);
    syncToRedis(saved);
    return saved;
  }

  /** Synchronizes the campaign state to Redis for the Ingestion Service. */
  public void syncToRedis(Campaign campaign) {
    String campaignId = campaign.getId().toString();
    String budgetKey = "campaign:budget:" + campaignId;

    if ("active".equalsIgnoreCase(campaign.getStatus())) {
      // 1. Add to active set
      redisTemplate.opsForSet().add(ACTIVE_CAMPAIGNS_KEY, campaignId);

      // 2. Set/Update budget in hash
      redisTemplate
          .opsForHash()
          .put(budgetKey, "daily_budget", campaign.getDailyBudget().toString());

      // Initialize today_spend if it doesn't exist
      redisTemplate.opsForHash().putIfAbsent(budgetKey, "today_spend", "0.00");

      System.out.println("🔄 Synced Campaign " + campaignId + " to Redis (ACTIVE)");
    } else {
      // Remove from active set if paused/ended/etc.
      redisTemplate.opsForSet().remove(ACTIVE_CAMPAIGNS_KEY, campaignId);
      System.out.println("🛑 Campaign " + campaignId + " removed from Redis (INACTIVE)");
    }
  }

  /** Fetches top performing campaigns by joining ClickHouse metrics with Postgres metadata. */
  public List<Map<String, Object>> getTopPerformingCampaigns(String metric, int limit) {
    List<Map<String, Object>> topMetrics = metricsRepository.getTopPerformers(metric, limit);

    List<UUID> ids =
        topMetrics.stream()
            .map(m -> UUID.fromString(m.get("campaign_id").toString()))
            .collect(Collectors.toList());

    List<Campaign> campaigns = campaignRepository.findAllById(ids);
    Map<UUID, Campaign> campaignMap =
        campaigns.stream().collect(Collectors.toMap(Campaign::getId, c -> c));

    return topMetrics.stream()
        .map(
            m -> {
              UUID id = UUID.fromString(m.get("campaign_id").toString());
              Campaign c = campaignMap.get(id);

              Map<String, Object> map = new HashMap<>(m);
              if (c != null) {
                map.put("name", c.getName());
                map.put("status", c.getStatus());
                map.put("currency", c.getCurrency());
              } else {
                map.put("name", "Unknown Campaign (" + id.toString().substring(0, 8) + ")");
                map.put("status", "deleted");
              }
              return map;
            })
        .collect(Collectors.toList());
  }
}
