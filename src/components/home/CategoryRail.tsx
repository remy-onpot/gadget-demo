"use client";

import React, { useRef } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight, Zap, Layers } from 'lucide-react';
import Link from 'next/link';
import { Product } from '@/lib/types';
import { ProductCard } from '@/components/ProductCard';

interface RailProps {
  category: string;
  products: Product[];
  settings?: {
    title?: string;
    subtitle?: string;
    image_url?: string;
  };
}

export const CategoryRail = ({ category, products, settings }: RailProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Fallback values if DB data is missing
  const title = settings?.title || category;
  const subtitle = settings?.subtitle || 'Featured Collection';
  const imageUrl = settings?.image_url; // If null, we fall back to a dark gradient

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const current = scrollRef.current;
      const scrollAmount = direction === 'left' ? -320 : 320;
      current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (products.length === 0) return null;

  return (
    <section className="py-10 border-b border-gray-100 last:border-0 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="container mx-auto max-w-[1600px] px-3 md:px-4">
        
        {/* Header */}
        <div className="flex items-end justify-between mb-6">
           <div className="flex items-center gap-3">
              <div className="w-1.5 h-8 rounded-full bg-slate-900" />
              <div>
                <h3 className="text-2xl font-black text-slate-900 capitalize tracking-tight leading-none">
                    {title}
                </h3>
                <span className="text-gray-400 font-bold text-xs uppercase tracking-widest">{subtitle}</span>
              </div>
           </div>
           
           <div className="hidden md:flex gap-2">
              <button onClick={() => scroll('left')} className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-200 hover:bg-slate-900 hover:text-white hover:border-slate-900 text-slate-600 transition-all">
                <ChevronLeft size={20}/>
              </button>
              <button onClick={() => scroll('right')} className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-200 hover:bg-slate-900 hover:text-white hover:border-slate-900 text-slate-600 transition-all">
                <ChevronRight size={20}/>
              </button>
           </div>
        </div>

        {/* The Rail */}
        <div className="relative group/rail">
           <div 
             ref={scrollRef}
             className="flex gap-4 overflow-x-auto pb-8 -mb-8 snap-x snap-mandatory scrollbar-hide px-1"
             style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
           >
              {/* 1. IDENTITY CARD (Now with Image) */}
              <div className="min-w-[280px] md:min-w-[320px] snap-start h-auto">
                 <Link 
                    href={`/category/${category}`}
                    className="block h-full min-h-[400px] rounded-3xl relative overflow-hidden group/card shadow-lg hover:shadow-2xl transition-all hover:-translate-y-1"
                 >
                    {/* Background Image */}
                    {imageUrl ? (
                        <div className="absolute inset-0">
                           <img src={imageUrl} alt={title} className="w-full h-full object-cover transition-transform duration-1000 group-hover/card:scale-110" />
                           {/* Dark Gradient Overlay for Text Readability */}
                           <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10" />
                        </div>
                    ) : (
                        // Fallback Gradient
                        <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900" />
                    )}
                    
                    <div className="relative z-10 p-8 flex flex-col justify-between h-full">
                       <div>
                           <div className="inline-flex items-center gap-1.5 border border-white/30 bg-black/20 backdrop-blur-md px-3 py-1 rounded-full text-white mb-4">
                              <Zap size={12} fill="currentColor" />
                              <span className="text-[10px] font-black uppercase tracking-widest">Collection</span>
                           </div>
                           
                           <h4 className="text-4xl font-black text-white leading-[0.9] capitalize drop-shadow-md">
                              {title}
                           </h4>
                           
                           <p className="mt-4 text-sm font-medium leading-relaxed text-gray-200">
                              {subtitle}
                              <br/>
                              <span className="font-bold text-white opacity-100">{products.length}+ Items Available</span>
                           </p>
                       </div>
                       
                       <div className="inline-flex items-center gap-3 bg-white text-slate-900 pl-6 pr-2 py-2 rounded-full font-bold text-sm shadow-xl group-hover/card:scale-105 transition-transform w-fit">
                          <span>View All</span>
                          <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center">
                             <ArrowRight size={14} />
                          </div>
                       </div>
                    </div>
                 </Link>
              </div>

              {/* 2. PRODUCTS LOOP */}
              {products.map((product) => (
                 <div key={product.id} className="min-w-[280px] md:min-w-[300px] snap-start">
                    <ProductCard product={product} />
                 </div>
              ))}
              
              {/* 3. END CARD */}
              <div className="min-w-[200px] md:min-w-[240px] snap-start">
                 <Link 
                   href={`/category/${category}`} 
                   className="h-full min-h-[400px] rounded-3xl bg-slate-50 border-2 border-dashed border-slate-200 hover:border-slate-400 hover:bg-slate-100 flex flex-col items-center justify-center gap-4 group/more transition-all"
                 >
                    <div className="w-16 h-16 rounded-full bg-white shadow-sm flex items-center justify-center group-hover/more:scale-110 transition-transform">
                       <Layers className="text-slate-400 group-hover/more:text-slate-900 transition-colors" size={24} />
                    </div>
                    <div className="text-center">
                       <h5 className="font-black text-slate-700 text-lg group-hover/more:text-slate-900">View All</h5>
                       <p className="text-xs font-medium text-slate-400 uppercase tracking-widest mt-1">
                          {title}
                       </p>
                    </div>
                 </Link>
              </div>

           </div>
        </div>
      </div>
    </section>
  );
};;