'use server';

import { createClient } from '@/lib/supabase-server';
import { revalidateTag } from 'next/cache';

export async function upsertProduct(productData: any, variantData: any[]) {
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

  // 3. Sync Variants
  const productId = product.id;
  await supabase.from('product_variants').delete().eq('product_id', productId);

  const variantsPayload = variantData.map((v) => ({
    ...v,
    product_id: productId,
  }));

  const { error: varError } = await supabase.from('product_variants').insert(variantsPayload);
  if (varError) throw new Error(varError.message);

  // 4. THE CACHE BUSTER (Next.js 16 Compatible)
  // We pass 'max' to enable the recommended Stale-While-Revalidate behavior.
  // This satisfies the new TypeScript requirement.
  revalidateTag('products', 'max');
  revalidateTag('category-feed', 'max');
  
  return { success: true, productId };
}