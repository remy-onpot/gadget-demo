'use server';

import { createClient } from '@supabase/supabase-js'; 
import { Database } from '@/lib/database.types';

const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

// We strictly define what we accept from the client.
// Notice we REMOVED 'unit_price' and 'total' - we will calculate these.
interface OrderPayload {
  storeId: string; // Changed from slug to storeId
  customer: {
    name: string;
    email: string;
    phone: string;
    address: string;
    notes?: string;
  };
  items: {
    product_id: string; // Used for double-verification
    variant_id: string; // The source of truth for price
    variant_name?: string; // We can accept the label (e.g. "Red / L") for display
    quantity: number;
  }[];
}

export async function submitOrder(payload: OrderPayload) {
  try {
    // 1. Get Store Settings (store already validated in page.tsx)
    const { data: store, error: storeError } = await supabaseAdmin
      .from('stores')
      .select('id, settings')
      .eq('id', payload.storeId)
      .single();

    if (storeError || !store) throw new Error('Store not found');

    // 2. SECURITY FIX: Fetch Real Prices from DB
    // We do not trust the prices sent by the frontend.
    const variantIds = payload.items.map(item => item.variant_id);
    
    const { data: dbVariants, error: variantsError } = await supabaseAdmin
      .from('product_variants')
      .select(`
        id,
        price,
        sku,
        images,
        product_id,
        products (
          name,
          store_id
        )
      `)
      .in('id', variantIds);

    if (variantsError || !dbVariants) throw new Error('Failed to fetch product prices');

    // 3. Calculate Total & Verify Items
    let calculatedTotal = 0;
    const finalOrderItems = [];

    for (const clientItem of payload.items) {
      const dbItem = dbVariants.find(v => v.id === clientItem.variant_id);

      if (!dbItem) throw new Error(`Product variant not found: ${clientItem.variant_id}`);

      // Verify Store Ownership (Prevent users from ordering items from other stores)
      // @ts-ignore - Supabase types for joined relations can be tricky, verifying safely:
      const productData = dbItem.products as unknown as { name: string; store_id: string };
      
      if (productData.store_id !== store.id) {
        throw new Error(`Security Alert: Product "${productData.name}" does not belong to this store.`);
      }

      // Calculate Line Item
      const unitPrice = dbItem.price;
      const lineTotal = unitPrice * clientItem.quantity;
      calculatedTotal += lineTotal;

      // Build the secure item object
      finalOrderItems.push({
        product_id: dbItem.product_id,
        variant_id: dbItem.id,
        product_name: productData.name, 
        variant_name: clientItem.variant_name || '', // Use client label or empty
        quantity: clientItem.quantity,
        unit_price: unitPrice, // ✅ FROM DB
        sku: dbItem.sku || null,
        image_url: dbItem.images?.[0] || null
      });
    }

    // 4. Create Order (With Server-Calculated Total)
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({
        store_id: store.id,
        customer_name: payload.customer.name,
        customer_email: payload.customer.email,
        customer_phone: payload.customer.phone,
        delivery_address: payload.customer.address,
        delivery_notes: payload.customer.notes,
        total_amount: calculatedTotal, // ✅ SECURE TOTAL
        status: 'pending',
        payment_method: 'pay_on_delivery'
      })
      .select('id, created_at')
      .single();

    if (orderError) throw new Error(`Order Failed: ${orderError.message}`);

    // 5. Insert Order Items
    const itemsData = finalOrderItems.map(item => ({
      order_id: order.id,
      ...item
    }));

    const { error: itemsError } = await supabaseAdmin
      .from('order_items')
      .insert(itemsData);

    if (itemsError) throw new Error(`Items Failed: ${itemsError.message}`);

    const settings = store.settings as Record<string, any>;
    return { 
      success: true, 
      orderId: order.id, 
      whatsappPhone: settings?.whatsapp_phone || settings?.contact_phone || settings?.support_phone
    };

  } catch (error: any) {
    console.error("Order Error:", error);
    return { success: false, error: error.message };
  }
}