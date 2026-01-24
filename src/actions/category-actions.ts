'use server';

import { createClient } from '@/lib/supabase-server';

// 1. Fetch All Categories (For Dropdowns)
export async function getCategories(storeId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from('categories')
    .select('*')
    .eq('store_id', storeId)
    .order('name');
  
  return data || [];
}

// 2. Create Category (Safe Upsert)
export async function createCategory(name: string, storeId: string) {
  const supabase = await createClient();
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  const { data, error } = await supabase
    .from('categories')
    .upsert(
      { store_id: storeId, name, slug }, 
      { onConflict: 'store_id, name' } // If exists, just return it
    )
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}