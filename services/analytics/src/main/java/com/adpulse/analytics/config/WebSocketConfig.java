package com.adpulse.analytics.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

  @Override
  public void configureMessageBroker(MessageBrokerRegistry config) {
    // Clients subscribe to this prefix to receive live updates
    config.enableSimpleBroker("/topic");
  }

  @Override
  public void registerStompEndpoints(StompEndpointRegistry registry) {
    // 1. Raw WebSocket endpoint
    registry
        .addEndpoint("/ws-analytics")
        .setAllowedOriginPatterns("*");

    // 2. SockJS fallback endpoint
    registry
        .addEndpoint("/ws-analytics")
        .setAllowedOriginPatterns("*")
        .withSockJS();
  }
}
