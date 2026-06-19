-- One row per unique visitor (keyed by a salted hash of their IP).
-- Raw IPs are never stored. visits counts repeat page loads from the same person.
CREATE TABLE IF NOT EXISTS visitors (
  ip_hash    TEXT PRIMARY KEY,
  city       TEXT,
  region     TEXT,
  country    TEXT,
  first_seen INTEGER NOT NULL,
  last_seen  INTEGER NOT NULL,
  visits     INTEGER NOT NULL DEFAULT 1
);

CREATE INDEX IF NOT EXISTS idx_visitors_last_seen ON visitors (last_seen);
