import { supabase } from '@/lib/supabase';

// We now require storeId to ensure we only fetch data for the relevant store.
export async function getGlobalData(storeId: string) {
  if (!storeId) {
    console.error("getGlobalData called without storeId");
    return { settings: {}, categories: [] };
  }

  // 1. Fetch Site Settings (Now stored in the 'stores' table JSON column)
  const { data: storeData } = await supabase
    .from('stores')
    .select('settings')
    .eq('id', storeId)
    .single();

  // Safely cast the JSON settings to the expected Record format
  const settings = (storeData?.settings as Record<string, string>) || {};

  // 2. Fetch Active Categories (Dynamic Navigation)
  // ✅ SECURITY UPDATE: We now filter by 'store_id' so we don't leak 
  // categories from other stores.
  const { data: products } = await supabase
    .from('products')
    .select('category')
    .eq('store_id', storeId)
    .eq('is_active', true);

  // Get unique categories and sort them
  const categories = Array.from(new Set(
    products?.map(p => p.category?.toLowerCase()).filter(Boolean) || []
  )).sort();

  return { settings, categories };
}