'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Challenge, Event } from '@/lib/types';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';
import { Trophy, Award } from 'lucide-react';

interface ChallengesListProps {
  gameId: string;
  playerId: string;
}

export default function ChallengesList({ gameId, playerId }: ChallengesListProps) {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      // Fetch active challenges
      const { data: challengesData, error: challengesError } = await supabase
        .from('challenges')
        .select('*')
        .eq('game_id', gameId)
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (challengesError) throw challengesError;
      setChallenges(challengesData || []);

      // Fetch player's events
      const { data: eventsData, error: eventsError } = await supabase
        .from('events')
        .select('*')
        .eq('game_id', gameId)
        .eq('player_id', playerId);

      if (eventsError) throw eventsError;
      setEvents(eventsData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load challenges');
    } finally {
      setIsLoading(false);
    }
  }, [gameId, playerId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const hasClaimed = (challengeId: string, kind: 'base' | 'bonus') => {
    return events.some((e) => e.challenge_id === challengeId && e.kind === kind);
  };

  const handleClaim = async (challenge: Challenge, kind: 'base' | 'bonus') => {
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

      // Refetch to update UI
      fetchData();
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

  return (
    <div className="space-y-4">
      {challenges.map((challenge) => {
        const baseClaimed = hasClaimed(challenge.id, 'base');
        const bonusClaimed = hasClaimed(challenge.id, 'bonus');

        return (
          <div key={challenge.id} className="bg-white rounded-xl shadow-md p-6 border-2 border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-2">{challenge.title}</h3>
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
                disabled={baseClaimed}
                className={`flex-1 min-w-[140px] py-3 px-6 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                  baseClaimed
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95'
                }`}
              >
                <Trophy size={20} />
                {baseClaimed ? 'Claimed' : `Claim +${challenge.base_points}`}
              </button>

              {/* Bonus Points Button */}
              {challenge.bonus_points && (
                <button
                  onClick={() => handleClaim(challenge, 'bonus')}
                  disabled={bonusClaimed}
                  className={`flex-1 min-w-[140px] py-3 px-6 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                    bonusClaimed
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : 'bg-green-600 text-white hover:bg-green-700 active:scale-95'
                  }`}
                >
                  <Award size={20} />
                  {bonusClaimed ? 'Claimed' : `Bonus +${challenge.bonus_points}`}
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
