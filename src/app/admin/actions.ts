'use server';

import { createClient } from '@/lib/supabase-server';
import { revalidatePath } from 'next/cache';
import { Database } from '@/lib/database.types'; // ✅ Added Missing Import

// Helper Types
type CategoryMetaRow = Database['public']['Tables']['category_metadata']['Row'];
type AttributeData = {
  category: string;
  key: string;
  value: string;
  sort_order?: number;
};

// ==========================================
// 1. ORDER ACTIONS
// ==========================================

export async function updateOrderStatus(orderId: string, newStatus: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('orders')
    .update({ status: newStatus })
    .eq('id', orderId);

  if (error) throw new Error('Failed to update order status');

  revalidatePath('/admin/orders');
  return { success: true };
}

export async function deleteOrder(orderId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('orders')
    .delete()
    .eq('id', orderId);

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
  revalidatePath('/product/[slug]'); 
  return { success: true };
}

export async function toggleProductActive(productId: string, isActive: boolean) {
  const supabase = await createClient();
  
  await supabase
    .from('products')
    .update({ is_active: isActive })
    .eq('id', productId);

  revalidatePath('/admin/inventory');
  revalidatePath('/'); 
  return { success: true };
}

// ==========================================
// 3. SETTINGS ACTIONS
// ==========================================

export async function updateSiteSetting(key: string, value: string) {
  const supabase = await createClient();
  
  await supabase
    .from('site_settings')
    .update({ value })
    .eq('key', key);

  revalidatePath('/admin/settings');
  revalidatePath('/', 'layout'); 
  return { success: true };
}

// ==========================================
// 4. BANNER ACTIONS
// ==========================================

export async function deleteBanner(id: string) {
  const supabase = await createClient();
  await supabase.from('banners').delete().eq('id', id);
  revalidatePath('/admin/banners');
  revalidatePath('/'); 
  return { success: true };
}

export async function toggleBannerStatus(id: string, isActive: boolean) {
  const supabase = await createClient();
  await supabase.from('banners').update({ is_active: isActive }).eq('id', id);
  revalidatePath('/admin/banners');
  revalidatePath('/'); 
  return { success: true };
}

// ==========================================
// 5. ATTRIBUTE ACTIONS
// ==========================================

export async function createAttribute(data: AttributeData) {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from('attribute_options')
    .insert(data);

  if (error) throw new Error(error.message);
  revalidatePath('/admin/attributes');
  return { success: true };
}

export async function updateAttribute(id: string, data: AttributeData) {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from('attribute_options')
    .update(data)
    .eq('id', id);

  if (error) throw new Error(error.message);
  revalidatePath('/admin/attributes');
  return { success: true };
}

export async function deleteAttribute(id: string) {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from('attribute_options')
    .delete()
    .eq('id', id);

  if (error) throw new Error(error.message);
  revalidatePath('/admin/attributes');
  return { success: true };
}

// ==========================================
// 6. CATEGORY METADATA ACTIONS (Layouts)
// ==========================================

export async function updateCategoryMeta(data: CategoryMetaRow[]) {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from('category_metadata')
    .upsert(data);

  if (error) throw new Error(error.message);
  
  revalidatePath('/category/[slug]', 'page'); 
  revalidatePath('/admin/layouts');
  return { success: true };
}
// ==========================================
// 7. CATEGORY SECTION ACTIONS (The Rows)
// ==========================================

// Helper type for the input
type CategorySectionInsert = Database['public']['Tables']['category_sections']['Insert'];

export async function saveCategorySection(data: CategorySectionInsert) {
  const supabase = await createClient();

  // Upsert (Insert or Update based on ID)
  const { error } = await supabase
    .from('category_sections')
    .upsert(data);

  if (error) throw new Error(error.message);

  // Clear cache for this specific category page so users see the new row immediately
  revalidatePath('/category/[slug]', 'page'); 
  return { success: true };
}

export async function deleteCategorySection(id: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('category_sections')
    .delete()
    .eq('id', id);

  if (error) throw new Error(error.message);

  revalidatePath('/category/[slug]', 'page');
  return { success: true };
}


// ==========================================
// 8.
// ==========================================