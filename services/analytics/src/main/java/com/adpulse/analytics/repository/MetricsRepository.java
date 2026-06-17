package com.adpulse.analytics.repository;

import java.util.List;
import java.util.Map;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;

@Repository
public class MetricsRepository {

  private final JdbcClient jdbcClient;

  public MetricsRepository(@Qualifier("clickhouseJdbcClient") JdbcClient jdbcClient) {
    this.jdbcClient = jdbcClient;
  }

  /**
   * Queries the mv_campaign_daily Materialized View.
   */
  public List<Map<String, Object>> getLiveCampaignMetrics() {
    String query =
        """
            SELECT
                campaign_id,
                sumIf(total_events, event_type = 'impression') as impressions,
                sumIf(total_events, event_type = 'click') as clicks,
                sumIf(total_events, event_type = 'conversion') as conversions,
                sum(total_cost) as spend,
                sum(total_conversion_value) as conversion_value,
                if(impressions > 0, (spend / impressions) * 1000, 0) as ecpm,
                if(clicks > 0, spend / clicks, 0) as cpc,
                if(conversions > 0, spend / conversions, 0) as cpa,
                if(spend > 0, conversion_value / spend, 0) as roas,
                if(impressions > 0, clicks / impressions, 0) as ctr
            FROM adpulse.mv_campaign_daily
            WHERE day = toDate(now())
            GROUP BY campaign_id
        """;

    return jdbcClient.sql(query).query().listOfRows();
  }

  /**
   * Fetches daily time-series metrics for the last N days.
   */
  public List<Map<String, Object>> getTimeSeriesMetrics(int days) {
    String query =
        """
            SELECT
                day,
                sumIf(total_events, event_type = 'impression') as impressions,
                sumIf(total_events, event_type = 'click') as clicks,
                sumIf(total_events, event_type = 'conversion') as conversions,
                sum(total_cost) as spend,
                sum(total_conversion_value) as conversion_value,
                if(impressions > 0, (spend / impressions) * 1000, 0) as ecpm,
                if(clicks > 0, spend / clicks, 0) as cpc,
                if(conversions > 0, spend / conversions, 0) as cpa,
                if(spend > 0, conversion_value / spend, 0) as roas,
                if(impressions > 0, clicks / impressions, 0) as ctr
            FROM adpulse.mv_campaign_daily
            WHERE day >= toDate(now()) - INTERVAL :days DAY
            GROUP BY day
            ORDER BY day ASC
        """;

    return jdbcClient.sql(query)
        .param("days", days)
        .query()
        .listOfRows();
  }

  /**
   * Performs a dynamic breakdown of metrics by a specified dimension.
   */
  public List<Map<String, Object>> getBreakdownMetrics(String dimension) {
    // Whitelist check
    if (!List.of("device", "country").contains(dimension.toLowerCase())) {
      throw new IllegalArgumentException("Invalid breakdown dimension: " + dimension);
    }

    String query = String.format(
        """
            SELECT
                %s as dimension,
                sumIf(total_events, event_type = 'impression') as impressions,
                sumIf(total_events, event_type = 'click') as clicks,
                sumIf(total_events, event_type = 'conversion') as conversions,
                sum(total_cost) as spend,
                sum(total_conversion_value) as conversion_value,
                if(impressions > 0, (spend / impressions) * 1000, 0) as ecpm,
                if(clicks > 0, spend / clicks, 0) as cpc,
                if(conversions > 0, spend / conversions, 0) as cpa,
                if(spend > 0, conversion_value / spend, 0) as roas,
                if(impressions > 0, clicks / impressions, 0) as ctr
            FROM adpulse.mv_campaign_metrics
            WHERE hour >= toStartOfHour(now() - INTERVAL 24 HOUR)
            GROUP BY dimension
            ORDER BY impressions DESC
        """, dimension);

    return jdbcClient.sql(query).query().listOfRows();
  }

  /**
   * Fetches the top-performing campaigns based on a specific metric.
   */
  public List<Map<String, Object>> getTopPerformers(String metric, int limit) {
    List<String> allowedMetrics = List.of(
        "impressions", "clicks", "conversions", "spend",
        "conversion_value", "ecpm", "cpc", "cpa", "roas", "ctr"
    );

    if (!allowedMetrics.contains(metric.toLowerCase())) {
      throw new IllegalArgumentException("Invalid metric: " + metric);
    }

    String query = String.format(
        """
            SELECT
                campaign_id,
                sumIf(total_events, event_type = 'impression') as impressions,
                sumIf(total_events, event_type = 'click') as clicks,
                sumIf(total_events, event_type = 'conversion') as conversions,
                sum(total_cost) as spend,
                sum(total_conversion_value) as conversion_value,
                if(impressions > 0, (spend / impressions) * 1000, 0) as ecpm,
                if(clicks > 0, spend / clicks, 0) as cpc,
                if(conversions > 0, spend / conversions, 0) as cpa,
                if(spend > 0, conversion_value / spend, 0) as roas,
                if(impressions > 0, clicks / impressions, 0) as ctr
            FROM adpulse.mv_campaign_daily
            WHERE day >= toDate(now()) - INTERVAL 7 DAY
            GROUP BY campaign_id
            ORDER BY %s DESC
            LIMIT :limit
        """, metric);

    return jdbcClient.sql(query)
        .param("limit", limit)
        .query()
        .listOfRows();
  }

}


