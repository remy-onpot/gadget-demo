"use client";

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAdminData } from '@/hooks/useAdminData';
import { Database } from '@/lib/database.types';
import { Users, ShieldAlert, Trash2, Mail, Shield, X, UserPlus } from 'lucide-react';
import { useAdminRole } from '@/hooks/useAdminRole';
import { toast } from 'sonner';
import { inviteTeamMember, removeTeamMember } from '@/actions/team-actions';
import { fetchTeamMembers } from '@/actions/team-fetch-actions';
import { PLANS, PlanId } from '@/lib/plans';

type TeamMember = {
  id: string;
  user_id: string;
  role: string | null;
  created_at: string | null;
  email: string;
  full_name: string | null;
};

export default function TeamPage() {
  const { storeId, loading: authLoading } = useAdminData();
  const { isOwner, loading: roleLoading } = useAdminRole();
  
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('staff');
  const [submitting, setSubmitting] = useState(false);
  const [planId, setPlanId] = useState<PlanId>('starter');
  
  useEffect(() => {
    if (!storeId) return;
    fetchTeam();
    fetchPlan();
  }, [storeId]);

  const fetchPlan = async () => {
    if (!storeId) return;
    const { data } = await supabase
      .from('stores')
      .select('plan_id')
      .eq('id', storeId)
      .single();
    
    if (data?.plan_id) setPlanId(data.plan_id as PlanId);
  };

  const fetchTeam = async () => {
    if (!storeId) return;
    
    try {
        const result = await fetchTeamMembers(storeId);
        
        if (result.success && result.data) {
          setTeam(result.data);
        } else {
          toast.error(result.error || "Failed to load team");
        }
    } catch (e) {
        console.error(e);
        toast.error("Failed to load team members");
    } finally {
        setLoading(false);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeId || !inviteEmail.trim()) return;
    
    setSubmitting(true);
    const result = await inviteTeamMember(storeId, inviteEmail.trim(), inviteRole);
    setSubmitting(false);
    
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(result.message || 'Team member added!');
      setShowInviteModal(false);
      setInviteEmail('');
      fetchTeam();
    }
  };

  const handleRemove = async (userId: string, memberEmail: string) => {
    if (!storeId) return;
    if (!confirm(`Remove ${memberEmail} from your team?`)) return;
    
    const result = await removeTeamMember(storeId, userId);
    
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success('Team member removed');
      fetchTeam();
    }
  };

  const plan = PLANS[planId];
  const seatLimit = plan.limits.admins;
  const seatsUsed = team.length;

  // 2. PROTECTED ROUTE CHECK
  if (authLoading || roleLoading) return <div className="p-10 text-center text-slate-400">Verifying access...</div>;

  if (!isOwner) {
      return (
          <div className="flex flex-col items-center justify-center h-[60vh] text-center">
              <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6">
                <ShieldAlert size={40} className="text-red-500"/>
              </div>
              <h1 className="text-2xl font-black text-slate-900">Access Denied</h1>
              <p className="text-slate-500 mt-2 max-w-sm mx-auto">
                  Only the Business Owner can manage staff permissions. Please contact your administrator.
              </p>
          </div>
      )
  }

  return (
    <div className="max-w-4xl mx-auto pb-20">
       <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
                <Users className="text-blue-600"/> Team Management
            </h1>
            <p className="text-slate-500 mt-1">Control who can access your admin dashboard.</p>
            
            {/* Seat Usage Indicator */}
            <div className="mt-3 flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm">
                <span className="font-bold text-slate-700">{seatsUsed}/{seatLimit}</span>
                <span className="text-slate-500">seats used</span>
              </div>
              <div className="flex-1 max-w-xs h-2 bg-slate-200 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all ${
                    seatsUsed >= seatLimit ? 'bg-red-500' : 'bg-blue-500'
                  }`}
                  style={{ width: `${(seatsUsed / seatLimit) * 100}%` }}
                />
              </div>
            </div>
          </div>
          
          <button 
            onClick={() => setShowInviteModal(true)}
            disabled={seatsUsed >= seatLimit}
            className="bg-slate-900 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-slate-800 transition shadow-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <UserPlus size={16} /> Add Member
          </button>
       </div>

       {/* Invite Modal */}
       {showInviteModal && (
         <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
           <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
             <div className="flex items-center justify-between mb-4">
               <h2 className="text-xl font-bold text-slate-900">Add Team Member</h2>
               <button onClick={() => setShowInviteModal(false)} className="text-slate-400 hover:text-slate-600">
                 <X size={20} />
               </button>
             </div>
             
             <form onSubmit={handleInvite} className="space-y-4">
               <div>
                 <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
                 <input
                   type="email"
                   value={inviteEmail}
                   onChange={(e) => setInviteEmail(e.target.value)}
                   placeholder="user@example.com"
                   required
                   className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                 />
                 <p className="text-xs text-slate-500 mt-1">User must have an existing account</p>
               </div>
               
               <div>
                 <label className="block text-sm font-bold text-slate-700 mb-2">Role</label>
                 <select
                   value={inviteRole}
                   onChange={(e) => setInviteRole(e.target.value)}
                   className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                 >
                   <option value="staff">Staff</option>
                   <option value="manager">Manager</option>
                 </select>
               </div>
               
               <div className="flex gap-3 pt-2">
                 <button
                   type="button"
                   onClick={() => setShowInviteModal(false)}
                   className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition"
                 >
                   Cancel
                 </button>
                 <button
                   type="submit"
                   disabled={submitting}
                   className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition disabled:opacity-50"
                 >
                   {submitting ? 'Adding...' : 'Add Member'}
                 </button>
               </div>
             </form>
           </div>
         </div>
       )}

       <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full text-left">
             <thead className="bg-slate-50 text-xs font-bold text-slate-500 uppercase border-b border-gray-200">
                <tr>
                   <th className="px-6 py-4">Name</th>
                   <th className="px-6 py-4">Role</th>
                   <th className="px-6 py-4">Access Level</th>
                   <th className="px-6 py-4 text-right">Actions</th>
                </tr>
             </thead>
             <tbody className="divide-y divide-gray-100">
                {team.map((member) => (
                   <tr key={member.id} className="hover:bg-slate-50/50 transition">
                      <td className="px-6 py-4">
                          <div className="font-bold text-slate-900">{member.full_name || 'Unknown User'}</div>
                          <div className="text-xs text-slate-400">{member.email}</div>
                      </td>
                      <td className="px-6 py-4">
                         <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                             member.role === 'owner' 
                                ? 'bg-purple-100 text-purple-700 border border-purple-200' 
                                : member.role === 'manager'
                                ? 'bg-green-100 text-green-700 border border-green-200'
                                : 'bg-blue-100 text-blue-700 border border-blue-200'
                         }`}>
                            {member.role === 'owner' ? <Shield size={12}/> : <Users size={12}/>}
                            {member.role}
                         </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">
                          {member.role === 'owner' ? 'Full Access' : member.role === 'manager' ? 'Products & Orders' : 'Limited Access'}
                      </td>
                      <td className="px-6 py-4 text-right">
                         {member.role !== 'owner' && (
                             <button 
                               onClick={() => handleRemove(member.user_id, member.email)}
                               className="text-slate-400 hover:text-red-600 transition p-2 hover:bg-red-50 rounded-lg"
                               title="Remove User"
                             >
                                <Trash2 size={18}/>
                             </button>
                         )}
                      </td>
                   </tr>
                ))}
                
                {team.length === 0 && !loading && (
                    <tr>
                        <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                            No team members found.
                        </td>
                    </tr>
                )}
             </tbody>
          </table>
       </div>
    </div>
  );
}