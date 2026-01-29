"use server";

import { createClient } from "@/lib/supabase-server";
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { revalidatePath } from "next/cache";

function getAdminClient() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

export async function createExpert(formData: FormData) {
  const supabase = await createClient();
  
  // Verify super admin access (you should add proper super admin check)
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const name = formData.get("name") as string;
  const bio = formData.get("bio") as string;
  const specialties = formData.getAll("specialties") as string[];
  const avatarUrl = formData.get("avatar_url") as string;

  if (!email || !password || !name || specialties.length === 0) {
    return { error: "Missing required fields" };
  }

  try {
    // 1. Create auth user
    const adminClient = getAdminClient();
    const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { role: 'expert', full_name: name }
    });

    if (authError || !authData.user) {
      return { error: authError?.message || "Failed to create user" };
    }

    // 2. Create expert profile (type assertion until migration run)
    const { error: expertError } = await (supabase as any).from('experts').insert({
      user_id: authData.user.id,
      name,
      bio,
      specialties,
      avatar_url: avatarUrl || null,
      status: 'active'
    });

    if (expertError) {
      // Rollback: delete the auth user if expert creation fails
      await adminClient.auth.admin.deleteUser(authData.user.id);
      return { error: expertError.message };
    }

    revalidatePath('/admin/super/experts');
    return { success: true };
  } catch (e: any) {
    console.error('Failed to create expert:', e);
    return { error: e.message || "Failed to create expert" };
  }
}

export async function updateExpertStatus(expertId: string, status: string) {
  const supabase = await createClient();
  
  // Type assertion until migration run
  const { error } = await (supabase as any)
    .from('experts')
    .update({ status })
    .eq('id', expertId);

  if (error) return { error: error.message };

  revalidatePath('/admin/super/experts');
  return { success: true };
}

export async function fetchExperts() {
  const supabase = await createClient();
  
  // Type assertion until migration run
  const { data, error } = await (supabase as any)
    .from('experts')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return { error: error.message, experts: null };
  return { success: true, experts: data };
}
