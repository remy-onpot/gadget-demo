'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, ShoppingBag, Sparkles } from 'lucide-react';
import { ProductCardVisualProps } from '@/lib/types/card-types';

export const PosterCard = ({ 
  title, 
  price, 
  imageUrl, 
  href, 
  tags, 
  isFeatured,
  primaryColor = '#0f172a', // Admin's Theme Color
  glassMode = false,        // The Toggle
  onAddToCart,
}: ProductCardVisualProps) => {

  // 1. DATA PARSING FOR SKETCH LAYOUT (A, B, C)
  // A = Brand, B & C = Specs
  const brand = tags?.[0] || 'Brand'; // Bubble A
  const spec1 = tags?.[1] || 'New';   // Bubble B
  const spec2 = tags?.[2] || 'Sale';  // Bubble C
  const description = tags?.[3] || 'No description available for this item.';

  return (
    <div className="group h-full w-full select-none">
      <Link href={href} className="block h-full">
        <div 
          className="relative h-full flex flex-col overflow-hidden rounded-[1.5rem] shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 ease-out border"
          style={{ 
            // 2. LIQUID GLASS LOGIC
            // If Glass Mode: Use Primary Color as background + Blur
            // If Normal: White background
            backgroundColor: glassMode ? primaryColor : '#ffffff',
            borderColor: glassMode ? 'rgba(255,255,255,0.1)' : '#f3f4f6',
            color: glassMode ? '#ffffff' : '#0f172a'
          }}
        >
          {/* === GLASS TEXTURE OVERLAY === */}
          {glassMode && (
            <>
              {/* Blur Filter */}
              <div className="absolute inset-0 backdrop-blur-md bg-black/10" />
              {/* Shine Gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none" />
            </>
          )}

          {/* === IMAGE SECTION (Top 60%) === */}
          <div className="relative h-64 md:h-auto md:flex-[1.3] w-full overflow-hidden bg-gray-50/50">
            {/* Featured Badge */}
            {isFeatured && (
               <div className="absolute top-3 left-3 z-10 px-2 py-1 rounded-md bg-white/90 backdrop-blur-md text-[10px] font-bold uppercase tracking-wider text-slate-900 shadow-sm">
                 Featured
               </div>
            )}
            
            {/* Price Badge (Floating) */}
            <div className="absolute bottom-3 right-3 z-10 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-md text-sm font-black text-slate-900 shadow-sm">
                {price}
            </div>

            {imageUrl ? (
              <img 
                src={imageUrl} 
                alt={title} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-300">
                <ShoppingBag size={40} strokeWidth={1} />
              </div>
            )}
          </div>

          {/* === DENSE FOOTER SECTION (Sketch Implementation) === */}
          <div className="relative z-10 p-4 flex flex-col gap-3">
            
            {/* 1. Product Name */}
            <h3 className="text-lg font-bold leading-tight line-clamp-1">
              {title}
            </h3>

            {/* 2. The Sketch Grid (A/B/C vs Description) */}
            <div className="grid grid-cols-[auto_1fr] gap-3 h-24">
              
              {/* LEFT COL: Stacked Bubbles (A, B, C) */}
              <div className="flex flex-col gap-1.5 justify-between py-1">
                 {/* A: Brand */}
                 <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${glassMode ? 'bg-white/20 border-white/10 text-white' : 'bg-gray-100 border-gray-100 text-gray-500'}`}>
                   {brand}
                 </span>
                 {/* B: Spec 1 */}
                 <span className={`w-fit px-2 py-0.5 rounded-md text-[9px] font-medium border ${glassMode ? 'bg-white/10 border-white/5 text-white/80' : 'bg-white border-gray-100 text-gray-400'}`}>
                   {spec1}
                 </span>
                 {/* C: Spec 2 */}
                 <span className={`w-fit px-2 py-0.5 rounded-md text-[9px] font-medium border ${glassMode ? 'bg-white/10 border-white/5 text-white/80' : 'bg-white border-gray-100 text-gray-400'}`}>
                   {spec2}
                 </span>
              </div>

              {/* RIGHT COL: Description Bubble + Action */}
              <div className={`relative rounded-2xl p-3 flex flex-col justify-between border ${glassMode ? 'bg-black/20 border-white/5' : 'bg-gray-50 border-gray-100'}`}>
                 <p className={`text-[10px] leading-relaxed line-clamp-3 ${glassMode ? 'text-white/80' : 'text-gray-500'}`}>
                    {description}
                 </p>
                 
                 {/* Arrow Button (Bottom Right of Bubble) */}
                 <button 
                   onClick={(e) => {
                     e.preventDefault();
                     onAddToCart?.(e);
                   }}
                   className={`absolute bottom-0 right-0 translate-x-1 translate-y-1 w-9 h-9 rounded-xl flex items-center justify-center shadow-md transition-transform active:scale-90 hover:scale-105 ${glassMode ? 'bg-white text-slate-900' : 'bg-slate-900 text-white'}`}
                 >
                    <ArrowRight size={16} />
                 </button>
              </div>

            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};