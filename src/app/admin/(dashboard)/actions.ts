'use server';

import { createClient } from '@/lib/supabase-server';
import { getActiveStore } from "@/lib/services/admin-auth";
import { revalidatePath } from 'next/cache';
import { Database } from '@/lib/database.types';
import { redirect } from 'next/navigation';
// Helper Types
type CategoryMetaRow = Database['public']['Tables']['category_metadata']['Row'];
type AttributeData = {
  category: string;
  key: string;
  value: string;
  sort_order?: number;
};
type CategorySectionInsert = Database['public']['Tables']['category_sections']['Insert'];
type ContentBlockUpdate = Database['public']['Tables']['content_blocks']['Update'];
type BannerInsert = Database['public']['Tables']['banners']['Insert'];

// Helper to enforce security
async function getStoreOrThrow() {
  const store = await getActiveStore();
  if (!store) throw new Error("Unauthorized: You do not own a store.");
  return store;
}

// ==========================================
// 1. ORDER ACTIONS
// ==========================================

export async function updateOrderStatus(orderId: string, newStatus: string) {
  const store = await getStoreOrThrow();
  const supabase = await createClient();

  const { error } = await supabase
    .from('orders')
    .update({ status: newStatus })
    .eq('id', orderId)
    .eq('store_id', store.id); // 🔒 Security Check

  if (error) throw new Error('Failed to update order status');

  revalidatePath('/admin/orders');
  return { success: true };
}

export async function deleteOrder(orderId: string) {
  const store = await getStoreOrThrow();
  const supabase = await createClient();

  const { error } = await supabase
    .from('orders')
    .delete()
    .eq('id', orderId)
    .eq('store_id', store.id); // 🔒 Security Check

  if (error) throw new Error('Failed to delete order');

  revalidatePath('/admin/orders');
  return { success: true };
}

// ==========================================
// 2. INVENTORY ACTIONS
// ==========================================

export async function updateProductStock(variantId: string, newStock: number) {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from('product_variants')
    .update({ stock: newStock })
    .eq('id', variantId);

  if (error) throw new Error('Failed to update stock');
  
  revalidatePath('/admin/inventory');
  return { success: true };
}

export async function toggleProductActive(productId: string, isActive: boolean) {
  const store = await getStoreOrThrow();
  const supabase = await createClient();
  
  await supabase
    .from('products')
    .update({ is_active: isActive })
    .eq('id', productId)
    .eq('store_id', store.id); // 🔒 Security Check

  revalidatePath('/admin/inventory');
  return { success: true };
}

// ==========================================
// 3. SETTINGS ACTIONS (Modern JSONB)
// ==========================================

export async function getStoreSettings() {
  const store = await getActiveStore();
  if (!store) return {};
  return (store.settings as Record<string, any>) || {};
}

export async function updateStoreSettings(newSettings: Record<string, any>) {
  const store = await getStoreOrThrow();
  const supabase = await createClient();

  // Merge existing settings with new ones to prevent data loss
  const currentSettings = (store.settings as Record<string, any>) || {};
  const mergedSettings = { ...currentSettings, ...newSettings };

  const { error } = await supabase
    .from('stores')
    .update({ 
      settings: mergedSettings,
      name: newSettings.site_name || store.name // Sync name if changed
    })
    .eq('id', store.id);

  if (error) throw new Error(error.message);

  revalidatePath('/admin/settings');
  return { success: true };
}

// Legacy support
export async function updateSiteSetting(key: string, value: string) {
    return updateStoreSettings({ [key]: value });
}

// ==========================================
// 4. BANNER ACTIONS
// ==========================================

export async function deleteBanner(id: string) {
  const store = await getStoreOrThrow();
  const supabase = await createClient();
  
  await supabase
    .from('banners')
    .delete()
    .eq('id', id)
    .eq('store_id', store.id); // 🔒 Security Check

  revalidatePath('/admin/banners');
  return { success: true };
}

export async function createBanner(data: BannerInsert) {
  const store = await getStoreOrThrow();
  const supabase = await createClient();

  const { error } = await supabase.from('banners').insert({
    ...data,
    store_id: store.id // 🔒 Enforce Ownership
  });

  if (error) throw new Error(error.message);
  revalidatePath('/admin/banners');
  return { success: true };
}

export async function toggleBannerStatus(id: string, isActive: boolean) {
  const store = await getStoreOrThrow();
  const supabase = await createClient();
  
  await supabase
    .from('banners')
    .update({ is_active: isActive })
    .eq('id', id)
    .eq('store_id', store.id); // 🔒 Security Check

  revalidatePath('/admin/banners');
  return { success: true };
}

// ==========================================
// 5. ATTRIBUTE ACTIONS
// ==========================================

export async function createAttribute(data: AttributeData) {
  const store = await getStoreOrThrow();
  const supabase = await createClient();
  
  const { error } = await supabase
    .from('attribute_options')
    .insert({
        ...data,
        store_id: store.id // 🔒 Enforce Ownership
    });

  if (error) throw new Error(error.message);
  revalidatePath('/admin/attributes');
  return { success: true };
}

export async function updateAttribute(id: string, data: AttributeData) {
  const store = await getStoreOrThrow();
  const supabase = await createClient();
  
  const { error } = await supabase
    .from('attribute_options')
    .update(data)
    .eq('id', id)
    .eq('store_id', store.id); // 🔒 Security Check

  if (error) throw new Error(error.message);
  revalidatePath('/admin/attributes');
  return { success: true };
}

