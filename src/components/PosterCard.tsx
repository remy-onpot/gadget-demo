'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles, ShoppingBag } from 'lucide-react';
import { ProductCardVisualProps } from '@/lib/types/card-types';

/**
 * PosterCard - Editorial, Nike-inspired design
 * Large hero image with overlay info and decorative accents
 */
export const PosterCard = ({ 
  title, 
  price, 
  imageUrl, 
  href, 
  tags,
  isFeatured,
  primaryColor,
  borderRadius = '2rem', 
  glassMode = false,
}: ProductCardVisualProps) => {
  
  // Calculate inner radius
  const innerRadius = `calc(${borderRadius} - 0.5rem)`;
  
  // Get condition and specs from tags
  const condition = tags?.[0] || 'New';

  // Card container styles
  const cardStyle = glassMode ? {
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    border: '1px solid rgba(255, 255, 255, 0.4)',
    borderRadius,
  } : {
    backgroundColor: 'white',
    borderRadius,
  };

  return (
    <Link href={href} className="group block h-full select-none">
      <div 
        className="relative p-2 shadow-sm hover:shadow-2xl transition-all duration-500 h-full flex flex-col overflow-hidden"
        style={cardStyle}
      >
        {/* Hero Image Area */}
        <div 
          className="relative aspect-[4/5] w-full overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200"
          style={{ borderRadius: innerRadius }}
        >
          {/* Featured Badge */}
          {isFeatured && (
            <div 
              className="absolute top-3 left-3 z-10 px-3 py-1.5 rounded-lg text-[10px] font-bold text-white uppercase tracking-wider shadow-lg"
              style={{ backgroundColor: primaryColor }}
            >
              Featured
            </div>
          )}
          
          {/* Decorative Icon */}
          <div className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm">
            <Sparkles size={14} style={{ color: primaryColor }} />
          </div>

          {/* Decorative Accent Dots */}
          <div className="absolute top-1/4 left-3 flex flex-col gap-2 opacity-60">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: primaryColor }} />
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: primaryColor }} />
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: primaryColor }} />
          </div>

          {imageUrl ? (
            <img 
              src={imageUrl} 
              alt={title} 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-300">
              <ShoppingBag size={48} strokeWidth={1} />
            </div>
          )}

          {/* Bottom Gradient Overlay */}
          <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/60 to-transparent" />
          
          {/* Overlay Content */}
          <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
            <p className="text-[10px] font-bold uppercase tracking-widest opacity-80 mb-1">
              {condition}
            </p>
            <h3 className="text-lg font-bold leading-tight line-clamp-2">
              {title}
            </h3>
          </div>
        </div>

        {/* Footer: Price and CTA */}
        <div className="pt-3 px-1 pb-1 flex items-center justify-between gap-2">
          <div className="bg-slate-100/80 rounded-xl px-4 py-2">
            <div className="flex items-baseline gap-1">
              <span className="text-[10px] text-slate-400 font-medium">from</span>
              <span className="text-lg font-black text-slate-900">{price}</span>
            </div>
          </div>
          <button 
            className="flex-1 py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 text-xs font-bold text-white transition-all duration-300 hover:opacity-90 shadow-md"
            style={{ backgroundColor: primaryColor }}
          >
            Shop Now
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </Link>
  );
};