"use client";

import { useState, Suspense } from 'react';
import { createClient } from '@/lib/supabase-client';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2, Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react';
import Image from 'next/image';

// --- CHILD COMPONENT (Logic) ---
function LoginContent() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  
  const searchParams = useSearchParams(); 
  const redirectPath = searchParams.get('next') || '/admin';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      toast.success('Access Granted. Welcome back.');
      router.push(redirectPath);
      router.refresh(); 

    } catch (error: any) {
      toast.error(error.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[400px] relative z-10">
      
      {/* 1. MAIN CARD */}
      <div className="bg-white rounded-3xl shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
        
        {/* Header Section */}
        <div className="pt-10 pb-6 px-8 text-center border-b border-slate-50">
           <div className="relative w-16 h-16 mx-auto mb-4">
              <Image 
                src="/logo.svg" 
                alt="NimdeShop Logo" 
                fill
                className="object-contain"
                priority
              />
           </div>
           <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center justify-center gap-1">
             Nimde<span className="text-green-500">Shop</span>
           </h1>
           <p className="text-slate-500 text-sm font-medium mt-2">
             The Operating System for Commerce
           </p>
        </div>

        {/* Form Section */}
        <div className="p-8">
          <form onSubmit={handleLogin} className="space-y-5">
            
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Email Address</label>
              <div className="relative group">
                 <div className="absolute left-3 top-3.5 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                    <Mail size={18} />
                 </div>
                 <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                  placeholder="merchant@nimdeshop.com"
                 />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Password</label>
              <div className="relative group">
                 <div className="absolute left-3 top-3.5 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                    <Lock size={18} />
                 </div>
                 <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                  placeholder="••••••••"
                 />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#0A2540] hover:bg-slate-900 text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-slate-900/20 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : (
                <>
                  Sign In to Dashboard <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer Section */}
        <div className="bg-slate-50 p-4 text-center border-t border-slate-100">
           <div className="flex items-center justify-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wide">
              <ShieldCheck size={14} className="text-green-500" /> Secure Admin Portal
           </div>
        </div>
      </div>

      {/* 2. BOTTOM COPYRIGHT */}
      <p className="text-center text-slate-400 text-xs mt-8 font-medium">
        &copy; {new Date().getFullYear()} Nimde Inc. All rights reserved.
      </p>

    </div>
  );
}

// --- PARENT WRAPPER ---
export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden">
       
       {/* Background Pattern */}
       <div className="absolute inset-0 z-0 opacity-40" style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
       
       {/* Ambient Glow */}
       <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-100 rounded-full blur-[120px] opacity-50 pointer-events-none" />

       <Suspense fallback={<div className="flex items-center gap-2 text-slate-500 font-bold"><Loader2 className="animate-spin text-blue-500" /> Initializing...</div>}>
         <LoginContent />
       </Suspense>
    </div>
  );
}