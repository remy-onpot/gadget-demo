import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase-server';
import StoreAuthForm from '@/components/storefront/StoreAuthForm';

export async function generateMetadata({ params }: { params: { site: string } }) {
  return {
    title: `Login | ${params.site}`,
    description: 'Access your account history and manage orders.',
  };
}

export default async function LoginPage({ params }: { params: { site: string } }) {
  // ✅ FIX: 'createClient()' is async. We must await it.
  const supabase = await createClient();

  // 1. Resolve Store Identity
  const { data: store } = await supabase
    .from('stores')
    .select('id, name, settings')
    .eq('subdomain', params.site)
    .single();

  if (!store) return notFound();

  // 2. Check if already logged in -> Redirect to Account
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    redirect('/account');
  }

  // 3. Theme Setup
  // We safely cast settings to a generic object to access properties
  const settings = store.settings as Record<string, any>;
  const themeColor = settings?.theme_color || '#f97316';
  const logo = settings?.site_logo;

  return (
    <div className="min-h-screen bg-white">
      {/* Inject theme color for this specific store */}
      <style>{`:root { --primary: ${themeColor}; }`}</style>
      
      {/* Render the Client Component */}
      <StoreAuthForm storeName={store.name} storeLogo={logo} />
    </div>
  );
}