'use server'

import { createClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'
import { PLANS, PlanId } from '@/lib/plans'

export async function saveProduct360Set(
  storeId: string,
  productId: string, 
  frameUrls: string[]
) {
  const supabase = await createClient()

  try {
    // 0. PLAN LIMIT CHECK (Storage Bomb Prevention 💣🚫)
    // Check for existing set first
    const { data: existingSet } = await supabase
      .from('product_360_sets')
      .select('id')
      .eq('product_id', productId)
      .single()
    
    // Only enforce limits for NEW 360 sets (not updates)
    if (!existingSet) {
      // A. Get store's plan
      const { data: store } = await supabase
        .from('stores')
        .select('plan_id')
        .eq('id', storeId)
        .single()
      
      if (!store) throw new Error('Store not found')
      
      const planId = (store.plan_id as PlanId) || 'starter'
      const plan = PLANS[planId]
      const max360Products = plan.limits.products_360
      
      // B. Count existing 360 products for this store
      const { count } = await supabase
        .from('product_360_sets')
        .select('*', { count: 'exact', head: true })
        .eq('store_id', storeId)
      
      // C. Enforce the limit
      if ((count || 0) >= max360Products) {
        throw new Error(
          `360° Limit Reached: Your ${plan.label} plan allows ${max360Products} products with 360 views. ` +
          `Upgrade to ${planId === 'starter' ? 'Growth ($450)' : 'Pro ($1,200)'} for more.`
        )
      }
    }

    // 1. Continue with existing logic

    let error;

    if (existingSet) {
      // Update
      const { error: updateError } = await supabase
        .from('product_360_sets')
        .update({ 
          frame_urls: frameUrls,
          // created_at is ignored on update
        })
        .eq('id', existingSet.id)
        .eq('store_id', storeId) // Security check
      error = updateError
    } else {
      // Insert
      const { error: insertError } = await supabase
        .from('product_360_sets')
        .insert({
          store_id: storeId,
          product_id: productId,
          frame_urls: frameUrls
        })
      error = insertError
    }

    if (error) throw error

    revalidatePath(`/dashboard/sites/${storeId}/products`) 
    return { success: true }
    
  } catch (error: any) {
    console.error('Error saving 360 set:', error)
    return { success: false, error: error.message }
  }
}