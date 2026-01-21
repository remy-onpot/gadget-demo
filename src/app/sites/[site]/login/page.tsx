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
  const supabase = await createClient();

  // 1. Resolve Store Identity
  const { data: store } = await supabase
    .from('stores')
    .select('id, name, settings')
    .eq('slug', params.site)
    .single();

  if (!store) return notFound();

  // 2. Check if already logged in -> Redirect to Account
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    redirect('/account');
  }

  // 3. Theme Setup
  const settings = store.settings as any;
  const themeColor = settings?.theme_color || '#f97316';
  const logo = settings?.site_logo;

  return (
    <>
      <style>{`:root { --primary: ${themeColor}; }`}</style>
      <StoreAuthForm storeName={store.name} storeLogo={logo} />
    </>
  );
}