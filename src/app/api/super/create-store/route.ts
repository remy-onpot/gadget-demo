import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createClient as createServerClient } from '@/lib/supabase-server';

// 1. Setup the "God Mode" Client
const getAdminClient = () => {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) throw new Error('Missing Service Role Key');
  
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceKey,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
};

export async function POST(req: Request) {
  try {
    // 2. Verify Super Admin (Security Check)
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user?.email !== process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // 3. Parse Data
    const body = await req.json();
    const { email, password, storeName, storeSlug, plan } = body;

    const supabaseAdmin = getAdminClient();

    // 4. Create User
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    });

    if (authError) return NextResponse.json({ error: authError.message }, { status: 400 });
    
    // 5. Create Store
    const userId = authData.user!.id;
    const { error: storeError } = await supabaseAdmin
      .from('stores')
      .insert({
        name: storeName,
        slug: storeSlug,
        owner_id: userId,
        plan_id: plan,
        is_active: true,
        settings: { theme_color: '#f97316' }
      });

    if (storeError) {
      // Cleanup user if store fails
      await supabaseAdmin.auth.admin.deleteUser(userId);
      return NextResponse.json({ error: storeError.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: 'Store created successfully!' });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}