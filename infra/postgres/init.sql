-- =============================================================================
-- AdPulse / PostgreSQL — production-grade schema
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Extensions
-- ---------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "pgcrypto";   -- gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "citext";     -- case-insensitive email type


-- ---------------------------------------------------------------------------
-- Lookup / reference tables
-- ---------------------------------------------------------------------------

CREATE TABLE currencies (
    code        VARCHAR(3)   PRIMARY KEY,           -- e.g. 'USD', 'EUR', 'GBP'
    name        VARCHAR(64)  NOT NULL,
    symbol      VARCHAR(8)   NOT NULL,
    is_active   BOOLEAN      NOT NULL DEFAULT TRUE
);

CREATE TABLE countries (
    code        VARCHAR(2)   PRIMARY KEY,           -- e.g. 'US', 'DE'
    name        VARCHAR(128) NOT NULL,
    region      VARCHAR(64),                        -- e.g. 'EMEA', 'APAC'
    is_active   BOOLEAN      NOT NULL DEFAULT TRUE
);

CREATE TABLE device_types (
    code        VARCHAR(32)  PRIMARY KEY,           -- e.g. 'desktop', 'mobile', 'tablet', 'ctv', 'unknown'
    label       VARCHAR(64)  NOT NULL,
    is_active   BOOLEAN      NOT NULL DEFAULT TRUE
);

INSERT INTO device_types (code, label) VALUES
    ('desktop', 'Desktop'),
    ('mobile',  'Mobile'),
    ('tablet',  'Tablet'),
    ('ctv',     'Connected TV'),
    ('unknown', 'Unknown');


-- ---------------------------------------------------------------------------
-- Advertisers
-- ---------------------------------------------------------------------------
CREATE TABLE advertisers (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(255) NOT NULL,
    email           CITEXT       NOT NULL,
    billing_currency VARCHAR(3)  NOT NULL REFERENCES currencies(code),
    timezone        VARCHAR(64) NOT NULL DEFAULT 'UTC',
    is_verified     BOOLEAN     NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at      TIMESTAMPTZ                          -- soft delete
);

CREATE UNIQUE INDEX uq_advertisers_email_active
    ON advertisers(email)
    WHERE deleted_at IS NULL;

CREATE INDEX idx_advertisers_live
    ON advertisers(id)
    WHERE deleted_at IS NULL;


-- ---------------------------------------------------------------------------
-- Campaign status
-- ---------------------------------------------------------------------------
CREATE TYPE campaign_status AS ENUM (
    'draft',
    'pending',
    'active',
    'paused',
    'exhausted',
    'ended',
    'cancelled'
);


-- ---------------------------------------------------------------------------
-- Campaigns
-- ---------------------------------------------------------------------------
CREATE TABLE campaigns (
    id                  UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    advertiser_id       UUID            NOT NULL REFERENCES advertisers(id),
    name                VARCHAR(255)    NOT NULL,
    status              campaign_status NOT NULL DEFAULT 'draft',
    daily_budget        DECIMAL(19,4)   NOT NULL,
    total_budget        DECIMAL(19,4)   NOT NULL,
    currency            VARCHAR(3)      NOT NULL REFERENCES currencies(code),
    target_all_countries BOOLEAN        NOT NULL DEFAULT TRUE,
    target_all_devices   BOOLEAN        NOT NULL DEFAULT TRUE,
    start_date          DATE            NOT NULL,
    end_date            DATE            NOT NULL,
    created_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    deleted_at          TIMESTAMPTZ,
    cancelled_at        TIMESTAMPTZ,
    cancellation_reason TEXT,

    CONSTRAINT chk_campaign_dates
        CHECK (end_date > start_date),

    CONSTRAINT chk_campaign_daily_lte_total
        CHECK (daily_budget <= total_budget),

    CONSTRAINT chk_campaign_budgets_positive
        CHECK (daily_budget > 0 AND total_budget > 0),

    CONSTRAINT chk_campaign_cancellation
        CHECK (
            (status = 'cancelled' AND cancelled_at IS NOT NULL)
            OR
            (status <> 'cancelled' AND cancelled_at IS NULL)
        )
);

CREATE INDEX idx_campaigns_advertiser
    ON campaigns(advertiser_id)
    WHERE deleted_at IS NULL;

CREATE INDEX idx_campaigns_active
    ON campaigns(advertiser_id, start_date, end_date)
    WHERE status = 'active' AND deleted_at IS NULL;

CREATE INDEX idx_campaigns_status
    ON campaigns(status)
    WHERE deleted_at IS NULL;


-- ---------------------------------------------------------------------------
-- Campaign targeting: countries
-- ---------------------------------------------------------------------------
CREATE TABLE campaign_target_countries (
    campaign_id     UUID       NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    country_code    VARCHAR(2) NOT NULL REFERENCES countries(code),
    PRIMARY KEY (campaign_id, country_code)
);


