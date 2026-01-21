import { createClient } from '@/lib/supabase-server';
import { unstable_cache } from 'next/cache';
import { Database } from '@/lib/database.types';

type VariantSpecs = Database['public']['Tables']['product_variants']['Row']['specs'];

interface ProductWithSpecs {
  variants: {
    specs: VariantSpecs;
  }[];
}

export type FilterOption = {
  key: string;
  values: string[];
};

// 2. Internal Fetcher (Updated to accept storeId)
const getCategoryFiltersInternal = async (categorySlug: string, storeId: string) => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('products')
    .select('variants:product_variants(specs)')
    .eq('store_id', storeId) // ✅ Filter by Store
    .eq('category', categorySlug)
    .eq('is_active', true);

  if (error || !data) return [];

  const products = data as unknown as ProductWithSpecs[];
  const rawStats: Record<string, Set<string>> = {};

  products.forEach((p) => {
    p.variants.forEach((v) => {
      const specs = (v.specs as Record<string, unknown>) || {};
      
      Object.entries(specs).forEach(([key, val]) => {
        if (val == null) return;
        const cleanKey = key.trim();
        const cleanVal = String(val).trim();

        if (!cleanVal) return;

        if (!rawStats[cleanKey]) {
          rawStats[cleanKey] = new Set();
        }
        rawStats[cleanKey].add(cleanVal);
      });
    });
  });

  const filters: FilterOption[] = Object.entries(rawStats).map(([key, valueSet]) => ({
    key,
    values: Array.from(valueSet).sort((a, b) => a.localeCompare(b, undefined, { numeric: true })),
  }));

  return filters.sort((a, b) => a.key.localeCompare(b.key));
};

// 3. The Shielded Export
export const getCategoryFilters = unstable_cache(
  async (slug: string, storeId: string) => getCategoryFiltersInternal(slug, storeId),
  ['category-filters'], 
  {
    tags: ['products'], 
    revalidate: 3600 
  }
);