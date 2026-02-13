'use client';

import { useState } from 'react';
import { Player } from '@/lib/types';
import { supabase } from '@/lib/supabase';
import { Users } from 'lucide-react';
import toast from 'react-hot-toast';

interface PlayerPickerProps {
  gameId: string;
  players: Player[];
  onSelectPlayer: (playerId: string) => void;
}

export default function PlayerPicker({ gameId, players, onSelectPlayer }: PlayerPickerProps) {
  const [customName, setCustomName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleCustomName = async (e: React.FormEvent) => {
    e.preventDefault();

    const name = customName.trim();
    if (!name) {
      toast.error('Please enter your name');
      return;
    }

    // Check if player with this name already exists
    const existingPlayer = players.find((p) => p.name.toLowerCase() === name.toLowerCase());
    if (existingPlayer) {
      onSelectPlayer(existingPlayer.id);
      return;
    }

    // Create new player
    setIsCreating(true);
    try {
      const { data, error } = await supabase
        .from('players')
        .insert([{ game_id: gameId, name }])
        .select()
        .single();

      if (error) {
        // Handle duplicate name error
        if (error.code === '23505') {
          toast.error('Name already taken!');
        } else {
          throw error;
        }
        return;
      }

      toast.success(`Welcome, ${name}!`);
      onSelectPlayer(data.id);
    } catch (error) {
      console.error('Error creating player:', error);
      toast.error('Failed to join game');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        <div className="text-center mb-6">
          <div className="text-blue-600 mb-4">
            <Users size={64} className="mx-auto" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Who are you?</h2>
          <p className="text-gray-600">Enter your name to get started</p>
        </div>

        {/* Custom Name Input */}
        <form onSubmit={handleCustomName} className="mb-6">
          <div className="space-y-3">
            <input
              type="text"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder="Enter your name"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              disabled={isCreating}
              autoFocus
            />
            <button
              type="submit"
              disabled={isCreating}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors"
            >
              {isCreating ? 'Joining...' : 'Join Game'}
            </button>
          </div>
        </form>

        {/* Existing Players */}
        {players.length > 0 && (
          <>
            <div className="relative mb-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-white text-gray-500">Or select existing player</span>
              </div>
            </div>

            <div className="space-y-2">
              {players.map((player) => (
                <button
                  key={player.id}
                  onClick={() => onSelectPlayer(player.id)}
                  className="w-full p-3 text-left border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all font-medium text-gray-900 hover:text-blue-700"
                >
                  {player.name}
                </button>
              ))}
            </div>
          </>
        )}

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>This device will be signed in as your player</p>
        </div>
      </div>
    </div>
  );
}
