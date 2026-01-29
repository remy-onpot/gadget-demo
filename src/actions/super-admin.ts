'use server';

import { createClient } from '@supabase/supabase-js';
import { revalidateTag } from 'next/cache'; // ✅ Added for cache clearing

// ✅ 1. Self-contained Admin Client
function getAdminClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) throw new Error('SUPABASE_SERVICE_ROLE_KEY is missing');

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );
}

export async function createStoreAndUser(formData: FormData) {
  console.log("⚡ Server Action Triggered: createStoreAndUser (KYC Mode)");

  try {
    // --- A. EXTRACT DATA ---
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const storeName = formData.get('storeName') as string;
    const storeSlug = formData.get('storeSlug') as string;
    const plan = formData.get('plan') as string;

    // KYC / Legal Identity
    const legalName = formData.get('legalName') as string;
    const phone = formData.get('phone') as string;
    const governmentId = formData.get('governmentId') as string;
    const digitalAddress = formData.get('digitalAddress') as string;
    const physicalAddress = formData.get('physicalAddress') as string;
    
    const supabaseAdmin = getAdminClient();

    // --- B. CREATE AUTH USER ---
    console.log(`[Admin] Creating identity for: ${email}`);
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: legalName } 
    });

    if (authError) {
        console.error("Auth Error:", authError);
        return { error: `Auth Error: ${authError.message}` };
    }
    
    if (!authData.user) return { error: 'User creation failed (No data returned)' };
    const userId = authData.user.id;

    // --- C. UPSERT PROFILE (KYC STEP) ---
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: userId,
        full_name: legalName,
        email: email,
        phone: phone,
        shipping_address: physicalAddress, 
      });

    if (profileError) {
       console.error("Profile Warning:", profileError); 
    }

    // --- D. CREATE STORE ---
    console.log(`[Admin] Provisioning store: ${storeName}`);
    const { data: storeData, error: storeError } = await supabaseAdmin
      .from('stores')
      .insert({
        name: storeName,
        slug: storeSlug,
        owner_id: userId, // Legacy reference (keep for safety)
        plan_id: plan,
        is_active: true,
        settings: { 
           theme_color: '#f97316',
           kyc: {
              government_id: governmentId,
              gps_address: digitalAddress,
              physical_address: physicalAddress
           }
        }
      })
      .select('id') // Return ID for next step
      .single();

    if (storeError || !storeData) {
      console.error("Store Error:", storeError);
      await supabaseAdmin.auth.admin.deleteUser(userId); // Cleanup
      return { error: `Store DB Error: ${storeError?.message}` };
    }

    // --- E. ✅ CRITICAL: ADD TO STORE MEMBERS ---
    // This ensures they work with the new "Expert" system permissions
    const { error: memberError } = await supabaseAdmin
        .from('store_members')
        .insert({
            store_id: storeData.id,
            user_id: userId,
            role: 'owner'
        });

    if (memberError) {
        console.error("Member Error:", memberError);
        // We don't fail here, but we log it. You can manually fix via SQL if needed.
    }

    // --- F. CLEANUP & CACHE ---
    // Clear cache so the new store appears in your dashboard list immediately
    revalidateTag('stores-list', 'default'); 

    return { success: true, message: `Ecosystem deployed for ${legalName}!` };

  } catch (err: any) {
    console.error("Critical Failure:", err);
    return { error: err.message || "Unknown Server Error" };
  }
}

export async function toggleStoreStatus(storeId: string, isActive: boolean) {
   const supabaseAdmin = getAdminClient();
   const { error } = await supabaseAdmin
     .from('stores')
     .update({ is_active: isActive })
     .eq('id', storeId);

   if (error) return { error: error.message };
   
   // Clear cache so the status update reflects on the storefront
   revalidateTag(`store-data-${storeId}`, 'default');
   
   return { success: true };
}

export async function checkSlugAvailability(slug: string) {
  const supabaseAdmin = getAdminClient();
  
  const { data } = await supabaseAdmin
    .from('stores')
    .select('id')
    .eq('slug', slug)
    .single();

  return { available: !data };
}