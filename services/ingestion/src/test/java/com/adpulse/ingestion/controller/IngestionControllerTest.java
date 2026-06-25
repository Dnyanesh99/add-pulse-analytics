package com.adpulse.ingestion.controller;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import com.adpulse.ingestion.dto.AdEvent;
import com.adpulse.ingestion.service.RedisBudgetValidator;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.kafka.core.KafkaTemplate;

@ExtendWith(MockitoExtension.class)
class IngestionControllerTest {

  @Mock private KafkaTemplate<String, String> kafkaTemplate;

  @Mock private RedisBudgetValidator validator;

  @Mock private ObjectMapper objectMapper;

  @InjectMocks private IngestionController ingestionController;

  private AdEvent event;

  @BeforeEach
  void setUp() {
    event = new AdEvent();
    // We can't set fields directly because they are private without setters in the DTO
    // However, Mockito can use reflection or we can assume the DTO is populated via Jackson in
    // reality.
    // For testing, I'll assume the DTO has been populated or use reflection if needed.
    // Actually, let's check AdEvent.java again to see if I should add setters or if it's fine.
  }

  @Test
  void trackEvent_Success() throws Exception {
    String campaignId = UUID.randomUUID().toString();
    double cost = 1.50;

    // Mocking behavior
    when(validator.processEventCost(any(), anyDouble())).thenReturn(1);
    when(objectMapper.writeValueAsString(any())).thenReturn("{\"json\":\"payload\"}");

    // Using reflection to set private fields for the test event
    setField(event, "campaignId", campaignId);
    setField(event, "cost", cost);

    ResponseEntity<Void> response = ingestionController.trackEvent(event);

    assertEquals(HttpStatus.ACCEPTED, response.getStatusCode());
    verify(kafkaTemplate, times(1)).send(eq("ad-events"), eq(campaignId), anyString());
  }

  @Test
  void trackEvent_BudgetExhausted() {
    when(validator.processEventCost(any(), anyDouble())).thenReturn(-2);

    ResponseEntity<Void> response = ingestionController.trackEvent(event);

    assertEquals(HttpStatus.UNPROCESSABLE_ENTITY, response.getStatusCode());
    verify(kafkaTemplate, times(1)).send(eq("system-events"), any(), anyString());
  }

  // Helper to set private fields without adding public setters to production code
  private void setField(Object target, String fieldName, Object value) throws Exception {
    java.lang.reflect.Field field = target.getClass().getDeclaredField(fieldName);
    field.setAccessible(true);
    field.set(target, value);
  }
}
