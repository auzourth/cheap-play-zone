'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Clock, CheckCircle, ExternalLink } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Order } from '../../../../types';

export default function OrderDetails() {
  const params = useParams();
  const { code } = params;
  const [order, setOrder] = useState<Order>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrder = async () => {
      if (!code) return;

      setLoading(true);

      try {
        const { data, error } = await supabase
          .from('cheap-play-zone')
          .select('*')
          .eq('code', code)
          .single();

        if (error) {
          console.error('Error fetching order:', error);
          setError('Order not found');
        } else {
          setOrder(data);
        }
      } catch (err) {
        console.error('Exception when fetching order:', err);
        setError('Failed to load order details');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [code]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
        <div className="bg-gray-900 p-8 rounded-lg shadow-lg max-w-md w-full text-center">
          <h1 className="text-2xl font-bold mb-4">Order Not Found</h1>
          <p className="text-gray-400 mb-6">
            The order you&apos;re looking for could not be found.
          </p>
          <Link
            href="/track-order"
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded transition-colors inline-block"
          >
            Go Back
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Link
        href="/track-order"
        className="flex items-center text-gray-400 hover:text-white mb-8 transition-colors"
      >
        <ChevronLeft size={20} />
        <span>Back to Track Order</span>
      </Link>

      <div className="max-w-md mx-auto bg-gray-900 p-8 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold mb-6 text-center">Order Status</h1>

        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400">Redemption Code:</span>
            <span className="font-medium">{order.code}</span>
          </div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400">Order Date:</span>
            <span className="font-medium">
              {new Date(order.created_at!).toLocaleDateString()}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Status:</span>
            <span
              className={`font-medium flex items-center ${
                order.status === 'delivered'
                  ? 'text-green-500'
                  : 'text-yellow-500'
              }`}
            >
              {order.status === 'delivered' ? (
                <>
                  <CheckCircle size={16} className="mr-1" />
                  Delivered
                </>
              ) : (
                <>
                  <Clock size={16} className="mr-1" />
                  Pending
                </>
              )}
            </span>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-6 mb-6">
          {order.status === 'delivered' && order.loginInfo ? (
            <>
              <h2 className="text-xl font-bold mb-3">Login Information</h2>
              <div className="bg-gray-800 p-4 rounded-lg mb-4">
                <pre className="whitespace-pre-wrap text-sm text-gray-300">
                  {order.loginInfo}
                </pre>
              </div>
            </>
          ) : (
            <>
              <div className="bg-gray-800 p-4 rounded-lg mb-4">
                <p className="text-center text-gray-300">
                  Your order is currently being processed. It will be delivered
                  within 24 hours.
                </p>
              </div>
            </>
          )}

          <p className="text-center text-gray-400">
            Need help? Contact us via{' '}
            <a
              href="https://www.g2a.com/contact-us"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:underline inline-flex items-center"
            >
              G2A support
              <ExternalLink size={14} className="ml-1" />
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
