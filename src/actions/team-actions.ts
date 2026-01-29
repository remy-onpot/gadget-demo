"use server";

import { createClient } from "@/lib/supabase-server";
import { PLANS, PlanId } from "@/lib/plans";
import { revalidatePath } from "next/cache";
import { createClient as createAdminClient } from '@supabase/supabase-js';

// Service role client for user lookup
function getAdminClient() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

export async function inviteTeamMember(storeId: string, email: string, role: string = 'staff') {
  const supabase = await createClient();
  
  // 1. Get Current Plan
  const { data: store } = await supabase
    .from('stores')
    .select('plan_id')
    .eq('id', storeId)
    .single();

  if (!store) return { error: "Store not found" };

  const planId = (store.plan_id as PlanId) || 'starter';
  const plan = PLANS[planId];
  const maxAdmins = plan.limits.admins;

  // 2. Count Existing Team Members
  const { count } = await supabase
    .from('store_members')
    .select('*', { count: 'exact', head: true })
    .eq('store_id', storeId);

  // 3. Enforce Admin Seat Limit
  if ((count || 0) >= maxAdmins) {
    return { 
      error: `Upgrade Required: Your ${plan.label} plan is limited to ${maxAdmins} team member${maxAdmins > 1 ? 's' : ''}. Upgrade to Growth ($450) to add more staff.` 
    };
  }

  // 4. Check if user exists in auth
  const adminClient = getAdminClient();
  const { data: { users }, error: listError } = await adminClient.auth.admin.listUsers();
  
  if (listError) {
    return { error: "Failed to lookup user. Please try again." };
  }

  const existingUser = users.find(u => u.email?.toLowerCase() === email.toLowerCase());
  
  if (!existingUser) {
    return { 
      error: "User not found. Please ask them to sign up for an account first at your store's login page." 
    };
  }

  // 5. Check if already a member
  const { data: existing } = await supabase
    .from('store_members')
    .select('id')
    .eq('store_id', storeId)
    .eq('user_id', existingUser.id)
    .single();

  if (existing) {
    return { error: "This user is already a team member." };
  }

  // 6. Add to store_members
  const { error: insertError } = await supabase
    .from('store_members')
    .insert({
      store_id: storeId,
      user_id: existingUser.id,
      role: role
    });

  if (insertError) {
    console.error('Insert error:', insertError);
    return { error: "Failed to add team member. Please try again." };
  }
  
  revalidatePath('/admin/team');
  return { success: true, message: `${email} added to your team successfully!` };
}

export async function removeTeamMember(storeId: string, userId: string) {
  const supabase = await createClient();
  
  // Don't allow removing owner (check role first)
  const { data: member } = await supabase
    .from('store_members')
    .select('role')
    .eq('store_id', storeId)
    .eq('user_id', userId)
    .single();

  if (member?.role === 'owner') {
    return { error: "Cannot remove the store owner." };
  }

  const { error } = await supabase
    .from('store_members')
    .delete()
    .eq('store_id', storeId)
    .eq('user_id', userId);

  if (error) {
    return { error: "Failed to remove team member." };
  }

  revalidatePath('/admin/team');
  return { success: true };
}