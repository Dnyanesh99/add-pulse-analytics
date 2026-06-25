package com.adpulse.analytics.controller;

import com.adpulse.analytics.entity.Alert;
import com.adpulse.analytics.repository.AlertRepository;
import com.adpulse.analytics.service.AlertCacheService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/alerts")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AlertController {

    private final AlertRepository alertRepository;
    private final AlertCacheService alertCacheService;

    @GetMapping
    public ResponseEntity<List<Alert>> getAllAlerts() {
        return ResponseEntity.ok(alertRepository.findAll());
    }

    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<Alert> createAlert(@RequestBody Alert alert) {
        Alert saved = alertRepository.save(alert);
        alertCacheService.refreshCache();
        return ResponseEntity.ok(saved);
    }

    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<Alert> updateAlert(@PathVariable UUID id, @RequestBody Alert alertDetails) {
        return alertRepository.findById(id)
            .map(alert -> {
                alert.setTitle(alertDetails.getTitle());
                alert.setMetric(alertDetails.getMetric());
                alert.setOperator(alertDetails.getOperator());
                alert.setThreshold(alertDetails.getThreshold());
                alert.setExpiryAt(alertDetails.getExpiryAt());
                alert.setActive(alertDetails.isActive());
                Alert updated = alertRepository.save(alert);
                alertCacheService.refreshCache();
                return ResponseEntity.ok(updated);
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/campaign/{campaignId}")
    public ResponseEntity<List<Alert>> getAlertsByCampaign(@PathVariable UUID campaignId) {
        return ResponseEntity.ok(alertRepository.findByCampaignId(campaignId));
    }

    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAlert(@PathVariable UUID id) {
        alertRepository.deleteById(id);
        alertCacheService.refreshCache();
        return ResponseEntity.noContent().build();
    }
}
