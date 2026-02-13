'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';
import { Trophy, Award, Search } from 'lucide-react';
import { useChallenges, useEvents, queryKeys } from '@/lib/queries';
import { useQueryClient } from '@tanstack/react-query';

interface ChallengesListProps {
  gameId: string;
  playerId: string;
}

export default function ChallengesList({ gameId, playerId }: ChallengesListProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const queryClient = useQueryClient();

  const { data: challenges = [], isLoading: challengesLoading } = useChallenges(gameId, true);
  const { data: events = [], isLoading: eventsLoading } = useEvents(gameId, playerId);

  const isLoading = challengesLoading || eventsLoading;

  useEffect(() => {
    // Subscribe to events changes for realtime updates
    const channel = supabase
      .channel(`events-${gameId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'events', filter: `game_id=eq.${gameId}` },
        () => {
          // Invalidate queries to trigger refetch
          queryClient.invalidateQueries({ queryKey: queryKeys.events(gameId, playerId) });
          queryClient.invalidateQueries({ queryKey: queryKeys.scoreboard(gameId) });
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [gameId, playerId, queryClient]);

  const hasClaimed = (challengeId: string, kind: 'base' | 'bonus') => {
    return events.some((e) => e.challenge_id === challengeId && e.kind === kind);
  };

  const handleClaim = async (
    challenge: { id: string; base_points: number; bonus_points: number | null },
    kind: 'base' | 'bonus'
  ) => {
    const points = kind === 'base' ? challenge.base_points : challenge.bonus_points || 0;

    try {
      const { error } = await supabase.from('events').insert([
        {
          game_id: gameId,
          player_id: playerId,
          challenge_id: challenge.id,
          kind,
          points,
          created_by_player_id: playerId,
        },
      ]);

      if (error) {
        // Check for unique constraint violation
        if (error.code === '23505') {
          toast.error('Already claimed!');
        } else {
          throw error;
        }
        return;
      }

      // Success!
      toast.success(`+${points} points!`);

      // Trigger confetti for big points
      if (points >= 5) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      }

      // Invalidate queries to trigger refetch
      queryClient.invalidateQueries({ queryKey: queryKeys.events(gameId, playerId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.scoreboard(gameId) });
    } catch (error) {
      console.error('Error claiming points:', error);
      toast.error('Failed to claim points');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">Loading challenges...</div>
      </div>
    );
  }

  if (challenges.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-4">
          <Trophy size={64} className="mx-auto" />
        </div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">No Challenges Yet</h3>
        <p className="text-gray-500">The host will add challenges soon</p>
      </div>
    );
  }

  // Get unique categories
  const categories = ['all', ...Array.from(new Set(challenges.map(c => c.category).filter(Boolean)))];

  // Filter challenges by category and search
  const filteredChallenges = challenges.filter((challenge) => {
    const matchesCategory = selectedCategory === 'all' || challenge.category === selectedCategory;
    const matchesSearch = searchQuery === '' ||
      challenge.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      challenge.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Search challenges..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Category Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category || 'all')}
            className={`px-4 py-2 rounded-lg font-medium transition-all capitalize ${
              selectedCategory === category
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {category || 'uncategorized'}
          </button>
        ))}
      </div>

      {/* Filtered Challenges */}
      {filteredChallenges.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No challenges found matching your filters</p>
        </div>
      ) : (
        filteredChallenges.map((challenge) => {
        const baseClaimed = hasClaimed(challenge.id, 'base');
        const bonusClaimed = hasClaimed(challenge.id, 'bonus');

        return (
          <div key={challenge.id} className="bg-white rounded-xl shadow-md p-6 border-2 border-gray-100">
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-xl font-bold text-gray-900">{challenge.title}</h3>
              {challenge.is_repeatable && (
                <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">
                  REPEATABLE
                </span>
              )}
            </div>
            {challenge.description && (
              <p className="text-gray-600 mb-4">{challenge.description}</p>
            )}

            {challenge.category && (
              <div className="mb-4">
                <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                  {challenge.category}
                </span>
              </div>
            )}

            <div className="flex flex-wrap gap-3">
              {/* Base Points Button */}
              <button
                onClick={() => handleClaim(challenge, 'base')}
                disabled={baseClaimed && !challenge.is_repeatable}
                className={`flex-1 min-w-[140px] py-3 px-6 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                  baseClaimed && !challenge.is_repeatable
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95'
                }`}
              >
                <Trophy size={20} />
                {baseClaimed && !challenge.is_repeatable
                  ? 'Claimed'
                  : `Claim +${challenge.base_points}`}
              </button>

              {/* Bonus Points Button */}
              {challenge.bonus_points && (
                <button
                  onClick={() => handleClaim(challenge, 'bonus')}
                  disabled={bonusClaimed && !challenge.is_repeatable}
                  className={`flex-1 min-w-[140px] py-3 px-6 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                    bonusClaimed && !challenge.is_repeatable
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : 'bg-green-600 text-white hover:bg-green-700 active:scale-95'
                  }`}
                >
                  <Award size={20} />
                  {bonusClaimed && !challenge.is_repeatable
                    ? 'Claimed'
                    : `Bonus +${challenge.bonus_points}`}
                </button>
              )}
            </div>
          </div>
        );
      }))}
    </div>
  );
}
