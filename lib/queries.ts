import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from './supabase';
import { Game, Player, Challenge, Event, PlayerWithScore, EventWithDetails } from './types';

// Query Keys
export const queryKeys = {
  game: (gameId: string) => ['game', gameId],
  players: (gameId: string) => ['players', gameId],
  challenges: (gameId: string, activeOnly?: boolean) =>
    activeOnly ? ['challenges', gameId, 'active'] : ['challenges', gameId],
  events: (gameId: string, playerId?: string) =>
    playerId ? ['events', gameId, playerId] : ['events', gameId],
  scoreboard: (gameId: string) => ['scoreboard', gameId],
};

// Game Query
export function useGame(gameId: string) {
  return useQuery({
    queryKey: queryKeys.game(gameId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('games')
        .select('*')
        .eq('id', gameId)
        .single();

      if (error) throw error;
      return data as Game;
    },
  });
}

// Players Query
export function usePlayers(gameId: string) {
  return useQuery({
    queryKey: queryKeys.players(gameId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('players')
        .select('*')
        .eq('game_id', gameId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as Player[];
    },
  });
}

// Challenges Query
export function useChallenges(gameId: string, activeOnly = false) {
  return useQuery({
    queryKey: queryKeys.challenges(gameId, activeOnly),
    queryFn: async () => {
      let query = supabase
        .from('challenges')
        .select('*')
        .eq('game_id', gameId)
        .order('sort_order', { ascending: true });

      if (activeOnly) {
        query = query.eq('is_active', true);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as Challenge[];
    },
  });
}

// Events Query
export function useEvents(gameId: string, playerId?: string) {
  return useQuery({
    queryKey: queryKeys.events(gameId, playerId),
    queryFn: async () => {
      let query = supabase
        .from('events')
        .select(`
          *,
          player:players!events_player_id_fkey(id, name),
          challenge:challenges(id, title),
          created_by:players!events_created_by_player_id_fkey(id, name)
        `)
        .eq('game_id', gameId)
        .order('created_at', { ascending: false });

      if (playerId) {
        query = query.eq('player_id', playerId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as EventWithDetails[];
    },
  });
}

// Scoreboard Query (players with total points)
export function useScoreboard(gameId: string) {
  return useQuery({
    queryKey: queryKeys.scoreboard(gameId),
    queryFn: async () => {
      // Fetch players
      const { data: players, error: playersError } = await supabase
        .from('players')
        .select('*')
        .eq('game_id', gameId)
        .order('created_at', { ascending: true });

      if (playersError) throw playersError;

      // Fetch all events for this game
      const { data: events, error: eventsError } = await supabase
        .from('events')
        .select('player_id, points')
        .eq('game_id', gameId);

      if (eventsError) throw eventsError;

      // Calculate total points for each player
      const playerScores = players.map((player) => {
        const playerEvents = events.filter((e) => e.player_id === player.id);
        const total_points = playerEvents.reduce((sum, e) => sum + e.points, 0);
        return { ...player, total_points };
      });

      // Sort by points descending
      playerScores.sort((a, b) => b.total_points - a.total_points);

      return playerScores as PlayerWithScore[];
    },
  });
}

// Mutation Hooks
export function useAddPlayer(gameId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (name: string) => {
      const { data, error } = await supabase
        .from('players')
        .insert([{ game_id: gameId, name: name.trim() }])
        .select()
        .single();

      if (error) throw error;
      return data as Player;
    },
    onSuccess: async () => {
      // Wait for queries to refetch before resolving
      await queryClient.invalidateQueries({ queryKey: queryKeys.players(gameId) });
      await queryClient.invalidateQueries({ queryKey: queryKeys.scoreboard(gameId) });
    },
  });
}

export function useRemovePlayer(gameId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (playerId: string) => {
      const { error } = await supabase
        .from('players')
        .delete()
        .eq('id', playerId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.players(gameId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.scoreboard(gameId) });
    },
  });
}

export function useDeleteEvent(gameId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (eventId: string) => {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.events(gameId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.scoreboard(gameId) });
    },
  });
}

// Challenge Mutations
export function useAddChallenge(gameId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (challenge: {
      title: string;
      description: string | null;
      base_points: number;
      bonus_points: number | null;
      category: string | null;
      is_active: boolean;
      is_repeatable: boolean;
      sort_order: number;
    }) => {
      const { error } = await supabase.from('challenges').insert([
        {
          game_id: gameId,
          ...challenge,
        },
      ]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.challenges(gameId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.challenges(gameId, true) });
    },
  });
}

export function useUpdateChallenge(gameId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: {
      id: string;
      title: string;
      description: string | null;
      base_points: number;
      bonus_points: number | null;
      category: string | null;
      is_active: boolean;
      is_repeatable: boolean;
    }) => {
      const { error } = await supabase
        .from('challenges')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.challenges(gameId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.challenges(gameId, true) });
    },
  });
}

export function useDeleteChallenge(gameId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (challengeId: string) => {
      const { error } = await supabase
        .from('challenges')
        .delete()
        .eq('id', challengeId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.challenges(gameId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.challenges(gameId, true) });
    },
  });
}

export function useToggleChallengeActive(gameId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const { error } = await supabase
        .from('challenges')
        .update({ is_active: isActive })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.challenges(gameId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.challenges(gameId, true) });
    },
  });
}
