import { createClient } from '@/lib/supabase-server';
import { Database } from '@/lib/database.types';

// Use strict types from your Generator
type Banner = Database['public']['Tables']['banners']['Row'];
type AttributeOption = Database['public']['Tables']['attribute_options']['Row'];
type CategorySection = Database['public']['Tables']['category_sections']['Row'];

// --- BANNERS ---
export async function getAdminBanners(storeId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from('banners')
    .select('*')
    .eq('store_id', storeId) // ✅ Filter by Store
    .order('created_at', { ascending: false });
  return (data || []) as Banner[];
}

// --- SETTINGS ---
// Fixed: Fetches from the 'stores' table JSON column instead of 'site_settings'
export async function getAdminSettings(storeId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from('stores')
    .select('settings')
    .eq('id', storeId)
    .single();
    
  return (data?.settings || {}) as Record<string, any>;
}

// --- ATTRIBUTES ---
export async function getAdminAttributes(storeId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from('attribute_options')
    .select('*')
    .eq('store_id', storeId) // ✅ Filter by Store
    .order('category', { ascending: true })
    .order('sort_order', { ascending: true });
  return (data || []) as AttributeOption[];
}

// --- LAYOUTS (Category Sections) ---
export async function getAdminLayouts(storeId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from('category_sections')
    .select('*')
    .eq('store_id', storeId) // ✅ Filter by Store
    .order('sort_order', { ascending: true });
  return (data || []) as CategorySection[];
}