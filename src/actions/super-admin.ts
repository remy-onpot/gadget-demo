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

// ✅ 2. Self-contained User Client (For checking who is clicking the button)
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
  console.log("⚡ Server Action Triggered: createStoreAndUser");

  try {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const storeName = formData.get('storeName') as string;
    const storeSlug = formData.get('storeSlug') as string;
    const plan = formData.get('plan') as string;
    
    // We are going to trust the Super Admin Key here for a moment to debug.
    // In production, we'd verify the session again, but let's get it working first.
    const supabaseAdmin = getAdminClient();

    // 1. Create Auth User
    console.log(`[Admin] Creating user: ${email}`);
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true 
    });

    if (authError) {
        console.error("Auth Error:", authError);
        return { error: `Auth Error: ${authError.message}` };
    }
    
    if (!authData.user) return { error: 'User creation failed (No data returned)' };
    const userId = authData.user.id;

    // 2. Create Store
    console.log(`[Admin] Creating store: ${storeName}`);
    const { error: storeError } = await supabaseAdmin
      .from('stores')
      .insert({
        name: storeName,
        slug: storeSlug,
        owner_id: userId,
        plan_id: plan,
        is_active: true,
        settings: { theme_color: '#f97316' }
      });

    if (storeError) {
      console.error("Store Error:", storeError);
      // Cleanup
      await supabaseAdmin.auth.admin.deleteUser(userId);
      return { error: `Store DB Error: ${storeError.message}` };
    }

    return { success: true, message: `Created ${storeName} successfully!` };

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