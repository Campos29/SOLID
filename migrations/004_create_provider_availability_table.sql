-- Migration 004: Create provider_availability table
-- Depends on: 002_create_providers_table.sql
--
-- weekly_slots: JSON array of { dayOfWeek: 0-6, startTime: "HH:mm", endTime: "HH:mm", slotIntervalInMinutes: number }
-- blocked_dates: JSON array of { date: ISO string, reason?: string }

CREATE TABLE provider_availability (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id   UUID        NOT NULL REFERENCES providers (id) ON DELETE CASCADE,
  weekly_slots  JSONB       NOT NULL DEFAULT '[]',
  blocked_dates JSONB       NOT NULL DEFAULT '[]',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT uq_provider_availability UNIQUE (provider_id),
  CONSTRAINT chk_weekly_slots_is_array  CHECK (jsonb_typeof(weekly_slots)  = 'array'),
  CONSTRAINT chk_blocked_dates_is_array CHECK (jsonb_typeof(blocked_dates) = 'array')
);

CREATE INDEX idx_provider_availability_provider_id ON provider_availability (provider_id);
