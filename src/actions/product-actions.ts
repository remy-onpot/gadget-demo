'use server';

import { createClient } from '@/lib/supabase-server';
import { revalidateTag } from 'next/cache';
import { Database } from '@/lib/database.types';

// 1. DEFINE PAYLOAD TYPES
type ProductInsert = Database['public']['Tables']['products']['Insert'];
type VariantInsert = Database['public']['Tables']['product_variants']['Insert'];

// Omit product_id because it's generated after the parent is inserted
type VariantPayload = Omit<VariantInsert, 'product_id'>;

export async function upsertProduct(
  productData: ProductInsert, 
  variantData: VariantPayload[]
) {
  const supabase = await createClient();

  // 1. Security Check
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  // 2. Parent Product Upsert
  const { data: product, error: prodError } = await supabase
    .from('products')
    .upsert(productData)
    .select()
    .single();

  if (prodError) throw new Error(prodError.message);

  const productId = product.id;

  // 3. Sync Variants
  // A. Delete old variants (Replace Strategy)
  const { error: deleteError } = await supabase
    .from('product_variants')
    .delete()
    .eq('product_id', productId);

  if (deleteError) throw new Error(deleteError.message);

  // B. Insert new variants
  if (variantData.length > 0) {
    const variantsPayload = variantData.map((v) => ({
        ...v,
        product_id: productId,
    }));

    const { error: varError } = await supabase
        .from('product_variants')
        .insert(variantsPayload);
        
    if (varError) throw new Error(varError.message);
  }

  // 4. CACHE BUSTER
  // ✅ FIX: Pass a dummy second argument to satisfy your specific Next.js version.
  // We cast to 'any' to ensure it works regardless of what "profile" expects.
  revalidateTag('products', 'max' as any);
  revalidateTag('category-feed', 'max' as any);
  
  return { success: true, productId };
}