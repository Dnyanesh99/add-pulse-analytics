package com.adpulse.analytics.service;

import static org.mockito.Mockito.*;

import com.adpulse.analytics.repository.MetricsRepository;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.messaging.simp.SimpMessagingTemplate;

@ExtendWith(MockitoExtension.class)
class MetricsBroadcastServiceTest {

  @Mock private MetricsRepository metricsRepository;

  @Mock private SimpMessagingTemplate messagingTemplate;

  @InjectMocks private MetricsBroadcastService broadcastService;

  @Test
  void broadcastMetrics_Success() {
    List<Map<String, Object>> campaigns = List.of(Map.of("campaign_id", "123"));

    when(metricsRepository.getLiveCampaignMetrics()).thenReturn(campaigns);

    broadcastService.broadcastMetrics();

    verify(metricsRepository, times(1)).getLiveCampaignMetrics();
    verify(messagingTemplate, times(1)).convertAndSend(eq("/topic/metrics"), any(Map.class));
  }

  @Test
  void broadcastMetrics_Failure() {
    when(metricsRepository.getLiveCampaignMetrics()).thenThrow(new RuntimeException("DB Down"));

    broadcastService.broadcastMetrics();

    verify(messagingTemplate, never()).convertAndSend(anyString(), any(Object.class));
  }
}
