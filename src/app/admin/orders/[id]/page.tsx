'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Save } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import { supabase } from '@/lib/supabase';
import { Order } from '../../../../types';

export default function EditOrder() {
  const params = useParams();
  const router = useRouter();
  const idParam = params && 'id' in params ? params.id : undefined;
  const id = Array.isArray(idParam) ? idParam[0] : idParam;

  const { updateOrderStatus } = useAppContext();

  const [loginInfo, setLoginInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [order, setOrder] = useState<Order>();
  const [isLoading, setIsLoading] = useState(true);

  // Fetch order from Supabase
  useEffect(() => {
    const fetchOrder = async () => {
      setIsLoading(true);

      // Check authentication
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session) {
        console.error('Session error:', sessionError);
        router.push('/admin/login');
        return;
      }

      // Load order from Supabase
      const { data: orderData, error: orderError } = await supabase
        .from('cheap-play-zone')
        .select('*')
        .eq('id', id)
        .single();

      if (orderError) {
        console.error('Error loading order:', orderError);
        setIsLoading(false);
        return;
      }

      if (orderData) {
        setOrder(orderData);
        if (orderData.loginInfo) {
          setLoginInfo(orderData.loginInfo);
        }
      }

      setIsLoading(false);
    };

    fetchOrder();
  }, [id, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!loginInfo.trim()) {
      setError('Login information is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Update the order in Supabase
      if (!order) {
        throw new Error('Order not found');
      }

      const { error: updateError } = await supabase
        .from('cheap-play-zone')
        .update({
          loginInfo: loginInfo, // Enable loginInfo update
          status: 'processing',
          updated_at: new Date().toISOString(),
        })
        .eq('id', order.id);

      if (updateError) {
        throw updateError;
      }

      // Send email to user with loginInfo if email exists
      if (order.email) {
        try {
          await fetch('/api/send-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              to: order.email,
              subject: 'Your Game Login Information',
              text: loginInfo,
              orderId: order.id,
            }),
          });
        } catch (emailErr) {
          // Optionally log or show error, but don't block order completion
          console.error('Failed to send email:', emailErr);
        }
      }

      // Also update in local state for backwards compatibility
      if (updateOrderStatus) {
        updateOrderStatus(order.code, 'completed', loginInfo);
      }

      // Return to dashboard
      router.back();
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Please try again.';
      setError('Failed to update order: ' + errorMessage);
      console.error(err);
      setLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-gray-800 p-8 rounded-lg shadow-lg max-w-md w-full text-center">
          <h1 className="text-2xl font-bold mb-4 text-white">
            Order Not Found
          </h1>
          <p className="text-gray-400 mb-6">
            The order you&apos;re looking for could not be found.
          </p>
          <Link
            href="/admin/dashboard"
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded transition-colors inline-block"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <Link
        href="/admin/dashboard"
        className="flex items-center text-gray-400 hover:text-white mb-8 transition-colors"
      >
        <ChevronLeft size={20} />
        <span>Back to Dashboard</span>
      </Link>

      <div className="max-w-2xl mx-auto bg-gray-800 p-8 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold mb-6">Add Login Information</h1>

        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400">Redemption Code:</span>
            <span className="font-medium">{order.code}</span>
          </div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400">Order ID:</span>
            <span className="font-medium">{order.id || '-'}</span>
          </div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400">Email:</span>
            <span className="font-medium">{order.email || '-'}</span>
          </div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400">Name:</span>
            <span className="font-medium">{order.name || '-'}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Created:</span>
            <span className="font-medium">
              {new Date(order.created_at!).toLocaleString()}
            </span>
          </div>
        </div>

        {error && (
          <div className="bg-red-900/50 border border-red-500 text-white p-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-gray-400 mb-2">
              Login Information
            </label>
            <textarea
              value={loginInfo}
              onChange={(e) => setLoginInfo(e.target.value)}
              placeholder="Enter login details, instructions, or any information to provide to the customer..."
              className="w-full bg-gray-700 border border-gray-600 rounded p-3 text-white h-40"
            ></textarea>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className={`bg-green-600 text-white font-bold py-3 px-6 rounded flex items-center gap-2 transition-colors ${
                loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-green-700'
              }`}
            >
              <Save size={18} />
              {loading ? 'Saving...' : 'Save and Mark as Completed'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