export async function deleteAttribute(id: string) {
  const store = await getStoreOrThrow();
  const supabase = await createClient();
  
  const { error } = await supabase
    .from('attribute_options')
    .delete()
    .eq('id', id)
    .eq('store_id', store.id); // 🔒 Security Check

  if (error) throw new Error(error.message);
  revalidatePath('/admin/attributes');
  return { success: true };
}

// ==========================================
// 6. CATEGORY METADATA ACTIONS (Layouts)
// ==========================================

export async function updateCategoryMeta(data: CategoryMetaRow[]) {
  const store = await getStoreOrThrow();
  const supabase = await createClient();
  
  // Ensure every row belongs to this store
  const safeData = data.map(d => ({
    ...d,
    store_id: store.id
  }));

  const { error } = await supabase
    .from('category_metadata')
    .upsert(safeData);

  if (error) throw new Error(error.message);
  
  revalidatePath('/admin/layouts');
  return { success: true };
}

// ==========================================
// 7. CATEGORY SECTION ACTIONS (The Rows)
// ==========================================

export async function saveCategorySection(data: CategorySectionInsert) {
  const store = await getStoreOrThrow();
  const supabase = await createClient();

  const { error } = await supabase
    .from('category_sections')
    .upsert({
        ...data,
        store_id: store.id // 🔒 Enforce Ownership
    });

  if (error) throw new Error(error.message);

  revalidatePath('/category/[slug]', 'page'); 
  return { success: true };
}

export async function deleteCategorySection(id: string) {
  const store = await getStoreOrThrow();
  const supabase = await createClient();

  const { error } = await supabase
    .from('category_sections')
    .delete()
    .eq('id', id)
    .eq('store_id', store.id); // 🔒 Security Check

  if (error) throw new Error(error.message);

  revalidatePath('/category/[slug]', 'page');
  return { success: true };
}

// ==========================================
// 8. CONTENT BLOCK ACTIONS (Home Grid)
// ==========================================

export async function updateContentBlock(id: string, updates: ContentBlockUpdate) {
  const store = await getStoreOrThrow();
  const supabase = await createClient();

  const { error } = await supabase
    .from('content_blocks')
    .update(updates)
    .eq('id', id)
    .eq('store_id', store.id); // 🔒 Security Check

  if (error) throw new Error(error.message);

  revalidatePath('/'); // ⚡ Refresh the homepage immediately
  return { success: true };
}

// ✅ NEW: Create a new block (for adding carousel items)
export async function createContentBlock(data: { 
  section_key: string; 
  block_key: string; 
  title: string; 
  description?: string; 
  icon_key?: string; 
  meta_info?: any 
}) {
  const store = await getStoreOrThrow(); // 🔒 Get current store
  const supabase = await createClient();
  
  const { data: newBlock, error } = await supabase
    .from('content_blocks')
    .insert([{
      store_id: store.id, // 🔒 IMPORTANT: Link to store
      section_key: data.section_key,
      block_key: data.block_key, 
      title: data.title,
      description: data.description,
      icon_key: data.icon_key,
      meta_info: data.meta_info
    }])
    .select()
    .single();

  if (error) throw new Error(error.message);
  
  revalidatePath('/admin/grid'); 
  revalidatePath('/'); 
  return newBlock;
}

// ✅ NEW: Delete a block
export async function deleteContentBlock(id: string) {
  const store = await getStoreOrThrow();
  const supabase = await createClient();
  
  const { error } = await supabase
    .from('content_blocks')
    .delete()
    .eq('id', id)
    .eq('store_id', store.id); // 🔒 Security Check

  if (error) throw new Error(error.message);
  
  revalidatePath('/admin/grid');
  revalidatePath('/');
}

// ==========================================
// 9. DASHBOARD STATS
// ==========================================

export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  avgOrderValue: number;
  lowStockCount: number;
  recentOrders: any[];
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = await createClient();
  
  // 1. Security: Get the Store ID for the current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/admin/login');

  const { data: store } = await supabase
    .from('stores')
    .select('id')
    .eq('owner_id', user.id)
    .single();

  if (!store) throw new Error("Store not found");

  // 2. Parallel Fetching for Speed ⚡
  const [revenueRes, ordersRes, inventoryRes, recentRes] = await Promise.all([
    // A. Total Revenue
    supabase
      .from('orders')
      .select('total_amount.sum()')
      .eq('store_id', store.id)
      .neq('status', 'cancelled'),

    // B. Total Orders
    supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('store_id', store.id),

    // C. Low Stock
    supabase
      .from('product_variants')
      .select('*', { count: 'exact', head: true })
      .lt('stock', 5),

    // D. Recent Orders
    supabase
      .from('orders')
      .select('id, customer_name, total_amount, status, created_at')
      .eq('store_id', store.id)
      .order('created_at', { ascending: false })
      .limit(5)
  ]);

  const totalRevenue = (revenueRes.data as any)?.[0]?.sum || 0;
  const totalOrders = ordersRes.count || 0;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  return {
    totalRevenue,
    totalOrders,
    avgOrderValue,
    lowStockCount: inventoryRes.count || 0,
    recentOrders: recentRes.data || []
  };
}