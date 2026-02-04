'use server';

import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

function getAdminClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) throw new Error('SUPABASE_SERVICE_ROLE_KEY is missing');

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceKey,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

export interface PaymentConfig {
  momo_number: string;
  account_name: string;
  network: string;
  currency: string;
}

// Get payment configuration (public, read-only)
export async function getPaymentConfig(): Promise<PaymentConfig | null> {
  try {
    const supabase = getAdminClient();
    
    const { data, error } = await supabase
      .from('system_settings')
      .select('value')
      .eq('key', 'payment_config')
      .single();

    if (error || !data) {
      console.error('Failed to fetch payment config:', error);
      return null;
    }

    return data.value as PaymentConfig;
  } catch (err) {
    console.error('Error getting payment config:', err);
    return null;
  }
}

// Update payment configuration (super admin only)
export async function updatePaymentConfig(config: PaymentConfig) {
  try {
    const supabase = getAdminClient();

    // Validate input
    if (!config.momo_number || !config.account_name) {
      return { error: 'MoMo number and account name are required' };
    }

    const { error } = await supabase
      .from('system_settings')
      .update({ 
        value: config,
        updated_at: new Date().toISOString()
      })
      .eq('key', 'payment_config');

    if (error) {
      console.error('Failed to update payment config:', error);
      return { error: 'Failed to update payment settings' };
    }

    revalidatePath('/admin/super');
    return { success: true };
  } catch (err) {
    console.error('Error updating payment config:', err);
    return { error: 'An unexpected error occurred' };
  }
}

// Submit payment proof (applicant)
export async function submitPaymentProof(
  applicationId: string, 
  transactionId: string,
  amount: number
) {
  try {
    const supabase = getAdminClient();

    // Security: Validate transaction ID format (10-15 alphanumeric chars)
    if (!transactionId || !/^[A-Z0-9]{10,15}$/i.test(transactionId)) {
      return { error: 'Invalid transaction ID format' };
    }

    // Security: Check if transaction ID already used
    const { data: existingTx } = await supabase
      .from('onboarding_applications')
      .select('id')
      .eq('transaction_id', transactionId)
      .neq('id', applicationId)
      .single();

    if (existingTx) {
      return { error: 'This transaction ID has already been used' };
    }

    // Update application with payment proof
    const { error } = await supabase
      .from('onboarding_applications')
      .update({
        transaction_id: transactionId,
        payment_amount: amount,
        payment_date: new Date().toISOString(),
        status: 'payment_submitted',
        updated_at: new Date().toISOString()
      })
      .eq('id', applicationId)
      .eq('status', 'pending'); // Only update if still pending

    if (error) {
      console.error('Failed to submit payment proof:', error);
      return { error: 'Failed to submit payment proof. Please try again.' };
    }

    return { success: true };
  } catch (err) {
    console.error('Error submitting payment proof:', err);
    return { error: 'An unexpected error occurred' };
  }
}

// Verify payment (admin)
export async function verifyPayment(
  applicationId: string, 
  adminId: string,
  verified: boolean,
  notes?: string
) {
  try {
    const supabase = getAdminClient();

    const updateData: any = {
      payment_verified: verified,
      payment_verified_by: adminId,
      payment_verified_at: new Date().toISOString(),
      status: verified ? 'payment_verified' : 'pending',
      updated_at: new Date().toISOString()
    };

    if (notes) {
      updateData.payment_notes = notes;
    }

    const { error } = await supabase
      .from('onboarding_applications')
      .update(updateData)
      .eq('id', applicationId);

    if (error) {
      console.error('Failed to verify payment:', error);
      return { error: 'Failed to verify payment' };
    }

    revalidatePath('/admin/super');
    return { success: true };
  } catch (err) {
    console.error('Error verifying payment:', err);
    return { error: 'An unexpected error occurred' };
  }
}
