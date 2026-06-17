package com.adpulse.analytics.service;

import com.adpulse.analytics.entity.Alert;
import com.adpulse.analytics.repository.AlertRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AlertCacheService {

    private final AlertRepository alertRepository;
    
    // Map of CampaignID -> List of Active Alerts
    private final Map<UUID, List<Alert>> activeAlerts = new ConcurrentHashMap<>();
    
    // Map of AlertID -> Triggered State (to avoid redundant notifications)
    private final Map<UUID, Boolean> triggeredAlerts = new ConcurrentHashMap<>();

    @PostConstruct
    public void init() {
        refreshCache();
    }

    public void refreshCache() {
        List<Alert> alerts = alertRepository.findByIsActiveTrue();
        
        // Filter out expired alerts
        OffsetDateTime now = OffsetDateTime.now();
        List<Alert> validAlerts = alerts.stream()
                .filter(a -> a.getExpiryAt() == null || a.getExpiryAt().isAfter(now))
                .collect(Collectors.toList());

        activeAlerts.clear();
        validAlerts.forEach(alert -> {
            activeAlerts.computeIfAbsent(alert.getCampaignId(), k -> new java.util.ArrayList<>()).add(alert);
        });
        
        System.out.println("🔔 Alert Cache Refreshed: " + validAlerts.size() + " active alerts loaded.");
    }

    public Map<UUID, List<Alert>> getActiveAlerts() {
        return activeAlerts;
    }

    public boolean isTriggered(UUID alertId) {
        return triggeredAlerts.getOrDefault(alertId, false);
    }

    public void setTriggered(UUID alertId, boolean state) {
        triggeredAlerts.put(alertId, state);
    }
}
