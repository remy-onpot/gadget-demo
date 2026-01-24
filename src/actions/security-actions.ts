'use server';

import { createClient } from '@/lib/supabase-server';

export async function verifyPassword(password: string) {
  const supabase = await createClient();

  // 1. Get Current User Email
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !user.email) {
    return { success: false, error: "User not authenticated" };
  }

  // 2. Attempt "Dry Run" Login to verify password
  // We use a fresh client to avoid messing up the current session cookies
  const { error } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: password,
  });

  if (error) {
    return { success: false, error: "Incorrect password" };
  }

  return { success: true };
}