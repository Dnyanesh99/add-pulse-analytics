package com.adpulse.analytics.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "campaigns")
@Getter
@Setter
public class Campaign {

  @Id
  @GeneratedValue(strategy = GenerationType.AUTO)
  private UUID id;

  @Column(name = "advertiser_id", nullable = false)
  private UUID advertiserId;

  @Column(nullable = false)
  private String name;

  @Column(nullable = false)
  private String status;

  @Column(name = "daily_budget", nullable = false)
  private BigDecimal dailyBudget;

  @Column(name = "total_budget", nullable = false)
  private BigDecimal totalBudget;

  @Column(nullable = false, length = 3)
  private String currency;

  @Column(name = "target_all_countries", nullable = false)
  private boolean targetAllCountries = true;

  @Column(name = "target_all_devices", nullable = false)
  private boolean targetAllDevices = true;

  @Column(name = "start_date", nullable = false)
  private LocalDate startDate;

  @Column(name = "end_date", nullable = false)
  private LocalDate endDate;

  @Column(name = "created_at", nullable = false, updatable = false)
  private OffsetDateTime createdAt;

  @Column(name = "updated_at", nullable = false)
  private OffsetDateTime updatedAt;

  @PrePersist
  protected void onCreate() {
    createdAt = OffsetDateTime.now();
    updatedAt = OffsetDateTime.now();
    if (status == null) status = "draft";
  }

  @PreUpdate
  protected void onUpdate() {
    updatedAt = OffsetDateTime.now();
  }
}
