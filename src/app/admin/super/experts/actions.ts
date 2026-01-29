"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

// ⚠️ SERVICE ROLE KEY REQUIRED (God Mode Access)
// We use supabase-js directly to bypass any RLS middleware for these admin tasks
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, 
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// --- 1. CREATE EXPERT ACCOUNT ---
export async function createExpertUser(email: string, fullName: string) {
  // Generate a random temp password
  const tempPassword = Math.random().toString(36).slice(-8) + "Aa1!";

  // Create Auth User (Auto-verified)
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password: tempPassword,
    email_confirm: true, 
    user_metadata: { full_name: fullName, is_expert: true }
  });

  if (error) return { error: error.message };

  // Create Profile
  const { error: profileError } = await supabaseAdmin
    .from('profiles')
    .insert({
       id: data.user.id,
       email: email,
       full_name: fullName,
       role: 'expert' // Ensure your profiles table has this column or remove this line
    });

  if (profileError) console.error("Profile creation warning:", profileError);

  return { 
    success: true, 
    credentials: { email, password: tempPassword } 
  };
}

// --- 2. ASSIGN EXPERT ---
export async function assignExpert(requestId: string, storeId: string, expertEmail: string) {
  // A. Find Expert User ID
  const { data: { users }, error: userError } = await supabaseAdmin.auth.admin.listUsers();
  const expertUser = users.find(u => u.email === expertEmail);

  if (!expertUser) return { error: "Expert user not found. Please register them first." };

  // B. Add to Store Members
  const { error: linkError } = await supabaseAdmin
    .from('store_members')
    .insert({
      store_id: storeId,
      user_id: expertUser.id,
      role: 'expert'
    });

  if (linkError && !linkError.message.includes('unique constraint')) {
      return { error: linkError.message };
  }

  // C. Update Request Status
  await supabaseAdmin
    .from('expert_requests')
    .update({ status: 'assigned' })
    .eq('id', requestId);

  revalidatePath('/super-admin/experts');
  return { success: true };
}

// --- 3. REVOKE EXPERT ---
export async function revokeExpert(requestId: string, storeId: string, expertEmail: string) {
  
  // A. Find User ID
  const { data: { users } } = await supabaseAdmin.auth.admin.listUsers();
  const expertUser = users.find(u => u.email === expertEmail);
  
  if (!expertUser) return { error: "User not found" };

  // B. Remove from Store Members
  const { error } = await supabaseAdmin
    .from('store_members')
    .delete()
    .match({ store_id: storeId, user_id: expertUser.id });

  if (error) return { error: error.message };

  // C. Mark Request as Completed
  await supabaseAdmin
    .from('expert_requests')
    .update({ status: 'completed' })
    .eq('id', requestId);

  revalidatePath('/super-admin/experts');
  return { success: true };
}