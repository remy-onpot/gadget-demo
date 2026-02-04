import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase-server';
import CheckoutClient from './CheckoutClient';

export default async function CheckoutPage({ params }: { params: Promise<{ site: string }> }) {
  const resolvedParams = await params;
  const supabase = await createClient();

  // 1. Fetch store and validate it exists
  const { data: store, error: storeError } = await supabase
    .from('stores')
    .select('id, slug, settings')
    .eq('slug', resolvedParams.site)
    .single();

  if (storeError || !store) {
    return notFound();
  }

  // 2. Check if user is authenticated (optional - checkout works for guests too)
  const { data: { user } } = await supabase.auth.getUser();

  // 3. Fetch profile if authenticated
  let profile = null;
  if (user) {
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();
    
    profile = profileData;
  }

  // 4. Pass all data to client component
  const settings = (store.settings as Record<string, any> | null) || {};
  const contactPhone = settings.whatsapp_phone || settings.contact_phone || settings.support_phone || null;

  return (
    <CheckoutClient
      storeId={store.id}
      storeSlug={store.slug}
      contactPhone={contactPhone}
      user={user}
      profile={profile}
    />
  );
}