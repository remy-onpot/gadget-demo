'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Heart, Plus, ShoppingBag } from 'lucide-react';
import { ProductCardVisualProps } from '@/lib/types/card-types';

/**
 * TechCard - Clean, minimal furniture-inspired design
 * Centered layout with pill-shaped price bar and add button
 * 
 * ✨ IMPROVED VERSION - Better matches original design while keeping all logic
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
  
  // ✅ Keep your favorite state logic
  const [isFavorite, setIsFavorite] = useState(false);
  
  // ✅ Keep your glass mode styles logic
  const cardStyle = glassMode ? {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.5)',
    borderRadius,
  } : {
    backgroundColor: 'white',
    borderRadius,
  };

  // ✅ Keep your tag extraction logic
  const condition = tags?.[0] || 'New';

  return (
    <Link href={href} className="group block h-full select-none">
      <div 
        className="relative h-full p-6 shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col"
        style={cardStyle}
      >
        {/* Product Image - IMPROVED: Bigger, more space, better shadow */}
        <div className="relative mb-6 flex items-center justify-center h-64">
          {/* Favorite Button - IMPROVED: Larger, better positioning, state-aware colors */}
          <button
            onClick={(e) => { 
              e.preventDefault(); 
              setIsFavorite(!isFavorite); // ✅ Keep your state toggle
            }}
            className="absolute top-0 right-0 z-10 w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-200 hover:scale-105"
            style={{ 
              backgroundColor: isFavorite ? primaryColor : `${primaryColor}20`,
            }}
          >
            <Heart 
              className={`w-6 h-6 transition-all duration-200 ${
                isFavorite ? 'fill-current' : ''
              }`}
              style={{ 
                color: isFavorite ? 'white' : primaryColor,
              }}
            />
          </button>
          
          {/* ✅ Keep your imageUrl conditional logic */}
          {imageUrl ? (
            <img 
              src={imageUrl} 
              alt={title} 
              className="w-full h-full object-contain drop-shadow-xl transition-transform duration-500 ease-out group-hover:scale-105" 
            />
          ) : (
            <div className="flex flex-col items-center text-slate-300">
              <ShoppingBag size={48} strokeWidth={1.5} />
            </div>
          )}
        </div>

        {/* Product Info - IMPROVED: Bigger text, better spacing */}
        <div className="text-center mb-6 flex-1">
          <h3 className="text-xl font-bold text-slate-900 mb-1 line-clamp-2 leading-tight">
            {title}
          </h3>
          <p className="text-slate-500 text-sm font-medium">
            {condition}
          </p>
        </div>

        {/* Price and Add Button - IMPROVED: Larger elements, better proportions */}
        <div className="flex items-center gap-3">
          <div className="bg-slate-100 rounded-full px-6 py-3 flex-1 transition-colors">
            <span className="text-2xl font-semibold text-slate-900">
              {price}
            </span>
          </div>
          <button 
            onClick={onAddToCart} // ✅ Keep your onAddToCart handler
            className="w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-lg text-white"
            style={{ backgroundColor: primaryColor }}
          >
            <Plus className="w-6 h-6" strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </Link>
  );
};