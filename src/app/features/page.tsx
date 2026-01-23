import React from 'react';
import { Footer } from '@/components/landing/Footer';
import { Zap, Layout, BarChart3, Globe, ShieldCheck, Smartphone } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Features - NimdeShop',
  description: 'Everything you need to build, scale, and manage your online store in Africa.',
};

export default function FeaturesPage() {
  return (
    <div className="bg-[#020617] min-h-screen text-slate-200">
       
       {/* HERO */}
       <section className="pt-32 pb-20 px-6 text-center">
          <div className="container mx-auto max-w-4xl">
             <span className="text-green-500 font-bold tracking-widest text-xs uppercase mb-4 block">Platform Capabilities</span>
             <h1 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight leading-tight">
                Tools built for <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500">modern commerce.</span>
             </h1>
             <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
                From product management to real-time analytics, NimdeShop gives you the power to run your business from anywhere.
             </p>
          </div>
       </section>

       {/* FEATURES GRID */}
       <section className="py-20 bg-slate-900/50 border-y border-white/5">
          <div className="container mx-auto px-6 max-w-7xl grid md:grid-cols-3 gap-8">
             <FeatureCard 
                icon={<Layout size={32} className="text-blue-500"/>}
                title="Storefront Themes"
                desc="Choose from professionally designed themes that look great on mobile and desktop. No coding required."
             />
             <FeatureCard 
                icon={<Smartphone size={32} className="text-green-500"/>}
                title="Mobile First"
                desc="Your store is optimized for speed on 3G/4G networks, ensuring customers can buy even with slow connections."
             />
             <FeatureCard 
                icon={<BarChart3 size={32} className="text-purple-500"/>}
                title="Real-Time Analytics"
                desc="Track sales, visitor traffic, and inventory levels in real-time from your admin dashboard."
             />
             <FeatureCard 
                icon={<Globe size={32} className="text-orange-500"/>}
                title="Custom Domains"
                desc="Connect your own .com or .gh domain name to build trust and brand identity."
             />
             <FeatureCard 
                icon={<Zap size={32} className="text-yellow-500"/>}
                title="Fast Checkout"
                desc="Optimized checkout flow that supports local payment methods like Mobile Money and Cards."
             />
             <FeatureCard 
                icon={<ShieldCheck size={32} className="text-cyan-500"/>}
                title="Secure Hosting"
                desc="We handle the SSL certificates, hosting, and security updates so you can focus on selling."
             />
          </div>
       </section>

       {/* CTA */}
       <section className="py-32 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">Ready to start selling?</h2>
          <Link href="/pricing" className="bg-green-500 hover:bg-green-600 text-slate-900 font-bold py-4 px-10 rounded-full transition-all inline-flex items-center gap-2">
             View Pricing
          </Link>
       </section>

       <Footer />
    </div>
  );
}

const FeatureCard = ({ icon, title, desc }: any) => (
  <div className="p-8 bg-slate-950 border border-white/10 rounded-3xl hover:border-green-500/50 transition-colors group">
     <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
        {icon}
     </div>
     <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
     <p className="text-slate-400 leading-relaxed">{desc}</p>
  </div>
);