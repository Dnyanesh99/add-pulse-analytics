package com.adpulse.analytics;

import com.adpulse.analytics.service.CampaignService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.web.bind.annotation.RestController;

@SpringBootApplication
@RestController
public class AnalyticsApplication {

  public static void main(String[] args) {
    SpringApplication.run(AnalyticsApplication.class, args);
  }

  @Bean
  public CommandLineRunner syncOnStartup(CampaignService campaignService) {
    return args -> {
      System.out.println("🚀 Startup: Syncing campaigns from Postgres to Redis...");
      campaignService.getAllCampaigns().forEach(campaignService::syncToRedis);
      System.out.println("✅ Startup Sync Complete.");
    };
  }
}
