package com.adpulse.analytics.service;

import java.math.BigDecimal;
import java.util.Set;
import java.util.UUID;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class BudgetSchedulerService {

    private final StringRedisTemplate redisTemplate;
    private final JdbcTemplate jdbcTemplate;

    public BudgetSchedulerService(StringRedisTemplate redisTemplate, JdbcTemplate jdbcTemplate) {
        this.redisTemplate = redisTemplate;
        this.jdbcTemplate = jdbcTemplate;
    }

    // Run at midnight UTC every day
    @Scheduled(cron = "0 0 0 * * *", zone = "UTC")
    @Transactional
    public void resetDailyBudgets() {
        System.out.println("🔄 Running midnight daily budget reset...");
        
        Set<String> keys = redisTemplate.keys("campaign:budget:*");
        if (keys == null || keys.isEmpty()) {
            return;
        }

        for (String key : keys) {
            String campaignIdStr = key.replace("campaign:budget:", "");
            UUID campaignId;
            try {
                campaignId = UUID.fromString(campaignIdStr);
            } catch (IllegalArgumentException e) {
                continue;
            }

            Object todaySpendObj = redisTemplate.opsForHash().get(key, "today_spend");
            if (todaySpendObj != null) {
                BigDecimal todaySpend = new BigDecimal(todaySpendObj.toString());
                
                // Update Postgres campaign_spend
                jdbcTemplate.update(
                    "UPDATE campaign_spend SET lifetime_spend = lifetime_spend + ?, today_spend = 0, today_date = CURRENT_DATE, last_synced_at = NOW() WHERE campaign_id = ?",
                    todaySpend, campaignId
                );

                // Reset Redis today_spend
                redisTemplate.opsForHash().put(key, "today_spend", "0.00");
                System.out.println("✅ Reset budget for campaign: " + campaignId);
            }
        }
    }
}
