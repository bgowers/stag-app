-- Stag Points App Database Schema
--
-- To apply this schema:
-- 1. Go to your Supabase project SQL Editor
-- 2. Copy and paste this entire file
-- 3. Run the SQL

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Games table
CREATE TABLE games (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Players table
CREATE TABLE players (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_player_per_game UNIQUE (game_id, name)
);

-- Challenges table
CREATE TABLE challenges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  base_points INTEGER NOT NULL DEFAULT 0,
  bonus_points INTEGER,
  category TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Events table (claims)
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  challenge_id UUID NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
  kind TEXT NOT NULL CHECK (kind IN ('base', 'bonus')),
  points INTEGER NOT NULL,
  created_by_player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_claim_per_kind UNIQUE (player_id, challenge_id, kind)
);

-- Indexes for better query performance
CREATE INDEX idx_players_game_id ON players(game_id);
CREATE INDEX idx_challenges_game_id ON challenges(game_id);
CREATE INDEX idx_challenges_active ON challenges(game_id, is_active);
CREATE INDEX idx_events_game_id ON events(game_id);
CREATE INDEX idx_events_player_id ON events(player_id);
CREATE INDEX idx_events_challenge_id ON events(challenge_id);
CREATE INDEX idx_events_created_at ON events(created_at DESC);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at on challenges
CREATE TRIGGER update_challenges_updated_at
  BEFORE UPDATE ON challenges
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies
-- Since there's no authentication, we'll enable RLS but allow all operations
-- This provides a structure for future auth if needed

ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Allow all operations for now (no auth)
CREATE POLICY "Allow all on games" ON games FOR ALL USING (true);
CREATE POLICY "Allow all on players" ON players FOR ALL USING (true);
CREATE POLICY "Allow all on challenges" ON challenges FOR ALL USING (true);
CREATE POLICY "Allow all on events" ON events FOR ALL USING (true);

-- Optional: Add some sample data for testing
-- Uncomment the following lines if you want to start with test data

-- INSERT INTO games (name) VALUES ('Test Stag Do 2026');
--
-- INSERT INTO players (game_id, name)
-- SELECT id, 'Dave' FROM games WHERE name = 'Test Stag Do 2026'
-- UNION ALL
-- SELECT id, 'Mike' FROM games WHERE name = 'Test Stag Do 2026'
-- UNION ALL
-- SELECT id, 'Tom' FROM games WHERE name = 'Test Stag Do 2026'
-- UNION ALL
-- SELECT id, 'Steve' FROM games WHERE name = 'Test Stag Do 2026'
-- UNION ALL
-- SELECT id, 'Chris' FROM games WHERE name = 'Test Stag Do 2026';
--
-- INSERT INTO challenges (game_id, title, description, base_points, bonus_points, category, is_active, sort_order)
-- SELECT
--   g.id,
--   'Down your pint',
--   'Finish a full pint in under 10 seconds',
--   5,
--   3,
--   'drinking',
--   true,
--   1
-- FROM games g WHERE g.name = 'Test Stag Do 2026'
-- UNION ALL
-- SELECT
--   g.id,
--   'Speak in an accent',
--   'Maintain a foreign accent for 30 minutes',
--   3,
--   2,
--   'performance',
--   true,
--   2
-- FROM games g WHERE g.name = 'Test Stag Do 2026';
