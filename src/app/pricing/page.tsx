import React from 'react';
import { Footer } from '@/components/landing/Footer';
import { Check, X, Sparkles, Package, Users, Box, HardDrive } from 'lucide-react';
import Link from 'next/link';
import { PLANS, type PlanId } from '@/lib/plans';

export const metadata = {
  title: 'Pricing - NimdeShop',
  description: 'Simple, transparent pricing for businesses of all sizes.',
};

const planDetails = {
  starter: {
    description: 'Perfect for small businesses getting started',
    badge: null,
  },
  growth: {
    description: 'Ideal for growing businesses',
    badge: 'Most Popular',
  },
  pro: {
    description: 'For established businesses at scale',
    badge: null,
  },
} as const;

const featureRows = [
  { key: 'products', label: 'Product Listings', icon: Package },
  { key: 'products_360', label: '360° Product Views', icon: Box },
  { key: 'admins', label: 'Admin Users', icon: Users },
  { key: 'storage_gb', label: 'Storage', icon: HardDrive },
  { key: 'inventory_sync', label: 'Inventory Sync', icon: null },
];

export default function PricingPage() {
  const planIds: PlanId[] = ['starter', 'growth', 'pro'];

  return (
    <div className="bg-[#020617] min-h-screen text-slate-200">
       
       {/* Hero Section */}
       <section className="pt-32 pb-16 px-6 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-green-500/10 via-transparent to-transparent pointer-events-none" />
          <div className="relative z-10">
            <h1 className="text-5xl md:text-6xl font-black text-white mb-4">
              Simple, transparent pricing
            </h1>
            <p className="text-xl text-slate-400 mb-2">One-time setup fee. No monthly charges.</p>
            <p className="text-sm text-green-400">✓ All features included forever</p>
          </div>
       </section>

       {/* Pricing Cards */}
       <section className="pb-20 px-6">
          <div className="container mx-auto max-w-7xl grid md:grid-cols-3 gap-6">
             {planIds.map((planId) => (
               <PricingCard key={planId} planId={planId} />
             ))}
          </div>
       </section>

       {/* Feature Comparison Table */}
       <section className="pb-32 px-6">
          <div className="container mx-auto max-w-7xl">
            <h2 className="text-3xl font-black text-white text-center mb-12">
              Compare all features
            </h2>
            
            {/* Glassmorphism Table */}
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl overflow-hidden">
              {/* Table Header */}
              <div className="grid grid-cols-4 gap-4 p-6 border-b border-white/10 bg-gradient-to-r from-green-500/10 to-blue-500/10">
                <div className="font-bold text-slate-300">Features</div>
                {planIds.map((planId) => (
                  <div key={planId} className="text-center">
                    <div className="font-black text-white">{PLANS[planId].label}</div>
                    <div className="text-sm text-green-400 font-bold">GHS {PLANS[planId].price}</div>
                  </div>
                ))}
              </div>

              {/* Table Body */}
              <div className="divide-y divide-white/5">
                {featureRows.map((feature, idx) => (
                  <div 
                    key={feature.key} 
                    className={`grid grid-cols-4 gap-4 p-6 transition-colors hover:bg-white/5 ${
                      idx % 2 === 0 ? 'bg-white/[0.02]' : ''
                    }`}
                  >
                    <div className="text-slate-300 font-medium flex items-center gap-2">
                      {feature.icon && <feature.icon size={18} className="text-slate-500" />}
                      {feature.label}
                    </div>
                    {planIds.map((planId) => {
                      const plan = PLANS[planId];
                      return (
                        <div key={planId} className="text-center">
                          {feature.key === 'inventory_sync' ? (
                            (plan.limits.features as readonly string[]).includes('inventory_sync') || (plan.limits.features as readonly string[]).includes('all') ? (
                              <Check className="inline-block text-green-500" size={20} />
                            ) : (
                              <X className="inline-block text-slate-600" size={20} />
                            )
                          ) : feature.key === 'storage_gb' ? (
                            <span className="text-slate-200 font-medium text-sm">
                              {plan.limits[feature.key as keyof typeof plan.limits]} GB
                            </span>
                          ) : (
                            <span className="text-slate-200 font-medium text-sm">
                              {plan.limits[feature.key as keyof typeof plan.limits] === 999 
                                ? 'Unlimited' 
                                : plan.limits[feature.key as keyof typeof plan.limits]}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>

              {/* CTA Row */}
              <div className="grid grid-cols-4 gap-4 p-6 bg-gradient-to-r from-slate-900/50 to-slate-950/50">
                <div></div>
                {planIds.map((planId) => (
                  <div key={planId} className="text-center">
                    <Link
                      href={`/onboarding/apply?plan=${planId}`}
                      className={`inline-block w-full py-3 px-6 rounded-xl font-bold transition-all ${
                        planDetails[planId].badge
                          ? 'bg-green-500 text-slate-900 hover:bg-green-400 shadow-lg shadow-green-500/25'
                          : 'bg-white/10 text-white hover:bg-white/20'
                      }`}
                    >
                      Get Started
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </div>
       </section>

       <Footer />
    </div>
  );
}

const PricingCard = ({ planId }: { planId: PlanId }) => {
  const plan = PLANS[planId];
  const details = planDetails[planId];

  return (
    <div className={`relative h-full group ${details.badge ? 'md:-mt-4' : ''}`}>
      {/* Glow Effect */}
      {details.badge && (
        <div className="absolute -inset-1 bg-gradient-to-r from-green-500 to-emerald-500 rounded-[2rem] blur-xl opacity-25 group-hover:opacity-40 transition-opacity" />
      )}
      
      {/* Card */}
      <div className={`relative h-full backdrop-blur-xl bg-white/5 border rounded-3xl p-8 flex flex-col ${
        details.badge 
          ? 'border-green-500/50 shadow-2xl shadow-green-500/10' 
          : 'border-white/10 hover:border-white/20'
      } transition-all`}>
        
        {/* Badge */}
        {details.badge && (
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-gradient-to-r from-green-500 to-emerald-500 text-slate-900 text-xs font-black uppercase tracking-wider rounded-full flex items-center gap-1.5 shadow-lg">
            <Sparkles size={12} />
            {details.badge}
          </div>
        )}

        {/* Header */}
        <div className="mb-8 text-center">
          <h3 className={`text-sm font-black uppercase tracking-widest mb-3 ${
            details.badge ? 'text-green-400' : 'text-slate-400'
          }`}>
            {plan.label}
          </h3>
          <div className="flex items-baseline justify-center gap-2 mb-4">
            <span className="text-2xl text-slate-400">GHS</span>
            <span className="text-5xl font-black text-white">{plan.price}</span>
          </div>
          <p className="text-sm text-slate-400 leading-relaxed">{details.description}</p>
        </div>

        {/* Features */}
        <ul className="space-y-3 mb-8 flex-1">
          <li className="flex items-start gap-3 text-sm">
            <Package size={18} className="text-green-500 shrink-0 mt-0.5" />
            <span className="text-slate-300">
              {plan.limits.products} Products
            </span>
          </li>
          <li className="flex items-start gap-3 text-sm">
            <Box size={18} className="text-green-500 shrink-0 mt-0.5" />
            <span className="text-slate-300">
              {plan.limits.products_360 === 999 ? 'Unlimited' : plan.limits.products_360} 360° Views
            </span>
          </li>
          <li className="flex items-start gap-3 text-sm">
            <Users size={18} className="text-green-500 shrink-0 mt-0.5" />
            <span className="text-slate-300">
              {plan.limits.admins} Admin {plan.limits.admins === 1 ? 'User' : 'Users'}
            </span>
          </li>
          <li className="flex items-start gap-3 text-sm">
            <HardDrive size={18} className="text-green-500 shrink-0 mt-0.5" />
            <span className="text-slate-300">
              {plan.limits.storage_gb} GB Storage
            </span>
          </li>
          {((plan.limits.features as readonly string[]).includes('inventory_sync') || (plan.limits.features as readonly string[]).includes('all')) && (
            <li className="flex items-start gap-3 text-sm">
              <Check size={18} className="text-green-500 shrink-0 mt-0.5" />
              <span className="text-slate-300">
                Inventory Sync
              </span>
            </li>
          )}
        </ul>

        {/* CTA Button */}
        <Link
          href={`/onboarding/apply?plan=${planId}`}
          className={`w-full py-4 rounded-xl font-bold text-center transition-all ${
            details.badge
              ? 'bg-green-500 text-slate-900 hover:bg-green-400 shadow-lg hover:shadow-xl shadow-green-500/25'
              : 'bg-white/10 text-white hover:bg-white/20'
          }`}
        >
          Get Started
        </Link>
      </div>
    </div>
  );
};