'use client';

import { useState } from 'react';
import { signOut } from '@/actions/auth-actions';
import { LogOut, Loader2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

export function SignOutButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await signOut(); // Calls the Server Action
    } catch (error) {
      toast.error('Failed to sign out');
      setLoading(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="p-2 hover:bg-white/10 rounded-full text-slate-400 hover:text-rose-400 transition-colors"
        title="Sign Out"
      >
        <LogOut size={18} />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl border border-slate-200 p-6 animate-in zoom-in-95 duration-200">
            
            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
               <AlertTriangle className="text-red-500" size={24} />
            </div>

            <h3 className="text-lg font-bold text-slate-900 text-center mb-2">Sign Out?</h3>
            <p className="text-sm text-slate-500 text-center mb-6">
               Are you sure you want to end your session? You will need to log in again to access the dashboard.
            </p>

            <div className="grid grid-cols-2 gap-3">
               <button 
                 onClick={() => setIsOpen(false)}
                 disabled={loading}
                 className="px-4 py-2.5 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
               >
                 Cancel
               </button>
               <button 
                 onClick={handleSignOut}
                 disabled={loading}
                 className="px-4 py-2.5 rounded-xl font-bold text-white bg-red-600 hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
               >
                 {loading ? <Loader2 className="animate-spin" size={16} /> : 'Sign Out'}
               </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}