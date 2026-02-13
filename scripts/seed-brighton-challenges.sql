-- Brighton Level 8 Stag Do Challenges
-- Replace 'YOUR_GAME_ID_HERE' with your actual game ID from the URL

INSERT INTO challenges (game_id, title, description, base_points, bonus_points, category, is_active, sort_order)
VALUES
  -- Friday — North Laine Brewhouse
  ('YOUR_GAME_ID_HERE', 'Pool Predator', 'Win a game of pool.

Bonus: Win by potting the black off a bank shot.', 2, 2, 'friday', true, 1),

  ('YOUR_GAME_ID_HERE', 'Darts Ton+', 'Score 60+ in a single turn of darts.

Bonus: Score 100+ in a single turn.', 2, 3, 'friday', true, 2),

  ('YOUR_GAME_ID_HERE', 'Shuffleboard Sniper', 'Score 15+ in a single shuffleboard round.

Bonus: Win a full shuffleboard match.', 2, 2, 'friday', true, 3),

  ('YOUR_GAME_ID_HERE', 'Cornhole Clutch', 'Get 2 bags in the hole in a single round.

Bonus: Get 3+ bags in the hole in one round.', 2, 2, 'friday', true, 4),

  ('YOUR_GAME_ID_HERE', 'Social Engineer', 'Start a friendly conversation with another group and get a photo (consensual).

Bonus: Convince them you''re in Brighton for a professional sporting tournament.', 2, 3, 'friday', true, 5),

  -- Saturday — Karting
  ('YOUR_GAME_ID_HERE', 'Speed Demon', 'Achieve the fastest lap time in the group.', 5, NULL, 'saturday', true, 6),

  ('YOUR_GAME_ID_HERE', 'Clean Racer', 'Complete a race without spinning out.

Bonus: Finish top 2 in the race.', 2, 2, 'saturday', true, 7),

  -- Saturday — Axe Throwing
  ('YOUR_GAME_ID_HERE', 'Axe Assassin', 'Hit a bullseye.

Bonus: Hit two bullseyes in a row.', 3, 3, 'saturday', true, 8),

  ('YOUR_GAME_ID_HERE', 'Calm Under Pressure', 'Hit the board cleanly on every throw in one round.', 2, NULL, 'saturday', true, 9),

  -- Public Brighton Missions
  ('YOUR_GAME_ID_HERE', 'Seagull Survivor', 'Eat food outside without being attacked by a seagull.

Bonus: Successfully protect someone else''s food from a seagull.', 2, 3, 'public', true, 10),

  ('YOUR_GAME_ID_HERE', 'Beach Orator', 'Deliver a dramatic speech to the sea including the word "brotherhood".

Bonus: Include the phrase "seagulls are witnesses".', 3, 2, 'public', true, 11),

  ('YOUR_GAME_ID_HERE', 'Brighton Bingo', 'Spot someone in glitter or dramatic Brighton fashion.

Bonus: Get a group photo (with permission).', 2, 3, 'public', true, 12),

  ('YOUR_GAME_ID_HERE', 'Dance Floor Declaration', 'Start dancing alone confidently.

Bonus: Get the whole group dancing within 10 seconds.', 2, 3, 'public', true, 13),

  -- Drinking Games
  ('YOUR_GAME_ID_HERE', 'That''s The Groom', 'Someone says "stag", "wedding", or the partner''s name and you catch it.', 1, NULL, 'drinking', true, 14),

  ('YOUR_GAME_ID_HERE', 'Character Commitment', 'Stay in a chosen character for 10 full minutes.

Bonus: Make a stranger believe the character is real.', 2, 3, 'drinking', true, 15),

  -- Wildcard Chaos
  ('YOUR_GAME_ID_HERE', 'Unexpected MVP', 'Do something unexpectedly legendary (group vote required).', 3, NULL, 'wildcard', true, 16),

  ('YOUR_GAME_ID_HERE', 'Tactical Saboteur', 'Successfully complete a secret mission assigned by another player.

Bonus: No one realises until revealed later.', 2, 3, 'wildcard', true, 17);
