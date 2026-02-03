"use client";

import { useState, Suspense } from 'react';
import { createClient } from '@/lib/supabase-client';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, AlertCircle, CheckCircle, Mail, Lock, User, ArrowRight, ShoppingBag, Sparkles, Shield } from 'lucide-react';
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
    <div className="min-h-screen flex bg-gradient-to-br from-slate-50 via-white to-slate-100 font-sans relative overflow-hidden">
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[var(--primary)]/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* LEFT SIDE: Store Branding (Hidden on Mobile) */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden items-center justify-center">
         {/* Animated gradient overlay */}
         <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary)]/20 via-transparent to-purple-500/20"></div>
         <div className="absolute inset-0 opacity-30 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
         
         {/* Floating elements for modern look */}
         <div className="absolute top-20 left-20 w-32 h-32 bg-white/5 rounded-3xl rotate-12 backdrop-blur-sm"></div>
         <div className="absolute bottom-20 right-20 w-40 h-40 bg-white/5 rounded-full backdrop-blur-sm"></div>
         
         <div className="relative z-10 text-center p-12 max-w-lg space-y-8">
            {/* NimdeShop Logo/Branding */}
            <div className="inline-flex items-center justify-center mb-8">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[var(--primary)] to-purple-500 flex items-center justify-center shadow-2xl shadow-[var(--primary)]/50 rotate-6">
                <ShoppingBag size={40} className="text-white -rotate-6" strokeWidth={2.5} />
              </div>
            </div>

            <div>
              <h1 className="text-6xl font-black text-white mb-4 tracking-tight leading-none">
                Nimde<span className="text-[var(--primary)]">Shop</span>
              </h1>
              <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mb-6">
                Powered by {storeName}
              </p>
            </div>
            
            <div className="space-y-4 text-left">
              <div className="flex items-start gap-4 bg-white/5 backdrop-blur-sm p-4 rounded-xl border border-white/10">
                <Shield className="text-[var(--primary)] shrink-0 mt-1" size={24} />
                <div>
                  <h3 className="text-white font-bold mb-1">Secure Shopping</h3>
                  <p className="text-slate-400 text-sm">Your data is encrypted and protected</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4 bg-white/5 backdrop-blur-sm p-4 rounded-xl border border-white/10">
                <Sparkles className="text-purple-400 shrink-0 mt-1" size={24} />
                <div>
                  <h3 className="text-white font-bold mb-1">Fast Checkout</h3>
                  <p className="text-slate-400 text-sm">Save time on your next purchase</p>
                </div>
              </div>
            </div>
         </div>
      </div>

      {/* RIGHT SIDE: Auth Form */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-6 sm:p-12 md:p-16 relative bg-white/80 backdrop-blur-sm">
         
         <div className="w-full max-w-md space-y-8 relative z-10">
           
           {/* MOBILE LOGO (Visible only on mobile) */}
           <div className="lg:hidden text-center mb-8">
             <div className="inline-flex items-center gap-2 mb-4">
               <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--primary)] to-purple-500 flex items-center justify-center shadow-lg">
                 <ShoppingBag size={24} className="text-white" strokeWidth={2.5} />
               </div>
               <h1 className="text-2xl font-black text-slate-900">
                 Nimde<span className="text-[var(--primary)]">Shop</span>
               </h1>
             </div>
             <p className="text-slate-500 text-xs font-medium">{storeName}</p>
           </div>

           {/* FORM HEADER */}
           <div className="text-center space-y-2">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--primary)]/10 to-purple-500/10 text-[var(--primary)] mb-4 shadow-sm border border-[var(--primary)]/20">
                 {storeLogo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={storeLogo} alt="Store Logo" className="w-10 h-10 object-contain" />
                 ) : (
                    <User size={28} strokeWidth={2.5} />
                 )}
              </div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                 {isSignUp ? 'Join Us Today' : 'Welcome Back'}
              </h2>
              <p className="text-slate-500 font-medium">
                 {isSignUp ? 'Create your account in seconds' : 'Sign in to continue shopping'}
              </p>
           </div>

           {/* FORM */}
           <form onSubmit={handleAuth} className="space-y-4">
              
              {isSignUp && (
                <div className="space-y-2 animate-in slide-in-from-top-2 fade-in duration-300">
                   <label className="text-xs font-bold text-slate-600 uppercase ml-1 tracking-wider">Full Name</label>
                   <div className="relative group">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[var(--primary)] transition-colors" size={20} />
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

              <div className="space-y-2">
                 <label className="text-xs font-bold text-slate-600 uppercase ml-1 tracking-wider">Email Address</label>
                 <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[var(--primary)] transition-colors" size={20} />
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

              <div className="space-y-2">
                 <label className="text-xs font-bold text-slate-600 uppercase ml-1 tracking-wider">Password</label>
                 <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[var(--primary)] transition-colors" size={20} />
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
                 <div className={`p-4 rounded-xl text-sm font-bold flex items-start gap-3 animate-in zoom-in-95 border ${
                    message.type === 'error' 
                      ? 'bg-red-50 text-red-700 border-red-200' 
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                 }`}>
                     {message.type === 'error' ? <AlertCircle size={18} className="shrink-0 mt-0.5"/> : <CheckCircle size={18} className="shrink-0 mt-0.5"/>}
                     <p>{message.text}</p>
                 </div>
              )}

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-gradient-to-r from-slate-900 to-slate-800 text-white h-14 rounded-xl font-bold text-base hover:from-[var(--primary)] hover:to-purple-500 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-[var(--primary)]/20 flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed mt-6"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : (
                   <>
                      {isSignUp ? 'Create Account' : 'Sign In'} 
                      <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform"/>
                   </>
                )}
              </button>
           </form>

           {/* TOGGLE & FOOTER */}
           <div className="text-center space-y-6 pt-4">
              <button 
                onClick={() => { setIsSignUp(!isSignUp); setMessage(null); }}
                className="text-slate-600 font-bold text-sm hover:text-[var(--primary)] transition-colors inline-flex items-center gap-2"
              >
                {isSignUp ? (
                  <>Already have an account? <span className="text-[var(--primary)]">Sign In</span></>
                ) : (
                  <>New to NimdeShop? <span className="text-[var(--primary)]">Create Account</span></>
                )}
              </button>
              
              <div className="pt-6 border-t border-slate-200">
                 <Link href="/" className="text-xs font-bold text-slate-400 hover:text-slate-700 transition-colors uppercase tracking-widest flex items-center justify-center gap-2">
                    <ArrowRight size={14} className="rotate-180" />
                    Back to Store
                 </Link>
              </div>

              {/* Trust Badge */}
              <div className="flex items-center justify-center gap-2 text-xs text-slate-400 pt-4">
                <Shield size={14} />
                <span>Secured by NimdeShop Platform</span>
              </div>
           </div>

        </div>
      </div>

      <style jsx global>{`
        .auth-input {
            @apply w-full pl-12 pr-4 py-3.5 bg-white border-2 border-slate-200 rounded-xl font-medium focus:bg-white focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary)]/10 outline-none transition-all text-slate-900 placeholder:text-slate-400 shadow-sm;
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