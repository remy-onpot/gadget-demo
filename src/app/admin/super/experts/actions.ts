"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

// ⚠️ SERVICE ROLE KEY REQUIRED (God Mode Access)
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

// --- ASSIGN EXPERT TO REQUEST ---
export async function assignExpertToRequest(requestId: string, expertId: string) {
  const { error } = await supabaseAdmin
    .from("expert_requests")
    .update({ assigned_expert_id: expertId })
    .eq("id", requestId);

  if (error) return { error: error.message };

  revalidatePath("/admin/super/experts");
  return { success: true };
}

// --- UPDATE REQUEST STATUS ---
export async function updateRequestStatus(requestId: string, newStatus: string) {
  const updates: any = { status: newStatus };

  // If completing, mark completion time
  if (newStatus === "completed") {
    updates.completed_at = new Date().toISOString();
    // Also update payment status to released
    updates.payment_status = "released_to_expert";
  }

  const { error } = await supabaseAdmin
    .from("expert_requests")
    .update(updates)
    .eq("id", requestId);

  if (error) return { error: error.message };

  // If job completed, increment expert's job count
  if (newStatus === "completed") {
    const { data: request } = await supabaseAdmin
      .from("expert_requests")
      .select("assigned_expert_id")
      .eq("id", requestId)
      .single();

    if (request?.assigned_expert_id) {
      await supabaseAdmin.rpc("increment_expert_jobs", {
        expert_id: request.assigned_expert_id,
      });
    }
  }

  revalidatePath("/admin/super/experts");
  return { success: true };
}

// --- RECORD PAYMENT ---
export async function recordPayment(requestId: string, paymentReference: string) {
  const { error } = await supabaseAdmin
    .from("expert_requests")
    .update({
      payment_status: "escrowed",
      payment_reference: paymentReference,
      status: "payment_received",
    })
    .eq("id", requestId);

  if (error) return { error: error.message };

  revalidatePath("/admin/super/experts");
  return { success: true };
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