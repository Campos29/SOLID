-- Migration 002: Create providers table
-- Depends on: 001_create_users_table.sql

CREATE TABLE providers (
  id             UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID          NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  name           VARCHAR(255)  NOT NULL,
  description    TEXT          NOT NULL DEFAULT '',
  category       VARCHAR(100)  NOT NULL,
  -- denormalized from reviews module; updated by submit-review use case
  average_rating NUMERIC(3, 2) NOT NULL DEFAULT 0.00,
  created_at     TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

  CONSTRAINT uq_providers_user_id UNIQUE (user_id),
  CONSTRAINT chk_average_rating   CHECK  (average_rating BETWEEN 0 AND 5)
);

CREATE INDEX idx_providers_user_id  ON providers (user_id);
CREATE INDEX idx_providers_category ON providers (category);
