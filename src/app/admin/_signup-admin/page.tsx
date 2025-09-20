'use client';
import React, { useState } from 'react';
import { UserPlus } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const AdminSignupPage: React.FC = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Form validation
    if (!email || !password || !confirmPassword) {
      setError('All fields are required');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Sign up with Supabase
      const { error: signupError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
            role: 'admin', // Set the user role as admin
          },
        },
      });

      if (signupError) {
        throw signupError;
      }

      // Success - show success message
      setSuccess(true);

      // Reset form
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setName('');

      // Redirect to login after a short delay
      setTimeout(() => {
        router.push('/admin/login');
      }, 3000);
    } catch (err: unknown) {
      console.error('Signup error:', err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Failed to create account. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg max-w-md w-full">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
            <UserPlus size={32} className="text-white" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-white text-center mb-6">
          Create Admin Account
        </h1>

        {error && (
          <div className="bg-red-900/50 border border-red-500 text-white p-3 rounded mb-4">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-900/50 border border-green-500 text-white p-3 rounded mb-4">
            Account created successfully! You&apos;ll be redirected to login
            shortly.
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-400 mb-2">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded p-3 text-white"
              placeholder="John Doe"
            />
          </div>

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

          <div className="mb-4">
            <label className="block text-gray-400 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded p-3 text-white"
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-400 mb-2">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded p-3 text-white"
            />
          </div>

          <button
            type="submit"
            disabled={loading || success}
            className={`w-full bg-blue-500 text-white font-bold py-3 px-4 rounded transition-colors mb-4 ${
              loading || success
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:bg-blue-600'
            }`}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>

          <div className="text-center text-gray-400">
            Already have an account?{' '}
            <Link
              href="/admin/login"
              className="text-blue-400 hover:text-blue-300"
            >
              Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminSignupPage;
