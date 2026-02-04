"use client";

import React, { useState, useEffect, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { submitPaymentProof } from '@/actions/payment-actions';
import { 
  Smartphone, Copy, CheckCircle, AlertCircle, 
  ArrowRight, Loader2, CreditCard, Shield
} from 'lucide-react';
import { toast } from 'sonner';

interface PaymentConfig {
  momo_number: string;
  account_name: string;
  network: string;
  currency: string;
}

interface Props {
  applicationId: string;
  paymentConfig: PaymentConfig;
  businessName: string;
  planId: string;
  amount: number;
}

export default function PaymentClient({ applicationId, paymentConfig, businessName, planId, amount }: Props) {
  const router = useRouter();
  const [transactionId, setTransactionId] = useState('');
  const [isPending, startTransition] = useTransition();
  const [copied, setCopied] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!transactionId.trim()) {
      toast.error('Please enter your transaction ID');
      return;
    }

    // Validate format (basic check)
    if (transactionId.length < 10) {
      toast.error('Transaction ID must be at least 10 characters');
      return;
    }

    startTransition(async () => {
      const result = await submitPaymentProof(
        applicationId, 
        transactionId.trim().toUpperCase(),
        amount
      );

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success('Payment proof submitted successfully!');
        router.push('/onboarding/success');
      }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <CheckCircle className="text-green-600" size={32} />
          </div>
          <h1 className="text-3xl font-black text-slate-900 mb-2">
            Application Received! 🎉
          </h1>
          <p className="text-slate-600">
            Complete your payment to activate <strong>{businessName}</strong>
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
          
          {/* Payment Instructions */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-6 md:p-8">
            <div className="flex items-center gap-3 mb-4">
              <Smartphone size={24} />
              <h2 className="text-xl font-bold">Mobile Money Payment</h2>
            </div>
            <p className="text-green-50 text-sm">
              Follow the steps below to complete your {paymentConfig.currency} {amount.toFixed(2)} {planId.toUpperCase()} plan payment
            </p>
          </div>

          <div className="p-6 md:p-8 space-y-6">
            
            {/* Step 1: Send Money */}
            <div className="border-l-4 border-green-500 pl-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-sm font-bold">
                  1
                </div>
                <h3 className="font-bold text-slate-900">Send Money via {paymentConfig.network} MoMo</h3>
              </div>
              <p className="text-slate-600 text-sm mb-3">
                Open your {paymentConfig.network} Mobile Money app or dial the USSD code
              </p>
              
              {/* Payment Details Card */}
              <div className="bg-slate-50 rounded-xl p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 text-sm">Number:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-900 text-lg">
                      {paymentConfig.momo_number}
                    </span>
                    <button
                      onClick={() => copyToClipboard(paymentConfig.momo_number)}
                      className="p-1.5 hover:bg-white rounded-lg transition-colors"
                    >
                      {copied ? (
                        <CheckCircle size={18} className="text-green-600" />
                      ) : (
                        <Copy size={18} className="text-slate-400" />
                      )}
                    </button>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 text-sm">Account Name:</span>
                  <span className="font-bold text-slate-900">{paymentConfig.account_name}</span>
                </div>
                
                <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                  <span className="text-slate-500 text-sm">Amount:</span>
                  <span className="font-black text-green-600 text-2xl">
                    {paymentConfig.currency} {amount.toFixed(2)}
                  </span>
                </div>
                <div className="text-center mt-2">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    {planId} Plan
                  </span>
                </div>
              </div>
            </div>

            {/* Step 2: Get Transaction ID */}
            <div className="border-l-4 border-blue-500 pl-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-bold">
                  2
                </div>
                <h3 className="font-bold text-slate-900">Save Your Transaction ID</h3>
              </div>
              <p className="text-slate-600 text-sm">
                After sending, you'll receive an SMS with a <strong>Transaction ID</strong> (e.g., MP200131.1234.A56789).
                Keep this ID safe!
              </p>
            </div>

            {/* Step 3: Submit Transaction ID */}
            <div className="border-l-4 border-orange-500 pl-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center text-sm font-bold">
                  3
                </div>
                <h3 className="font-bold text-slate-900">Enter Transaction ID Below</h3>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Transaction ID / Reference Number
                  </label>
                  <input
                    type="text"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value.toUpperCase())}
                    placeholder="MP200131.1234.A56789"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none font-mono text-slate-900 uppercase"
                    disabled={isPending}
                    required
                  />
                  <p className="text-xs text-slate-500 mt-1.5 flex items-center gap-1">
                    <Shield size={12} /> Your payment will be verified within 2-4 hours
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isPending || !transactionId.trim()}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      Submitting...
                    </>
                  ) : (
                    <>
                      Submit Payment Proof
                      <ArrowRight size={20} />
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Security Notice */}
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3">
              <AlertCircle className="text-blue-600 flex-shrink-0" size={20} />
              <div className="text-sm">
                <p className="font-semibold text-blue-900 mb-1">Payment Verification</p>
                <p className="text-blue-700 text-xs leading-relaxed">
                  Your application will be reviewed once payment is confirmed. 
                  You'll receive WhatsApp confirmation with login credentials within 2-4 hours.
                  <strong> Do not make duplicate payments.</strong>
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* Help Text */}
        <p className="text-center text-slate-500 text-sm mt-6">
          Having issues? Contact support at <a href="tel:+233240000000" className="text-green-600 font-semibold">+233 24 000 0000</a>
        </p>
      </div>
    </div>
  );
}
