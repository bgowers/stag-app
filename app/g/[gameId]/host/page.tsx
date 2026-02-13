import HostActivityFeed from "@/components/HostActivityFeed";
import HostSections from "@/components/HostSections";
import ShareLink from "@/components/ShareLink";
import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import { Toaster } from "react-hot-toast";

interface HostPageProps {
  params: Promise<{ gameId: string }>;
}

export default async function HostPage({ params }: HostPageProps) {
  const { gameId } = await params;

  // Fetch game details
  const { data: game, error } = await supabase
    .from("games")
    .select("*")
    .eq("id", gameId)
    .single();

  if (error || !game) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-8 text-gray-900">
      <Toaster position="top-center" />
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">{game.name}</h1>
          <p className="text-gray-600">Host Dashboard</p>
        </div>

        {/* Share Link */}
        <ShareLink gameId={gameId} />

        {/* Players and Challenges */}
        <HostSections gameId={gameId} />

        {/* Activity Feed */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mt-6">
          <h2 className="text-2xl font-semibold mb-4">Recent Activity</h2>
          <HostActivityFeed gameId={gameId} />
        </div>
      </div>
    </main>
  );
}
