import { createClient } from '@/lib/supabase-server';
import { StoreList } from '@/components/super-admin/StoreList'; 
import { PageActions } from '@/components/super-admin/PageActions';
import { PendingApplications } from '@/components/super-admin/PendingApplications';
import { fetchPendingApplications } from '@/actions/application-actions';
import { ShieldAlert, Building2, Activity, CreditCard, ClipboardList } from 'lucide-react';

export default async function SuperAdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // 🔒 STRICT Security Gate
  if (user?.email !== process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-10 text-center">
        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-4">
           <ShieldAlert className="text-red-500" size={40} />
        </div>
        <h1 className="text-3xl font-black text-slate-900 mb-2">Access Denied</h1>
        <p className="text-slate-500 max-w-md">This incident will be reported.</p>
      </div>
    );
  }

  // Fetch Stats
  const { data: stores, count } = await supabase
    .from('stores')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false });

  // Fetch pending applications
  const applications = await fetchPendingApplications();
  const pendingCount = applications.filter(a => a.status === 'pending').length;

  const activeCount = stores?.filter(s => s.is_active).length || 0;
  const growthPlanCount = stores?.filter(s => s.plan_id === 'growth').length || 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* 1. HEADER & ACTIONS */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-slate-200 pb-8">
         <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">System Overview</h1>
            <p className="text-slate-500 mt-1">Manage tenants, deployments, and billing status.</p>
         </div>
         
         <PageActions /> 
      </div>

      {/* 2. STATS ROW */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard label="Pending Apps" value={pendingCount} icon={<ClipboardList size={24} />} color="text-amber-600 bg-amber-50 border-amber-100" />
        <StatCard label="Total Ecosystems" value={count || 0} icon={<Building2 size={24} />} />
        <StatCard label="Active Status" value={activeCount} icon={<Activity size={24} />} color="text-green-600 bg-green-50 border-green-100" />
        <StatCard label="Pro Plans" value={growthPlanCount} icon={<CreditCard size={24} />} color="text-purple-600 bg-purple-50 border-purple-100" />
      </div>

      {/* 3. PENDING APPLICATIONS */}
      <PendingApplications applications={applications} />

      {/* 4. MAIN LIST (Full Width Now) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
         <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
               <Building2 size={18} className="text-slate-400" /> Tenant Registry
            </h3>
            <span className="text-xs font-bold bg-slate-200 text-slate-600 px-2 py-1 rounded">
               {stores?.length} Results
            </span>
         </div>
         <StoreList stores={stores || []} />
      </div>

    </div>
  );
}

function StatCard({ label, value, icon, color = "text-slate-600 bg-slate-50 border-slate-200" }: any) {
   return (
      <div className={`px-6 py-5 rounded-2xl border flex items-center gap-5 shadow-sm ${color} bg-white`}>
         <div className={`p-3 rounded-xl bg-slate-100`}>
            {icon}
         </div>
         <div>
            <div className="text-3xl font-black text-slate-900 leading-none">{value}</div>
            <div className="text-xs font-bold uppercase text-slate-400 mt-1">{label}</div>
         </div>
      </div>
   )
}