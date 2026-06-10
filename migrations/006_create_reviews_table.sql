-- Migration 006: Create reviews table
-- Depends on: 001_create_users_table.sql
--             002_create_providers_table.sql (providers.average_rating is updated here)
--             005_create_appointments_table.sql
--
-- Business rules enforced at the database level:
--   * One review per appointment (UNIQUE on appointment_id).
--   * Rating is a whole number from 1 to 5.
--   * Comment, when present, is at most 1000 characters.
--
-- provider_id and client_id are denormalized from the appointment row so that
-- the common read paths (list reviews for a provider, list reviews by a client)
-- never need to join through the appointments table.
--
-- providers.average_rating is a denormalized aggregate.  After every INSERT
-- here, the submit-review use case recalculates it with:
--   UPDATE providers
--      SET average_rating = (SELECT ROUND(AVG(rating)::NUMERIC, 2)
--                              FROM reviews
--                             WHERE provider_id = $1),
--          updated_at = NOW()
--    WHERE id = $1;
--
-- Reviews are immutable once submitted (no updated_at column).
-- Whether a review can be submitted is enforced by the use case, which checks
-- that the referenced appointment has status = 'completed' and belongs to the
-- authenticated client before inserting.

CREATE TABLE reviews (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID        NOT NULL REFERENCES appointments (id) ON DELETE RESTRICT,
  provider_id    UUID        NOT NULL REFERENCES providers    (id) ON DELETE CASCADE,
  client_id      UUID        NOT NULL REFERENCES users        (id) ON DELETE RESTRICT,
  rating         SMALLINT    NOT NULL,
  comment        TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- One review per appointment
  CONSTRAINT uq_reviews_appointment_id UNIQUE (appointment_id),

  CONSTRAINT chk_review_rating   CHECK (rating BETWEEN 1 AND 5),
  CONSTRAINT chk_comment_length  CHECK (char_length(comment) <= 1000)
);

-- Hot path: fetch all reviews for a provider's public profile
CREATE INDEX idx_reviews_provider_id ON reviews (provider_id);

-- Needed for "reviews I wrote" queries on the client side
CREATE INDEX idx_reviews_client_id ON reviews (client_id);

-- Most common read pattern: reviews for a provider, newest first
CREATE INDEX idx_reviews_provider_created ON reviews (provider_id, created_at DESC);
