import { getActiveStore } from "@/lib/services/admin-auth";
import { createClient } from "@/lib/supabase-server";

export default async function AdminDebugPage() {
  const supabase = await createClient();
  
  // 1. Get Raw User (Who is logged in?)
  const { data: { user } } = await supabase.auth.getUser();

  // 2. Get Store (What do they own?)
  const store = await getActiveStore();

  return (
    <div className="p-10 space-y-6">
      <h1 className="text-2xl font-bold">Admin Connection Debugger</h1>
      
      <div className="p-4 border rounded bg-slate-50">
        <h2 className="font-bold text-slate-700">1. Authentication</h2>
        <p><strong>User ID:</strong> {user?.id || "Not Logged In"}</p>
        <p><strong>Email:</strong> {user?.email}</p>
      </div>

      <div className="p-4 border rounded bg-slate-50">
        <h2 className="font-bold text-slate-700">2. Store Connection</h2>
        {store ? (
          <>
            <p className="text-green-600 font-bold">✅ Connected</p>
            <p><strong>Store Name:</strong> {store.name}</p>
            <p><strong>Store ID:</strong> {store.id}</p>
            <p><strong>Store Slug:</strong> {store.slug}</p>
          </>
        ) : (
          <>
            <p className="text-red-600 font-bold">❌ No Store Found</p>
            <p className="text-sm text-slate-500">
              This user is logged in, but their ID ({user?.id}) is not listed in the "owner_id" column of the "stores" table.
            </p>
          </>
        )}
      </div>
    </div>
  );
}