import { supabase } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import { Toaster } from 'react-hot-toast';
import ShareLink from '@/components/ShareLink';
import PlayersManager from '@/components/PlayersManager';

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
      <Toaster position="top-center" />
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">{game.name}</h1>
          <p className="text-gray-600">Host Dashboard</p>
        </div>

        {/* Share Link */}
        <ShareLink gameId={gameId} />

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Players Section */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">Players</h2>
            <PlayersManager gameId={gameId} />
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
