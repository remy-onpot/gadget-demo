'use server';

import { createClient } from '@/lib/supabase-server';

export interface SearchResult {
  name: string;
  slug: string;
  logo?: string; // Optional if you have logos in settings
}

export async function searchStores(query: string): Promise<SearchResult[]> {
  if (!query || query.length < 2) return [];

  const supabase = await createClient();

  // Search for active stores matching name or slug
  const { data, error } = await supabase
    .from('stores')
    .select('name, slug, settings')
    .eq('is_active', true)
    .or(`name.ilike.%${query}%,slug.ilike.%${query}%`)
    .limit(5);

  if (error) {
    console.error("Search error:", error);
    return [];
  }

  // Map results to a clean format
  return data.map((store) => {
    const settings = store.settings as Record<string, string>;
    return {
      name: store.name,
      slug: store.slug,
      logo: settings?.site_logo || undefined
    };
  });
}