'use server';

import { createClient } from '@/lib/supabase-server';
import { Database } from '@/lib/database.types';

// 1. DEFINE DB TYPES
type ProductRow = Database['public']['Tables']['products']['Row'];
type VariantRow = Database['public']['Tables']['product_variants']['Row'];
// Use the Insert type to validate the payload structure
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
  contactInfo: CheckoutContact, 
  cartItems: CartItemSnapshot[]
) {
  const supabase = await createClient();

  // 1. Validation
  if (!contactInfo.email || cartItems.length === 0) {
    return { success: false, message: "Email and Cart Items required" };
  }

  const totalValue = cartItems.reduce((sum, item) => {
    return sum + (item.variant.price * item.quantity);
  }, 0);

  // Prepare the JSON snapshot
  const itemsJson = cartItems.map(item => ({
    product_id: item.product.id,
    product_name: item.product.name,
    variant_id: item.variant.id,
    specs: item.variant.specs,
    price: item.variant.price,
    quantity: item.quantity,
    image: item.product.base_images?.[0] || null
  }));

  // 2. Prepare Payload (Strictly Typed)
  // We ensure 'undefined' values become 'null' or match the DB expectation
  const payload: AbandonedCheckoutInsert = {
    email: contactInfo.email,
    name: contactInfo.name || null,
    phone: contactInfo.phone || null,
    cart_items: itemsJson as unknown as Database['public']['Tables']['abandoned_checkouts']['Insert']['cart_items'], // Safe cast to DB Json type
    total_value: totalValue,
    recovered: false,
    updated_at: new Date().toISOString()
  };

  // ✅ FIX: No more 'as any'. TypeScript now validates this against database.types.ts
  const { error } = await supabase
    .from('abandoned_checkouts') 
    .upsert(payload, { onConflict: 'email' });

  if (error) {
    console.error("Failed to capture abandoned cart:", error);
    return { success: false }; 
  }

  return { success: true };
}