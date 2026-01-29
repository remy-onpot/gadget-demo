import { createClient } from "@/lib/supabase-server";
import { ExpertsList } from "@/components/super-admin/ExpertsList";
import { ShieldAlert } from 'lucide-react';

export const dynamic = 'force-dynamic'; // Ensure we always see new requests instantly

export default async function ExpertsPage() {
  const supabase = await createClient();
  
  // Fetch requests + Join Store Name
  // We sort by 'pending' first, then by date
  const { data: requests } = await supabase
    .from('expert_requests')
    .select('*, stores(name)')
    .order('status', { ascending: false }) // pending -> completed
    .order('created_at', { ascending: false });

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-10">
      
      {/* HEADER */}
      <div className="flex items-center gap-4 mb-10">
        <div className="bg-purple-100 p-3 rounded-xl text-purple-700">
           <ShieldAlert size={32} />
        </div>
        <div>
           <h1 className="text-3xl font-black text-slate-900">Expert Control Center</h1>
           <p className="text-slate-500">Inject agents into customer stores.</p>
        </div>
      </div>

      {/* CLIENT COMPONENT */}
      <ExpertsList requests={requests || []} />
      
    </div>
  );
}