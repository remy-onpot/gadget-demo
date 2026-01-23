'use server';

import { createClient } from '@/lib/supabase-server';
import { getActiveStore } from '@/lib/services/admin-auth';
import { revalidatePath, revalidateTag } from 'next/cache';
import { Database } from '@/lib/database.types';
import { Redis } from '@upstash/redis';
import { PLANS, PlanId } from '@/lib/plans';

// Initialize Redis safely
// If env vars are missing, it will throw an error, which is GOOD (fails safe)
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

type ProductInsert = Database['public']['Tables']['products']['Insert'];
type VariantInsert = Database['public']['Tables']['product_variants']['Insert'];
type VariantPayload = Omit<VariantInsert, 'product_id'>;

export async function upsertProduct(
  productData: ProductInsert, 
  variantData: VariantPayload[]
) {
  // 1. AUTH & STORE CHECK
  const store = await getActiveStore();
  if (!store) throw new Error('Unauthorized: No active store found.');

  const supabase = await createClient();

  // 2. RATE LIMIT CHECK (The Gatekeeper) 🛡️
  // Only check limits if creating a NEW product (ID is missing or null)
  if (!productData.id) {
      const planId = (store.plan_id as PlanId) || 'starter';
      const plan = PLANS[planId] || PLANS['starter'];
      
      // A. Get current count from Redis (Lightning fast ⚡)
      const cacheKey = `store:${store.id}:product_count`;
      let currentCount = await redis.get<number>(cacheKey);
      
      // B. Cache Miss? Sync truth from DB
      if (currentCount === null) {
          const { count } = await supabase
              .from('products')
              .select('*', { count: 'exact', head: true })
              .eq('store_id', store.id);
          
          currentCount = count || 0;
          // Cache it for 24 hours to keep DB load low
          await redis.set(cacheKey, currentCount, { ex: 86400 });
      }

      // C. The Verdict
      if (currentCount >= plan.limits.products) {
          throw new Error(`Upgrade Required: You have reached the ${plan.label} plan limit of ${plan.limits.products} products.`);
      }
  }

  // 3. PREPARE DATA
  const finalProductData = {
      ...productData,
      store_id: store.id
  };

  // 4. UPSERT PRODUCT
  const { data: product, error: prodError } = await supabase
    .from('products')
    .upsert(finalProductData)
    .select()
    .single();

  if (prodError) throw new Error(`Product Error: ${prodError.message}`);

  const productId = product.id;

  // 5. SYNC VARIANTS
 if (variantData.length > 0) {
    const variantsPayload = variantData.map((v) => ({
      ...v,
      product_id: productId,
      // If the UI passed an ID, Supabase updates that row. If no ID, it creates a new one.
      updated_at: new Date().toISOString()
    }));

    const { error: varError } = await supabase
      .from('product_variants')
      .upsert(variantsPayload, { onConflict: 'id' });
      
    if (varError) throw new Error(`Variant Error: ${varError.message}`);

  // 6. UPDATE COUNTER (If new product)
  if (!productData.id) {
      await redis.incr(`store:${store.id}:product_count`);
  }

  // 7. CACHE BUST
  revalidatePath('/admin/inventory');
  // If you use tags for the storefront, bust them too:
revalidatePath('/', 'layout');  
  return { success: true, productId };
}}