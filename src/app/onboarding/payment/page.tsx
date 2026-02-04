import { notFound } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { getPaymentConfig } from '@/actions/payment-actions';
import { PLANS } from '@/lib/plans';
import type { PlanId } from '@/lib/plans';
import PaymentClient from './PaymentClient';

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

interface PageProps {
  searchParams: Promise<{ id?: string }>;
}

export default async function PaymentPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const applicationId = params.id;

  if (!applicationId) {
    return notFound();
  }

  // Fetch application to verify it exists and get business name + plan
  const supabase = getAdminClient();
  const { data: application, error } = await supabase
    .from('onboarding_applications')
    .select('id, business_name, status, plan_id')
    .eq('id', applicationId)
    .single();

  if (error || !application) {
    return notFound();
  }

  // Security: Only show payment page if status is 'pending'
  if (application.status !== 'pending') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            {application.status === 'payment_submitted' 
              ? 'Payment Already Submitted' 
              : 'Application Already Processed'}
          </h1>
          <p className="text-slate-600">
            {application.status === 'payment_submitted' 
              ? 'Your payment proof has been submitted and is being reviewed.' 
              : 'This application has already been processed.'}
          </p>
        </div>
      </div>
    );
  }

  // Fetch payment configuration
  const paymentConfig = await getPaymentConfig();

  if (!paymentConfig) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Configuration Error</h1>
          <p className="text-slate-600">
            Payment system is not configured. Please contact support.
          </p>
        </div>
      </div>
    );
  }

  // Calculate fee based on selected plan
  const planId = (application.plan_id || 'starter') as PlanId;
  const planPrice = PLANS[planId]?.price || PLANS.starter.price;

  return (
    <PaymentClient
      applicationId={application.id}
      paymentConfig={paymentConfig}
      businessName={application.business_name}
      planId={planId}
      amount={planPrice}
    />
  );
}
