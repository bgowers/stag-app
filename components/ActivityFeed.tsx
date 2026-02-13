'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { EventWithDetails } from '@/lib/types';
import { Clock, Trophy, Award } from 'lucide-react';

interface ActivityFeedProps {
  gameId: string;
}

export default function ActivityFeed({ gameId }: ActivityFeedProps) {
  const [events, setEvents] = useState<EventWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchEvents = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          player:players!events_player_id_fkey(id, name),
          challenge:challenges(id, title)
        `)
        .eq('game_id', gameId)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Error fetching activity:', error);
    } finally {
      setIsLoading(false);
    }
  }, [gameId]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

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

  return (
    <div className="space-y-2">
      {events.map((event) => (
        <div
          key={event.id}
          className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200"
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
          <div className="flex-shrink-0">
            <span
              className={`text-lg font-bold ${
                event.kind === 'base' ? 'text-blue-600' : 'text-green-600'
              }`}
            >
              +{event.points}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
