'use client';

import React from 'react';
import Link from 'next/link';
import { Heart, Plus, ShoppingBag } from 'lucide-react';
import { ProductCardVisualProps } from '@/lib/types/card-types';

/**
 * TechCard - Clean, minimal furniture-inspired design
 * Centered layout with pill-shaped price bar and add button
 */
export const TechCard = ({ 
  title, 
  price, 
  imageUrl, 
  href, 
  tags,
  primaryColor,
  borderRadius = '2rem', 
  glassMode = false,
  onAddToCart,
}: ProductCardVisualProps) => {
  
  // Glass mode styles
  const cardStyle = glassMode ? {
    backgroundColor: 'rgba(255, 255, 255, 0.65)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    border: '1px solid rgba(255, 255, 255, 0.4)',
    borderRadius,
  } : {
    backgroundColor: 'white',
    borderRadius,
  };

  // Get condition from tags (first tag is usually condition)
  const condition = tags?.[0] || 'New';

  return (
    <Link href={href} className="group block h-full select-none">
      <div 
        className="relative h-full p-5 shadow-sm hover:shadow-2xl transition-all duration-500 flex flex-col overflow-hidden"
        style={cardStyle}
      >
        {/* Product Image */}
        <div className="relative mb-4 flex items-center justify-center h-48 bg-slate-50/80 rounded-2xl overflow-hidden">
          {/* Favorite Button */}
          <button
            onClick={(e) => { e.preventDefault(); }}
            className="absolute top-3 right-3 z-10 w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110"
            style={{ backgroundColor: `${primaryColor}15` }}
          >
            <Heart 
              className="w-5 h-5 transition-colors"
              style={{ color: primaryColor }}
            />
          </button>
          
          {imageUrl ? (
            <img 
              src={imageUrl} 
              alt={title} 
              className="w-[85%] h-[85%] object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-700" 
            />
          ) : (
            <div className="flex flex-col items-center text-slate-300">
              <ShoppingBag size={40} strokeWidth={1} />
            </div>
          )}
        </div>

        {/* Product Info - Centered */}
        <div className="text-center mb-4 flex-1">
          <h3 className="text-base font-bold text-slate-900 mb-1 line-clamp-2 leading-tight">
            {title}
          </h3>
          <p className="text-slate-400 text-xs font-medium uppercase tracking-wide">
            {condition}
          </p>
        </div>

        {/* Price and Add Button */}
        <div className="flex items-center gap-2">
          <div className="bg-slate-100/80 group-hover:bg-slate-100 rounded-full px-4 py-2.5 flex-1 transition-colors">
            <div className="flex items-baseline gap-1 justify-center">
              <span className="text-[10px] text-slate-400 font-medium">from</span>
              <span className="text-lg font-bold text-slate-900">
                {price}
              </span>
            </div>
          </div>
          <button 
            onClick={onAddToCart}
            className="w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-lg text-white"
            style={{ backgroundColor: primaryColor }}
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>
    </Link>
  );
};