-- Set replica identity to FULL for Realtime filtering on non-primary key columns
-- This is REQUIRED when filtering postgres_changes subscriptions by columns like game_id
-- See: https://supabase.com/docs/guides/realtime/postgres-changes

ALTER TABLE events REPLICA IDENTITY FULL;
ALTER TABLE players REPLICA IDENTITY FULL;
ALTER TABLE challenges REPLICA IDENTITY FULL;
