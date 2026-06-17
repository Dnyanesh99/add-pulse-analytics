package com.adpulse.analytics.repository;

import com.adpulse.analytics.entity.Campaign;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CampaignRepository extends JpaRepository<Campaign, UUID> {}
