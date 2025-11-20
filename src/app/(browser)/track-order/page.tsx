'use client';

import React, { useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import InputField from '@/components/ui/InputField';
import OrderStepper from '@/components/ui/OrderStepper';
import { parseStepData } from '../../../lib/helper';

export default function TrackOrder() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [order, setOrder] = useState<{
    id: string;
    code: string;
    email?: string;
    status: string;
    isRedeemed: boolean;
    pending?: string;
    processing?: string;
    completed?: string;
    updated_at?: string;
    loginInfo?: string;
  }>();

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
        .select('*')
        .eq('code', code.trim())
        .single();

      if (searchError || !data) {
        setError('Order not found. Please check your code and try again.');
        setLoading(false);
        return;
      }

      setOrder(data);
      setLoading(false);
    } catch (err) {
      setError('Failed to find order. Please try again.');
      console.error(err);
      setLoading(false);
    }
  };

  // Create steps array for OrderStepper
  const getStepsData = () => {
    if (!order) return [];

    return [
      parseStepData(order.pending!),
      parseStepData(order.processing!),
      parseStepData(order.completed!),
    ];
  };

  return (
    <div className="min-h-screen text-white">
      {/* Main Content */}
      <main className="bg-gray-800 max-w-4xl mx-auto px-4 py-6 mt-16">
        <Link
          href="/"
          className="flex items-center text-gray-400 hover:text-white mb-8 transition-colors"
        >
          <ChevronLeft size={20} />
          <span>Back</span>
        </Link>

        <h2 className="text-xl font-bold mb-4">Check Your Order Status</h2>

        {/* Search Form */}
        <form onSubmit={handleSubmit} className="flex items-center gap-3 mb-6">
          <InputField
            label="Enter Redemption Code"
            value={code}
            onChange={setCode}
            className="flex-1"
          />
          <button
            type="submit"
            disabled={loading}
            className={`bg-[#f2951d] hover:bg-orange-400 text-white text-sm font-medium px-6 py-3 rounded-md transition-colors ${loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
          >
            {loading ? 'Tracking...' : 'Track'}
          </button>
        </form>

        {/* Error Message */}
        {error && (
          <div className="bg-red-900/50 border border-red-500 text-white text-sm p-3 rounded-md mb-6">
            {error}
          </div>
        )}

        {/* Order Information */}
        {order && !error && (
          <div className="bg-gray-800 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-semibold mb-4">Order Information</h3>

            <div className="grid grid-cols-1 gap-3 mb-6">
              <div>
                <span className="text-gray-400 text-sm">Guide: </span>
                <span className="text-white text-sm">{order.loginInfo}</span>
              </div>
            </div>

            {/* Order Stepper */}
            <OrderStepper
              steps={getStepsData()}
              status={order.status}
              statusTimestamp={order.updated_at}
            />
          </div>
        )}
      </main>
    </div>
  );
}
