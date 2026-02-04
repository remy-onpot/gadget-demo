"use client";

import React, { useState, useEffect, useTransition } from 'react';
import { getPaymentConfig, updatePaymentConfig, PaymentConfig } from '@/actions/payment-actions';
import { Save, Loader2, Smartphone, DollarSign, Shield } from 'lucide-react';
import { toast } from 'sonner';

export default function PaymentSettingsClient({ initialConfig }: { initialConfig: PaymentConfig | null }) {
  const [config, setConfig] = useState<PaymentConfig>(
    initialConfig || {
      momo_number: '',
      account_name: '',
      network: 'MTN',
      currency: 'GHS'
    }
  );
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!config.momo_number || config.momo_number.length < 10) {
      toast.error('Please enter a valid mobile money number');
      return;
    }

    if (!config.account_name.trim()) {
      toast.error('Account name is required');
      return;
    }

    startTransition(async () => {
      const result = await updatePaymentConfig(config);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success('Payment settings updated successfully');
      }
    });
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3 mb-2">
          <Smartphone className="text-green-600" /> Payment Settings
        </h1>
        <p className="text-slate-600">Configure mobile money payment details for merchant onboarding</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Main Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-6">
            <div className="flex items-center gap-3 mb-2">
              <DollarSign size={24} />
              <h2 className="text-xl font-bold">Mobile Money Configuration</h2>
            </div>
            <p className="text-green-50 text-sm">
              New merchants will see these details on the payment instruction page
            </p>
          </div>

          <div className="p-8 space-y-6">
            
            {/* Network Selection */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Mobile Network
              </label>
              <select
                value={config.network}
                onChange={(e) => setConfig({ ...config, network: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none font-medium"
              >
                <option value="MTN">MTN Mobile Money</option>
                <option value="Vodafone">Vodafone Cash</option>
                <option value="AirtelTigo">AirtelTigo Money</option>
              </select>
            </div>

            {/* MoMo Number */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Mobile Money Number *
              </label>
              <input
                type="tel"
                value={config.momo_number}
                onChange={(e) => setConfig({ ...config, momo_number: e.target.value })}
                placeholder="0240000000"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none font-mono text-lg"
                required
              />
              <p className="text-xs text-slate-500 mt-1.5">
                Merchants will send onboarding fees to this number
              </p>
            </div>

            {/* Account Name */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Account Name *
              </label>
              <input
                type="text"
                value={config.account_name}
                onChange={(e) => setConfig({ ...config, account_name: e.target.value })}
                placeholder="Nimde Shop"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none font-medium"
                required
              />
              <p className="text-xs text-slate-500 mt-1.5">
                Name registered on the mobile money account
              </p>
            </div>

            {/* Currency Selection */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Currency
              </label>
              <select
                value={config.currency}
                onChange={(e) => setConfig({ ...config, currency: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none font-bold"
              >
                <option value="GHS">GHS (Ghanaian Cedi)</option>
                <option value="USD">USD (US Dollar)</option>
                <option value="EUR">EUR (Euro)</option>
              </select>
            </div>

            {/* Plan Pricing Info (Read-only) */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
              <h3 className="text-sm font-bold text-slate-700 mb-3">Plan Pricing</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Starter Plan:</span>
                  <span className="font-bold text-slate-900">{config.currency} 250</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Growth Plan:</span>
                  <span className="font-bold text-slate-900">{config.currency} 450</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Pro Plan:</span>
                  <span className="font-bold text-slate-900">{config.currency} 1200</span>
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-3">
                Merchants pay based on the plan they select during onboarding. Prices are managed in the codebase.
              </p>
            </div>

          </div>
        </div>

        {/* Security Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 flex gap-4">
          <Shield className="text-blue-600 flex-shrink-0" size={24} />
          <div className="text-sm">
            <p className="font-bold text-blue-900 mb-1">Security Notice</p>
            <p className="text-blue-700 leading-relaxed">
              Only super administrators can modify payment settings. 
              These details are publicly visible on the payment instruction page.
              Ensure transaction IDs are always verified before approving applications.
            </p>
          </div>
        </div>

        {/* Save Button */}
        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
        >
          {isPending ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              Saving Changes...
            </>
          ) : (
            <>
              <Save size={20} />
              Save Payment Settings
            </>
          )}
        </button>
      </form>
    </div>
  );
}
