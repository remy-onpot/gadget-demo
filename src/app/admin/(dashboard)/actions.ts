'use server';

import { createClient } from '@/lib/supabase-server';
import { getActiveStore } from "@/lib/services/admin-auth";
import { revalidatePath } from 'next/cache';
import { Database } from '@/lib/database.types';

// Helper Types
type CategoryMetaRow = Database['public']['Tables']['category_metadata']['Row'];
type AttributeData = {
  category: string;
  key: string;
  value: string;
  sort_order?: number;
};
type CategorySectionInsert = Database['public']['Tables']['category_sections']['Insert'];

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
  // Note: Variants don't have store_id directly, they link to products.
  // Ideally, we check the product's store_id via a join, or trust the RLS policies.
  // For V1 Admin Actions, we'll rely on the user being authenticated, but strict RLS is better.
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

// Legacy support (Deprecated, but keeps old components from crashing)
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
type BannerInsert = Database['public']['Tables']['banners']['Insert'];

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
type ContentBlockUpdate = Database['public']['Tables']['content_blocks']['Update'];

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