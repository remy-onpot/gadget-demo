'use server';

import { createClient } from '@supabase/supabase-js'; // Direct SDK for Service Role
import { Database } from '@/lib/database.types';

// Initialize "God Mode" Client (Bypasses RLS for anonymous shoppers)
const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

// 1. DEFINE DB TYPES
type ProductRow = Database['public']['Tables']['products']['Row'];
type VariantRow = Database['public']['Tables']['product_variants']['Row'];
type AbandonedCheckoutInsert = Database['public']['Tables']['abandoned_checkouts']['Insert'];

export interface CheckoutContact {
  email: string;
  name?: string;
  phone?: string;
  address?: string;
}

export interface CartItemSnapshot {
  uniqueId: string;
  quantity: number;
  product: ProductRow;
  variant: VariantRow;
}

export async function captureAbandonedCart(
  storeSlug: string, // ✅ Added: We need to know which store this is for
  contactInfo: CheckoutContact, 
  cartItems: CartItemSnapshot[]
) {
  // 1. Validation
  if (!contactInfo.email || cartItems.length === 0 || !storeSlug) {
    return { success: false, message: "Missing required data" };
  }

  try {
    // 2. Get Store ID (Context)
    const { data: store, error: storeError } = await supabaseAdmin
      .from('stores')
      .select('id')
      .eq('slug', storeSlug)
      .single();

    if (storeError || !store) throw new Error('Store context not found');

    // 3. Calculate Totals & Snapshot
    const totalValue = cartItems.reduce((sum, item) => {
      return sum + (item.variant.price * item.quantity);
    }, 0);

    const itemsJson = cartItems.map(item => ({
      product_id: item.product.id,
      product_name: item.product.name,
      variant_id: item.variant.id,
      specs: item.variant.specs,
      price: item.variant.price,
      quantity: item.quantity,
      image: item.product.base_images?.[0] || null
    }));

    // 4. Prepare Payload (Strictly Typed)
    const payload: AbandonedCheckoutInsert = {
      store_id: store.id, // ✅ Critical: Assign to specific store
      email: contactInfo.email,
      name: contactInfo.name || null,
      phone: contactInfo.phone || null,
      cart_items: itemsJson as unknown as Database['public']['Tables']['abandoned_checkouts']['Insert']['cart_items'],
      total_value: totalValue,
      recovered: false,
      updated_at: new Date().toISOString()
    };

    // 5. Upsert based on Store + Email
    // Note: This requires the Unique Index created in Step 1
    const { error } = await supabaseAdmin
      .from('abandoned_checkouts') 
      .upsert(payload, { onConflict: 'store_id, email' });

    if (error) {
      console.error("Failed to capture abandoned cart:", error);
      return { success: false }; 
    }

    return { success: true };

  } catch (err) {
    console.error("Server Error in Sniper:", err);
    return { success: false };
  }
}