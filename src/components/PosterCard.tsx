'use client';

import React from 'react';
// import Link from 'next/link'; // Note: Uncomment this for your Next.js app
import { ShoppingBag, Heart, Plus } from 'lucide-react';
import { ProductCardVisualProps } from '@/lib/types/card-types';

/**
 * PosterCard - Editorial Design
 * A versatile card component that supports both a clean white "Standard" mode 
 * and a dark, translucent "Glass" mode.
 */
export const PosterCard = ({ 
  title, 
  price, 
  imageUrl, 
  href, 
  tags,
  isFeatured,
  primaryColor = '#0f172a',
  borderRadius = '1.5rem', 
  glassMode = false,
  onAddToCart,
  onToggleWishlist,
}: ProductCardVisualProps) => {
  
  const innerRadius = `calc(${borderRadius} - 0.5rem)`;
  
  // Data Mapping
  // Adjust these indices if your data structure differs
  const condition = tags?.[0] || 'New';
  const description = tags?.[1] || 'No description available.';
  const brand = tags?.[2] || 'Brand';
  const category = tags?.[3] || 'Category';

  // Dynamic card dimensions
  const cardHeight = glassMode ? 'h-[520px]' : 'h-[420px]';
  const cardWidth = glassMode ? 'w-80' : 'w-72';

  return (
    <div className={`relative ${cardWidth} ${cardHeight} group select-none`}>
      {/* Note: Change <a> to <Link> when using in Next.js */}
      <a href={href} className="block h-full">
        <div 
          className={`
            relative h-full overflow-hidden shadow-xl hover:shadow-2xl 
            transition-all duration-500 ease-out flex flex-col
            ${glassMode ? 'bg-gray-900' : 'bg-white'}
          `}
          style={{ borderRadius }}
        >
          {/* --- Image Section (55% height) --- */}
          <div 
            className="relative h-[55%] w-full overflow-hidden shrink-0"
            style={{ borderRadius: `${innerRadius} ${innerRadius} 0 0` }}
          >
            {/* Featured Badge */}
            {isFeatured && (
              <div className="absolute top-4 left-4 z-10 px-3 py-1.5 rounded-full text-xs font-semibold bg-black/80 backdrop-blur-sm text-white border border-white/10">
                Featured
              </div>
            )}
            
            {/* Glass Mode: Price Badge (Top Right) */}
            {glassMode && (
              <div 
                className="absolute top-4 right-4 z-10 px-3 py-1.5 rounded-full text-sm font-bold text-white shadow-lg flex items-center justify-center min-w-[3rem]"
                style={{ backgroundColor: primaryColor }}
              >
                ${price}
              </div>
            )}

            {/* Wishlist Button */}
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onToggleWishlist?.(e);
              }}
              className="absolute z-20 w-9 h-9 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center shadow-md hover:scale-110 transition-transform active:scale-95 text-gray-700 hover:text-red-500"
              style={{ 
                top: '1rem',
                right: glassMode ? 'auto' : '1rem', 
                left: glassMode ? '1rem' : 'auto' 
              }}
            >
              <Heart size={16} />
            </button>

            {/* Carousel/Image Indicator */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
              <div className={`w-1.5 h-1.5 rounded-full ${glassMode ? 'bg-white/60' : 'bg-white'}`} />
              <div className={`w-4 h-1.5 rounded-full ${glassMode ? 'bg-white' : 'bg-white'}`} />
              <div className={`w-1.5 h-1.5 rounded-full ${glassMode ? 'bg-white/40' : 'bg-white/60'}`} />
            </div>

            {/* Product Image */}
            {imageUrl ? (
              <img 
                src={imageUrl} 
                alt={title} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-100">
                <ShoppingBag size={48} className="text-gray-300" />
              </div>
            )}

            {/* Gradient Overlay for Glass Mode */}
            {glassMode && (
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/60" />
            )}
          </div>

          {/* --- Content Section (45% height) --- */}
          <div 
            className={`
              h-[45%] p-5 flex flex-col justify-between
              ${glassMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}
            `}
            style={{ borderRadius: `0 0 ${innerRadius} ${innerRadius}` }}
          >
            <div>
              {/* Header: Title + Price (Standard Mode) */}
              <div className="flex justify-between items-start mb-1.5">
                <h3 className={`text-lg font-bold leading-tight line-clamp-1 ${glassMode ? 'text-white' : 'text-gray-900'}`}>
                  {title}
                </h3>
                {!glassMode && (
                  <span className="text-lg font-bold text-gray-900 ml-2 shrink-0">
                    ${price}
                  </span>
                )}
              </div>
              
              {/* Subtitle / Category */}
              <p className={`text-xs mb-2 font-medium tracking-wide ${glassMode ? 'text-gray-400' : 'text-gray-400'}`}>
                {category}
              </p>

              {/* Description */}
              <p className={`text-xs leading-relaxed line-clamp-2 ${glassMode ? 'text-gray-300' : 'text-gray-500'}`}>
                {description}
              </p>
            </div>

            {/* Meta Tags Row */}
            <div className="flex gap-2 mb-3">
              {!glassMode ? (
                // Standard Mode: Category & Brand Boxes
                <>
                  <div className="flex-1 bg-gray-50 rounded-xl py-2 px-2 text-center border border-gray-100">
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">Category</p>
                    <p className="text-sm font-bold text-gray-900 truncate">{category}</p>
                  </div>
                  <div className="flex-1 bg-gray-50 rounded-xl py-2 px-2 text-center border border-gray-100">
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">Brand</p>
                    <p className="text-sm font-bold text-gray-900 truncate">{brand}</p>
                  </div>
                </>
              ) : (
                // Glass Mode: Pill Tags
                <>
                  <div className="px-3 py-1.5 bg-white/10 backdrop-blur-md rounded-full text-xs font-medium border border-white/10 text-gray-200 flex items-center gap-1.5">
                    {brand}
                  </div>
                  <div className="px-3 py-1.5 bg-white/10 backdrop-blur-md rounded-full text-xs font-medium border border-white/10 text-gray-200">
                    {condition}
                  </div>
                </>
              )}
            </div>

            {/* Reserve / Add to Cart Button */}
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onAddToCart?.(e);
              }}
              className={`
                w-full py-3 rounded-xl font-bold text-sm tracking-wide transition-all duration-300 shadow-md flex items-center justify-center gap-2
                active:scale-95
                ${glassMode 
                  ? 'bg-white text-gray-900 hover:bg-gray-100' 
                  : 'bg-black text-white hover:bg-gray-800'
                }
              `}
              style={!glassMode && primaryColor && primaryColor !== '#0f172a' ? { backgroundColor: primaryColor } : {}}
            >
              Add to Cart
              {!glassMode && <Plus size={16} />}
            </button>
          </div>
        </div>
      </a>
    </div>
  );
};