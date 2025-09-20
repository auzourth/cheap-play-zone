'use client';
import React, { useLayoutEffect, useState } from 'react';
import { Lock, Mail } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useAppContext } from '../../../context/AppContext';

const AdminLoginPage: React.FC = () => {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetMode, setResetMode] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const { isAdmin } = useAppContext();

  useLayoutEffect(() => {
    if (isAdmin) {
      router.push('/');
    }
  }, [isAdmin, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || (!resetMode && !password)) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (resetMode) {
        // Handle password reset
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(
          email,
          {
            redirectTo: `${window.location.origin}/admin/reset-password`,
          }
        );

        if (resetError) throw resetError;
        setResetSent(true);
      } else {
        // Handle normal login
        const { data, error: signInError } =
          await supabase.auth.signInWithPassword({
            email,
            password,
          });

        if (signInError) throw signInError;

        if (data?.session) {
          // Check for admin role if needed
          // const { data: userData } = await supabase.auth.getUser();
          // if (!userData?.user?.user_metadata?.role === 'admin') {
          //   throw new Error('Not authorized as admin');
          // }

          router.push('/admin/dashboard');
        }
      }
    } catch (err: unknown) {
      console.error('Authentication error:', err);
      const errorMessage =
        err instanceof Error ? err.message : 'Please try again.';
      setError('Failed to update order: ' + errorMessage);
      setError(errorMessage || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleResetMode = () => {
    setResetMode(!resetMode);
    setError('');
    setResetSent(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg max-w-md w-full">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
            {resetMode ? (
              <Mail size={32} className="text-white" />
            ) : (
              <Lock size={32} className="text-white" />
            )}
          </div>
        </div>

        <h1 className="text-2xl font-bold text-white text-center mb-6">
          {resetMode ? 'Reset Password' : 'Admin Login'}
        </h1>

        {error && (
          <div className="bg-red-900/50 border border-red-500 text-white p-3 rounded mb-4">
            {error}
          </div>
        )}

        {resetSent && (
          <div className="bg-green-900/50 border border-green-500 text-white p-3 rounded mb-4">
            Password reset link has been sent to your email.
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-400 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded p-3 text-white"
              placeholder="admin@example.com"
            />
          </div>

          {!resetMode && (
            <div className="mb-6">
              <label className="block text-gray-400 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded p-3 text-white"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading || (resetMode && resetSent)}
            className={`w-full bg-blue-500 text-white font-bold py-3 px-4 rounded transition-colors mb-4 ${
              loading || (resetMode && resetSent)
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:bg-blue-600'
            }`}
          >
            {loading
              ? resetMode
                ? 'Sending...'
                : 'Logging in...'
              : resetMode
              ? 'Send Reset Link'
              : 'Login'}
          </button>

          <div className="flex justify-between text-gray-400 text-sm mb-4">
            <button
              type="button"
              onClick={toggleResetMode}
              className="text-blue-400 hover:text-blue-300"
            >
              {resetMode ? 'Back to Login' : 'Forgot Password?'}
            </button>

            {!resetMode && (
              <Link
                href="/admin/signup"
                className="text-blue-400 hover:text-blue-300"
              >
                Sign Up
              </Link>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminLoginPage;
