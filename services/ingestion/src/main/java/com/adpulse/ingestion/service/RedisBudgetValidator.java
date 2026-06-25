package com.adpulse.ingestion.service;

import edu.umd.cs.findbugs.annotations.SuppressFBWarnings;
import jakarta.annotation.PostConstruct;
import java.util.List;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.script.DefaultRedisScript;
import org.springframework.stereotype.Service;

@Service
@SuppressFBWarnings("EI_EXPOSE_REP2")
public class RedisBudgetValidator {

  private final StringRedisTemplate redisTemplate;
  private static final String ACTIVE_CAMPAIGNS_KEY = "campaign:active";

  private static final String LUA_BUDGET_CHECK =
      """
        local active_key = KEYS[1]
        local budget_key = KEYS[2]
        local cost = tonumber(ARGV[1])

        -- 1. Check if campaign is active
        if redis.call('SISMEMBER', active_key, ARGV[2]) == 0 then
            return -1 -- Not Active
        end

        if cost <= 0 then return 1 end -- Free event (Impression)

        -- 2. Atomic Budget Check
        local data = redis.call('HMGET', budget_key, 'daily_budget', 'today_spend')
        local limit = tonumber(data[1] or 0)
        local spend = tonumber(data[2] or 0)

        if (spend + cost) >= limit then
            -- Mark as exhausted and remove from active rotation
            redis.call('SREM', active_key, ARGV[2])
            return -2 -- Exhausted
        end

        -- 3. Commit spend
        redis.call('HINCRBYFLOAT', budget_key, 'today_spend', cost)
        return 1 -- Authorized
        """;

  public RedisBudgetValidator(StringRedisTemplate redisTemplate) {
    this.redisTemplate = redisTemplate;
  }

  /**
   * Executes an atomic check and increment entirely within Redis memory using Lua. Prevents race
   * conditions and overspending at high scale.
   */
  public int processEventCost(String campaignId, double eventCost) {
    String budgetKey = "campaign:budget:" + campaignId;

    Long result =
        redisTemplate.execute(
            new DefaultRedisScript<>(LUA_BUDGET_CHECK, Long.class),
            List.of(ACTIVE_CAMPAIGNS_KEY, budgetKey),
            String.valueOf(eventCost),
            campaignId);

    return result != null ? result.intValue() : -1;
  }
}
