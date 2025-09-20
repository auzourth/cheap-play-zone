'use client';

import React from 'react';
import Link from 'next/link';
import { CheckCircle } from 'lucide-react';

export default function RedeemConfirmation() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-md mx-auto bg-gray-900 p-8 rounded-lg shadow-lg text-center">
        <div className="flex justify-center mb-6">
          <div className="bg-green-600/20 p-4 rounded-full">
            <CheckCircle size={48} className="text-green-500" />
          </div>
        </div>

        <h1 className="text-2xl font-bold mb-4">Redemption Successful!</h1>

        <p className="text-gray-300 mb-8">
          Thank you for your redemption. Your order has been recorded and is
          being processed. You will receive an email with your login details
          within 24 hours.
        </p>

        <div className="mb-6 bg-gray-800 p-4 rounded-lg text-left">
          <p className="text-gray-300 mb-2">
            <span className="text-gray-400 block mb-1">Important:</span>
            You can check the status of your order at any time by visiting the
            Track Order page and entering your redemption code.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/track-order"
            className="bg-blue-500 text-white font-bold py-3 px-4 rounded hover:bg-blue-600 transition-colors flex-1"
          >
            Track Your Order
          </Link>
          <Link
            href="/"
            className="bg-gray-700 text-white font-bold py-3 px-4 rounded hover:bg-gray-600 transition-colors flex-1"
          >
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
