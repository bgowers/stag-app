'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { PlayerWithScore } from '@/lib/types';
import { Medal, Crown } from 'lucide-react';

interface ScoreboardProps {
  gameId: string;
  currentPlayerId: string;
}

export default function Scoreboard({ gameId, currentPlayerId }: ScoreboardProps) {
  const [players, setPlayers] = useState<PlayerWithScore[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchScoreboard = useCallback(async () => {
    try {
      // Fetch all players with their total points
      const { data: playersData, error: playersError } = await supabase
        .from('players')
        .select('*')
        .eq('game_id', gameId);

      if (playersError) throw playersError;

      // Fetch all events for this game
      const { data: eventsData, error: eventsError } = await supabase
        .from('events')
        .select('player_id, points')
        .eq('game_id', gameId);

      if (eventsError) throw eventsError;

      // Calculate totals
      const totals: Record<string, number> = {};
      eventsData?.forEach((event) => {
        totals[event.player_id] = (totals[event.player_id] || 0) + event.points;
      });

      // Combine and sort
      const playersWithScores: PlayerWithScore[] = (playersData || []).map((player) => ({
        ...player,
        total_points: totals[player.id] || 0,
      }));

      playersWithScores.sort((a, b) => b.total_points - a.total_points);

      setPlayers(playersWithScores);
    } catch (error) {
      console.error('Error fetching scoreboard:', error);
    } finally {
      setIsLoading(false);
    }
  }, [gameId]);

  useEffect(() => {
    fetchScoreboard();

    // Subscribe to events changes for realtime scoreboard updates
    const channel = supabase
      .channel(`scoreboard-${gameId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'events', filter: `game_id=eq.${gameId}` },
        () => {
          fetchScoreboard(); // Refetch when events change
        }
      )
      .subscribe();

    return () => {
      // Use unsubscribe() instead of removeChannel() for React Strict Mode compatibility
      channel.unsubscribe();
    };
  }, [fetchScoreboard, gameId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">Loading scoreboard...</div>
      </div>
    );
  }

  if (players.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No players yet</p>
      </div>
    );
  }

  const getMedalIcon = (rank: number) => {
    if (rank === 0) return <Crown size={24} className="text-yellow-500" />;
    if (rank === 1) return <Medal size={24} className="text-gray-400" />;
    if (rank === 2) return <Medal size={24} className="text-orange-600" />;
    return null;
  };

  return (
    <div className="space-y-3">
      {players.map((player, index) => {
        const isCurrentPlayer = player.id === currentPlayerId;
        const rank = index + 1;

        return (
          <div
            key={player.id}
            className={`flex items-center gap-4 p-4 rounded-lg transition-all ${
              isCurrentPlayer
                ? 'bg-blue-100 border-2 border-blue-500 shadow-md'
                : 'bg-white border-2 border-gray-100'
            }`}
          >
            {/* Rank */}
            <div className="flex-shrink-0 w-12 text-center">
              {getMedalIcon(index) || (
                <span className="text-2xl font-bold text-gray-400">#{rank}</span>
              )}
            </div>

            {/* Player Name */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3
                  className={`text-lg font-bold truncate ${
                    isCurrentPlayer ? 'text-blue-900' : 'text-gray-900'
                  }`}
                >
                  {player.name}
                </h3>
                {isCurrentPlayer && (
                  <span className="px-2 py-1 bg-blue-600 text-white text-xs font-semibold rounded">
                    YOU
                  </span>
                )}
              </div>
            </div>

            {/* Points */}
            <div className="flex-shrink-0">
              <div
                className={`text-2xl font-bold ${
                  isCurrentPlayer ? 'text-blue-900' : 'text-gray-900'
                }`}
              >
                {player.total_points}
                <span className="text-sm font-normal text-gray-500 ml-1">pts</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
