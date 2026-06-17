package com.adpulse.analytics.controller;

import com.adpulse.analytics.entity.Campaign;
import com.adpulse.analytics.service.CampaignService;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/campaigns")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class CampaignController {

  private final CampaignService campaignService;

  @GetMapping
  public List<Campaign> getAll() {
    return campaignService.getAllCampaigns();
  }

  @GetMapping("/with-metrics")
  public List<Map<String, Object>> getAllWithMetrics() {
    return campaignService.getAllCampaignsWithMetrics();
  }

  @PostMapping
  public Campaign create(@RequestBody Campaign campaign) {
    return campaignService.createCampaign(campaign);
  }

  @PutMapping("/{id}")
  public Campaign update(@PathVariable UUID id, @RequestBody Campaign campaign) {
    return campaignService.updateCampaign(id, campaign);
  }
}
