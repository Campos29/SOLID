-- Migration 003: Create services table
-- Depends on: 002_create_providers_table.sql

CREATE TABLE services (
  id                  UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id         UUID          NOT NULL REFERENCES providers (id) ON DELETE CASCADE,
  name                VARCHAR(255)  NOT NULL,
  duration_in_minutes INTEGER       NOT NULL,
  price_in_cents      INTEGER       NOT NULL,
  created_at          TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

  CONSTRAINT chk_duration_positive  CHECK (duration_in_minutes > 0),
  CONSTRAINT chk_price_non_negative CHECK (price_in_cents >= 0)
);

CREATE INDEX idx_services_provider_id ON services (provider_id);
