"use client";

import React from 'react';
import { Truck, ShieldCheck, Star, MessageCircle, GraduationCap } from 'lucide-react';
import Link from 'next/link';

interface SocialGridProps {
  settings: Record<string, string>;
}

export const SocialGrid = ({ settings }: SocialGridProps) => {
  const whatsapp = settings['whatsapp_phone'];
  
  return (
    // MOBILE FIX: Reduced py-24 to py-12.
    <section className="py-12 md:py-24 px-4 md:px-6 bg-[#0A2540] text-white overflow-hidden relative">
      <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>

      <div className="container mx-auto max-w-7xl relative z-10">
        
        {/* MOBILE FIX: Reduced bottom margin mb-20 -> mb-10 */}
        <div className="mb-10 md:mb-20 text-center max-w-3xl mx-auto">
           <h2 className="text-2xl md:text-5xl font-black mb-4 leading-tight">
              More Than Just a Tech Store.
           </h2>
           <p className="text-blue-200 text-sm md:text-xl mb-6 leading-relaxed font-medium px-4">
              We started Payless4Tech with a simple mission: to make premium technology accessible to everyone in Ghana.
           </p>
           <Link href="/about" className="text-sm md:text-base inline-block border-b-2 border-orange-500 pb-1 font-bold text-orange-500 hover:text-white transition-colors">
              Read Our Full Story
           </Link>
        </div>

        {/* MOBILE FIX: Changed gap-6 to gap-3. Auto rows reduced. */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6 md:auto-rows-[280px]">
           
           {/* TILE 1: STUDENT (Full width on mobile) */}
           <div className="col-span-2 relative rounded-3xl md:rounded-[2.5rem] bg-white/5 border border-white/10 p-6 md:p-10 overflow-hidden">
              <div className="relative z-10 max-w-md">
                 <div className="inline-flex items-center gap-2 bg-orange-500/20 text-orange-400 border border-orange-500/30 rounded-full px-3 py-1 font-bold text-[10px] uppercase tracking-wider mb-3">
                    <GraduationCap size={14} /> Campus Favorite
                 </div>
                 <h3 className="text-xl md:text-3xl font-black text-white mb-2">Student Discounts</h3>
                 <p className="text-blue-100/80 text-sm md:text-base leading-relaxed">
                    From Legon to KNUST, we support students with affordable, high-performance laptops.
                 </p>
              </div>
           </div>

           {/* MOBILE FIX: 
              DELIVERY & WARRANTY are now Side-by-Side (col-span-1) on mobile 
              instead of stacking full width. This saves huge vertical space.
           */}
           
           {/* TILE 2: DELIVERY */}
           <div className="col-span-1 relative rounded-2xl md:rounded-[2.5rem] bg-white text-slate-900 p-4 md:p-8 flex flex-col justify-between shadow-lg min-h-[160px]">
              <div>
                 <div className="w-8 h-8 md:w-12 md:h-12 bg-green-100 rounded-xl flex items-center justify-center text-green-600 mb-3 md:mb-6">
                    <Truck size={18} className="md:w-6 md:h-6" />
                 </div>
                 <h3 className="text-sm md:text-2xl font-black mb-1 leading-tight">Fast Delivery</h3>
                 <p className="hidden md:block text-slate-500 text-sm font-medium">Order before 2 PM for same-day delivery.</p>
              </div>
              <div className="flex gap-1"><div className="h-1 w-6 bg-green-500 rounded-full"/><div className="h-1 w-3 bg-gray-200 rounded-full"/></div>
           </div>

           {/* TILE 3: WARRANTY */}
           <div className="col-span-1 relative rounded-2xl md:rounded-[2.5rem] bg-orange-500 text-white p-4 md:p-8 flex flex-col justify-center items-center text-center shadow-lg min-h-[160px]">
              <ShieldCheck size={32} className="text-white mb-2 md:mb-4 opacity-90 md:w-12 md:h-12" />
              <h3 className="text-sm md:text-xl font-black mb-1 leading-tight">6-Month Warranty</h3>
              <p className="hidden md:block text-white/80 text-sm font-medium">Verified quality checks on all devices.</p>
           </div>

           {/* TILE 4: TESTIMONIAL (Full width) */}
           <div className="col-span-2 relative rounded-3xl md:rounded-[2.5rem] bg-white/5 border border-white/10 p-6 md:p-10 flex flex-col justify-center">
              <div className="flex text-yellow-400 gap-0.5 mb-3">
                 {[...Array(5)].map((_,i) => <Star key={i} fill="currentColor" size={16} />)}
              </div>
              <blockquote className="text-lg md:text-2xl font-bold text-white leading-snug mb-6">
                 "I was scared to buy online, but Payless delivered to my hostel in 2 hours."
              </blockquote>
              <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                 <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500" />
                     <div>
                        <div className="font-bold text-white text-sm">Ama Serwaa</div>
                        <div className="text-[10px] md:text-xs font-bold text-blue-300 uppercase">Medical Student, Legon</div>
                     </div>
                 </div>
                 {whatsapp && (
                    <a href={`https://wa.me/${whatsapp}`} target="_blank" className="w-full md:w-auto inline-flex items-center justify-center gap-2 bg-[#25D366] text-white px-5 py-3 rounded-xl font-bold text-sm shadow-lg">
                        <MessageCircle size={18} /> Chat & Verify
                    </a>
                 )}
              </div>
           </div>

        </div>
      </div>
    </section>
  );
};