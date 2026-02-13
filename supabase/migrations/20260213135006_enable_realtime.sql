-- Enable Realtime for tables
-- This allows Supabase Realtime subscriptions to receive postgres_changes events

ALTER PUBLICATION supabase_realtime ADD TABLE events;
ALTER PUBLICATION supabase_realtime ADD TABLE players;
ALTER PUBLICATION supabase_realtime ADD TABLE challenges;
