"use client";

import React, { useState, useEffect } from 'react';
import { ArrowRight, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Database } from '@/lib/database.types'; // ✅ Correct Import

// ✅ Use Centralized Type
type BannerRow = Database['public']['Tables']['banners']['Row'];

interface HeroGridProps {
  banners: BannerRow[];
}

export const HeroGrid = ({ banners }: HeroGridProps) => {
  // Filter active banners
  const mainHeroes = banners.filter(b => b.slot === 'main_hero' && b.is_active);
  const sideTops = banners.filter(b => b.slot === 'side_top' && b.is_active);
  const sideBottoms = banners.filter(b => b.slot === 'side_bottom' && b.is_active);

  const [indices, setIndices] = useState({ main: 0, top: 0, bottom: 0 });

  // Auto-Rotate Logic
  useEffect(() => {
    const interval = setInterval(() => {
      setIndices(prev => ({
        main: mainHeroes.length > 1 ? (prev.main + 1) % mainHeroes.length : 0,
        top: sideTops.length > 1 ? (prev.top + 1) % sideTops.length : 0,
        bottom: sideBottoms.length > 1 ? (prev.bottom + 1) % sideBottoms.length : 0,
      }));
    }, 6000);
    return () => clearInterval(interval);
  }, [mainHeroes.length, sideTops.length, sideBottoms.length]);

  // --- FALLBACK STATE ---
  // If no banners exist, show a "Welcome" placeholder instead of empty space
  if (mainHeroes.length === 0 && sideTops.length === 0 && sideBottoms.length === 0) {
      return (
          <section className="px-3 md:px-4 mb-8">
              <div className="container mx-auto max-w-[1600px] h-[300px] md:h-[450px] rounded-3xl bg-slate-900 relative overflow-hidden flex items-center justify-center text-center p-6">
                  {/* Grainy Gradient Background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-slate-900 to-black" />
                  <div className="absolute inset-0 opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay"></div>
                  
                  <div className="relative z-10 max-w-2xl">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-blue-200 text-xs font-bold uppercase tracking-wider mb-4 backdrop-blur-md">
                         <ShoppingBag size={14} /> Welcome to Our Store
                      </div>
                      <h1 className="text-3xl md:text-6xl font-black text-white mb-6">Discover Premium Quality</h1>
                      <Link href="/search" className="inline-flex items-center gap-2 bg-white text-slate-900 px-6 py-3 rounded-full font-bold hover:bg-blue-50 transition-colors">
                          Start Shopping <ArrowRight size={18} />
                      </Link>
                  </div>
              </div>
          </section>
      );
  }

  const activeMain = mainHeroes[indices.main];
  const activeTop = sideTops[indices.top];
  const activeBottom = sideBottoms[indices.bottom];

  return (
    <section className="px-3 md:px-4 mb-8">
      <div className="container mx-auto max-w-[1600px]">
        
        {/* GRID LAYOUT: 450px Height on Desktop */}
        <div className="grid grid-cols-1 md:grid-cols-12 md:grid-rows-2 gap-3 md:gap-4 h-auto md:h-[450px]">
          
          {/* --- MAIN HERO CARD --- */}
          <div className="col-span-1 md:col-span-8 md:row-span-2 relative rounded-3xl md:rounded-[2.5rem] overflow-hidden group shadow-xl aspect-[2/1] md:aspect-auto md:h-full bg-slate-900">
            <AnimatePresence mode="wait">
              {activeMain && (
                <motion.div
                  key={activeMain.id}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="absolute inset-0 w-full h-full"
                >
                  {/* Background */}
                  <div className="absolute inset-0">
                      <div className="absolute top-0 left-0 w-full h-full"
                        style={{ background: `radial-gradient(circle at 0% 0%, #00AEEF 0%, transparent 50%), radial-gradient(circle at 100% 100%, #F7931E 0%, transparent 50%), linear-gradient(135deg, #00AEEF 0%, #F7931E 100%)` }} 
                      />
                      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
                      <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/30 to-transparent z-10"></div>
                  </div>

                  {/* Content */}
                  <div className="relative z-20 h-full flex flex-col justify-center p-6 md:p-14">
                    <div className="w-[70%] md:w-3/5 space-y-2 md:space-y-5">
                      {activeMain.label && (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/20 shadow-sm">
                          <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse"></span>
                          <span className="text-[9px] md:text-xs font-black uppercase tracking-widest text-white">{activeMain.label}</span>
                        </div>
                      )}
                      
                      <h1 className="text-2xl sm:text-4xl md:text-6xl lg:text-7xl font-black text-white leading-[0.9] tracking-tight drop-shadow-xl line-clamp-2">
                        {activeMain.title}
                      </h1>
                      
                      {activeMain.description && (
                          <p className="hidden xs:block text-white/90 text-xs md:text-lg lg:text-xl font-medium leading-relaxed max-w-sm md:max-w-lg drop-shadow-md line-clamp-2">
                            {activeMain.description}
                          </p>
                      )}
                      
                      {activeMain.link_url && (
                          <Link 
                            href={activeMain.link_url} 
                            className="inline-flex items-center gap-2 bg-white text-slate-900 pl-4 pr-1.5 py-1.5 md:pl-8 md:pr-2 md:py-3 rounded-full font-bold text-xs md:text-lg shadow-lg hover:scale-105 transition-transform mt-1"
                          >
                            <span>{activeMain.cta_text || 'Shop Now'}</span>
                            <div className="w-6 h-6 md:w-10 md:h-10 bg-slate-900 rounded-full flex items-center justify-center text-white">
                              <ArrowRight size={12} className="md:w-5 md:h-5"/>
                            </div>
                          </Link>
                      )}
                    </div>
                  </div>

                  {/* Image */}
                  <div className="absolute bottom-0 right-0 w-[55%] h-[90%] md:w-[55%] md:h-[90%] z-10 pointer-events-none">
                      <div className="relative w-full h-full">
                         <Image 
                           src={activeMain.image_url}
                           fill
                           className="object-contain object-bottom-right drop-shadow-[-10px_10px_20px_rgba(0,0,0,0.4)]"
                           alt={activeMain.title || 'Main Hero'}
                           priority // ✅ High Priority for LCP
                         />
                      </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Indicators */}
            {mainHeroes.length > 1 && (
                <div className="absolute bottom-4 left-6 flex gap-1 z-30">
                    {mainHeroes.map((_, idx) => (
                        <div key={idx} className={`h-1 md:h-1.5 rounded-full transition-all duration-300 ${indices.main === idx ? 'w-6 md:w-10 bg-white' : 'w-2 md:w-3 bg-white/40'}`} />
                    ))}
                </div>
            )}
          </div>

          {/* --- SIDE CARDS --- */}
          <div className="col-span-1 md:col-span-4 md:row-span-2 grid grid-cols-2 md:grid-cols-1 md:grid-rows-2 gap-3 md:gap-4 h-36 md:h-full">
            
            {/* TOP SIDE */}
            <div className="relative rounded-2xl md:rounded-[2.5rem] overflow-hidden group shadow-lg bg-[#0F172A]">
              <AnimatePresence mode="wait">
                {activeTop ? (
                  <motion.div
                    key={activeTop.id}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="absolute inset-0 w-full h-full"
                  >
                    <Link href={activeTop.link_url || '#'} className="block w-full h-full relative p-4 md:p-8 flex flex-col justify-center items-start z-20">
                        {/* Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/20 to-transparent z-0"></div>
                        
                        <div className="relative z-20 max-w-[90%] md:max-w-[60%]">
                          {activeTop.label && <div className="text-[8px] md:text-[10px] font-black uppercase tracking-wider text-cyan-400 mb-1">{activeTop.label}</div>}
                          <h2 className="text-sm md:text-3xl font-black text-white leading-tight mb-1 md:mb-3 uppercase line-clamp-2">{activeTop.title}</h2>
                          <span className="text-[10px] md:text-xs font-bold text-white/70 border-b border-white/20 pb-0.5 group-hover:text-white group-hover:border-white transition-all">Shop Now</span>
                        </div>

                        {/* Image */}
                        <div className="absolute bottom-0 right-[5%] w-[70%] h-[90%] md:h-[90%] z-10">
                           <Image src={activeTop.image_url} fill className="object-contain object-bottom-right drop-shadow-xl" alt={activeTop.title || 'Offer'}/>
                        </div>
                    </Link>
                  </motion.div>
                ) : (
                   /* Empty State for Side Top */
                   <div className="absolute inset-0 flex items-center justify-center bg-slate-800 text-slate-600 font-bold text-xs uppercase tracking-widest">
                       Details Coming Soon
                   </div>
                )}
              </AnimatePresence>
            </div>

            {/* BOTTOM SIDE */}
            <div className="relative rounded-2xl md:rounded-[2.5rem] overflow-hidden group shadow-lg bg-white border border-gray-100">
              <AnimatePresence mode="wait">
                {activeBottom ? (
                  <motion.div
                    key={activeBottom.id}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="absolute inset-0 w-full h-full"
                  >
                      <Link href={activeBottom.link_url || '#'} className="block w-full h-full relative p-4 md:p-8 flex items-center">
                        {/* Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/50 to-transparent z-10"></div>

                        <div className="w-full md:w-1/2 relative z-20">
                          <div className="text-[8px] md:text-[10px] font-bold uppercase tracking-wider text-orange-500 mb-0.5">{activeBottom.label || 'Deal'}</div>
                          <h2 className="text-sm md:text-3xl font-black text-slate-900 leading-tight mb-1 md:mb-3 uppercase line-clamp-2">{activeBottom.title}</h2>
                          <div className="hidden md:flex w-10 h-10 rounded-full bg-slate-100 items-center justify-center text-slate-900 group-hover:bg-orange-500 group-hover:text-white transition-colors">
                             <ArrowRight size={18}/>
                          </div>
                        </div>

                        {/* Image */}
                        <div className="absolute bottom-0 right-5 w-[50%] h-[90%] md:w-[60%] md:h-[90%] z-0">
                            <Image src={activeBottom.image_url} fill className="object-contain object-bottom-right drop-shadow-lg" alt={activeBottom.title || 'Deal'}/>
                        </div>
                      </Link>
                  </motion.div>
                ) : (
                    /* Empty State for Side Bottom */
                   <div className="absolute inset-0 flex items-center justify-center bg-slate-50 text-slate-400 font-bold text-xs uppercase tracking-widest">
                       Stay Tuned
                   </div>
                )}
              </AnimatePresence>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};