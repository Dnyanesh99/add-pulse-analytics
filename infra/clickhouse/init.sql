-- =============================================================================
-- AdPulse / ClickHouse — production-grade schema
-- =============================================================================

CREATE DATABASE IF NOT EXISTS adpulse;
USE adpulse;

-- ---------------------------------------------------------------------------
-- 1. Kafka Engine — raw consumer
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ad_events_queue (
    event_id         UUID,
    campaign_id      UUID,
    advertiser_id    UUID,
    event_type       String,
    country          String,
    device           String,
    currency         String,
    cost             Decimal(19,4),
    conversion_value Decimal(19,4),
    occurred_at      DateTime64(3)
) ENGINE = Kafka
SETTINGS
    kafka_broker_list           = 'kafka:29092',
    kafka_topic_list            = 'ad-events',
    kafka_group_name            = 'clickhouse_consumer_group',
    kafka_format                = 'JSONEachRow',
    kafka_num_consumers         = 1,
    kafka_max_block_size        = 65536,
    kafka_poll_max_batch_size   = 1048576,
    kafka_flush_interval_ms     = 1000,
    kafka_skip_broken_messages  = 100;


-- ---------------------------------------------------------------------------
-- 2. Storage table — where data actually lives
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ad_events (
    event_id         UUID,
    campaign_id      UUID,
    advertiser_id    UUID,
    event_type       LowCardinality(String),
    country          LowCardinality(String),
    device           LowCardinality(String),
    currency         LowCardinality(String),
    cost             Decimal(19,4),
    conversion_value Decimal(19,4),
    occurred_at      DateTime64(3),
    _version         UInt64 MATERIALIZED toUnixTimestamp64Milli(occurred_at)
)
ENGINE = ReplacingMergeTree(_version)
PARTITION BY toYYYYMM(occurred_at)
ORDER BY (campaign_id, event_type, country, device, occurred_at)
SETTINGS
    index_granularity               = 8192,
    merge_with_ttl_timeout          = 3600,
    replicated_deduplication_window = 100;

-- ---------------------------------------------------------------------------
-- 3. Passthrough MV — moves rows from Kafka engine into storage
-- ---------------------------------------------------------------------------
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_ad_events TO ad_events AS
SELECT
    event_id,
    campaign_id,
    advertiser_id,
    event_type,
    country,
    device,
    currency,
    cost,
    conversion_value,
    occurred_at
FROM ad_events_queue;


-- ---------------------------------------------------------------------------
-- 4. Hourly aggregation MV
-- ---------------------------------------------------------------------------
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_campaign_metrics
ENGINE = SummingMergeTree()
PARTITION BY toYYYYMM(hour)
ORDER BY (campaign_id, hour, event_type, country, device, currency)
AS
SELECT
    campaign_id,
    advertiser_id,
    toStartOfHour(occurred_at)  AS hour,
    event_type,
    country,
    device,
    currency,
    count()                     AS total_events,
    sum(cost)                   AS total_cost,
    sum(conversion_value)       AS total_conversion_value
FROM ad_events
GROUP BY
    campaign_id, advertiser_id, hour, event_type, country, device, currency;


-- ---------------------------------------------------------------------------
-- 5. Daily rollup MV
-- ---------------------------------------------------------------------------
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_campaign_daily
ENGINE = SummingMergeTree()
PARTITION BY toYYYYMM(day)
ORDER BY (campaign_id, day, event_type, currency)
AS
SELECT
    campaign_id,
    advertiser_id,
    toDate(occurred_at)         AS day,
    event_type,
    currency,
    count()                     AS total_events,
    sum(cost)                   AS total_cost,
    sum(conversion_value)       AS total_conversion_value
FROM ad_events
GROUP BY
    campaign_id, advertiser_id, day, event_type, currency;


-- ---------------------------------------------------------------------------
-- 6. Advertiser-level daily rollup
-- ---------------------------------------------------------------------------
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_advertiser_daily
ENGINE = SummingMergeTree()
PARTITION BY toYYYYMM(day)
ORDER BY (advertiser_id, day, currency)
AS
SELECT
    advertiser_id,
    toDate(occurred_at)         AS day,
    currency,
    count()                     AS total_events,
    sum(cost)                   AS total_cost,
    sum(conversion_value)       AS total_conversion_value
FROM ad_events
GROUP BY advertiser_id, day, currency;
