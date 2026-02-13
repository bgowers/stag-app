'use client';

import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import PlayersManager from './PlayersManager';
import ChallengesManager from './ChallengesManager';

interface HostSectionsProps {
  gameId: string;
}

export default function HostSections({ gameId }: HostSectionsProps) {
  const [challengesCollapsed, setChallengesCollapsed] = useState(false);

  // Load collapsed state from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('hostChallengesCollapsed');
    if (saved !== null) {
      setChallengesCollapsed(saved === 'true');
    }
  }, []);

  // Save collapsed state to localStorage
  const toggleChallenges = () => {
    const newState = !challengesCollapsed;
    setChallengesCollapsed(newState);
    localStorage.setItem('hostChallengesCollapsed', String(newState));
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Players Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-2xl font-semibold mb-4">Players</h2>
        <PlayersManager gameId={gameId} />
      </div>

      {/* Challenges Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold">Challenges</h2>
          <button
            onClick={toggleChallenges}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title={challengesCollapsed ? 'Expand' : 'Collapse'}
          >
            {challengesCollapsed ? <ChevronDown size={24} /> : <ChevronUp size={24} />}
          </button>
        </div>
        {!challengesCollapsed && <ChallengesManager gameId={gameId} />}
      </div>
    </div>
  );
}
