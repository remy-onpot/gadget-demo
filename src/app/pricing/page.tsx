import React from 'react';
import { Footer } from '@/components/landing/Footer';
import { Check } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Pricing - NimdeShop',
  description: 'Simple, transparent pricing for businesses of all sizes.',
};

export default function PricingPage() {
  return (
    <div className="bg-[#020617] min-h-screen text-slate-200">
       
       <section className="pt-32 pb-20 px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-black text-white mb-6">Simple, transparent pricing.</h1>
          <p className="text-xl text-slate-400">No hidden fees. Cancel anytime.</p>
       </section>

       <section className="pb-32 px-6">
          <div className="container mx-auto max-w-6xl grid md:grid-cols-3 gap-8">
             
             {/* STARTER */}
             <PricingCard 
                title="Starter" 
                price="Free" 
                desc="Perfect for testing the waters."
                features={['1 Store', '50 Products', 'Standard Themes', '2% Transaction Fee', 'Community Support']}
                btnText="Start for Free"
                href="/admin/register?plan=starter"
             />

             {/* PRO (Highlighted) */}
             <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-green-500 to-blue-500 rounded-[2rem] blur opacity-30"></div>
                <PricingCard 
                   title="Pro" 
                   price="GH₵ 150" 
                   period="/mo"
                   desc="For growing businesses."
                   features={['3 Stores', 'Unlimited Products', 'Premium Themes', '1% Transaction Fee', 'Custom Domain Support', 'Priority Support']}
                   btnText="Get Started"
                   href="/admin/register?plan=pro"
                   highlighted
                />
             </div>

             {/* ENTERPRISE */}
             <PricingCard 
                title="Enterprise" 
                price="Custom" 
                desc="For large scale operations."
                features={['Unlimited Stores', 'Unlimited Products', 'Custom Development', '0% Transaction Fee', 'Dedicated Account Manager', 'API Access']}
                btnText="Contact Sales"
                href="mailto:sales@nimdeshop.com"
             />

          </div>
       </section>

       <Footer />
    </div>
  );
}

const PricingCard = ({ title, price, period, desc, features, btnText, href, highlighted }: any) => (
  <div className={`h-full p-8 rounded-3xl border flex flex-col ${highlighted ? 'bg-slate-900 border-green-500/50 relative z-10' : 'bg-slate-950 border-white/10'}`}>
     <div className="mb-8">
        <h3 className={`text-lg font-bold uppercase tracking-widest mb-2 ${highlighted ? 'text-green-400' : 'text-slate-400'}`}>{title}</h3>
        <div className="flex items-baseline gap-1">
           <span className="text-4xl font-black text-white">{price}</span>
           {period && <span className="text-slate-500">{period}</span>}
        </div>
        <p className="text-slate-400 mt-4 text-sm">{desc}</p>
     </div>
     
     <ul className="space-y-4 mb-8 flex-1">
        {features.map((f: string, i: number) => (
           <li key={i} className="flex items-start gap-3 text-sm text-slate-300">
              <Check size={18} className="text-green-500 shrink-0" /> {f}
           </li>
        ))}
     </ul>

     <Link 
        href={href} 
        className={`w-full py-4 rounded-xl font-bold text-center transition-all ${
           highlighted 
             ? 'bg-green-500 text-slate-900 hover:bg-green-400' 
             : 'bg-white/10 text-white hover:bg-white/20'
        }`}
     >
        {btnText}
     </Link>
  </div>
);