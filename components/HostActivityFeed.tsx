'use client';

import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';
import { Clock, Trophy, Award, Undo2 } from 'lucide-react';
import { useEvents, useDeleteEvent, queryKeys } from '@/lib/queries';
import { useQueryClient } from '@tanstack/react-query';

interface HostActivityFeedProps {
  gameId: string;
}

export default function HostActivityFeed({ gameId }: HostActivityFeedProps) {
  const queryClient = useQueryClient();
  const { data: events = [], isLoading } = useEvents(gameId);
  const deleteEventMutation = useDeleteEvent(gameId);

  useEffect(() => {
    // Subscribe to events changes for realtime activity feed
    const channel = supabase
      .channel(`host-activity-${gameId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'events', filter: `game_id=eq.${gameId}` },
        () => {
          // Invalidate events query to trigger refetch
          queryClient.invalidateQueries({ queryKey: queryKeys.events(gameId) });
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [gameId, queryClient]);

  const handleUndo = async (eventId: string, playerName: string, challengeTitle: string) => {
    if (!confirm(`Undo ${playerName}'s claim for "${challengeTitle}"?`)) {
      return;
    }

    try {
      await deleteEventMutation.mutateAsync(eventId);
      toast.success('Claim undone');
    } catch (error) {
      console.error('Error undoing claim:', error);
      toast.error('Failed to undo claim');
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">Loading activity...</div>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-2">
          <Clock size={48} className="mx-auto" />
        </div>
        <p className="text-gray-500">No activity yet</p>
        <p className="text-sm text-gray-400 mt-1">Claims will appear here</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {events.map((event) => (
        <div
          key={event.id}
          className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
        >
          {/* Icon */}
          <div
            className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
              event.kind === 'base' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'
            }`}
          >
            {event.kind === 'base' ? <Trophy size={20} /> : <Award size={20} />}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-900">
              <span className="font-semibold">{event.player?.name || 'Unknown'}</span>
              {' claimed '}
              <span className="font-semibold">{event.kind === 'base' ? 'base' : 'bonus'}</span>
              {' for '}
              <span className="font-semibold">{event.challenge?.title || 'Unknown'}</span>
            </p>
            <p className="text-xs text-gray-500 mt-0.5">{formatTime(event.created_at)}</p>
          </div>

          {/* Points */}
          <div className="flex-shrink-0 flex items-center gap-3">
            <span
              className={`text-lg font-bold ${
                event.kind === 'base' ? 'text-blue-600' : 'text-green-600'
              }`}
            >
              +{event.points}
            </span>

            {/* Undo Button */}
            <button
              onClick={() =>
                handleUndo(
                  event.id,
                  event.player?.name || 'Unknown',
                  event.challenge?.title || 'Unknown'
                )
              }
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Undo this claim"
            >
              <Undo2 size={18} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
