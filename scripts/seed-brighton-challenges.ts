/**
 * Seed script for Brighton Level 8 Stag Do challenges
 *
 * Usage:
 *   1. Get your game ID from the URL (e.g., /g/YOUR_GAME_ID/host)
 *   2. Run: npx tsx scripts/seed-brighton-challenges.ts YOUR_GAME_ID
 */

import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";

// Load environment variables from .env.local
config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing Supabase environment variables");
  console.error("Make sure .env.local exists with:");
  console.error("  NEXT_PUBLIC_SUPABASE_URL");
  console.error("  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const challenges = [
  // Friday — North Laine Brewhouse
  {
    title: "Pool Predator",
    description:
      "Win a game of pool.\n\nBonus: Win by potting the black off a bank shot.",
    base_points: 2,
    bonus_points: 2,
    category: "friday",
    sort_order: 1,
  },
  {
    title: "Darts Ton+",
    description:
      "Score 60+ in a single turn of darts.\n\nBonus: Score 100+ in a single turn.",
    base_points: 2,
    bonus_points: 3,
    category: "friday",
    sort_order: 2,
  },
  {
    title: "Shuffleboard Sniper",
    description:
      "Score 15+ in a single shuffleboard round.\n\nBonus: Win a full shuffleboard match.",
    base_points: 2,
    bonus_points: 2,
    category: "friday",
    sort_order: 3,
  },
  {
    title: "Cornhole Clutch",
    description:
      "Get 2 bags in the hole in a single round.\n\nBonus: Get 3+ bags in the hole in one round.",
    base_points: 2,
    bonus_points: 2,
    category: "friday",
    sort_order: 4,
  },
  {
    title: "Social Engineer",
    description:
      "Start a friendly conversation with another group and get a photo (consensual).\n\nBonus: Convince them you're in Brighton for a professional sporting tournament.",
    base_points: 2,
    bonus_points: 3,
    category: "friday",
    is_repeatable: true, // Can talk to multiple groups
    sort_order: 5,
  },

  // Saturday — Karting
  {
    title: "Speed Demon",
    description: "Achieve the fastest lap time in the group.",
    base_points: 5,
    bonus_points: null,
    category: "saturday",
    sort_order: 6,
  },
  {
    title: "Clean Racer",
    description:
      "Complete a race without spinning out.\n\nBonus: Finish top 2 in the race.",
    base_points: 2,
    bonus_points: 2,
    category: "saturday",
    sort_order: 7,
  },

  // Saturday — Axe Throwing
  {
    title: "Axe Assassin",
    description: "Hit a bullseye.\n\nBonus: Hit two bullseyes in a row.",
    base_points: 3,
    bonus_points: 3,
    category: "saturday",
    sort_order: 8,
  },
  {
    title: "Calm Under Pressure",
    description: "Hit the board cleanly on every throw in one round.",
    base_points: 2,
    bonus_points: null,
    category: "saturday",
    sort_order: 9,
  },

  // Public Brighton Missions
  {
    title: "Seagull Survivor",
    description:
      "Eat food outside without being attacked by a seagull.\n\nBonus: Successfully protect someone else's food from a seagull.",
    base_points: 2,
    bonus_points: 3,
    category: "public",
    is_repeatable: true, // Multiple meals throughout weekend
    sort_order: 10,
  },
  {
    title: "Beach Orator",
    description:
      'Deliver a dramatic speech to the sea including the word "brotherhood".\n\nBonus: Include the phrase "seagulls are witnesses".',
    base_points: 3,
    bonus_points: 2,
    category: "public",
    sort_order: 11,
  },
  {
    title: "Brighton Bingo",
    description:
      "Spot someone in glitter or dramatic Brighton fashion.\n\nBonus: Get a group photo (with permission).",
    base_points: 2,
    bonus_points: 3,
    category: "public",
    is_repeatable: true, // Can spot multiple people
    sort_order: 12,
  },
  {
    title: "Dance Floor Declaration",
    description:
      "Start dancing alone confidently.\n\nBonus: Get the whole group dancing within 10 seconds.",
    base_points: 2,
    bonus_points: 3,
    category: "public",
    is_repeatable: true, // Multiple nights/venues
    sort_order: 13,
  },

  // Drinking Games
  {
    title: "That's The Groom",
    description:
      'Someone says "stag", "wedding", or the partner\'s name and you catch it.',
    base_points: 1,
    bonus_points: null,
    category: "drinking",
    is_repeatable: true, // Ongoing game throughout the stag
    sort_order: 14,
  },
  {
    title: "Character Commitment",
    description:
      "Stay in a chosen character for 10 full minutes.\n\nBonus: Make a stranger believe the character is real.",
    base_points: 2,
    bonus_points: 3,
    category: "drinking",
    is_repeatable: true, // Can do different characters
    sort_order: 15,
  },

  // Wildcard Chaos
  {
    title: "Unexpected MVP",
    description: "Do something unexpectedly legendary (group vote required).",
    base_points: 3,
    bonus_points: null,
    category: "wildcard",
    is_repeatable: true, // Multiple legendary moments
    sort_order: 16,
  },
  {
    title: "Tactical Saboteur",
    description:
      "Successfully complete a secret mission assigned by another player.\n\nBonus: No one realises until revealed later.",
    base_points: 2,
    bonus_points: 3,
    category: "wildcard",
    is_repeatable: true, // Multiple secret missions
    sort_order: 17,
  },
];

async function seedChallenges(gameId: string) {
  console.log(
    `🌱 Seeding ${challenges.length} challenges for game: ${gameId}\n`,
  );

  const challengesWithGameId = challenges.map((challenge) => ({
    ...challenge,
    game_id: gameId,
    is_active: true,
    is_repeatable: challenge.is_repeatable ?? false, // Default to false if not specified
  }));

  const { data, error } = await supabase
    .from("challenges")
    .insert(challengesWithGameId)
    .select();

  if (error) {
    console.error("❌ Error seeding challenges:", error);
    process.exit(1);
  }

  console.log(`✅ Successfully seeded ${data.length} challenges!\n`);
  console.log("Categories:");
  console.log("  - Friday: 5 challenges");
  console.log("  - Saturday: 4 challenges");
  console.log("  - Public: 4 challenges");
  console.log("  - Drinking: 2 challenges");
  console.log("  - Wildcard: 2 challenges");
  console.log("\n🍺 Ready for the Brighton stag do!\n");
}

// Get game ID from command line
const gameId = process.argv[2];

if (!gameId) {
  console.error("❌ Please provide a game ID");
  console.error(
    "Usage: npx tsx scripts/seed-brighton-challenges.ts YOUR_GAME_ID",
  );
  process.exit(1);
}

seedChallenges(gameId);
