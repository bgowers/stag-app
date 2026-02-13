'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import toast, { Toaster } from 'react-hot-toast';

export default function CreateGameForm() {
  const [gameName, setGameName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!gameName.trim()) {
      toast.error('Please enter a game name');
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase
        .from('games')
        .insert([{ name: gameName.trim(), status: 'active' }])
        .select()
        .single();

      if (error) throw error;

      toast.success('Game created!');
      router.push(`/g/${data.id}/host`);
    } catch (error) {
      console.error('Error creating game:', error);
      toast.error('Failed to create game. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <>
      <Toaster position="top-center" />
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="gameName" className="block text-sm font-medium text-gray-700 mb-2">
            Game Name
          </label>
          <input
            type="text"
            id="gameName"
            value={gameName}
            onChange={(e) => setGameName(e.target.value)}
            placeholder="e.g., Dave's Stag Do 2026"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isLoading}
          />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? 'Creating...' : 'Create Game'}
        </button>
      </form>
    </>
  );
}
