'use client';

import { Player } from '@/lib/types';
import { Users } from 'lucide-react';

interface PlayerPickerProps {
  players: Player[];
  onSelectPlayer: (playerId: string) => void;
}

export default function PlayerPicker({ players, onSelectPlayer }: PlayerPickerProps) {
  if (players.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="text-gray-400 mb-4">
            <Users size={64} className="mx-auto" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Players Yet</h2>
          <p className="text-gray-600 mb-4">
            The host needs to add players before you can join the game.
          </p>
          <p className="text-sm text-gray-500">
            Ask the host to add players from the host dashboard.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        <div className="text-center mb-6">
          <div className="text-blue-600 mb-4">
            <Users size={64} className="mx-auto" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Who are you?</h2>
          <p className="text-gray-600">Select your player to get started</p>
        </div>

        <div className="space-y-2">
          {players.map((player) => (
            <button
              key={player.id}
              onClick={() => onSelectPlayer(player.id)}
              className="w-full p-4 text-left border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all font-semibold text-gray-900 hover:text-blue-700"
            >
              {player.name}
            </button>
          ))}
        </div>

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>This device will be signed in as the selected player</p>
        </div>
      </div>
    </div>
  );
}
