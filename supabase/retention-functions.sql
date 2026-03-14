-- ============================================
-- Retention RPC functions for Dashboard
-- Execute this SQL in Supabase SQL Editor AFTER schema.sql
-- ============================================

-- D1 Retention: % of users who sent a message the day after their first_seen
CREATE OR REPLACE FUNCTION get_retention_d1()
RETURNS NUMERIC AS $$
DECLARE
  total_users INTEGER;
  retained_users INTEGER;
BEGIN
  -- Users who signed up more than 1 day ago
  SELECT COUNT(*) INTO total_users
  FROM users
  WHERE first_seen < NOW() - INTERVAL '1 day';

  IF total_users = 0 THEN
    RETURN 0;
  END IF;

  -- Users who sent a message the day after first_seen
  SELECT COUNT(DISTINCT u.user_phone) INTO retained_users
  FROM users u
  INNER JOIN messages m ON m.user_phone = u.user_phone
  WHERE u.first_seen < NOW() - INTERVAL '1 day'
    AND DATE(m.timestamp) = DATE(u.first_seen) + INTERVAL '1 day';

  RETURN ROUND((retained_users::NUMERIC / total_users) * 100, 1);
END;
$$ LANGUAGE plpgsql;

-- D7 Retention: % of users who sent a message within 7 days after first_seen
CREATE OR REPLACE FUNCTION get_retention_d7()
RETURNS NUMERIC AS $$
DECLARE
  total_users INTEGER;
  retained_users INTEGER;
BEGIN
  -- Users who signed up more than 7 days ago
  SELECT COUNT(*) INTO total_users
  FROM users
  WHERE first_seen < NOW() - INTERVAL '7 days';

  IF total_users = 0 THEN
    RETURN 0;
  END IF;

  -- Users who sent a message between day 2 and day 7 after first_seen
  SELECT COUNT(DISTINCT u.user_phone) INTO retained_users
  FROM users u
  INNER JOIN messages m ON m.user_phone = u.user_phone
  WHERE u.first_seen < NOW() - INTERVAL '7 days'
    AND m.timestamp BETWEEN u.first_seen + INTERVAL '1 day' AND u.first_seen + INTERVAL '7 days';

  RETURN ROUND((retained_users::NUMERIC / total_users) * 100, 1);
END;
$$ LANGUAGE plpgsql;
