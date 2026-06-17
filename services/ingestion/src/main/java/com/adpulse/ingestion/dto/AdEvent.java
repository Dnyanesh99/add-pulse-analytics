package com.adpulse.ingestion.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import edu.umd.cs.findbugs.annotations.SuppressFBWarnings;

@SuppressFBWarnings({"UWF_UNWRITTEN_FIELD", "NP_NULL_ON_SOME_PATH_FROM_RETURN_VALUE"})
public class AdEvent {
  @JsonProperty("event_id")
  private String eventId;

  @JsonProperty("campaign_id")
  private String campaignId;

  @JsonProperty("advertiser_id")
  private String advertiserId;

  @JsonProperty("event_type")
  private String eventType;

  private String country;
  private String device;
  private String currency;
  private double cost;

  @JsonProperty("conversion_value")
  private double conversionValue;

  @JsonProperty("occurred_at")
  private String occurredAt;

  // Standard Getters used by Jackson and Kafka
  public String getEventId() {
    return eventId;
  }

  public String getCampaignId() {
    return campaignId;
  }

  public String getAdvertiserId() {
    return advertiserId;
  }

  public String getEventType() {
    return eventType;
  }

  public String getCountry() {
    return country;
  }

  public String getDevice() {
    return device;
  }

  public String getCurrency() {
    return currency;
  }

  public double getCost() {
    return cost;
  }

  public double getConversionValue() {
    return conversionValue;
  }

  public String getOccurredAt() {
    return occurredAt;
  }
}
