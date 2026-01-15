import { createClient } from '@/lib/supabase-server'; // ✅ Fixed Import
import { unstable_cache } from 'next/cache';

export type FilterOption = {
  key: string;
  values: string[];
};

// 1. Internal Fetcher (The Heavy Lifting)
const getCategoryFiltersInternal = async (categorySlug: string) => {
  // ✅ Create the client inside the function (Server Component compatible)
  const supabase = await createClient();

  // Fetch all active products + variants in this category
  const { data: products } = await supabase
    .from('products')
    .select('variants:product_variants(specs)')
    .eq('category', categorySlug)
    .eq('is_active', true);

  if (!products) return [];

  // Aggregate Attributes
  const rawStats: Record<string, Set<string>> = {};

  products.forEach((p) => {
    p.variants.forEach((v: any) => {
      const specs = v.specs || {};
      Object.entries(specs).forEach(([key, val]) => {
        // Normalize keys (e.g. "Ram" -> "RAM")
        const cleanKey = key.trim();
        const cleanVal = String(val).trim();

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

// 2. The Shielded Export
// We use unstable_cache directly to handle the 'slug' argument correctly
export const getCategoryFilters = unstable_cache(
  async (slug: string) => getCategoryFiltersInternal(slug),
  ['category-filters'], // Next.js automatically combines this with the 'slug' arg for uniqueness
  {
    tags: ['products'], // ✅ Nuke this cache when you save a product
    revalidate: 3600    // Default: 1 hour
  }
);