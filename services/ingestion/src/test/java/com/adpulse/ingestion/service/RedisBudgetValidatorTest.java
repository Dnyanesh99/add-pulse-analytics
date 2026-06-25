package com.adpulse.ingestion.service;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.script.RedisScript;

@ExtendWith(MockitoExtension.class)
class RedisBudgetValidatorTest {

  @Mock private StringRedisTemplate redisTemplate;

  @InjectMocks private RedisBudgetValidator validator;

  @Test
  void processEventCost_Authorized() {
    // Lua script returns 1 for authorized
    when(redisTemplate.execute(any(RedisScript.class), anyList(), any(), any())).thenReturn(1L);

    int result = validator.processEventCost("camp-123", 1.50);

    org.junit.jupiter.api.Assertions.assertEquals(1, result);
  }

  @Test
  void processEventCost_NotActive() {
    // Lua script returns -1 for not active
    when(redisTemplate.execute(any(RedisScript.class), anyList(), any(), any())).thenReturn(-1L);

    int result = validator.processEventCost("camp-123", 1.50);

    org.junit.jupiter.api.Assertions.assertEquals(-1, result);
  }

  @Test
  void processEventCost_Exhausted() {
    // Lua script returns -2 for exhausted
    when(redisTemplate.execute(any(RedisScript.class), anyList(), any(), any())).thenReturn(-2L);

    int result = validator.processEventCost("camp-123", 1.50);

    org.junit.jupiter.api.Assertions.assertEquals(-2, result);
  }

  @Test
  void processEventCost_NullResult() {
    when(redisTemplate.execute(any(RedisScript.class), anyList(), any(), any())).thenReturn(null);

    int result = validator.processEventCost("camp-123", 1.50);

    org.junit.jupiter.api.Assertions.assertEquals(-1, result);
  }
}
