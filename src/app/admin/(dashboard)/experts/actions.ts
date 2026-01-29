"use server";

import { createClient } from "@/lib/supabase-server";
import { revalidatePath } from "next/cache";

// Fetch active experts for marketplace
export async function fetchActiveExperts() {
  const supabase = await createClient();
  
  // Type assertion needed until DB types are regenerated after migration
  const { data, error } = await (supabase as any)
    .from("experts")
    .select("id, name, bio, specialties, avatar_url, jobs_completed, rating")
    .eq("status", "active")
    .order("jobs_completed", { ascending: false });

  if (error) {
    console.error("Error fetching experts:", error);
    return [];
  }

  return data;
}

export async function submitExpertRequest(formData: FormData) {
  const supabase = await createClient();
  
  // 1. Get User
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  // 2. Extract Data
  const storeId = formData.get("storeId") as string;
  const serviceType = formData.get("serviceType") as string;
  const contactPhone = formData.get("contactPhone") as string;
  const selectedExpertId = formData.get("selectedExpertId") as string | null;
  const totalAmount = formData.get("totalAmount") as string | null;
  const platformFee = formData.get("platformFee") as string | null;

  if (!storeId || !contactPhone) return { error: "Missing required fields" };

  // 3. Validate Ghana Phone Format (10 digits)
  const cleanPhone = contactPhone.replace(/\D/g, '');
  if (cleanPhone.length !== 10 || !cleanPhone.match(/^[0-9]{10}$/)) {
    return { error: "Invalid phone number. Please enter 10 digits (e.g., 0241234567)" };
  }

  // 4. Get store name for reference
  const { data: store } = await supabase
    .from('stores')
    .select('name, slug')
    .eq('id', storeId)
    .single();

  // 5. Calculate expert payout if amounts provided
  const total = totalAmount ? parseFloat(totalAmount) : 0;
  const fee = platformFee ? parseFloat(platformFee) : 50;
  const payout = total - fee;

  // 6. Save Request to DB with escrow fields
  const { error } = await supabase.from('expert_requests').insert({
    store_id: storeId,
    store_name: store?.name || 'Unknown Store',
    store_slug: store?.slug || '',
    requester_id: user.id,
    service_type: serviceType,
    contact_phone: `+233${cleanPhone}`,
    selected_expert_id: selectedExpertId || null,
    total_amount: total,
    platform_fee: fee,
    expert_payout: payout,
    status: 'pending',
    payment_status: 'unpaid',
  });

  if (error) {
      console.error(error);
      return { error: "Failed to submit request. Please try again." };
  }

  // 7. Revalidate
  revalidatePath('/admin/experts');
  
  // TODO: Optional Slack/Discord webhook notification:
  // await fetch('YOUR_WEBHOOK_URL', { 
  //   method: 'POST', 
  //   body: JSON.stringify({ text: `New Expert Request from ${store?.name}` })
  // });
  
  return { success: true };
}
