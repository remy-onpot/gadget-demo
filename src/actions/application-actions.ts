'use server';

import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

// Admin Client for privileged operations
function getAdminClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) throw new Error('SUPABASE_SERVICE_ROLE_KEY is missing');

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceKey,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

// Generate a secure random password
function generatePassword(length = 12): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

export async function approveApplication(applicationId: string) {
  console.log(`⚡ Approving application: ${applicationId}`);
  
  try {
    const supabaseAdmin = getAdminClient();
    
    // 1. Fetch the application
    const { data: app, error: fetchError } = await supabaseAdmin
      .from('onboarding_applications')
      .select('*')
      .eq('id', applicationId)
      .single();
    
    if (fetchError || !app) {
      return { error: 'Application not found' };
    }
    
    // Security: Ensure application is in correct state
    if (app.status === 'approved') {
      return { error: 'Application already approved' };
    }

    if (app.status === 'rejected') {
      return { error: 'Cannot approve a rejected application' };
    }

    // Security: Payment must be verified before approval
    if (!app.payment_verified) {
      return { error: 'Payment must be verified before approval' };
    }

    // 2. Check if email already exists in auth
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    const emailExists = existingUsers?.users?.some(u => u.email === app.email);
    
    if (emailExists) {
      return { error: `Email ${app.email} already has an account` };
    }

    // 3. Generate password and create auth user
    const generatedPassword = generatePassword();
    
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: app.email,
      password: generatedPassword,
      email_confirm: true,
      user_metadata: { full_name: app.legal_name }
    });

    if (authError || !authData.user) {
      console.error('Auth Error:', authError);
      return { error: `Failed to create user: ${authError?.message}` };
    }

    const userId = authData.user.id;

    // 4. Create profile
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: userId,
        full_name: app.legal_name,
        email: app.email,
        phone: app.phone,
        shipping_address: app.physical_address,
      });

    if (profileError) {
      console.error('Profile Warning:', profileError);
    }

    // 5. Create store
    const { data: storeData, error: storeError } = await supabaseAdmin
      .from('stores')
      .insert({
        name: app.business_name,
        slug: app.business_slug,
        owner_id: userId,
        plan_id: app.plan_id,
        is_active: true,
        settings: {
          theme_color: '#3b82f6',
          kyc: {
            gps_address: app.digital_address,
            physical_address: app.physical_address
          }
        }
      })
      .select('id')
      .single();

    if (storeError || !storeData) {
      console.error('Store Error:', storeError);
      // Cleanup: delete the auth user we just created
      await supabaseAdmin.auth.admin.deleteUser(userId);
      return { error: `Failed to create store: ${storeError?.message}` };
    }

    // 6. Add to store_members
    const { error: memberError } = await supabaseAdmin
      .from('store_members')
      .insert({
        store_id: storeData.id,
        user_id: userId,
        role: 'owner'
      });

    if (memberError) {
      console.error('Member Warning:', memberError);
    }

    // 7. Update application status and link user_id
    const { error: updateError } = await supabaseAdmin
      .from('onboarding_applications')
      .update({ 
        status: 'approved', 
        user_id: userId,
        updated_at: new Date().toISOString()
      })
      .eq('id', applicationId);

    if (updateError) {
      console.error('Update Warning:', updateError);
    }

    // 8. Send email with credentials (using Supabase Edge Function or external service)
    // For now, we log it - in production, integrate with Resend/SendGrid
    console.log('========================================');
    console.log('📧 CREDENTIALS TO SEND:');
    console.log(`   Email: ${app.email}`);
    console.log(`   Password: ${generatedPassword}`);
    console.log(`   Store URL: nimdeshop.com/${app.business_slug}`);
    console.log('========================================');

    // Revalidate the super admin page
    revalidatePath('/admin/super');

    return { 
      success: true, 
      message: `Store created for ${app.business_name}`,
      credentials: {
        email: app.email,
        password: generatedPassword,
        storeUrl: `nimdeshop.com/${app.business_slug}`
      }
    };

  } catch (err: any) {
    console.error('Critical Error:', err);
    return { error: err.message || 'Unknown error occurred' };
  }
}

export async function rejectApplication(applicationId: string, reason: string) {
  console.log(`⚡ Rejecting application: ${applicationId}`);
  
  try {
    const supabaseAdmin = getAdminClient();

    const { error } = await supabaseAdmin
      .from('onboarding_applications')
      .update({ 
        status: 'rejected', 
        rejection_reason: reason,
        updated_at: new Date().toISOString()
      })
      .eq('id', applicationId);

    if (error) {
      return { error: error.message };
    }

    // TODO: Send rejection email to applicant

    revalidatePath('/admin/super');
    
    return { success: true };
  } catch (err: any) {
    console.error('Rejection Error:', err);
    return { error: err.message || 'Unknown error occurred' };
  }
}

export async function fetchPendingApplications() {
  const supabaseAdmin = getAdminClient();
  
  const { data, error } = await supabaseAdmin
    .from('onboarding_applications')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Fetch Error:', error);
    return [];
  }

  return data || [];
}
