import { createClient } from '@supabase/supabase-js';

// Note: In Next.js with App Router, we need to handle both server and client environments
// For client components, we need to check if window is defined
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper function for admin authentication
export const checkAdminSession = async () => {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();
  if (error) {
    console.error('Error checking session:', error);
    return false;
  }

  if (!session) return false;

  // You can add additional checks here such as checking for an admin role
  // For example, by fetching user metadata or checking a separate admin table
  return true;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('Error signing out:', error);
    throw error;
  }
  return true;
};
