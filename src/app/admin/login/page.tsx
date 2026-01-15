'use client';

import { useState, Suspense } from 'react'; // 1. Import Suspense
import { adminLogin } from './action';
import { ShieldAlert, Loader2, Lock } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';

// 2. Move the Logic into a Child Component
function LoginForm() {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams(); // This causes the build error if not suspended

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await adminLogin(password);
      
      if (result.success) {
        toast.success('Access Granted');
        const next = searchParams.get('next') || '/admin';
        router.push(next);
      } else {
        toast.error('Access Denied');
        setLoading(false);
      }
    } catch (err) {
      toast.error('System Error');
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4 text-red-500">
            <Lock size={32} />
          </div>
          <h1 className="text-2xl font-black text-white">Restricted Area</h1>
          <p className="text-slate-400 text-sm">Authorized Personnel Only</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">
              Sudo Password
            </label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-white px-4 py-3 rounded-xl focus:border-red-500 focus:outline-none transition-colors font-mono placeholder:text-slate-700"
              placeholder="••••••••••••"
              autoFocus
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-white text-slate-950 font-bold py-3 rounded-xl hover:bg-slate-200 transition-colors flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" /> : <ShieldAlert size={18} />}
            Authenticate
          </button>
        </form>
    </div>
  );
}

// 3. Main Page Component (The Wrapper)
export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      {/* 4. Wrap the Client Component in Suspense */}
      <Suspense fallback={<div className="text-slate-500 flex flex-col items-center gap-2"><Loader2 className="animate-spin" /> Verify Access...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}