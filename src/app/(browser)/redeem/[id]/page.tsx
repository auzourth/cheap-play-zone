'use client';

import React, { useState, useEffect, useLayoutEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

// Notification component
const Notification = ({
  message,
  type,
  onClose,
}: {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`fixed top-4 right-4 flex items-center p-4 rounded-lg shadow-lg transition-all transform duration-500 z-50 ${
        type === 'success'
          ? 'bg-green-900/80 border border-green-500'
          : 'bg-red-900/80 border border-red-500'
      }`}
    >
      {type === 'success' ? (
        <CheckCircle size={20} className="text-green-400 mr-2" />
      ) : (
        <XCircle size={20} className="text-red-400 mr-2" />
      )}
      <span className="text-white">{message}</span>
      <button onClick={onClose} className="ml-4 text-gray-300 hover:text-white">
        &times;
      </button>
    </div>
  );
};

export default function Redeem() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [orderId, setOrderId] = useState('');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [codeExists, setCodeExists] = useState(true);
  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);

  // Helper function to show notifications
  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
  };

  // Helper function to clear notifications
  const clearNotification = () => {
    setNotification(null);
  };

  useLayoutEffect(() => {
    // fetch order from Supabase
    const fetchOrder = async () => {
      const { data: ordersData } = await supabase
        .from('cheap-play-zone')
        .select('*')
        .eq('code', code)
        .single();
      if (ordersData) {
        setOrderId(ordersData.id);
        setEmail(ordersData.email);
      }
    };
    fetchOrder();
  }, [code]);

  // Get code from URL params if present
  useEffect(() => {
    // From path params - params.id is the code from the URL path
    if (params?.id) {
      setCode(params.id as string);
      checkCodeExists(params.id as string);
    }

    // From query params (fallback)
    const codeParam = searchParams?.get('code');
    if (codeParam && !params?.id) {
      setCode(codeParam);
      checkCodeExists(codeParam);
    }
  }, [params, searchParams]);

  // Check if the code exists in Supabase
  const checkCodeExists = async (codeToCheck: string) => {
    try {
      const { data, error } = await supabase
        .from('cheap-play-zone')
        .select('id, status')
        .eq('code', codeToCheck)
        .single();

      if (error) {
        console.error('Error checking code:', error);
        setCodeExists(false);
        return;
      }

      // If the code has already been redeemed (not pending), show error
      if (data && data.status === 'delivered') {
        setError('This code has already been redeemed. check track order page');
        return;
      }

      setCodeExists(!!data);
    } catch (err) {
      console.error('Exception when checking code:', err);
      setCodeExists(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!orderId || !email || !code) {
      setError('All fields are required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Check if code exists in Supabase
      const { data: existingOrder, error: checkError } = await supabase
        .from('cheap-play-zone')
        .select('*')
        .eq('code', code)
        .single();

      console.log('Existing order:', existingOrder);

      if (checkError && checkError.code !== 'PGRST116') {
        // PGRST116 = not found
        throw new Error('Failed to check code. Please try again.');
      }

      if (!existingOrder) {
        setError('Invalid redemption code. Please check and try again.');
        setLoading(false);
        return;
      }

      if (existingOrder.status === 'delivered') {
        setError('This code has already been redeemed. check track order page');
        setLoading(false);
        return;
      }

      // Update the existing order with user information and mark as redeemed
      const { error: updateError } = await supabase
        .from('cheap-play-zone')
        .update({
          email,
          updated_at: new Date().toISOString(),
          isRedeemed: true, // Mark the code as redeemed
          status: 'pending', // Update status to pending
        })
        .eq('code', code);

      if (updateError) {
        throw updateError;
      }

      // Show success notification
      showNotification('Code successfully redeemed!', 'success');

      // Redirect to confirmation page after a short delay
      setTimeout(() => {
        router.push('/redeem/confirmation');
      }, 2000);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Please try again.';
      setError('Failed to redeem code: ' + errorMessage);
      showNotification(`Failed to redeem: ${errorMessage}`, 'error');
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={clearNotification}
        />
      )}

      <Link
        href="/"
        className="flex items-center text-gray-400 hover:text-white mb-8 transition-colors"
      >
        <ChevronLeft size={20} />
        <span>Back</span>
      </Link>

      <div className="max-w-md mx-auto bg-gray-900 p-8 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold mb-6 text-center">
          REDEEM YOUR CODE:
        </h1>

        {error && (
          <div className="bg-red-900/50 border border-red-500 text-white p-3 rounded mb-4">
            {error}
          </div>
        )}

        {!codeExists && !error && code && (
          <div className="bg-yellow-900/50 border border-yellow-500 text-white p-3 rounded mb-4">
            This redemption code doesn&apos;t exist. Please check your code.
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* <div className="mb-4">
            <label className="block text-gray-400 mb-2">YOUR ORDER ID</label>
            <input
              type="text"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              placeholder="Enter your order ID..."
              className="w-full bg-gray-800 border border-gray-700 rounded p-3 text-white"
            />
          </div> */}

          <div className="mb-4">
            <label className="block text-gray-400 mb-2">YOUR EMAIL</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
              className="w-full bg-gray-800 border border-gray-700 rounded p-3 text-white"
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-400 mb-2">YOUR REDEEM CODE</label>
            <input
              type="text"
              value={code}
              onChange={(e) => {
                const newCode = e.target.value;
                setCode(newCode);
                if (newCode.length > 8) {
                  checkCodeExists(newCode);
                }
              }}
              placeholder="Enter your redeem code..."
              className="w-full bg-gray-800 border border-gray-700 rounded p-3 text-white"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !codeExists}
            className={`w-full bg-white text-black font-bold py-3 px-4 rounded-full transition-colors ${
              loading || !codeExists
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:bg-gray-200'
            }`}
          >
            {loading ? 'Processing...' : 'Redeem'}
          </button>
        </form>
      </div>
    </div>
  );
}
