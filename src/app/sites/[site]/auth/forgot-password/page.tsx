"use client";

import { useState } from 'react';
import { createClient } from '@/lib/supabase-client';
import { Loader2, Mail, ArrowLeft, CheckCircle, AlertCircle, Shield } from 'lucide-react';
import Link from 'next/link';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        // This is where they go after clicking the link in the email
        // We will build this 'update-password' page in Step 2
        redirectTo: `${window.location.origin}/auth/callback?next=/auth/update-password`,
      });

      if (error) throw error;
      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 p-6 relative overflow-hidden">
      
      {/* Background Blobs (Consistent with Login) */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[var(--primary)]/5 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse" />

      <div className="w-full max-w-md bg-white/80 backdrop-blur-md p-8 rounded-2xl shadow-xl border border-white/20 relative z-10">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-[var(--primary)]/10 text-[var(--primary)] mb-4">
            <Shield size={28} />
          </div>
          <h1 className="text-2xl font-black text-slate-900">Reset Password</h1>
          <p className="text-slate-500 text-sm mt-2">
            Enter your email and we'll send you instructions to reset your password.
          </p>
        </div>

        {success ? (
          <div className="text-center space-y-6 animate-in fade-in zoom-in-95 duration-300">
            <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-800 flex flex-col items-center gap-2">
              <CheckCircle size={32} />
              <p className="font-bold">Check your inbox</p>
              <p className="text-xs opacity-80">We sent a reset link to <span className="font-bold">{email}</span></p>
            </div>
            
            <Link 
              href="/auth" // Or wherever your login page is
              className="inline-flex items-center justify-center gap-2 text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors"
            >
              <ArrowLeft size={16} />
              Back to Sign In
            </Link>
          </div>
        ) : (
          <form onSubmit={handleReset} className="space-y-4">
            <div className="space-y-1.5">
               <label htmlFor="email" className="text-xs font-bold text-slate-600 uppercase ml-1 tracking-wider">
                 Email Address
               </label>
               <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[var(--primary)] transition-colors pointer-events-none" size={20} />
                  <input 
                    id="email"
                    type="email" 
                    required
                    placeholder="you@example.com"
                    className="w-full pl-12 pr-4 py-3 bg-white border-2 border-slate-200 rounded-xl font-medium outline-none transition-all text-slate-900 placeholder:text-slate-400 focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary)]/10"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
               </div>
            </div>

            {error && (
               <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600 flex items-center gap-2 font-medium">
                  <AlertCircle size={16} />
                  {error}
               </div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-slate-900 text-white h-12 rounded-xl font-bold hover:bg-[var(--primary)] transition-all shadow-lg hover:shadow-[var(--primary)]/20 disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : 'Send Reset Link'}
            </button>

            <div className="pt-4 text-center">
              <Link href="/auth" className="text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors">
                Cancel
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}