'use client';

import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Medal, Crown } from 'lucide-react';
import { useScoreboard, queryKeys } from '@/lib/queries';
import { useQueryClient } from '@tanstack/react-query';

interface ScoreboardProps {
  gameId: string;
  currentPlayerId: string;
}

export default function Scoreboard({ gameId, currentPlayerId }: ScoreboardProps) {
  const queryClient = useQueryClient();
  const { data: players = [], isLoading } = useScoreboard(gameId);

  useEffect(() => {
    // Subscribe to events changes for realtime scoreboard updates
    const channel = supabase
      .channel(`scoreboard-${gameId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'events', filter: `game_id=eq.${gameId}` },
        () => {
          // Invalidate scoreboard query to trigger refetch
          queryClient.invalidateQueries({ queryKey: queryKeys.scoreboard(gameId) });
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [gameId, queryClient]);

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
