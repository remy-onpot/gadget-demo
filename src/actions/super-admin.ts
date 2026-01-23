'use server';

import { createClient } from '@supabase/supabase-js';

// ✅ 1. Self-contained Admin Client (No external imports)
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

// ✅ 2. Self-contained User Client (Preserved for future use)
function getUserClient(accessToken: string) {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { 
       global: { headers: { Authorization: `Bearer ${accessToken}` } }
    }
  );
}

export async function createStoreAndUser(formData: FormData) {
  console.log("⚡ Server Action Triggered: createStoreAndUser (KYC Mode)");

  try {
    // --- A. EXTRACT DATA ---
    // Basics
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
    // We update the profile immediately so we have their details on file
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: userId,
        full_name: legalName,
        email: email,
        phone: phone,
        shipping_address: physicalAddress, // Standard field for location
        // Note: Ensure you ran the SQL to add government_id/digital_address columns,
        // otherwise, these specific lines might be ignored or cause a soft error depending on your PG settings.
        // We are passing them just in case you added them.
        // government_id: governmentId, 
        // digital_address: digitalAddress
      });

    if (profileError) {
       console.error("Profile Warning:", profileError); 
       // We don't stop execution here, as the user exists, but we log the warning.
    }

    // --- D. CREATE STORE ---
    console.log(`[Admin] Provisioning store: ${storeName}`);
    const { error: storeError } = await supabaseAdmin
      .from('stores')
      .insert({
        name: storeName,
        slug: storeSlug,
        owner_id: userId,
        plan_id: plan,
        is_active: true,
        settings: { 
           theme_color: '#f97316',
           // BACKUP: We store critical KYC info in settings JSON too, just to be safe
           kyc: {
              government_id: governmentId,
              gps_address: digitalAddress,
              physical_address: physicalAddress
           }
        }
      });

    if (storeError) {
      console.error("Store Error:", storeError);
      // Cleanup: Delete the user if store creation fails to avoid "orphan" accounts
      await supabaseAdmin.auth.admin.deleteUser(userId);
      return { error: `Store DB Error: ${storeError.message}` };
    }

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
   return { success: true };
}
export async function checkSlugAvailability(slug: string) {
  const supabaseAdmin = getAdminClient();
  
  const { data } = await supabaseAdmin
    .from('stores')
    .select('id')
    .eq('slug', slug)
    .single();

  // If we found a store, the slug is taken (available = false)
  return { available: !data };
}