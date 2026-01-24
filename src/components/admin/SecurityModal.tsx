'use client';

import { useState } from 'react';
import { verifyPassword } from '@/actions/security-actions';
import { Loader2, ShieldAlert, Lock } from 'lucide-react';
import { toast } from 'sonner';

interface SecurityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  title?: string;
  description?: string;
}

export function SecurityModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Security Check", 
  description = "Please enter your password to confirm this action."
}: SecurityModalProps) {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // 1. Verify Password
    const res = await verifyPassword(password);

    if (!res.success) {
      toast.error(res.error || "Incorrect password");
      setLoading(false);
      return;
    }

    // 2. If valid, execute the dangerous action
    try {
      await onConfirm();
      onClose(); // Close only on success
      setPassword(''); // Reset
    } catch (error) {
      // Error handling is usually done inside onConfirm, but just in case
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95">
        
        <div className="p-6 text-center">
          <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-100">
             <ShieldAlert className="text-red-500" size={28} />
          </div>
          
          <h3 className="text-lg font-black text-slate-900 mb-2">{title}</h3>
          <p className="text-sm text-slate-500 mb-6 leading-relaxed">
            {description}
          </p>

          <form onSubmit={handleSubmit} className="text-left space-y-4">
             <div>
               <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Password</label>
               <div className="relative">
                 <Lock className="absolute left-3 top-3 text-slate-400" size={16} />
                 <input 
                   type="password" 
                   autoFocus
                   value={password}
                   onChange={(e) => setPassword(e.target.value)}
                   className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all"
                   placeholder="••••••••"
                   required
                 />
               </div>
             </div>

             <div className="grid grid-cols-2 gap-3 pt-2">
               <button 
                 type="button"
                 onClick={onClose}
                 disabled={loading}
                 className="py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-colors"
               >
                 Cancel
               </button>
               <button 
                 type="submit"
                 disabled={loading || !password}
                 className="py-3 rounded-xl font-bold text-white bg-red-600 hover:bg-red-700 shadow-lg shadow-red-200 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
               >
                 {loading ? <Loader2 className="animate-spin" size={18} /> : 'Confirm'}
               </button>
             </div>
          </form>
        </div>

      </div>
    </div>
  );
}