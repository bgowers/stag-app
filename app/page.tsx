import CreateGameForm from '@/components/CreateGameForm';

export default function Home() {
  return (
    <main className="min-h-screen p-8 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-gray-900 mb-2">🍺 Stag Points</h1>
          <p className="text-gray-600 text-lg">Track your stag do challenges and compete for glory</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800">Create a New Game</h2>
          <CreateGameForm />
        </div>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Once created, you&apos;ll get a link to share with your group</p>
        </div>
      </div>
    </main>
  );
}
