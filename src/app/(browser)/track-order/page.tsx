'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Search } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function TrackOrder() {
  const router = useRouter();

  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!code.trim()) {
      setError('Please enter a redemption code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Check if the code exists in Supabase
      const { data, error: searchError } = await supabase
        .from('cheap-play-zone')
        .select('code')
        .eq('code', code.trim())
        .single();

      if (searchError || !data) {
        setError('Order not found. Please check your code and try again.');
        setLoading(false);
        return;
      }

      // Redirect to order details page
      router.push(`/track-order/${code}`);
    } catch (err) {
      setError('Failed to find order. Please try again.');
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Link
        href="/"
        className="flex items-center text-gray-400 hover:text-white mb-8 transition-colors"
      >
        <ChevronLeft size={20} />
        <span>Back</span>
      </Link>

      <div className="max-w-md mx-auto bg-gray-900 p-8 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold mb-6 text-center">
          Track Your Order
        </h1>

        {error && (
          <div className="bg-red-900/50 border border-red-500 text-white p-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-gray-400 mb-2">
              ENTER YOUR REDEMPTION CODE
            </label>
            <div className="relative">
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Enter your redemption code..."
                className="w-full bg-gray-800 border border-gray-700 rounded p-3 pl-10 text-white"
              />
              <Search
                size={18}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-blue-500 text-white font-bold py-3 px-4 rounded transition-colors ${
              loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-600'
            }`}
          >
            {loading ? 'Searching...' : 'Track Order'}
          </button>
        </form>
      </div>
    </div>
  );
}
