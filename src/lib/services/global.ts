import { supabase } from '@/lib/supabase';

export async function getGlobalData() {
  // 1. Fetch Site Settings (Phone, Address, Socials, Description)
  const { data: settingsData } = await supabase
    .from('site_settings')
    .select('*');

  // Convert array to object for easy access: settings['key']
  const settings = (settingsData || []).reduce((acc, curr) => {
    acc[curr.key] = curr.value;
    return acc;
  }, {} as Record<string, string>);

  // 2. Fetch Active Categories (Dynamic Navigation)
  // We look at actual products to see what categories exist
  const { data: products } = await supabase
    .from('products')
    .select('category')
    .eq('is_active', true);

  // Get unique categories and sort them
  const categories = Array.from(new Set(
    products?.map(p => p.category?.toLowerCase()).filter(Boolean) || []
  )).sort();

  return { settings, categories };
}