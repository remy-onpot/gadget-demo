"use client";

import React, { useState } from 'react';
import { assignExpert, revokeExpert } from '@/app/admin/super/experts/actions';
import { 
  Users, CheckCircle, Clock, ShieldAlert, ArrowRight, UserMinus, UserPlus 
} from 'lucide-react';
import { toast } from 'sonner';

export const ExpertsList = ({ requests }: { requests: any[] }) => {
  const [expertEmail, setExpertEmail] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const handleAssign = async (req: any) => {
    if (!expertEmail) return toast.error("Enter expert email");
    setIsPending(true);

    const res = await assignExpert(req.id, req.store_id, expertEmail);
    
    if (res.success) {
      toast.success("Expert Injected into Store!");
      setSelectedRequest(null);
      setExpertEmail('');
    } else {
      toast.error(res.error || "Failed to assign");
    }
    setIsPending(false);
  };

  const handleRevoke = async (req: any) => {
    if (!confirm("Is the job done? This will remove the expert.")) return;
    setIsPending(true);

    const emailToRemove = prompt("Confirm Expert Email to remove:"); 
    if(!emailToRemove) { setIsPending(false); return; }

    const res = await revokeExpert(req.id, req.store_id, emailToRemove);
    
    if (res.success) {
      toast.success("Access Revoked. Job Closed.");
    } else {
      toast.error(res.error || "Failed to revoke");
    }
    setIsPending(false);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500 font-bold border-b border-slate-100">
            <tr>
              <th className="p-5">Client Store</th>
              <th className="p-5">Service Needed</th>
              <th className="p-5">Contact</th>
              <th className="p-5">Status</th>
              <th className="p-5">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {requests.length === 0 && (
                <tr>
                    <td colSpan={5} className="p-10 text-center text-slate-400">No requests found.</td>
                </tr>
            )}
            {requests.map((req) => (
              <tr key={req.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="p-5 font-medium text-slate-900">
                   {req.stores?.name || "Unknown Store"} <br/>
                   <span className="text-xs text-slate-400 font-mono">{req.store_id.slice(0, 8)}...</span>
                </td>
                <td className="p-5">
                   <span className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded text-xs font-bold uppercase">
                      {req.service_type}
                   </span>
                </td>
                <td className="p-5 font-mono text-slate-600">
                   {req.contact_phone}
                </td>
                <td className="p-5">
                   {req.status === 'pending' && <span className="text-orange-500 flex items-center gap-1 font-bold text-xs"><Clock size={14}/> Pending</span>}
                   {req.status === 'assigned' && <span className="text-blue-500 flex items-center gap-1 font-bold text-xs"><Users size={14}/> In Progress</span>}
                   {req.status === 'completed' && <span className="text-green-500 flex items-center gap-1 font-bold text-xs"><CheckCircle size={14}/> Done</span>}
                </td>
                <td className="p-5">
                   {req.status === 'pending' ? (
                      <div className="flex items-center gap-2">
                         {selectedRequest === req.id ? (
                            <div className="flex items-center gap-2 animate-in slide-in-from-right-2">
                               <input 
                                  className="border border-slate-300 rounded px-2 py-1.5 w-40 text-xs outline-none focus:border-indigo-500 transition-all"
                                  placeholder="Expert Email..."
                                  value={expertEmail}
                                  onChange={e => setExpertEmail(e.target.value)}
                                  autoFocus
                               />
                               <button 
                                  onClick={() => handleAssign(req)}
                                  disabled={isPending}
                                  className="bg-slate-900 text-white p-1.5 rounded hover:bg-slate-800 disabled:opacity-50"
                               >
                                  <ArrowRight size={14}/>
                               </button>
                            </div>
                         ) : (
                            <button 
                               onClick={() => setSelectedRequest(req.id)}
                               className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 hover:bg-indigo-700 shadow-sm hover:shadow"
                            >
                               <UserPlus size={14}/> Assign
                            </button>
                         )}
                      </div>
                   ) : req.status === 'assigned' ? (
                      <button 
                         onClick={() => handleRevoke(req)}
                         disabled={isPending}
                         className="bg-white border border-red-200 text-red-600 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 hover:bg-red-50 disabled:opacity-50"
                      >
                         <UserMinus size={14}/> Revoke Access
                      </button>
                   ) : (
                      <span className="text-slate-300 text-xs font-medium">Archived</span>
                   )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
    </div>
  );
}