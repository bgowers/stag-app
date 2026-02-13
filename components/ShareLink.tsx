'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { Copy, Check } from 'lucide-react';

interface ShareLinkProps {
  gameId: string;
}

export default function ShareLink({ gameId }: ShareLinkProps) {
  const [copied, setCopied] = useState(false);
  const url = typeof window !== 'undefined' ? `${window.location.origin}/g/${gameId}` : '';

  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success('Link copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
      <h2 className="text-lg font-semibold mb-2">Share with Players</h2>
      <div className="flex items-center gap-2">
        <input
          type="text"
          readOnly
          value={url}
          className="flex-1 min-w-0 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 text-sm truncate"
        />
        <button
          onClick={handleCopy}
          className="flex-shrink-0 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2 whitespace-nowrap"
        >
          {copied ? <Check size={18} /> : <Copy size={18} />}
          <span className="hidden sm:inline">{copied ? 'Copied!' : 'Copy'}</span>
        </button>
      </div>
    </div>
  );
}
