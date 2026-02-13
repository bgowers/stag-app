'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Game, Player } from '@/lib/types';
import PlayerPicker from '@/components/PlayerPicker';
import ChallengesList from '@/components/ChallengesList';
import Scoreboard from '@/components/Scoreboard';
import ActivityFeed from '@/components/ActivityFeed';
import { Toaster } from 'react-hot-toast';
import { LogOut, Trophy, Users, Activity } from 'lucide-react';

export default function PlayerPage() {
  const params = useParams();
  const gameId = params.gameId as string;

  const [game, setGame] = useState<Game | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentPlayerId, setCurrentPlayerId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'challenges' | 'scoreboard' | 'activity'>('challenges');

  const fetchGameData = useCallback(async () => {
    try {
      // Fetch game
      const { data: gameData, error: gameError } = await supabase
        .from('games')
        .select('*')
        .eq('id', gameId)
        .single();

      if (gameError) throw gameError;
      setGame(gameData);

      // Fetch players
      const { data: playersData, error: playersError } = await supabase
        .from('players')
        .select('*')
        .eq('game_id', gameId)
        .order('created_at', { ascending: true });

      if (playersError) throw playersError;
      setPlayers(playersData || []);
    } catch (error) {
      console.error('Error fetching game data:', error);
    }
  }, [gameId]);

  useEffect(() => {
    fetchGameData();
  }, [fetchGameData]);

  useEffect(() => {
    // Check localStorage for saved player
    const savedPlayerId = localStorage.getItem(`stagApp_playerId_${gameId}`);
    if (savedPlayerId) {
      setCurrentPlayerId(savedPlayerId);
    }
    setIsLoading(false);
  }, [gameId]);

  const handleSelectPlayer = (playerId: string) => {
    localStorage.setItem(`stagApp_playerId_${gameId}`, playerId);
    setCurrentPlayerId(playerId);
  };

  const handleChangePlayer = () => {
    if (confirm('Switch to a different player? Your current selection will be changed.')) {
      localStorage.removeItem(`stagApp_playerId_${gameId}`);
      setCurrentPlayerId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-gray-600 text-lg">Loading...</div>
      </div>
    );
  }

  // Show player picker if no player selected
  if (!currentPlayerId) {
    return <PlayerPicker players={players} onSelectPlayer={handleSelectPlayer} />;
  }

  // Find current player
  const currentPlayer = players.find((p) => p.id === currentPlayerId);

  if (!currentPlayer) {
    // Player was deleted, clear selection
    localStorage.removeItem(`stagApp_playerId_${gameId}`);
    setCurrentPlayerId(null);
    return null;
  }

  const tabs = [
    { id: 'challenges' as const, label: 'Challenges', icon: Trophy },
    { id: 'scoreboard' as const, label: 'Scores', icon: Users },
    { id: 'activity' as const, label: 'Activity', icon: Activity },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50 to-teal-100 p-4 md:p-8">
      <Toaster position="top-center" />

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-1">
              {game?.name}
            </h1>
            <p className="text-gray-600">
              Playing as <span className="font-semibold text-gray-900">{currentPlayer.name}</span>
            </p>
          </div>
          <button
            onClick={handleChangePlayer}
            className="p-2 text-gray-600 hover:bg-white hover:text-gray-900 rounded-lg transition-colors"
            title="Change player"
          >
            <LogOut size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-t-2xl shadow-lg border-b border-gray-200">
          <div className="flex">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-2 py-4 px-4 font-semibold transition-colors ${
                    activeTab === tab.id
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon size={20} />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-b-2xl shadow-xl p-6">
          {activeTab === 'challenges' && (
            <ChallengesList gameId={gameId} playerId={currentPlayerId} />
          )}
          {activeTab === 'scoreboard' && (
            <Scoreboard gameId={gameId} currentPlayerId={currentPlayerId} />
          )}
          {activeTab === 'activity' && <ActivityFeed gameId={gameId} />}
        </div>
      </div>
    </main>
  );
}
