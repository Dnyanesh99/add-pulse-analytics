package com.adpulse.simulator;

import edu.umd.cs.findbugs.annotations.SuppressFBWarnings;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Instant;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Random;
import java.util.UUID;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@SuppressFBWarnings("SS_SHOULD_BE_STATIC")
public class SimulatorApplication implements CommandLineRunner {

  @Value("${simulator.ingestion-url}")
  private String ingestionUrl;

  @Value("${simulator.workers}")
  private int workers;

  @Value("${simulator.batch-delay-ms}")
  private long batchDelayMs;

  // Hardcoded seed data from your Postgres schema
  private final List<String> campaigns =
      List.of("d290f1ee-6c54-4b01-90e6-d701748f0851", "8f30c6fa-57a5-48b0-8c29-3b62db8f0819");
  private final String advertiserId = "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d";
  private final List<String> devices = List.of("mobile", "desktop", "ctv", "tablet");
  private final List<String> eventTypes =
      List.of("impression", "impression", "impression", "click");

  private final DateTimeFormatter formatter =
      DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss.SSS").withZone(ZoneOffset.UTC);
  private final Random random = new Random();

  public static void main(String[] args) {
    SpringApplication.run(SimulatorApplication.class, args);
  }

  @Override
  @SuppressFBWarnings("RV_RETURN_VALUE_IGNORED_BAD_PRACTICE")
  public void run(String... args) {
    System.out.println(
        "Starting AdPulse Load Simulator with "
            + workers
            + " Virtual Threads targeting "
            + ingestionUrl);

    // 1. Initialize High-Performance HTTP Client
    HttpClient client =
        HttpClient.newBuilder()
            .executor(
                Executors.newVirtualThreadPerTaskExecutor()) // Use Virtual Threads for network I/O
            .build();

    // 2. Create the Virtual Thread Pool for the workers
    try (ExecutorService executor = Executors.newVirtualThreadPerTaskExecutor()) {
      for (int i = 0; i < workers; i++) {
        executor.submit(() -> blastServer(client));
      }
    }
  }

  private void blastServer(HttpClient client) {
    while (true) {
      try {
        String payload = generatePayload();
        HttpRequest request =
            HttpRequest.newBuilder()
                .uri(URI.create(ingestionUrl))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(payload))
                .build();

        // Send request asynchronously
        client
            .sendAsync(request, HttpResponse.BodyHandlers.discarding())
            .thenAccept(
                res -> {
                  if (res.statusCode() == 202) {
                    System.out.println("🚀 Event Sent Successfully");
                  } else {
                    System.err.println("⚠️ Unexpected Status: " + res.statusCode());
                  }
                })
            .exceptionally(
                e -> {
                  System.err.println("Request failed: " + e.getMessage());
                  return null;
                });

        Thread.sleep(batchDelayMs);
      } catch (InterruptedException e) {
        Thread.currentThread().interrupt();
        break;
      }
    }
  }

  private String generatePayload() {
    double r = random.nextDouble();
    String eventType;
    double cost = 0.0;
    double conversionValue = 0.0;

    if (r < 0.90) {
      eventType = "impression";
    } else if (r < 0.99) {
      eventType = "click";
      cost = 0.10 + (random.nextDouble() * 2.40);
    } else {
      eventType = "conversion";
      conversionValue = 20.0 + (random.nextDouble() * 130.0);
    }

    // Manual JSON construction is faster than Jackson for massive throughput simulation
    return String.format(
        "{\"event_id\":\"%s\",\"campaign_id\":\"%s\",\"advertiser_id\":\"%s\",\"event_type\":\"%s\",\"country\":\"US\",\"device\":\"%s\",\"currency\":\"USD\",\"cost\":%.4f,\"conversion_value\":%.4f,\"occurred_at\":\"%s\"}",
        UUID.randomUUID().toString(),
        campaigns.get(random.nextInt(campaigns.size())),
        advertiserId,
        eventType,
        devices.get(random.nextInt(devices.size())),
        cost,
        conversionValue,
        formatter.format(Instant.now()));
  }
}
