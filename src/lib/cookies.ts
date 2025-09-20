'use server';

import { User } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

// Cookie constants - not exported
const SESSION_COOKIE_NAME = 'connect.sid';
const USER_COOKIE_NAME = 'user_data';
const REFRESH_TOKEN_COOKIE_NAME = 'refresh_token';

// Default cookie options - not exported directly
const defaultCookieOptions = {
  maxAge: 7 * 24 * 60 * 60, // 7 days
  path: '/',
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
};

export async function setCookie(key: string, value: string, options = {}) {
  (await cookies()).set(key, value, {
    ...defaultCookieOptions,
    ...options,
  });
}

/**
 * Get cookie options (if needed from client components)
 */
export async function getCookieOptions() {
  return { ...defaultCookieOptions };
}

/**
 * Get a cookie value by key
 */
export async function getCookie(key: string) {
  return (await cookies()).get(key)?.value;
}

/**
 * Delete a cookie by key
 */
export async function deleteCookie(key: string) {
  (await cookies()).delete(key);
}

/**
 * Set session token in cookies
 */
export async function setSessionToken(token: string) {
  await setCookie(SESSION_COOKIE_NAME, token);
}

/**
 * Get session token from cookies
 */
export async function getSessionToken() {
  return getCookie(SESSION_COOKIE_NAME);
}

/**
 * Set refresh token in cookies
 */
export async function setRefreshToken(token: string) {
  await setCookie(REFRESH_TOKEN_COOKIE_NAME, token, {
    httpOnly: true, // Refresh tokens should be HttpOnly for security
    maxAge: 30 * 24 * 60 * 60, // 30 days - longer than session token
  });
}

/**
 * Get refresh token from cookies
 */
export async function getRefreshToken() {
  return getCookie(REFRESH_TOKEN_COOKIE_NAME);
}

/**
 * Set user data in cookies
 */
export async function setUserData(userData: User) {
  try {
    // Add timestamp to user data for expiry checking
    const timestampedData = {
      ...userData,
    };

    const userDataString = JSON.stringify(timestampedData);
    await setCookie(USER_COOKIE_NAME, userDataString);
  } catch (error) {
    console.error('Error setting user data cookie:', error);
  }
}

/**
 * Get user data from cookies
 */
export async function getUserData() {
  try {
    const userDataString = await getCookie(USER_COOKIE_NAME);
    if (userDataString) {
      return JSON.parse(userDataString);
    }
    return null;
  } catch (error) {
    console.error('Error parsing user data from cookie:', error);
    return null;
  }
}

/**
 * Check if user is authenticated based on cookies
 */
export async function isAuthenticated() {
  // Check both server cookie and client localStorage
  const token = await getCookie(SESSION_COOKIE_NAME);

  // We can also check for user data cookie as a fallback
  const userData = await getUserData();

  // Return true if either the session token or user data exists
  return !!token || !!userData;
}

/**
 * Check if the session is expired based on timestamp
 */
export async function isSessionExpired(expiryTimeInSeconds = 7200) {
  // Default 2 hours
  const userData = await getUserData();

  if (userData && userData._timestamp) {
    const timestamp = new Date(userData._timestamp).getTime();
    const now = Date.now();
    const expiry = expiryTimeInSeconds * 1000; // Convert to milliseconds

    return now - timestamp > expiry;
  }

  // If there's no timestamp, consider it expired
  return true;
}

/**
 * Clear all session cookies
 */
export async function clearSession() {
  await deleteCookie(SESSION_COOKIE_NAME);
  await deleteCookie(USER_COOKIE_NAME);
  await deleteCookie(REFRESH_TOKEN_COOKIE_NAME);
}

/**
 * Refresh cookie expiry (resets the cookies with the same values)
 */
export async function refreshSession() {
  const token = await getCookie(SESSION_COOKIE_NAME);
  const userData = await getUserData();
  const refreshToken = await getCookie(REFRESH_TOKEN_COOKIE_NAME);

  if (token) {
    await setCookie(SESSION_COOKIE_NAME, token);
  }

  if (userData) {
    // Update the timestamp when refreshing the session
    const updatedUserData = {
      ...userData,
      _timestamp: new Date().toISOString(),
    };
    await setUserData(updatedUserData);
  }

  if (refreshToken) {
    await setRefreshToken(refreshToken);
  }
}
