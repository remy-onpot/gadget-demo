'use server';

import { createClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';

export async function signOut(redirectPath?: string) {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect(redirectPath || '/admin/login');
}