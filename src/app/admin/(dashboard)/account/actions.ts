'use server';

import { createClient } from '@/lib/supabase-server';
import { revalidatePath } from 'next/cache';

// Define the shape of our form state
export type FormState = {
  error?: string;
  success?: string;
};

// 1. Update Profile
export async function updateProfile(
  prevState: FormState, 
  formData: FormData
): Promise<FormState> { // Explicit return type
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'Not authenticated' };

  const fullName = formData.get('fullName') as string;
  const phone = formData.get('phone') as string;

  const { error } = await supabase
    .from('profiles')
    .upsert({
      id: user.id,
      full_name: fullName,
      phone: phone,
      updated_at: new Date().toISOString(),
    });

  if (error) return { error: error.message };

  revalidatePath('/admin/account');
  return { success: 'Profile updated successfully' };
}

// 2. Update Password
export async function updatePassword(
  prevState: FormState, 
  formData: FormData
): Promise<FormState> { // Explicit return type
  const supabase = await createClient();
  const password = formData.get('password') as string;
  const confirm = formData.get('confirmPassword') as string;

  if (password !== confirm) {
    return { error: "Passwords do not match" };
  }

  if (password.length < 6) {
    return { error: "Password must be at least 6 characters" };
  }

  const { error } = await supabase.auth.updateUser({ password });

  if (error) return { error: error.message };

  return { success: 'Password updated successfully' };
}