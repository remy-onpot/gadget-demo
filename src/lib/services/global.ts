import { supabase } from '@/lib/supabase';

// We now require storeId to ensure we only fetch data for the relevant store.
export async function getGlobalData(storeId: string) {
  if (!storeId) {
    console.error("getGlobalData called without storeId");
    return { settings: {}, categories: [] };
  }

  // 1. Fetch Site Settings
  const { data: storeData } = await supabase
    .from('stores')
    .select('settings')
    .eq('id', storeId)
    .single();

  const settings = (storeData?.settings as Record<string, string>) || {};

  // 2. Fetch Categories (Dynamic Navigation)
  // ✅ FIX: Query the new 'categories' master table directly
  const { data: categoriesData } = await supabase
    .from('categories')
    .select('name')
    .eq('store_id', storeId)
    .order('name', { ascending: true });

  // Map to a simple string array for the navigation menu
  const categories = categoriesData?.map(c => c.name) || [];

  return { settings, categories };
}