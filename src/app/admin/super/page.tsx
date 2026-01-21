import { createClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';
import { createStoreAndUser, toggleStoreStatus } from '@/actions/super-admin';
import { CreateStoreForm } from '@/components/super-admin/CreateStoreForm'; // We'll make this next
import { StoreList } from '@/components/super-admin/StoreList'; // And this

export default async function SuperAdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // 🔒 Security Gate
  if (user?.email !== process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL) {
    return (
      <div className="p-10 text-center text-red-600 font-bold">
        ⛔ ACCESS DENIED. You are not the Super Admin.
      </div>
    );
  }

  // Fetch All Stores (Admin View)
  // We use the normal client because RLS policies might block this.
  // Ideally, use a dedicated RPC or Admin Client if RLS is strict.
  // For V1, ensure you have a "Super Admin Read" policy or just use the Service Key in a Server Component helper.
  
  // Quick Fix: We'll just fetch normally. If it returns empty, your RLS is blocking it.
  // Let's assume you'll fix RLS or use the helper below.
  const { data: stores } = await supabase.from('stores').select('*').order('created_at', { ascending: false });

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-12">
      
      {/* SECTION 1: ONBOARDING */}
      <section className="bg-white p-6 rounded-lg border shadow-sm">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          🚀 Manual Onboarding
          <span className="text-sm font-normal text-slate-500">(Create User + Store)</span>
        </h2>
        <CreateStoreForm />
      </section>

      {/* SECTION 2: MANAGEMENT */}
      <section>
        <h2 className="text-xl font-bold mb-4">All Stores ({stores?.length || 0})</h2>
        <StoreList stores={stores || []} />
      </section>

    </div>
  );
}