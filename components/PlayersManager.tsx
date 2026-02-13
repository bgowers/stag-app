'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Player } from '@/lib/types';
import toast from 'react-hot-toast';
import { UserPlus, Trash2 } from 'lucide-react';

interface PlayersManagerProps {
  gameId: string;
}

export default function PlayersManager({ gameId }: PlayersManagerProps) {
  const [players, setPlayers] = useState<Player[]>([]);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);

  const fetchPlayers = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('players')
        .select('*')
        .eq('game_id', gameId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setPlayers(data || []);
    } catch (error) {
      console.error('Error fetching players:', error);
      toast.error('Failed to load players');
    } finally {
      setIsLoading(false);
    }
  }, [gameId]);

  useEffect(() => {
    fetchPlayers();
  }, [fetchPlayers]);

  const handleAddPlayer = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newPlayerName.trim()) {
      toast.error('Please enter a player name');
      return;
    }

    setIsAdding(true);

    try {
      const { data, error } = await supabase
        .from('players')
        .insert([{ game_id: gameId, name: newPlayerName.trim() }])
        .select()
        .single();

      if (error) {
        // Check for unique constraint violation
        if (error.code === '23505') {
          toast.error('A player with this name already exists');
        } else {
          throw error;
        }
        return;
      }

      setPlayers([...players, data]);
      setNewPlayerName('');
      toast.success(`${data.name} added!`);
    } catch (error) {
      console.error('Error adding player:', error);
      toast.error('Failed to add player');
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemovePlayer = async (playerId: string, playerName: string) => {
    if (!confirm(`Remove ${playerName} from the game?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('players')
        .delete()
        .eq('id', playerId);

      if (error) throw error;

      setPlayers(players.filter((p) => p.id !== playerId));
      toast.success(`${playerName} removed`);
    } catch (error) {
      console.error('Error removing player:', error);
      toast.error('Failed to remove player');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-gray-500">Loading players...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Add Player Form */}
      <form onSubmit={handleAddPlayer} className="flex gap-2">
        <input
          type="text"
          value={newPlayerName}
          onChange={(e) => setNewPlayerName(e.target.value)}
          placeholder="Enter player name"
          className="flex-1 min-w-0 px-4 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          disabled={isAdding}
        />
        <button
          type="submit"
          disabled={isAdding}
          className="flex-shrink-0 px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 disabled:bg-purple-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2 whitespace-nowrap"
        >
          <UserPlus size={18} />
          <span className="hidden sm:inline">{isAdding ? 'Adding...' : 'Add'}</span>
        </button>
      </form>

      {/* Players List */}
      {players.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No players yet</p>
          <p className="text-sm mt-2">Add players to get started</p>
        </div>
      ) : (
        <div className="space-y-2">
          {players.map((player) => (
            <div
              key={player.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <span className="font-medium text-gray-900">{player.name}</span>
              <button
                onClick={() => handleRemovePlayer(player.id, player.name)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title={`Remove ${player.name}`}
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="text-sm text-gray-500 mt-2">
        {players.length} {players.length === 1 ? 'player' : 'players'}
      </div>
    </div>
  );
}
