package com.adpulse.analytics.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import com.adpulse.analytics.entity.Campaign;
import com.adpulse.analytics.repository.CampaignRepository;
import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.HashOperations;
import org.springframework.data.redis.core.SetOperations;
import org.springframework.data.redis.core.StringRedisTemplate;

@ExtendWith(MockitoExtension.class)
class CampaignServiceTest {

  @Mock private CampaignRepository campaignRepository;

  @Mock private StringRedisTemplate redisTemplate;

  @Mock private SetOperations<String, String> setOperations;

  @Mock private HashOperations<String, Object, Object> hashOperations;

  @Mock private com.adpulse.analytics.repository.MetricsRepository metricsRepository;

  @InjectMocks private CampaignService campaignService;

  @Test
  void getAllCampaignsWithMetrics_Success() {
    UUID id = UUID.randomUUID();
    Campaign campaign = new Campaign();
    campaign.setId(id);
    campaign.setName("Test");

    java.util.List<java.util.Map<String, Object>> metrics =
        java.util.List.of(java.util.Map.of("campaign_id", id.toString(), "impressions", 100));

    when(campaignRepository.findAll()).thenReturn(java.util.List.of(campaign));
    when(metricsRepository.getLiveCampaignMetrics()).thenReturn(metrics);

    java.util.List<java.util.Map<String, Object>> result = campaignService.getAllCampaignsWithMetrics();

    assertEquals(1, result.size());
    assertEquals("Test", result.get(0).get("name"));
    assertEquals(100, result.get(0).get("impressions"));
  }

  @Test
  void createCampaign_Success() {
    Campaign campaign = new Campaign();
    campaign.setId(UUID.randomUUID());
    campaign.setStatus("active");
    campaign.setDailyBudget(new BigDecimal("100.00"));

    when(campaignRepository.save(any(Campaign.class))).thenReturn(campaign);
    when(redisTemplate.opsForSet()).thenReturn(setOperations);
    when(redisTemplate.opsForHash()).thenReturn(hashOperations);

    Campaign result = campaignService.createCampaign(campaign);

    assertNotNull(result);
    verify(campaignRepository, times(1)).save(campaign);
    verify(setOperations, times(1)).add(anyString(), anyString());
    verify(hashOperations, atLeastOnce()).put(anyString(), anyString(), anyString());
  }

  @Test
  void updateCampaign_Success() {
    UUID id = UUID.randomUUID();
    Campaign existing = new Campaign();
    existing.setId(id);
    existing.setStatus("paused");

    Campaign details = new Campaign();
    details.setName("Updated Name");
    details.setStatus("active");
    details.setDailyBudget(new BigDecimal("200.00"));

    when(campaignRepository.findById(id)).thenReturn(Optional.of(existing));
    when(campaignRepository.save(any(Campaign.class))).thenReturn(existing);
    when(redisTemplate.opsForSet()).thenReturn(setOperations);
    when(redisTemplate.opsForHash()).thenReturn(hashOperations);

    Campaign result = campaignService.updateCampaign(id, details);

    assertEquals("Updated Name", result.getName());
    assertEquals("active", result.getStatus());
    verify(campaignRepository, times(1)).save(existing);
  }
}
