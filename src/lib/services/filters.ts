import { createClient } from '@/lib/supabase-server';
import { unstable_cache } from 'next/cache';
import { Database } from '@/lib/database.types';

// 1. DEFINE TYPES
type VariantSpecs = Database['public']['Tables']['product_variants']['Row']['specs'];

// Define the shape returned by the specific select query
interface ProductWithSpecs {
  variants: {
    specs: VariantSpecs;
  }[];
}

export type FilterOption = {
  key: string;
  values: string[];
};

// 2. Internal Fetcher (The Heavy Lifting)
const getCategoryFiltersInternal = async (categorySlug: string) => {
  const supabase = await createClient();

  // Fetch all active products + variants in this category
  const { data, error } = await supabase
    .from('products')
    .select('variants:product_variants(specs)')
    .eq('category', categorySlug)
    .eq('is_active', true);

  if (error) {
    console.error("Error fetching filters:", error);
    return [];
  }
  
  if (!data) return [];

  // ✅ Cast the raw data to our specific shape
  const products = data as unknown as ProductWithSpecs[];

  // Aggregate Attributes
  const rawStats: Record<string, Set<string>> = {};

  products.forEach((p) => {
    p.variants.forEach((v) => {
      // ✅ Cast generic JSON to a Record we can iterate
      const specs = (v.specs as Record<string, unknown>) || {};
      
      Object.entries(specs).forEach(([key, val]) => {
        // Skip null/undefined values
        if (val === null || val === undefined) return;

        // Normalize keys (e.g. "Ram" -> "RAM")
        const cleanKey = key.trim();
        const cleanVal = String(val).trim(); // Safe string conversion

        if (!cleanVal) return;

        if (!rawStats[cleanKey]) {
          rawStats[cleanKey] = new Set();
        }
        rawStats[cleanKey].add(cleanVal);
      });
    });
  });

  // Convert Sets to Arrays & Sort
  const filters: FilterOption[] = Object.entries(rawStats).map(([key, valueSet]) => ({
    key,
    values: Array.from(valueSet).sort((a, b) => a.localeCompare(b, undefined, { numeric: true })),
  }));

  return filters.sort((a, b) => a.key.localeCompare(b.key));
};

// 3. The Shielded Export
export const getCategoryFilters = unstable_cache(
  async (slug: string) => getCategoryFiltersInternal(slug),
  ['category-filters'], // Base key
  {
    tags: ['products'], // Nuke this cache when you save a product
    revalidate: 3600    // Default: 1 hour
  }
);