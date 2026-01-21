'use server';

import { createClient } from '@/lib/supabase-server';
import { revalidatePath } from 'next/cache';

export async function updateCustomerProfile(formData: { fullName: string; phone: string; address: string }) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const { error } = await supabase
    .from('profiles')
    .update({
      full_name: formData.fullName,
      phone: formData.phone,
      shipping_address: formData.address,
      updated_at: new Date().toISOString()
    })
    .eq('id', user.id);

  if (error) throw new Error(error.message);

  revalidatePath('/account');
  return { success: true };
}