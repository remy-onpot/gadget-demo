"use client";

import { useState, Suspense } from 'react';
import { createClient } from '@/lib/supabase-client';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, AlertCircle, CheckCircle, Mail, Lock, User, ArrowRight, ShoppingBag } from 'lucide-react';
import Link from 'next/link';

interface StoreAuthFormProps {
  storeName: string;
  storeLogo?: string;
}

function AuthContent({ storeName, storeLogo }: StoreAuthFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextUrl = searchParams.get('next') || '/account';

  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'error' | 'success', text: string } | null>(null);
  
  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const supabase = createClient();

    try {
      if (isSignUp) {
        // --- CUSTOMER SIGN UP ---
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName },
            emailRedirectTo: `${window.location.origin}/auth/callback?next=${nextUrl}`
          },
        });

        if (error) {
          // 🎯 SMART ERROR HANDLING: Detect "User already exists" error
          if (error.message.toLowerCase().includes('already registered') || 
              error.message.toLowerCase().includes('already exists') ||
              error.message.toLowerCase().includes('already been registered')) {
            
            // Auto-switch to login mode
            setIsSignUp(false);
            setPassword(''); // Clear password for security
            setMessage({ 
              type: 'success', 
              text: '✨ You already have a Nimde account! Please log in below.' 
            });
            return;
          }
          throw error;
        }
        
        if (data.session) {
           router.refresh();
           router.push(nextUrl);
        } else {
           setMessage({ type: 'success', text: 'Account created! Please check your email to confirm.' });
        }

      } else {
        // --- CUSTOMER SIGN IN ---
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;
        
        router.refresh();
        router.push(nextUrl);
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50 font-sans">
      
      {/* LEFT SIDE: Store Branding (Hidden on Mobile) */}
      <div className="hidden lg:flex w-1/2 bg-slate-900 relative overflow-hidden items-center justify-center">
         {/* Dynamic Theme Gradient using the injected --primary var */}
         <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-900 to-[var(--primary)] opacity-40"></div>
         <div className="absolute inset-0 opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
         
         <div className="relative z-10 text-center p-12 max-w-lg">
            <h2 className="text-5xl font-black text-white mb-6 tracking-tight leading-tight">
               Welcome to <br/>
               <span className="text-[var(--primary)]">{storeName}</span>
            </h2>
            <p className="text-slate-300 text-lg leading-relaxed font-medium">
               Sign in to track your orders, manage your shipping addresses, and speed up your checkout.
            </p>
         </div>
      </div>

      {/* RIGHT SIDE: Auth Form */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-6 sm:p-12 md:p-24 relative bg-white">
         
         <div className="w-full max-w-md space-y-8">
           
           {/* BRAND HEADER (Mobile/Desktop) */}
           <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-[var(--primary)]/10 text-[var(--primary)] mb-6 shadow-sm border border-[var(--primary)]/20">
                 {storeLogo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={storeLogo} alt="Logo" className="w-12 h-12 object-contain" />
                 ) : (
                    <ShoppingBag size={36} />
                 )}
              </div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                 {isSignUp ? 'Create Account' : 'Welcome Back'}
              </h2>
              <p className="text-slate-500 mt-2 font-medium">
                 {isSignUp ? `Join ${storeName} today.` : 'Enter your details to access your account.'}
              </p>
           </div>

           {/* FORM */}
           <form onSubmit={handleAuth} className="space-y-5">
              
              {isSignUp && (
                <div className="space-y-1.5 animate-in slide-in-from-top-2 fade-in">
                   <label className="text-xs font-bold text-slate-500 uppercase ml-1">Full Name</label>
                   <div className="relative group">
                      <User className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-[var(--primary)] transition-colors" size={20} />
                      <input 
                        type="text" 
                        required={isSignUp}
                        placeholder="John Doe"
                        className="auth-input"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                      />
                   </div>
                </div>
              )}

              <div className="space-y-1.5">
                 <label className="text-xs font-bold text-slate-500 uppercase ml-1">Email Address</label>
                 <div className="relative group">
                    <Mail className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-[var(--primary)] transition-colors" size={20} />
                    <input 
                      type="email" 
                      required
                      placeholder="you@example.com"
                      className="auth-input"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                 </div>
              </div>

              <div className="space-y-1.5">
                 <label className="text-xs font-bold text-slate-500 uppercase ml-1">Password</label>
                 <div className="relative group">
                    <Lock className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-[var(--primary)] transition-colors" size={20} />
                    <input 
                      type="password" 
                      required
                      placeholder="••••••••"
                      className="auth-input"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                 </div>
              </div>

              {/* FEEDBACK */}
              {message && (
                 <div className={`p-4 rounded-xl text-sm font-bold flex items-start gap-3 animate-in zoom-in-95 ${
                    message.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-700'
                 }`}>
                     {message.type === 'error' ? <AlertCircle size={18} className="shrink-0 mt-0.5"/> : <CheckCircle size={18} className="shrink-0 mt-0.5"/>}
                     <p>{message.text}</p>
                 </div>
              )}

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-slate-900 text-white h-14 rounded-xl font-bold text-lg hover:bg-[var(--primary)] transition-all shadow-xl shadow-slate-900/10 flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed mt-4"
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
           <div className="text-center space-y-4">
              <button 
                onClick={() => { setIsSignUp(!isSignUp); setMessage(null); }}
                className="text-slate-500 font-bold text-sm hover:text-[var(--primary)] transition-colors"
              >
                {isSignUp ? 'Already have an account? Sign In' : 'New customer? Create Account'}
              </button>
              
              <div className="border-t border-slate-100 pt-6">
                 <Link href="/" className="text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-wider">
                    ← Back to Store
                 </Link>
              </div>
           </div>

        </div>
      </div>

      <style jsx global>{`
        .auth-input {
            @apply w-full pl-12 pr-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl font-medium focus:bg-white focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary)]/10 outline-none transition-all text-slate-900 placeholder:text-slate-400;
        }
      `}</style>
    </div>
  );
}

// 3. MAIN EXPORT WRAPPED IN SUSPENSE
export default function StoreAuthForm(props: StoreAuthFormProps) {
  return (
    <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <Loader2 className="animate-spin text-slate-400" />
        </div>
    }>
        <AuthContent {...props} />
    </Suspense>
  );
}