'use server';

import { createClient } from '@supabase/supabase-js'; 
import { Database } from '@/lib/database.types';

const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

interface OrderPayload {
  slug: string;
  customer: {
    name: string;
    email: string; // Ensure this is passed from the form
    phone: string;
    address: string;
    notes?: string;
  };
  items: {
    product_id: string;
    variant_id: string;
    product_name: string;
    variant_name: string;
    quantity: number;
    unit_price: number;
    // NEW FIELDS FOR SNAPSHOT
    sku?: string;
    image_url?: string;
  }[];
  total: number;
}

export async function submitOrder(payload: OrderPayload) {
  try {
    // 1. Get Store ID & Settings
    const { data: store, error: storeError } = await supabaseAdmin
      .from('stores')
      .select('id, settings')
      .eq('slug', payload.slug)
      .single();

    if (storeError || !store) throw new Error('Store not found');

    // 2. Create Order
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({
        store_id: store.id,
        customer_name: payload.customer.name,
        customer_email: payload.customer.email, // Now supported by DB
        customer_phone: payload.customer.phone,
        delivery_address: payload.customer.address,
        delivery_notes: payload.customer.notes,
        total_amount: payload.total,
        status: 'pending',
        payment_method: 'pay_on_delivery'
      })
      .select('id, created_at')
      .single();

    if (orderError) throw new Error(`Order Failed: ${orderError.message}`);

    // 3. Create Order Items (With Snapshot Data)
    const itemsData = payload.items.map(item => ({
      order_id: order.id,
      product_id: item.product_id,
      variant_id: item.variant_id,
      product_name: item.product_name,
      variant_name: item.variant_name,
      quantity: item.quantity,
      unit_price: item.unit_price,
      sku: item.sku || null,            // Snapshot SKU
      image_url: item.image_url || null // Snapshot Image
    }));

    const { error: itemsError } = await supabaseAdmin
      .from('order_items')
      .insert(itemsData);

    if (itemsError) throw new Error(`Items Failed: ${itemsError.message}`);

    const settings = store.settings as Record<string, any>;
    return { 
      success: true, 
      orderId: order.id, 
      whatsappPhone: settings.whatsapp_phone || settings.support_phone 
    };

  } catch (error: any) {
    console.error("Order Error:", error);
    return { success: false, error: error.message };
  }
}