package com.adpulse.ingestion.controller;

import com.adpulse.ingestion.dto.AdEvent;
import com.adpulse.ingestion.service.RedisBudgetValidator;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import edu.umd.cs.findbugs.annotations.SuppressFBWarnings;
import org.springframework.http.ResponseEntity;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/events")
@SuppressFBWarnings("EI_EXPOSE_REP2")
public class IngestionController {

  private final KafkaTemplate<String, String> kafkaTemplate;
  private final RedisBudgetValidator validator;
  private final ObjectMapper objectMapper;

  public IngestionController(
      KafkaTemplate<String, String> kafkaTemplate,
      RedisBudgetValidator validator,
      ObjectMapper objectMapper) {
    this.kafkaTemplate = kafkaTemplate;
    this.validator = validator;
    this.objectMapper = objectMapper;
  }

  @PostMapping(value = "/track", consumes = "application/json")
  public ResponseEntity<Void> trackEvent(@RequestBody AdEvent payload) {

    int authResult = validator.processEventCost(payload.getCampaignId(), payload.getCost());

    if (authResult == -2) {
      // Just exhausted the budget!
      try {
        String sysEvent = String.format("{\"eventType\": \"BUDGET_EXHAUSTED\", \"campaignId\": \"%s\"}", payload.getCampaignId());
        kafkaTemplate.send("system-events", payload.getCampaignId(), sysEvent);
        System.out.println("🚨 Budget Exhausted for Campaign: " + payload.getCampaignId());
      } catch (Exception e) {
        System.err.println("Failed to send system event: " + e.getMessage());
      }
      return ResponseEntity.unprocessableEntity().build();
    } else if (authResult == -1) {
      // Campaign is paused or already exhausted
      return ResponseEntity.unprocessableEntity().build();
    }

    try {
      // Serialize and push to Kafka.
      // We use campaignId as the Kafka Key to ensure events for the same campaign
      // are processed strictly in order by the ClickHouse consumer partitions.
      String jsonPayload = objectMapper.writeValueAsString(payload);
      kafkaTemplate.send("ad-events", payload.getCampaignId(), jsonPayload);

      // HTTP 202: Request accepted for processing, but processing is not complete.
      System.out.println(
          "✅ Event Processed: " + payload.getEventId() + " for Campaign: " + payload.getCampaignId());
      return ResponseEntity.accepted().build();

    } catch (JsonProcessingException e) {
      return ResponseEntity.badRequest().build();
    }
  }
}
