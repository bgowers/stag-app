import { supabase } from '@/lib/supabase';
import { notFound } from 'next/navigation';

interface HostPageProps {
  params: Promise<{ gameId: string }>;
}

export default async function HostPage({ params }: HostPageProps) {
  const { gameId } = await params;

  // Fetch game details
  const { data: game, error } = await supabase
    .from('games')
    .select('*')
    .eq('id', gameId)
    .single();

  if (error || !game) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">{game.name}</h1>
          <p className="text-gray-600">Host Dashboard</p>
        </div>

        {/* Share Link */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h2 className="text-lg font-semibold mb-2">Share with Players</h2>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={`${typeof window !== 'undefined' ? window.location.origin : ''}/g/${gameId}`}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm"
            />
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
              onClick={() => {
                navigator.clipboard.writeText(`${window.location.origin}/g/${gameId}`);
              }}
            >
              Copy
            </button>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Players Section */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">Players</h2>
            <p className="text-gray-500">Player management coming soon...</p>
          </div>

          {/* Challenges Section */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">Challenges</h2>
            <p className="text-gray-500">Challenge management coming soon...</p>
          </div>
        </div>

        {/* Activity Feed */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mt-6">
          <h2 className="text-2xl font-semibold mb-4">Recent Activity</h2>
          <p className="text-gray-500">Activity feed coming soon...</p>
        </div>
      </div>
    </main>
  );
}
