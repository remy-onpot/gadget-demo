"use client";

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Loader2, AlertCircle, CheckCircle, Mail, Lock, User, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function AuthPage() {
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'error' | 'success', text: string } | null>(null);
  
  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState(''); // Only for Sign Up

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      if (isSignUp) {
        // --- SIGN UP LOGIC ---
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName }, // Store extra user metadata
          },
        });

        if (error) throw error;
        
        // Check if email confirmation is required
        if (data.session) {
           router.refresh();
           router.push('/admin/inventory');
        } else {
           setMessage({ type: 'success', text: 'Account created! Please check your email to confirm.' });
        }

      } else {
        // --- SIGN IN LOGIC ---
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;
        
        // Success: Redirect
        router.refresh();
        router.push('/admin/inventory');
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      
      {/* LEFT SIDE: Brand Hero (Hidden on Mobile) */}
      <div className="hidden lg:flex w-1/2 bg-slate-900 relative overflow-hidden items-center justify-center">
         {/* Abstract Background */}
         <div className="absolute inset-0">
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-[#00AEEF]/20"></div>
            <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-[#00AEEF] rounded-full blur-[128px] opacity-20"></div>
            <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#F7931E] rounded-full blur-[128px] opacity-20"></div>
         </div>

         <div className="relative z-10 text-center p-12">
            <h2 className="text-4xl font-black text-white mb-4 tracking-tight">Manage Your Empire.</h2>
            <p className="text-slate-400 text-lg max-w-md mx-auto leading-relaxed">
               Secure access to the Payless4Tech inventory, matrix builders, and marketing assets.
            </p>
         </div>
      </div>

      {/* RIGHT SIDE: Auth Form */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-6 sm:p-12 md:p-24 relative">
         
         <div className="w-full max-w-md space-y-8">
            
            {/* BRAND LOGO */}
            <div className="text-center">
               <div className="inline-flex items-center gap-1 mb-2">
                  <span className="font-black text-3xl md:text-4xl tracking-tighter text-[#00AEEF]">
                    Payless
                  </span>
                  <span className="bg-[#F7931E] text-white px-2 py-0.5 font-black text-3xl md:text-4xl tracking-tighter leading-none -mb-1 rounded-sm shadow-sm transform -rotate-2">
                    4tech
                  </span>
               </div>
               <h2 className="text-2xl font-bold text-slate-900 mt-6">
                  {isSignUp ? 'Create Admin Account' : 'Welcome Back'}
               </h2>
               <p className="text-slate-500 mt-2 text-sm">
                  {isSignUp ? 'Join the team to manage products.' : 'Enter your credentials to access the dashboard.'}
               </p>
            </div>

            {/* FORM */}
            <form onSubmit={handleAuth} className="space-y-5">
               
               {isSignUp && (
                 <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase ml-1">Full Name</label>
                    <div className="relative group">
                       <User className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-[#00AEEF] transition-colors" size={20} />
                       <input 
                         type="text" 
                         required={isSignUp}
                         placeholder="John Doe"
                         className="w-full pl-12 pr-4 py-3 bg-white border-2 border-slate-100 rounded-xl font-medium focus:border-[#00AEEF] focus:ring-4 focus:ring-[#00AEEF]/10 outline-none transition-all"
                         value={fullName}
                         onChange={(e) => setFullName(e.target.value)}
                       />
                    </div>
                 </div>
               )}

               <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase ml-1">Email Address</label>
                  <div className="relative group">
                     <Mail className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-[#00AEEF] transition-colors" size={20} />
                     <input 
                       type="email" 
                       required
                       placeholder="admin@payless4tech.com"
                       className="w-full pl-12 pr-4 py-3 bg-white border-2 border-slate-100 rounded-xl font-medium focus:border-[#00AEEF] focus:ring-4 focus:ring-[#00AEEF]/10 outline-none transition-all"
                       value={email}
                       onChange={(e) => setEmail(e.target.value)}
                     />
                  </div>
               </div>

               <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase ml-1">Password</label>
                  <div className="relative group">
                     <Lock className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-[#00AEEF] transition-colors" size={20} />
                     <input 
                       type="password" 
                       required
                       placeholder="••••••••"
                       className="w-full pl-12 pr-4 py-3 bg-white border-2 border-slate-100 rounded-xl font-medium focus:border-[#00AEEF] focus:ring-4 focus:ring-[#00AEEF]/10 outline-none transition-all"
                       value={password}
                       onChange={(e) => setPassword(e.target.value)}
                     />
                  </div>
               </div>

               {/* MESSAGE BOX */}
               {message && (
                  <div className={`p-4 rounded-xl text-sm font-bold flex items-start gap-3 ${
                     message.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-700'
                  }`}>
                     {message.type === 'error' ? <AlertCircle size={18} className="shrink-0 mt-0.5"/> : <CheckCircle size={18} className="shrink-0 mt-0.5"/>}
                     <p>{message.text}</p>
                  </div>
               )}

               <button 
                 type="submit" 
                 disabled={loading}
                 className="w-full bg-slate-900 text-white h-14 rounded-xl font-bold text-lg hover:bg-[#F7931E] transition-all shadow-xl shadow-slate-900/10 flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
               >
                 {loading ? <Loader2 className="animate-spin" /> : (
                    <>
                       {isSignUp ? 'Create Account' : 'Sign In'} 
                       <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform"/>
                    </>
                 )}
               </button>
            </form>

            {/* TOGGLE */}
            <div className="text-center">
               <button 
                 onClick={() => { setIsSignUp(!isSignUp); setMessage(null); }}
                 className="text-slate-500 font-bold text-sm hover:text-[#00AEEF] transition-colors"
               >
                 {isSignUp ? 'Already have an account? Sign In' : 'Need an admin account? Sign Up'}
               </button>
            </div>

            <div className="text-center pt-8 border-t border-slate-100">
               <Link href="/" className="text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors">
                  ← Back to Store
               </Link>
            </div>

         </div>
      </div>
    </div>
  );
}