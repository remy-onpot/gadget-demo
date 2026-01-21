import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";

export async function getActiveStore() {
  const supabase = await createClient();
  
  // 1. Get Logged In User
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/admin/login');
  }

  // 2. Find the Store they own
  // (In V1, we assume 1 User = 1 Store)
  const { data: store } = await supabase
    .from('stores')
    .select('*')
    .eq('owner_id', user.id)
    .single();

  if (!store) {
    // If they have an account but no store, maybe send them to a "Create Store" flow?
    // For now, just error out or return null
    return null;
  }

  return store;
}