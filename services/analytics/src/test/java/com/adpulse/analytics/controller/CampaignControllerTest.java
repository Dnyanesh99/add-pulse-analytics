package com.adpulse.analytics.controller;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.*;

import com.adpulse.analytics.entity.Campaign;
import com.adpulse.analytics.service.CampaignService;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class CampaignControllerTest {

  @Mock private CampaignService campaignService;

  @InjectMocks private CampaignController campaignController;

  @Test
  void getAll_Success() {
    when(campaignService.getAllCampaigns()).thenReturn(List.of(new Campaign()));

    List<Campaign> result = campaignController.getAll();

    assertEquals(1, result.size());
    verify(campaignService, times(1)).getAllCampaigns();
  }

  @Test
  void create_Success() {
    Campaign campaign = new Campaign();
    when(campaignService.createCampaign(any())).thenReturn(campaign);

    Campaign result = campaignController.create(campaign);

    assertEquals(campaign, result);
    verify(campaignService, times(1)).createCampaign(campaign);
  }

  @Test
  void update_Success() {
    UUID id = UUID.randomUUID();
    Campaign campaign = new Campaign();
    when(campaignService.updateCampaign(eq(id), any())).thenReturn(campaign);

    Campaign result = campaignController.update(id, campaign);

    assertEquals(campaign, result);
    verify(campaignService, times(1)).updateCampaign(id, campaign);
  }
}
