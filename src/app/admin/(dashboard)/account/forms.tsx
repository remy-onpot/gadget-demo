'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { updateProfile, updatePassword } from './actions';
import { Save, Lock } from 'lucide-react';

const initialState = {
  error: '',
  success: ''
};

function SubmitButton({ label, icon: Icon }: { label: string, icon?: any }) {
  const { pending } = useFormStatus();
  return (
    <button 
      type="submit" 
      disabled={pending}
      className="mt-4 w-full bg-slate-900 text-white py-2 rounded-md hover:bg-slate-800 transition flex items-center justify-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {pending ? 'Saving...' : (
        <>
          {Icon && <Icon size={16} />} {label}
        </>
      )}
    </button>
  );
}

export function ProfileForm({ user, profile }: { user: any, profile: any }) {
  const [state, action] = useFormState(updateProfile, initialState);

  return (
    <form action={action} className="space-y-4">
      {state?.error && <p className="text-sm text-red-500 bg-red-50 p-2 rounded">{state.error}</p>}
      {state?.success && <p className="text-sm text-green-500 bg-green-50 p-2 rounded">{state.success}</p>}

      <div className="space-y-2">
        <label className="text-sm font-medium">Email Address</label>
        <input 
          disabled 
          defaultValue={user.email} 
          className="w-full p-2 bg-slate-100 border border-slate-200 rounded-md text-slate-500 cursor-not-allowed" 
        />
        <p className="text-xs text-slate-400">Email cannot be changed.</p>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Full Name</label>
        <input 
          name="fullName"
          defaultValue={profile?.full_name || ''}
          placeholder="John Doe"
          className="w-full p-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Phone Number</label>
        <input 
          name="phone"
          defaultValue={profile?.phone || ''}
          placeholder="+233 ..."
          className="w-full p-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
        />
      </div>

      <SubmitButton label="Save Changes" icon={Save} />
    </form>
  );
}

export function PasswordForm() {
  const [state, action] = useFormState(updatePassword, initialState);

  return (
    <form action={action} className="space-y-4">
      {state?.error && <p className="text-sm text-red-500 bg-red-50 p-2 rounded">{state.error}</p>}
      {state?.success && <p className="text-sm text-green-500 bg-green-50 p-2 rounded">{state.success}</p>}

      <div className="space-y-2">
        <label className="text-sm font-medium">New Password</label>
        <input 
          type="password" 
          name="password"
          required
          minLength={6}
          placeholder="••••••••"
          className="w-full p-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500" 
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Confirm Password</label>
        <input 
          type="password" 
          name="confirmPassword"
          required
          minLength={6}
          placeholder="••••••••"
          className="w-full p-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500" 
        />
      </div>

      <div className="bg-yellow-50 text-yellow-800 text-xs p-3 rounded-md">
        Changing your password will not sign you out of other devices immediately.
      </div>

      <SubmitButton label="Update Password" icon={Lock} />
    </form>
  );
}