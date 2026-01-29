import { createClient } from "@/lib/supabase-server";
import { ExpertsManagement } from "@/components/super-admin/ExpertsManagement";
import { ShieldAlert, Users } from 'lucide-react';
import { fetchExperts } from "@/actions/expert-actions";

export const dynamic = 'force-dynamic';

export default async function ExpertsPage() {
  const supabase = await createClient();
  
  // Fetch all experts
  const { experts, error: expertsError } = await fetchExperts();
  
  // Fetch all expert requests with store info
  // Note: expert joins won't work until migration run, so we fetch separately
  const { data: requests } = await (supabase as any)
    .from('expert_requests')
    .select(`
      *,
      stores(name, slug)
    `)
    .order('status', { ascending: false })
    .order('created_at', { ascending: false });

  // Manually attach expert names if experts exist
  const enrichedRequests = (requests || []).map((req: any) => ({
    ...req,
    total_amount: req.total_amount || 0,
    platform_fee: req.platform_fee || 50,
    expert_payout: req.expert_payout || 0,
    payment_status: req.payment_status || 'unpaid',
    payment_reference: req.payment_reference || null,
    selected_expert: experts?.find((e: any) => e.id === req.selected_expert_id) || null,
    assigned_expert: experts?.find((e: any) => e.id === req.assigned_expert_id) || null,
  }));

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-10">
      
      {/* HEADER */}
      <div className="flex items-center gap-4 mb-10">
        <div className="bg-purple-100 p-3 rounded-xl text-purple-700">
           <ShieldAlert size={32} />
        </div>
        <div>
           <h1 className="text-3xl font-black text-slate-900">Expert Control Center</h1>
           <p className="text-slate-500">Train experts and manage customer requests with escrow payments.</p>
        </div>
      </div>

      {/* MANAGEMENT INTERFACE */}
      <ExpertsManagement 
        experts={experts || []} 
        requests={enrichedRequests as any} 
      />
      
    </div>
  );
}