CREATE INDEX idx_ctc_campaign ON campaign_target_countries(campaign_id);


-- ---------------------------------------------------------------------------
-- Campaign targeting: devices
-- ---------------------------------------------------------------------------
CREATE TABLE campaign_target_devices (
    campaign_id     UUID        NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    device_code     VARCHAR(32) NOT NULL REFERENCES device_types(code),
    PRIMARY KEY (campaign_id, device_code)
);

CREATE INDEX idx_ctd_campaign ON campaign_target_devices(campaign_id);


-- ---------------------------------------------------------------------------
-- Campaign budget ledger
-- ---------------------------------------------------------------------------
CREATE TABLE campaign_spend (
    campaign_id         UUID        PRIMARY KEY REFERENCES campaigns(id),
    lifetime_spend      DECIMAL(19,4) NOT NULL DEFAULT 0,
    today_spend         DECIMAL(19,4) NOT NULL DEFAULT 0,
    today_date          DATE          NOT NULL DEFAULT CURRENT_DATE,
    last_synced_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_spend_non_negative
        CHECK (lifetime_spend >= 0 AND today_spend >= 0)
);


-- ---------------------------------------------------------------------------
-- Status transition audit log
-- ---------------------------------------------------------------------------
CREATE TABLE campaign_status_log (
    id              UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id     UUID            NOT NULL REFERENCES campaigns(id),
    from_status     campaign_status,
    to_status       campaign_status NOT NULL,
    changed_by      UUID,
    reason          TEXT,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_csl_campaign ON campaign_status_log(campaign_id, created_at DESC);


-- ---------------------------------------------------------------------------
-- updated_at auto-maintenance trigger
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_advertisers_updated_at
    BEFORE UPDATE ON advertisers
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_campaigns_updated_at
    BEFORE UPDATE ON campaigns
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- ---------------------------------------------------------------------------
-- Seed data: currencies
-- ---------------------------------------------------------------------------
INSERT INTO currencies (code, name, symbol) VALUES
    ('USD', 'US Dollar',          '$'),
    ('EUR', 'Euro',               '€'),
    ('GBP', 'British Pound',      '£'),
    ('JPY', 'Japanese Yen',       '¥'),
    ('AUD', 'Australian Dollar',  'A$'),
    ('CAD', 'Canadian Dollar',    'C$'),
    ('INR', 'Indian Rupee',       '₹');

-- ---------------------------------------------------------------------------
-- Seed data: Countries
-- ---------------------------------------------------------------------------
INSERT INTO countries (code, name, region) VALUES
    ('US', 'United States', 'Americas'),
    ('GB', 'United Kingdom', 'EMEA'),
    ('IN', 'India', 'APAC');

-- ---------------------------------------------------------------------------
-- Seed data: Default Advertiser & Campaigns
-- ---------------------------------------------------------------------------
INSERT INTO advertisers (id, name, email, billing_currency) VALUES
    ('a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'Global Ad Corp', 'billing@globalad.com', 'USD');

INSERT INTO campaigns (id, advertiser_id, name, status, daily_budget, total_budget, currency, start_date, end_date) VALUES
    ('d290f1ee-6c54-4b01-90e6-d701748f0851', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'Summer Sale 2026', 'active', 5000000.00, 50000000.00, 'USD', '2026-06-01', '2026-08-31'),
    ('8f30c6fa-57a5-48b0-8c29-3b62db8f0819', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'New Product Launch', 'active', 1500000.00, 15000000.00, 'USD', '2026-06-10', '2026-07-10');

-- ---------------------------------------------------------------------------
-- Campaign Alerts
-- ---------------------------------------------------------------------------
CREATE TYPE alert_metric AS ENUM (
    'spend_pct',
    'ctr',
    'conversions',
    'clicks'
);

CREATE TYPE alert_operator AS ENUM (
    'greater_than',
    'less_than',
    'equal_to'
);

CREATE TABLE campaign_alerts (
    id              UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id     UUID            NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    title           VARCHAR(255)    NOT NULL,
    metric          alert_metric    NOT NULL,
    operator        alert_operator  NOT NULL,
    threshold       DOUBLE PRECISION NOT NULL,
    is_active       BOOLEAN         NOT NULL DEFAULT TRUE,
    expiry_at       TIMESTAMPTZ,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_alerts_campaign ON campaign_alerts(campaign_id);
CREATE INDEX idx_alerts_active ON campaign_alerts(is_active) WHERE is_active = TRUE;

CREATE TRIGGER trg_alerts_updated_at
    BEFORE UPDATE ON campaign_alerts
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

INSERT INTO campaign_spend (campaign_id, lifetime_spend, today_spend, today_date) VALUES
    ('d290f1ee-6c54-4b01-90e6-d701748f0851', 0, 0, CURRENT_DATE),
    ('8f30c6fa-57a5-48b0-8c29-3b62db8f0819', 0, 0, CURRENT_DATE);

