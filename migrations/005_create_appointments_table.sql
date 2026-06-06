-- Migration 005: Create appointments table
-- Depends on: 002_create_providers_table.sql, 003_create_services_table.sql
--
-- btree_gist is a standard PostgreSQL extension required for the EXCLUDE constraint.
-- The EXCLUDE prevents double-booking at the database level: no two active appointments
-- for the same provider can have overlapping time ranges ([starts_at, ends_at)).
-- Cancelled appointments are excluded from the conflict check via the WHERE clause.

CREATE EXTENSION IF NOT EXISTS btree_gist;

CREATE TYPE appointment_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed');

CREATE TABLE appointments (
  id          UUID               PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID               NOT NULL REFERENCES providers (id) ON DELETE RESTRICT,
  client_id   UUID               NOT NULL REFERENCES users     (id) ON DELETE RESTRICT,
  service_id  UUID               NOT NULL REFERENCES services  (id) ON DELETE RESTRICT,
  starts_at   TIMESTAMPTZ        NOT NULL,
  ends_at     TIMESTAMPTZ        NOT NULL,
  status      appointment_status NOT NULL DEFAULT 'pending',
  notes       TEXT,
  created_at  TIMESTAMPTZ        NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ        NOT NULL DEFAULT NOW(),

  CONSTRAINT chk_appointment_time CHECK (ends_at > starts_at),

  -- Guarantees no two non-cancelled appointments overlap for the same provider
  CONSTRAINT excl_no_provider_overlap EXCLUDE USING gist (
    provider_id WITH =,
    tstzrange(starts_at, ends_at, '[)') WITH &&
  ) WHERE (status <> 'cancelled')
);

CREATE INDEX idx_appointments_provider_id   ON appointments (provider_id);
CREATE INDEX idx_appointments_client_id     ON appointments (client_id);
CREATE INDEX idx_appointments_service_id    ON appointments (service_id);
CREATE INDEX idx_appointments_starts_at     ON appointments (starts_at);
CREATE INDEX idx_appointments_status        ON appointments (status);
-- Composite index for the "list available slots" query: filter by provider + active time window
CREATE INDEX idx_appointments_provider_time ON appointments (provider_id, starts_at, ends_at)
  WHERE status <> 'cancelled';
