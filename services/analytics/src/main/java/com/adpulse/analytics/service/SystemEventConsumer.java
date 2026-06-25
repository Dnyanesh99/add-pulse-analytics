package com.adpulse.analytics.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class SystemEventConsumer {

    private final CampaignService campaignService;
    private final SimpMessagingTemplate messagingTemplate;
    private final ObjectMapper objectMapper;

    public SystemEventConsumer(CampaignService campaignService, SimpMessagingTemplate messagingTemplate, ObjectMapper objectMapper) {
        this.campaignService = campaignService;
        this.messagingTemplate = messagingTemplate;
        this.objectMapper = objectMapper;
    }

    @KafkaListener(topics = "system-events", groupId = "analytics-group")
    public void consumeSystemEvent(String message) {
        try {
            JsonNode node = objectMapper.readTree(message);
            String eventType = node.get("eventType").asText();

            if ("BUDGET_EXHAUSTED".equals(eventType)) {
                UUID campaignId = UUID.fromString(node.get("campaignId").asText());
                System.out.println("🚨 Received BUDGET_EXHAUSTED event for Campaign: " + campaignId);

                // Update postgres status
                com.adpulse.analytics.entity.Campaign campaign = campaignService.getAllCampaigns().stream()
                        .filter(c -> c.getId().equals(campaignId))
                        .findFirst()
                        .orElse(null);

                if (campaign != null && !"exhausted".equals(campaign.getStatus())) {
                    campaign.setStatus("exhausted");
                    campaignService.updateCampaign(campaignId, campaign);

                    // Notify frontend
                    messagingTemplate.convertAndSend("/topic/campaigns/status", 
                            "{\"campaignId\":\"" + campaignId + "\", \"status\":\"exhausted\"}");
                }
            }
        } catch (Exception e) {
            System.err.println("Failed to process system event: " + e.getMessage());
        }
    }
}
