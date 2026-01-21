'use server';

import { createClient } from '@/lib/supabase-server';
import { revalidatePath } from 'next/cache';

export async function submitReview(storeId: string, productId: string, rating: number, comment: string) {
  const supabase = await createClient();
  
  // 1. Auth Check
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("You must be logged in to review.");

  // 2. VERIFICATION LOGIC 🕵️‍♂️
  // Check if this user actually has a 'completed' order for this product
  const { data: purchase } = await supabase
    .from('order_items')
    .select('id, orders!inner(status, user_id)')
    .eq('product_id', productId)
    .eq('orders.user_id', user.id)
    .eq('orders.status', 'completed') // Only completed orders count
    .limit(1)
    .maybeSingle();

  const isVerified = !!purchase;

  // 3. Insert Review
  const { error } = await supabase
    .from('reviews')
    .insert({
      store_id: storeId,
      product_id: productId,
      user_id: user.id,
      rating,
      comment,
      is_verified_purchase: isVerified
    });

  if (error) throw new Error(error.message);

  revalidatePath(`/product/${productId}`); // Refresh page to show new review
  return { success: true, isVerified };
}