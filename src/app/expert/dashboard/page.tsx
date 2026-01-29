import { createClient } from "@/lib/supabase-server";
import { ExpertDashboardClient } from "@/components/expert/ExpertDashboardClient";
import { redirect } from "next/navigation";
import { Briefcase } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ExpertDashboard() {
  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  // Check if user is an expert (type assertion until migration run)
  const { data: expert } = await (supabase as any)
    .from("experts")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (!expert) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-slate-900">Access Denied</h1>
          <p className="text-slate-600">You need expert credentials to access this page.</p>
        </div>
      </div>
    );
  }

  // Fetch assigned requests for this expert
  const { data: requests } = await (supabase as any)
    .from("expert_requests")
    .select(`
      *,
      stores(name, slug)
    `)
    .eq("assigned_expert_id", expert.id)
    .order("created_at", { ascending: false });

  // Enrich requests with default values for missing escrow fields
  const enrichedRequests = (requests || []).map((req: any) => ({
    ...req,
    total_amount: req.total_amount || 0,
    platform_fee: req.platform_fee || 50,
    expert_payout: req.expert_payout || 0,
    payment_status: req.payment_status || 'unpaid',
    payment_reference: req.payment_reference || null,
    completion_proof_url: req.completion_proof_url || null,
  }));

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto p-4 md:p-10">
        {/* HEADER */}
        <div className="flex items-center gap-4 mb-10">
          <div className="bg-orange-100 p-3 rounded-xl text-orange-700">
            <Briefcase size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900">
              Welcome, {expert.name}
            </h1>
            <p className="text-slate-500">
              {expert.jobs_completed || 0} jobs completed • {expert.rating || 5}★ rating
            </p>
          </div>
        </div>

        {/* CLIENT COMPONENT */}
        <ExpertDashboardClient expert={expert as any} requests={enrichedRequests as any} />
      </div>
    </div>
  );
}
