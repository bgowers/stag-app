-- Add is_repeatable column to challenges
ALTER TABLE challenges ADD COLUMN is_repeatable BOOLEAN NOT NULL DEFAULT false;

-- Drop the unique constraint that prevents repeat claims
-- This allows repeatable challenges to be claimed multiple times
ALTER TABLE events DROP CONSTRAINT IF EXISTS unique_claim_per_kind;

-- Add a comment explaining the change
COMMENT ON COLUMN challenges.is_repeatable IS 'If true, players can claim this challenge multiple times. If false, enforce one claim per kind in application layer.';
