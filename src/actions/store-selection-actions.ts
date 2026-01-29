"use server";

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createClient } from "@/lib/supabase-server";

export async function selectStore(storeId: string) {
  try {
    // Verify store ownership
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { error: "Not authenticated" };
    }

    const { data: store } = await supabase
      .from('stores')
      .select('id')
      .eq('id', storeId)
      .eq('owner_id', user.id)
      .single();

    if (!store) {
      return { error: "Store not found or unauthorized" };
    }

    // Set cookie
    const cookieStore = await cookies();
    cookieStore.set('nimde_active_store', storeId, {
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    });

    return { success: true };
  } catch (e) {
    console.error('Failed to select store:', e);
    return { error: 'Failed to select store' };
  }
}

export async function getActiveStoreId(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get('nimde_active_store')?.value || null;
}

export async function clearActiveStore() {
  const cookieStore = await cookies();
  cookieStore.delete('nimde_active_store');
}
