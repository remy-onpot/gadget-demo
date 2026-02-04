'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, ShoppingBag } from 'lucide-react';
import { ProductCardVisualProps } from '@/lib/types/card-types';

/**
 * BodegaCard - Bold, colorful beverage-inspired design
 * Uses primaryColor as card background with nested image container
 * 
 * ✨ IMPROVED VERSION - Better matches original design while keeping all logic
 */
export const BodegaCard = ({ 
  title, 
  price, 
  imageUrl, 
  href, 
  tags,
  primaryColor,
  borderRadius = '2rem', 
  glassMode = false,
}: ProductCardVisualProps) => {

  // ✅ Keep your radius calculation logic
  const innerRadius = `calc(${borderRadius} - 0.75rem)`;
  
  // ✅ Keep your tag extraction logic
  const condition = tags?.[0] || 'New';
  const specTags = tags?.slice(1, 4) || [];

  // ✅ Keep your color generation logic
  const lighterBg = glassMode 
    ? 'rgba(255, 255, 255, 0.25)' 
    : `${primaryColor}30`;

  return (
    <Link href={href} className="group block h-full select-none">
      <div 
        className="relative h-full overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl"
        style={{ 
          backgroundColor: primaryColor, 
          borderRadius,
          ...(glassMode && { // ✅ Keep your glass mode spread logic
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
          })
        }}
      >
        {/* ✅ Keep your gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-black/20 pointer-events-none" />
        
        {/* Image Container - IMPROVED: Bigger, more prominent, better spacing */}
        <div 
          className="relative m-4 overflow-hidden"
          style={{ 
            backgroundColor: lighterBg,
            borderRadius: innerRadius,
          }}
        >
          {/* Price Badge - IMPROVED: Larger, simpler, cleaner */}
          <div className="absolute top-4 right-4 bg-white rounded-full px-4 py-2 shadow-lg z-10">
            <span className="text-sm font-semibold text-slate-900">{price}</span>
          </div>
          
          {/* Product Image - IMPROVED: Much taller, rounded, better effects */}
          <div className="h-72 flex items-center justify-center p-6">
            {/* ✅ Keep your imageUrl conditional logic */}
            {imageUrl ? (
              <img 
                src={imageUrl} 
                alt={title}
                className="w-full h-full object-cover rounded-2xl drop-shadow-2xl group-hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <div className="flex flex-col items-center text-white/40">
                <ShoppingBag size={48} strokeWidth={1} />
              </div>
            )}
          </div>
          
          {/* Bottom Info - IMPROVED: Changed to delivery info like original */}
          <div className="absolute bottom-4 left-4 right-4">
            <p className="text-xs text-white/80 font-medium">
              Free Delivery until 16/06/2026
            </p>
          </div>
        </div>

        {/* Product Info - IMPROVED: Better text sizes and spacing */}
        <div className="relative z-10 px-6 pb-6 pt-2">
          <div className="flex items-center justify-between gap-2 mb-3">
            <h3 className="text-xl font-semibold text-white leading-tight line-clamp-2 flex-1">
              {title}
            </h3>
            <button className="text-sm font-medium text-white flex items-center gap-1 hover:gap-2 transition-all">
              Order Now
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Spec Tags - IMPROVED: Better sizing and styling */}
          {/* ✅ Keep your conditional rendering logic */}
          {specTags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {specTags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1.5 rounded-full text-xs font-medium bg-white/25 text-white backdrop-blur-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};