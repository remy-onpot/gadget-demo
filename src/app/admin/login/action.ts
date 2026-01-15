'use server';

import { cookies } from 'next/headers';

export async function adminLogin(password: string) {
  // 1. Get the secret from environment variables
  // IMPORTANT: Add ADMIN_PASSWORD="your-secret-password" to your .env.local file
  const CORRECT_PASSWORD = process.env.ADMIN_PASSWORD;

  if (!CORRECT_PASSWORD) {
    throw new Error('ADMIN_PASSWORD not set in environment variables');
  }

  // 2. Check Password
  if (password === CORRECT_PASSWORD) {
    const cookieStore = await cookies();
    
    // 3. Set the Secure Cookie
    cookieStore.set('admin_session', 'true', {
      httpOnly: true, // JavaScript cannot read this (XSS protection)
      secure: process.env.NODE_ENV === 'production', // HTTPS only in production
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/',
    });

    return { success: true };
  }

  return { success: false };
}

export async function adminLogout() {
  const cookieStore = await cookies();
  cookieStore.delete('admin_session');
  return { success: true };
}