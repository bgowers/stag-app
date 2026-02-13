-- Add is_repeatable column to challenges (nullable first for existing data)
ALTER TABLE challenges ADD COLUMN IF NOT EXISTS is_repeatable BOOLEAN;

-- Set default value for existing challenges (non-repeatable)
UPDATE challenges SET is_repeatable = false WHERE is_repeatable IS NULL;

-- Now make it NOT NULL with default
ALTER TABLE challenges ALTER COLUMN is_repeatable SET NOT NULL;
ALTER TABLE challenges ALTER COLUMN is_repeatable SET DEFAULT false;

-- Drop the unique constraint that prevents repeat claims
-- This allows repeatable challenges to be claimed multiple times
ALTER TABLE events DROP CONSTRAINT IF EXISTS unique_claim_per_kind;

-- Add a comment explaining the change
COMMENT ON COLUMN challenges.is_repeatable IS 'If true, players can claim this challenge multiple times. If false, enforce one claim per kind in application layer.';
