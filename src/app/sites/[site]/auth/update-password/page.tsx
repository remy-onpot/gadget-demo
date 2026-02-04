"use client";

import { useState } from 'react';
import { createClient } from '@/lib/supabase-client';
import { useRouter } from 'next/navigation';
import { Loader2, Lock, CheckCircle, AlertCircle } from 'lucide-react';

export default function UpdatePassword() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();

    try {
      // We use updateUser because the user is technically logged in 
      // via the magic link they clicked in the email
      const { error } = await supabase.auth.updateUser({ 
        password: password 
      });

      if (error) throw error;

      // Redirect to dashboard or login
      router.push('/'); 
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl">
        <h1 className="text-2xl font-black text-slate-900 mb-2">Set New Password</h1>
        <p className="text-slate-500 mb-6">Please create a new secure password.</p>

        <form onSubmit={handleUpdate} className="space-y-4">
           <div className="space-y-1.5">
               <label className="text-xs font-bold text-slate-600 uppercase ml-1">New Password</label>
               <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input 
                    type="password" 
                    required
                    placeholder="Min. 6 characters"
                    className="w-full pl-12 pr-4 py-3 bg-white border-2 border-slate-200 rounded-xl font-medium outline-none focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary)]/10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
               </div>
            </div>

            {error && (
               <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm flex gap-2">
                 <AlertCircle size={16} /> {error}
               </div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-slate-900 text-white h-12 rounded-xl font-bold hover:bg-[var(--primary)] transition-all flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" /> : 'Update Password'}
            </button>
        </form>
      </div>
    </div>
  );
}