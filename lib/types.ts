// Database types for Supabase tables

export interface Game {
  id: string;
  name: string;
  status: string;
  created_at: string;
}

export interface Player {
  id: string;
  game_id: string;
  name: string;
  created_at: string;
}

export interface Challenge {
  id: string;
  game_id: string;
  title: string;
  description: string | null;
  base_points: number;
  bonus_points: number | null;
  category: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Event {
  id: string;
  game_id: string;
  player_id: string;
  challenge_id: string;
  kind: 'base' | 'bonus';
  points: number;
  created_by_player_id: string;
  created_at: string;
}

// Joined types for queries
export interface EventWithDetails extends Event {
  player?: Player;
  challenge?: Challenge;
  created_by?: Player;
}

export interface PlayerWithScore extends Player {
  total_points: number;
}
