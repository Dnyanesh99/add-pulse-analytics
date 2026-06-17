package com.adpulse.analytics.controller;

import com.adpulse.analytics.repository.MetricsRepository;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;


@RestController
@RequestMapping("/api/v1/analytics")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AnalyticsController {

  private final MetricsRepository metricsRepository;
  private final com.adpulse.analytics.service.CampaignService campaignService;

  @GetMapping("/time-series")
  public List<Map<String, Object>> getTimeSeries(
      @RequestParam(defaultValue = "30") int days) {
    return metricsRepository.getTimeSeriesMetrics(days);
  }

  @GetMapping("/breakdown/{dimension}")
  public List<Map<String, Object>> getBreakdown(@PathVariable String dimension) {
    return metricsRepository.getBreakdownMetrics(dimension);
  }

  @GetMapping("/top-performers")
  public List<Map<String, Object>> getTopPerformers(
      @RequestParam(defaultValue = "conversions") String metric,
      @RequestParam(defaultValue = "10") int limit) {
    return campaignService.getTopPerformingCampaigns(metric, limit);
  }
}

