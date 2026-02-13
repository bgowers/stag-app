'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { UserPlus, Trash2 } from 'lucide-react';
import { usePlayers, useAddPlayer, useRemovePlayer } from '@/lib/queries';

interface PlayersManagerProps {
  gameId: string;
}

export default function PlayersManager({ gameId }: PlayersManagerProps) {
  const [newPlayerName, setNewPlayerName] = useState('');

  const { data: players = [], isLoading } = usePlayers(gameId);
  const addPlayerMutation = useAddPlayer(gameId);
  const removePlayerMutation = useRemovePlayer(gameId);

  const handleAddPlayer = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newPlayerName.trim()) {
      toast.error('Please enter a player name');
      return;
    }

    try {
      await addPlayerMutation.mutateAsync(newPlayerName);
      setNewPlayerName('');
      toast.success('Player added!');
    } catch (error: any) {
      // Check for unique constraint violation
      if (error.code === '23505') {
        toast.error('A player with this name already exists');
      } else {
        console.error('Error adding player:', error);
        toast.error('Failed to add player');
      }
    }
  };

  const handleRemovePlayer = async (playerId: string, playerName: string) => {
    if (!confirm(`Remove ${playerName} from the game?`)) {
      return;
    }

    try {
      await removePlayerMutation.mutateAsync(playerId);
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
          disabled={addPlayerMutation.isPending}
        />
        <button
          type="submit"
          disabled={addPlayerMutation.isPending}
          className="flex-shrink-0 px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 disabled:bg-purple-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2 whitespace-nowrap"
        >
          <UserPlus size={18} />
          <span className="hidden sm:inline">
            {addPlayerMutation.isPending ? 'Adding...' : 'Add'}
          </span>
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
