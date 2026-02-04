'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles, ShoppingBag } from 'lucide-react';
import { ProductCardVisualProps } from '@/lib/types/card-types';

/**
 * PosterCard - Editorial, Nike-inspired design
 * Large hero image with overlay info and decorative accents
 * 
 * ✨ IMPROVED VERSION - Better matches original design while keeping all logic
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
  
  // ✅ Keep your radius calculation logic
  const innerRadius = `calc(${borderRadius} - 0.5rem)`;
  
  // ✅ Keep your tag extraction logic
  const condition = tags?.[0] || 'New';
  const description = tags?.[1] || 'Step back into classic style with a durable leather.';

  // ✅ Keep your card style logic
  const cardStyle = glassMode ? {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    border: '1px solid rgba(255, 255, 255, 0.5)',
    borderRadius,
  } : {
    backgroundColor: 'white',
    borderRadius,
  };

  return (
    <Link href={href} className="group block h-full select-none">
      <div 
        className="relative shadow-lg hover:shadow-2xl transition-all duration-300 h-full flex flex-col overflow-hidden"
        style={cardStyle}
      >
        {/* Hero Image Area - IMPROVED: Fixed tall height instead of aspect ratio */}
        <div 
          className="relative h-96 w-full overflow-hidden bg-gradient-to-br from-slate-100 via-slate-200 to-slate-300"
          style={{ borderRadius: innerRadius }}
        >
          {/* Featured Badge - IMPROVED: Better text, darker background */}
          {/* ✅ Keep your conditional rendering logic */}
          {isFeatured && (
            <div className="absolute top-6 left-6 z-10 px-3 py-1.5 rounded-lg text-sm font-medium bg-slate-900/80 backdrop-blur-sm text-white shadow-lg">
              Best Seller
            </div>
          )}
          
          {/* Decorative Icon - ✅ Keep your positioning and icon */}
          <div className="absolute top-6 right-6 z-10 w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center">
            <Sparkles size={20} style={{ color: primaryColor }} />
          </div>

          {/* Decorative Accent Dots - IMPROVED: Bigger, red color like Nike, with blur */}
          <div className="absolute top-1/3 left-6 flex flex-col gap-3 z-10">
            <div className="w-3 h-3 rounded-full blur-[1px]" style={{ backgroundColor: '#ef4444' }} />
            <div className="w-3 h-3 rounded-full blur-[1px]" style={{ backgroundColor: '#ef4444' }} />
            <div className="w-3 h-3 rounded-full blur-[1px]" style={{ backgroundColor: '#ef4444' }} />
          </div>

          {/* Product Image */}
          {/* ✅ Keep your imageUrl conditional logic */}
          {imageUrl ? (
            <img 
              src={imageUrl} 
              alt={title} 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-300">
              <ShoppingBag size={64} strokeWidth={1} />
            </div>
          )}

          {/* Carousel Dots - IMPROVED: Added like original Nike card */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
            <div className="w-2 h-2 rounded-full bg-white" />
            <div className="w-6 h-2 rounded-full bg-white" />
            <div className="w-2 h-2 rounded-full bg-white/50" />
            <div className="w-2 h-2 rounded-full bg-white/50" />
          </div>
        </div>

        {/* Product Info - IMPROVED: Moved outside image, better layout like original */}
        <div className="p-6 flex flex-col gap-3">
          <div>
            <h3 className="text-2xl font-bold text-slate-900 mb-1">
              {title}
            </h3>
            <p className="text-slate-400 text-sm font-medium mb-2">
              {condition}
            </p>
            <p className="text-slate-500 text-sm leading-relaxed">
              {description}
            </p>
          </div>

          {/* Footer: Price and CTA - IMPROVED: Much bigger, better proportions */}
          <div className="flex items-center gap-3 pt-2">
            <div className="bg-slate-100 rounded-2xl px-6 py-3">
              <span className="text-3xl font-bold text-slate-900">
                {price}
              </span>
            </div>
            <button 
              className="flex-1 py-3.5 rounded-full flex items-center justify-center gap-2 font-medium text-white transition-all duration-300 hover:opacity-90 shadow-lg text-base"
              style={{ backgroundColor: primaryColor }}
            >
              Buy Now
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
};