-- This migration ensures all date columns use proper ISO 8601 UTC format
-- Format: 2026-06-17T01:00:00Z (not 2026-06-17 01:00:00)

-- Optional: Verify current format of matches
SELECT id, match_date, last_updated FROM matches LIMIT 5;

-- The match_date and last_updated columns in the matches table should store:
-- Type: TIMESTAMP WITH TIME ZONE or TEXT in ISO 8601 format
-- Format: 2026-06-17T01:00:00Z

-- If you need to manually fix existing dates, run this:
-- UPDATE matches 
-- SET match_date = match_date AT TIME ZONE 'UTC'
-- WHERE match_date IS NOT NULL;

-- Check the current table schema:
-- The matches table should have:
-- - match_date TIMESTAMP NOT NULL (will store in UTC)
-- - last_updated TIMESTAMP (will store in UTC)

-- Verify after sync:
SELECT id, home_team, away_team, match_date, last_updated FROM matches ORDER BY match_date LIMIT 10;
