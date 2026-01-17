"use client";

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Database } from '@/lib/database.types'; // ✅ Import DB Types
import { Users, ShieldAlert, Trash2, Mail, Shield } from 'lucide-react';
import { useAdminRole } from '@/hooks/useAdminRole';
import { toast } from 'sonner';

// 1. DEFINE ROW TYPE
type TeamMember = Database['public']['Tables']['admin_roles']['Row'];

export default function TeamPage() {
  const { isOwner, loading: roleLoading } = useAdminRole();
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchTeam();
  }, []);

  const fetchTeam = async () => {
    try {
        const { data, error } = await supabase
            .from('admin_roles')
            .select('*')
            .order('created_at', { ascending: false });
            
        if (error) throw error;
        if (data) setTeam(data);
    } catch (e) {
        console.error(e);
        toast.error("Failed to load team members");
    } finally {
        setLoading(false);
    }
  };

  // 2. PROTECTED ROUTE CHECK
  if (roleLoading) return <div className="p-10 text-center text-slate-400">Verifying access...</div>;

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
          </div>
          
          <button 
            onClick={() => toast.info("To add staff, invite them via your Supabase Auth Dashboard.")}
            className="bg-slate-900 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-slate-800 transition shadow-lg flex items-center gap-2"
          >
            <Mail size={16} /> Invite Member
          </button>
       </div>

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
                          <div className="font-bold text-slate-900">{member.name || 'Unknown User'}</div>
                          <div className="text-xs text-slate-400 font-mono">{member.id.slice(0, 8)}...</div>
                      </td>
                      <td className="px-6 py-4">
                         <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                             member.role === 'owner' 
                                ? 'bg-purple-100 text-purple-700 border border-purple-200' 
                                : 'bg-blue-100 text-blue-700 border border-blue-200'
                         }`}>
                            {member.role === 'owner' ? <Shield size={12}/> : <Users size={12}/>}
                            {member.role}
                         </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">
                          {member.role === 'owner' ? 'Full Access' : 'Inventory & Orders'}
                      </td>
                      <td className="px-6 py-4 text-right">
                         {member.role !== 'owner' && (
                             <button 
                               onClick={() => toast.error("Delete feature disabled in demo.")}
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