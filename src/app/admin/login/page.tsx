"use client";

import { useState, useEffect, Suspense } from 'react';
import { createClient } from '@/lib/supabase-client';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2, Lock, Mail, ArrowRight, ShieldCheck, AlertCircle, CheckCircle2 } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

// --- CHILD COMPONENT (Logic) ---
function LoginContent() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isError, setIsError] = useState(false); // For visual shake/red border
  const [greeting, setGreeting] = useState('Welcome');
  
  const router = useRouter();
  const searchParams = useSearchParams(); 
  const redirectPath = searchParams.get('next') || '/admin';

  // 1. SMART INIT: Time Greeting & Remembered Email
  useEffect(() => {
    // Time Logic
    const hour = new Date().getHours();
    const timeGreeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
    
    // Memory Logic
    const lastEmail = localStorage.getItem('nimde_admin_email');
    if (lastEmail) {
      setEmail(lastEmail);
      setGreeting('Welcome back');
    } else {
      setGreeting(timeGreeting);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setIsError(false);

    try {
      const supabase = createClient();
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      // 2. SUCCESS STATE: Save email for next time
      localStorage.setItem('nimde_admin_email', email);
      
      // Smart Toast
      toast.success('Authenticated', {
        description: `Redirecting to dashboard...`,
        icon: <CheckCircle2 className="text-green-600" />,
        duration: 2000,
      });

      router.push(redirectPath);
      router.refresh(); 

    } catch (error: any) {
      setIsError(true);
      
      // 3. SMART ERROR HANDLING: Specific feedback
      const msg = error.message;
      if (msg.includes('Invalid login') || msg.includes('credentials')) {
         toast.error('Access Denied', {
           description: "Incorrect email or password.",
           icon: <Lock className="text-red-500" size={16} />
         });
      } else if (msg.includes('Email not confirmed')) {
         toast.warning('Verification Required', {
           description: "Please check your inbox to confirm your email.",
           icon: <Mail className="text-orange-500" size={16} />
         });
      } else {
         toast.error('Connection Failed', { description: msg });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[400px] relative z-10">
      
      {/* 1. MAIN CARD */}
      <div className={cn(
          "bg-white rounded-3xl shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden transition-transform duration-300",
          isError ? "animate-shake ring-2 ring-red-500/20" : "" // Shake animation on error
      )}>
        
        {/* Header Section */}
        <div className="pt-10 pb-6 px-8 text-center border-b border-slate-50 bg-gradient-to-b from-slate-50/50 to-transparent">
           <div className="relative w-16 h-16 mx-auto mb-4 bg-white rounded-2xl shadow-sm border border-slate-100 p-3 flex items-center justify-center">
              <Image 
                src="/logo.svg" 
                alt="NimdeShop Logo" 
                width={40}
                height={40}
                className="object-contain"
                priority
              />
           </div>
           <h1 className="text-xl font-medium text-slate-500 tracking-tight mb-1">
             {greeting}
           </h1>
           <h2 className="text-2xl font-black text-slate-900 tracking-tight">
             Admin Portal
           </h2>
        </div>

        {/* Form Section */}
        <div className="p-8">
          <form onSubmit={handleLogin} className="space-y-5">
            
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Email Address</label>
              <div className="relative group">
                 <div className={cn(
                   "absolute left-3 top-3.5 transition-colors",
                   isError ? "text-red-400" : "text-slate-400 group-focus-within:text-blue-500"
                 )}>
                    <Mail size={18} />
                 </div>
                 <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setIsError(false); }}
                  required
                  className={cn(
                    "w-full pl-10 pr-4 py-3 bg-slate-50 border rounded-xl font-medium text-slate-900 placeholder:text-slate-400 outline-none transition-all",
                    isError 
                      ? "border-red-200 bg-red-50 focus:border-red-500 focus:ring-4 focus:ring-red-500/10" 
                      : "border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                  )}
                  placeholder="merchant@nimdeshop.com"
                 />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center ml-1">
                 <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Password</label>
                 <span className="text-[10px] font-bold text-blue-500 cursor-pointer hover:underline">Forgot?</span>
              </div>
              <div className="relative group">
                 <div className={cn(
                   "absolute left-3 top-3.5 transition-colors",
                   isError ? "text-red-400" : "text-slate-400 group-focus-within:text-blue-500"
                 )}>
                    <Lock size={18} />
                 </div>
                 <input
                  type="password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setIsError(false); }}
                  required
                  className={cn(
                    "w-full pl-10 pr-4 py-3 bg-slate-50 border rounded-xl font-medium text-slate-900 placeholder:text-slate-400 outline-none transition-all",
                    isError 
                      ? "border-red-200 bg-red-50 focus:border-red-500 focus:ring-4 focus:ring-red-500/10" 
                      : "border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                  )}
                  placeholder="••••••••"
                 />
              </div>
            </div>

            {isError && (
              <div className="flex items-center gap-2 text-xs font-bold text-red-500 bg-red-50 p-3 rounded-lg border border-red-100 animate-in fade-in slide-in-from-top-1">
                 <AlertCircle size={14} /> Invalid credentials. Please try again.
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#0A2540] hover:bg-slate-900 text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-slate-900/20 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed mt-2 group"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : (
                <>
                  Sign In <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer Section */}
        <div className="bg-slate-50 p-4 text-center border-t border-slate-100">
           <div className="flex items-center justify-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wide">
              <ShieldCheck size={14} className="text-green-500" /> Secure System
           </div>
        </div>
      </div>

      {/* 2. BOTTOM COPYRIGHT */}
      <p className="text-center text-slate-400 text-xs mt-8 font-medium">
        &copy; {new Date().getFullYear()} Nimde Inc. 
      </p>

      {/* Custom Shake Animation Style */}
      <style jsx global>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
          20%, 40%, 60%, 80% { transform: translateX(4px); }
        }
        .animate-shake {
          animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both;
        }
      `}</style>

    </div>
  );
}

// --- PARENT WRAPPER ---
export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4 relative overflow-hidden font-sans">
       
       {/* Background Pattern */}
       <div className="absolute inset-0 z-0 opacity-30" style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
       
       {/* Ambient Glow */}
       <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-100/50 rounded-full blur-[120px] opacity-50 pointer-events-none" />

       <Suspense fallback={<div className="flex items-center gap-2 text-slate-500 font-bold"><Loader2 className="animate-spin text-blue-500" /> Initializing...</div>}>
         <LoginContent />
       </Suspense>
    </div>
  );
}