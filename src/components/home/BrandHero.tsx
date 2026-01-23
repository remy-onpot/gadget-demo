"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ChevronLeft, ChevronRight, ShoppingBag } from 'lucide-react';
import { Database } from '@/lib/database.types';

type Banner = Database['public']['Tables']['banners']['Row'];

interface BrandHeroProps {
  banners: Banner[];
  storeName?: string;       
  storeDescription?: string; 
}

export const BrandHero = ({ banners, storeName = "Welcome", storeDescription }: BrandHeroProps) => {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);

  // --- 1. EMPTY STATE CHECK ---
  if (!banners || banners.length === 0) {
    return (
      <section className="relative w-full h-[300px] md:h-[400px] flex items-center justify-center overflow-hidden bg-[#020617] rounded-3xl mb-8 border border-white/5 shadow-2xl">
         
         {/* Background Gradients */}
         <div className="absolute inset-0 w-full h-full">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-900/40 via-slate-900 to-slate-950 z-0" />
            <div className="absolute -top-[50%] -left-[20%] w-[80%] h-[80%] bg-blue-600/20 blur-[100px] rounded-full mix-blend-screen animate-pulse" />
            <div className="absolute top-[20%] -right-[20%] w-[60%] h-[60%] bg-purple-600/20 blur-[80px] rounded-full mix-blend-screen" />
            <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/noise.png')]"></div>
         </div>

         {/* Content */}
         <div className="relative z-10 text-center px-4 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-blue-200 text-[10px] md:text-xs font-bold uppercase tracking-wider mb-4 backdrop-blur-md">
               <ShoppingBag size={12} /> Official Store
            </div>
            
            <h1 className="text-3xl md:text-6xl font-black text-white tracking-tight mb-4 drop-shadow-2xl">
              {storeName}
            </h1>
            
            <p className="text-sm md:text-xl text-slate-300 font-medium max-w-lg mx-auto leading-relaxed mb-8">
               {storeDescription || "Discover our premium collection. Quality products and excellent service."}
            </p>

            <Link href="#products" className="inline-flex items-center gap-2 bg-white text-slate-950 px-6 py-3 rounded-xl font-bold text-sm md:text-base hover:bg-blue-50 transition-all shadow-lg hover:scale-105 active:scale-95">
               Start Shopping <ArrowRight size={18} />
            </Link>
         </div>
      </section>
    );
  }

  // --- 2. CAROUSEL LOGIC ---
  
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => nextSlide(), 6000);
    return () => clearInterval(timer);
  }, [current, banners.length]);

  const nextSlide = () => {
    setDirection(1);
    setCurrent((prev) => (prev + 1) % banners.length);
  };

  const prevSlide = () => {
    setDirection(-1);
    setCurrent((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const variants = {
    enter: (direction: number) => ({ x: direction > 0 ? '100%' : '-100%' }),
    center: { zIndex: 1, x: 0 },
    exit: (direction: number) => ({ zIndex: 0, x: direction < 0 ? '100%' : '-100%' }),
  };

  return (
    <section className="w-full relative group overflow-hidden bg-slate-900 rounded-xl mb-6">
      <div className="relative w-full h-[280px] md:h-auto md:aspect-[21/9]">
        
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.div
            key={current}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ x: { type: "spring", stiffness: 300, damping: 30 } }}
            className="absolute inset-0 w-full h-full"
          >
            {/* Image Layer */}
            <div className="relative w-full h-full">
               <Image 
                 src={banners[current].image_url} 
                 fill 
                 className="object-cover object-[75%_center] md:object-center" 
                 alt={banners[current].title || 'Hero'}
                 priority
               />
               <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/40 to-transparent" />
            </div>

            {/* Content Layer */}
            <div className="absolute inset-0 flex flex-col justify-center px-6 md:px-16">
              <div className="w-full max-w-[70%] md:max-w-xl">
                
                {banners[current].label && (
                  <div className="inline-block px-2 py-0.5 md:px-3 md:py-1 rounded border border-white/20 bg-white/10 backdrop-blur-md mb-2 md:mb-4">
                    <span className="text-[9px] md:text-xs font-bold uppercase tracking-widest text-white">
                      {banners[current].label}
                    </span>
                  </div>
                )}

                <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-black text-white leading-tight mb-2 md:mb-4 drop-shadow-lg">
                  {banners[current].title}
                </h1>

                {banners[current].description && (
                  <p className="hidden xs:block text-xs md:text-lg font-medium text-slate-200 mb-3 md:mb-6 line-clamp-2 max-w-md drop-shadow-md">
                    {banners[current].description}
                  </p>
                )}

                {banners[current].link_url && (
                  <Link 
                    href={banners[current].link_url} 
                    className="inline-flex items-center gap-2 bg-white text-slate-950 px-4 py-2 md:px-6 md:py-3 rounded-lg font-bold text-xs md:text-base hover:bg-orange-500 hover:text-white transition-colors shadow-lg"
                  >
                    {banners[current].cta_text || 'Shop Now'} <ArrowRight size={14} className="md:w-5 md:h-5"/>
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Desktop Arrows */}
        <div className="hidden md:flex absolute inset-0 pointer-events-none items-center justify-between px-4 opacity-0 group-hover:opacity-100 transition-opacity z-20">
           <button onClick={prevSlide} className="pointer-events-auto w-12 h-12 rounded-full bg-black/20 backdrop-blur-md border border-white/10 text-white flex items-center justify-center hover:bg-white hover:text-black transition">
              <ChevronLeft size={24}/>
           </button>
           <button onClick={nextSlide} className="pointer-events-auto w-12 h-12 rounded-full bg-black/20 backdrop-blur-md border border-white/10 text-white flex items-center justify-center hover:bg-white hover:text-black transition">
              <ChevronRight size={24}/>
           </button>
        </div>

        {/* Indicators */}
        <div className="absolute bottom-3 left-6 md:bottom-8 md:left-16 flex gap-2 z-20">
           {banners.map((_, idx) => (
              <button 
                key={idx} 
                onClick={() => { setDirection(idx > current ? 1 : -1); setCurrent(idx); }}
                className={`h-1 transition-all duration-300 rounded-full ${current === idx ? 'w-6 bg-orange-500' : 'w-2 bg-white/30 hover:bg-white/60'}`}
              />
           ))}
        </div>

      </div>
    </section>
  );
};