'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, ShoppingBag } from 'lucide-react';
import { ProductCardVisualProps } from '@/lib/types/card-types';

/**
 * BodegaCard - Bold, colorful beverage-inspired design
 * Uses primaryColor as card background with nested image container
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

  // Calculate inner radius for nested container
  const innerRadius = `calc(${borderRadius} - 0.75rem)`;
  
  // Get condition from tags
  const condition = tags?.[0] || 'New';
  const specTags = tags?.slice(1, 4) || [];

  // Generate a lighter shade of primary for the image container
  const lighterBg = glassMode 
    ? 'rgba(255, 255, 255, 0.25)' 
    : `${primaryColor}30`;

  return (
    <Link href={href} className="group block h-full select-none">
      <div 
        className="relative h-full overflow-hidden transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl"
        style={{ 
          backgroundColor: primaryColor, 
          borderRadius,
          ...(glassMode && {
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
          })
        }}
      >
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-black/20 pointer-events-none" />
        
        {/* Image Container - Nested rounded box */}
        <div 
          className="relative m-3 overflow-hidden"
          style={{ 
            backgroundColor: lighterBg,
            borderRadius: innerRadius,
          }}
        >
          {/* Price Badge */}
          <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm rounded-full px-3 py-1.5 shadow-lg z-10">
            <div className="flex items-baseline gap-0.5">
              <span className="text-[9px] text-slate-400 font-medium">from</span>
              <span className="text-sm font-bold text-slate-900">{price}</span>
            </div>
          </div>
          
          {/* Product Image */}
          <div className="h-44 flex items-center justify-center p-4">
            {imageUrl ? (
              <img 
                src={imageUrl} 
                alt={title}
                className="w-full h-full object-contain drop-shadow-xl group-hover:scale-110 transition-transform duration-700"
              />
            ) : (
              <div className="flex flex-col items-center text-white/40">
                <ShoppingBag size={40} strokeWidth={1} />
              </div>
            )}
          </div>
          
          {/* Condition Badge */}
          <div className="absolute bottom-3 left-3">
            <span className="text-[10px] font-bold text-white/80 uppercase tracking-wider">
              {condition}
            </span>
          </div>
        </div>

        {/* Product Info */}
        <div className="relative z-10 px-4 pb-4 pt-1">
          <div className="flex items-start justify-between gap-2 mb-3">
            <h3 className="text-base font-bold text-white leading-tight line-clamp-2 flex-1">
              {title}
            </h3>
            <button className="text-xs font-bold text-white/90 flex items-center gap-1 hover:text-white transition-colors whitespace-nowrap">
              Order
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Spec Tags */}
          {specTags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {specTags.map((tag, index) => (
                <span
                  key={index}
                  className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-white/20 text-white/90 backdrop-blur-sm border border-white/10"
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