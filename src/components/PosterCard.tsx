'use client';

import React from 'react';
import Link from 'next/link';
import { ShoppingBag, Heart } from 'lucide-react';
import { ProductCardVisualProps } from '@/lib/types/card-types';

/**
 * PosterCard - Iceland Cabin inspired design
 * Clean vertical layout with dynamic compact/glass states
 */
export const PosterCard = ({ 
  title, 
  price, 
  imageUrl, 
  href, 
  category,
  tags,
  isFeatured,
  primaryColor,
  borderRadius = '1.5rem', 
  glassMode = false,
  onAddToCart,
  onToggleWishlist,
}: ProductCardVisualProps) => {
  
  const innerRadius = `calc(${borderRadius} - 0.5rem)`;
  
  // Parse dynamic data from tags or use defaults
  const days = tags?.[0] || '3';
  const rating = tags?.[1] || '4.9';
  const tagline = tags?.[2] || 'Top Rated';
  
  // Dynamic card dimensions based on mode
  const cardHeight = glassMode ? 'h-[520px]' : 'h-[420px]';
  const cardWidth = glassMode ? 'w-80' : 'w-72';

  return (
    <div className={`relative ${cardWidth} ${cardHeight} group select-none`}>
      <Link href={href} className="block h-full">
        <div 
          className={`
            relative h-full overflow-hidden shadow-xl hover:shadow-2xl 
            transition-all duration-500 ease-out
            ${glassMode ? 'bg-gray-900' : 'bg-white'}
          `}
          style={{ borderRadius }}
        >
          {/* Image Section - 55% height */}
          <div 
            className="relative h-[55%] w-full overflow-hidden"
            style={{ borderRadius: `${innerRadius} ${innerRadius} 0 0` }}
          >
            {/* Featured Badge */}
            {isFeatured && (
              <div className="absolute top-4 left-4 z-10 px-3 py-1.5 rounded-full text-xs font-semibold bg-black/80 backdrop-blur-sm text-white">
                Featured
              </div>
            )}
            
            {/* Glass Mode: Price badge top right */}
            {glassMode && (
              <div 
                className="absolute top-4 right-4 z-10 px-3 py-1.5 rounded-full text-sm font-bold text-white shadow-lg"
                style={{ backgroundColor: primaryColor }}
              >
                {price}
              </div>
            )}

            {/* Wishlist button */}
            {onToggleWishlist && (
              <button
                onClick={onToggleWishlist}
                className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-md hover:scale-110 transition-transform"
                style={{ right: glassMode ? 'auto' : '1rem', left: glassMode ? '1rem' : 'auto' }}
              >
                <Heart size={16} className="text-gray-700" />
              </button>
            )}

            {/* Image dots indicator */}
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

            {/* Glass mode gradient overlay */}
            {glassMode && (
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/60" />
            )}
          </div>

          {/* Content Section - 45% height */}
          <div 
            className={`
              h-[45%] p-5 flex flex-col justify-between
              ${glassMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}
            `}
            style={{ borderRadius: `0 0 ${innerRadius} ${innerRadius}` }}
          >
            <div>
              {/* Header: Title + Price (compact mode only) */}
              <div className="flex justify-between items-start mb-1.5">
                <h3 className="text-lg font-bold leading-tight line-clamp-1">
                  {title}
                </h3>
                {!glassMode && (
                  <span className="text-sm font-bold text-gray-900 ml-2 shrink-0">
                    {price}
                  </span>
                )}
              </div>
              
              {/* Category */}
              <p className={`text-xs mb-2 ${glassMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {category}
              </p>

              {/* Description - dynamic or default */}
              <p className={`text-sm leading-relaxed line-clamp-2 ${glassMode ? 'text-gray-300' : 'text-gray-600'}`}>
                {tags?.[3] || `Cozy ${category.toLowerCase()} offering stunning views and premium comfort for your perfect getaway.`}
              </p>
            </div>

            {/* Stats or Tags row */}
            <div className="flex gap-2 mb-3">
              {!glassMode ? (
                // Compact: Stat boxes
                <>
                  <div className="flex-1 bg-gray-100 rounded-xl py-2 px-2 text-center">
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider font-medium">Days</p>
                    <p className="text-base font-bold text-gray-900">{days}</p>
                  </div>
                  <div className="flex-1 bg-gray-100 rounded-xl py-2 px-2 text-center">
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider font-medium">Rating</p>
                    <p className="text-base font-bold text-gray-900">{rating}</p>
                  </div>
                </>
              ) : (
                // Glass: Pill tags
                <>
                  <span className="px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-xs font-medium border border-white/30">
                    {tagline}
                  </span>
                  <span className="px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-xs font-medium border border-white/30">
                    {days} Day stay
                  </span>
                </>
              )}
            </div>

            {/* Reserve Button */}
            <button
              onClick={onAddToCart}
              className={`
                w-full py-3 rounded-xl font-semibold transition-all duration-300
                ${glassMode 
                  ? 'bg-white text-gray-900 hover:bg-gray-100' 
                  : 'bg-black text-white hover:bg-gray-800'
                }
              `}
            >
              Reserve
            </button>
          </div>
        </div>
      </Link>
    </div>
  );
};