import { supabase } from '@/lib/supabase';
import { unstable_cache } from 'next/cache';

// ✅ CACHED DATA LAYER: Store-specific caching with revalidation tags
// Create cached function factory to prevent recreation on every call
const createCachedGlobalData = (storeId: string) =>
  unstable_cache(
    async () => {
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
      const { data: categoriesData } = await supabase
        .from('categories')
        .select('name')
        .eq('store_id', storeId)
        .order('name', { ascending: true });

      // Map to a simple string array for the navigation menu
      const categories = categoriesData?.map(c => c.name) || [];

      return { settings, categories };
    },
    ['global-data', storeId], // Include storeId in cache key
    {
      tags: [`store-data-${storeId}`], // Unique per store for selective revalidation
      revalidate: 3600 // 1 hour cache duration
    }
  );

// Export the function that uses the cached version
export async function getGlobalData(storeId: string) {
  const cachedFn = createCachedGlobalData(storeId);
  return cachedFn();
}