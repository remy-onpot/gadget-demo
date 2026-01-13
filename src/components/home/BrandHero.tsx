"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Banner } from '@/lib/types';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';

export const BrandHero = ({ banners }: { banners: Banner[] }) => {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);

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

  if (!banners || banners.length === 0) return null;

  return (
    <section className="w-full relative group overflow-hidden bg-slate-900 rounded-xl mb-6">
      
      {/* MOBILE: Fixed Height (240px) | DESKTOP: Cinematic Ratio (21/9) */}
      <div className="relative w-full h-[240px] md:h-auto md:aspect-[21/9]">
        
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
            {/* 1. IMAGE LAYER */}
            <div className="relative w-full h-full">
               {/* MOBILE FIX: object-[75%_center] 
                  This tells the image to focus 75% to the right (where the product is)
                  instead of the center (which might be empty space).
               */}
               <Image 
                 src={banners[current].image_url} 
                 fill 
                 className="object-cover object-[75%_center] md:object-center" 
                 alt={banners[current].title || 'Hero'}
                 priority
               />
               
               {/* SCRIM: Darker on mobile to ensure text pops against complex backgrounds */}
               <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/40 to-transparent" />
            </div>

            {/* 2. CONTENT LAYER */}
            <div className="absolute inset-0 flex flex-col justify-center px-5 md:px-16">
              
              {/* MOBILE FIX: max-w-[60%]
                 This ensures text NEVER crosses into the right side of the screen 
                 where the product image is located.
              */}
              <div className="w-full max-w-[60%] md:max-w-xl">
                
                {banners[current].label && (
                  <div className="inline-block px-2 py-0.5 md:px-3 md:py-1 rounded border border-white/20 bg-white/10 backdrop-blur-md mb-2 md:mb-4">
                    <span className="text-[9px] md:text-xs font-bold uppercase tracking-widest text-white">
                      {banners[current].label}
                    </span>
                  </div>
                )}

                {/* MOBILE FIX: text-2xl (Smaller title so it doesn't wrap awkwardly) */}
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
                    className="inline-flex items-center gap-2 bg-white text-slate-950 px-3 py-1.5 md:px-6 md:py-3 rounded-lg font-bold text-[10px] md:text-base hover:bg-orange-500 hover:text-white transition-colors"
                  >
                    {banners[current].cta_text || 'Shop Now'} <ArrowRight size={14} className="md:w-5 md:h-5"/>
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* DESKTOP ARROWS */}
        <div className="hidden md:flex absolute inset-0 pointer-events-none items-center justify-between px-4 opacity-0 group-hover:opacity-100 transition-opacity z-20">
           <button onClick={prevSlide} className="pointer-events-auto w-12 h-12 rounded-full bg-black/20 backdrop-blur-md border border-white/10 text-white flex items-center justify-center hover:bg-white hover:text-black transition">
              <ChevronLeft size={24}/>
           </button>
           <button onClick={nextSlide} className="pointer-events-auto w-12 h-12 rounded-full bg-black/20 backdrop-blur-md border border-white/10 text-white flex items-center justify-center hover:bg-white hover:text-black transition">
              <ChevronRight size={24}/>
           </button>
        </div>

        {/* INDICATORS */}
        <div className="absolute bottom-3 left-5 md:bottom-8 md:left-16 flex gap-2 z-20">
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