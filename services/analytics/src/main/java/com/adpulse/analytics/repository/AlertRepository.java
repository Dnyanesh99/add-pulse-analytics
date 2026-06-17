package com.adpulse.analytics.repository;

import com.adpulse.analytics.entity.Alert;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface AlertRepository extends JpaRepository<Alert, UUID> {
    List<Alert> findByCampaignId(UUID campaignId);
    List<Alert> findByIsActiveTrue();
}
