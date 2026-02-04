import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import ProfileDashboard from "@/components/storefront/ProfileDashboard";

export default async function AccountPage({ params }: { params: Promise<{ site: string }> }) {
  const resolvedParams = await params;
  const supabase = await createClient();

  // 1. Get Store Context (Subdomain -> ID)
  const { data: store } = await supabase
    .from('stores')
    .select('id, settings')
    .eq('slug', resolvedParams.site)
    .single();

  if (!store) return notFound();

  // 2. Check Auth
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    // Redirect to login preserving the return URL
    redirect(`/login?next=/account`);
  }

  // 3. Fetch Profile & Orders (Server-side)
  const [profileResponse, ordersResponse] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).maybeSingle(),
    supabase.from('orders').select('*').eq('user_id', user.id).eq('store_id', store.id).order('created_at', { ascending: false })
  ]);

  // 4. Inject Theme & Render
  const themeColor = (store.settings as any)?.theme_color || '#f97316';

  return (
    <>
      <style>{`:root { --primary: ${themeColor}; }`}</style>
      <ProfileDashboard 
        initialUser={user} 
        storeId={store.id} 
        initialProfile={profileResponse.data}
        initialOrders={ordersResponse.data || []}
      />
    </>
  );
}