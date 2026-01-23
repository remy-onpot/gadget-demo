import { createClient } from '@/lib/supabase-server';
import { User, Lock } from 'lucide-react';
import { ProfileForm, PasswordForm } from './forms';

export default async function AccountPage() {
  const supabase = await createClient();
  
  // 1. Get Current User & Profile
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return <div>Please log in</div>;

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">My Account</h1>
        <p className="text-slate-500">Manage your personal details and security.</p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        
        {/* CARD 1: PERSONAL DETAILS */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <User size={20} />
            </div>
            <h2 className="text-lg font-semibold">Profile Information</h2>
          </div>
          
          <ProfileForm user={user} profile={profile} />
        </div>

        {/* CARD 2: SECURITY */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-red-50 text-red-600 rounded-lg">
              <Lock size={20} />
            </div>
            <h2 className="text-lg font-semibold">Change Password</h2>
          </div>

          <PasswordForm />
        </div>

      </div>
    </div>
  );
}