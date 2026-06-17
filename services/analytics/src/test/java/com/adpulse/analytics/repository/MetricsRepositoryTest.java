package com.adpulse.analytics.repository;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.jdbc.core.simple.JdbcClient;

@ExtendWith(MockitoExtension.class)
class MetricsRepositoryTest {

  @Mock private JdbcClient jdbcClient;

  @InjectMocks private MetricsRepository metricsRepository;

  @Test
  void getLiveCampaignMetrics_Success() {
    JdbcClient.StatementSpec statementSpec = mock(JdbcClient.StatementSpec.class);
    JdbcClient.ResultQuerySpec resultSpec = mock(JdbcClient.ResultQuerySpec.class);

    when(jdbcClient.sql(anyString())).thenReturn(statementSpec);
    when(statementSpec.query()).thenReturn(resultSpec);
    when(resultSpec.listOfRows())
        .thenReturn(
            List.of(
                Map.of(
                    "campaign_id", "123",
                    "impressions", 100,
                    "clicks", 10,
                    "conversions", 1,
                    "spend", 5.5)));

    List<Map<String, Object>> result = metricsRepository.getLiveCampaignMetrics();

    assertEquals(1, result.size());
    assertEquals("123", result.get(0).get("campaign_id"));
    assertEquals(10, result.get(0).get("clicks"));
  }

  @Test
  void getBreakdownMetrics_Success() {
    JdbcClient.StatementSpec statementSpec = mock(JdbcClient.StatementSpec.class);
    JdbcClient.ResultQuerySpec resultSpec = mock(JdbcClient.ResultQuerySpec.class);

    when(jdbcClient.sql(anyString())).thenReturn(statementSpec);
    when(statementSpec.query()).thenReturn(resultSpec);
    when(resultSpec.listOfRows()).thenReturn(List.of(Map.of("dimension", "mobile", "impressions", 500)));

    List<Map<String, Object>> result = metricsRepository.getBreakdownMetrics("device");

    assertEquals(1, result.size());
    assertEquals("mobile", result.get(0).get("dimension"));
  }
}
