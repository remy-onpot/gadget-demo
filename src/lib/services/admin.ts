import { createClient } from '@/lib/supabase-server';
import { Database } from '@/lib/database.types';

// Use strict types from your Generator
type Banner = Database['public']['Tables']['banners']['Row'];
type SiteSetting = Database['public']['Tables']['site_settings']['Row'];
type AttributeOption = Database['public']['Tables']['attribute_options']['Row'];

// --- BANNERS ---
export async function getAdminBanners() {
  const supabase = await createClient();
  const { data } = await supabase
    .from('banners')
    .select('*')
    .order('created_at', { ascending: false });
  return (data || []) as Banner[];
}

// --- SETTINGS ---
export async function getAdminSettings() {
  const supabase = await createClient();
  const { data } = await supabase
    .from('site_settings')
    .select('*')
    .order('key', { ascending: true });
  return (data || []) as SiteSetting[];
}

// --- ATTRIBUTES ---
export async function getAdminAttributes() {
  const supabase = await createClient();
  const { data } = await supabase
    .from('attribute_options')
    .select('*')
    .order('category', { ascending: true })
    .order('sort_order', { ascending: true });
  return (data || []) as AttributeOption[];
}

// --- LAYOUTS (Category Sections) ---
export async function getAdminLayouts() {
  const supabase = await createClient();
  const { data } = await supabase
    .from('category_sections')
    .select('*')
    .order('category_slug', { ascending: true })
    .order('sort_order', { ascending: true });
  return data || [];
}