'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Image as ImageIcon } from 'lucide-react';
import { ProductCardVisualProps } from '@/lib/types/card-types';

export const BodegaCard = ({ 
  title, 
  price, 
  imageUrl, 
  href, 
  tags,
  primaryColor,
  // These props are less relevant for the new look but kept to prevent TS errors
  borderRadius, 
  glassMode,
}: ProductCardVisualProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Map your existing 'tags' logic to a Category label
  const category = tags?.[0] || 'Product';

  return (
    <Link 
      href={href} 
      className="group block h-full select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div 
        className="relative h-full flex flex-col bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 transition-all duration-500 ease-out hover:shadow-xl hover:-translate-y-1"
      >
        
        {/* --- Image Section (4:5 Aspect Ratio) --- */}
        <div className="relative aspect-[4/5] overflow-hidden bg-gray-100">
          
          {/* Loading Skeleton */}
          {!imageLoaded && (
            <div className="absolute inset-0 bg-gray-200 animate-pulse" />
          )}
          
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={title}
              loading="lazy"
              onLoad={() => setImageLoaded(true)}
              className={`absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out ${
                isHovered ? 'scale-110' : 'scale-100'
              } ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
            />
          ) : (
             /* Fallback if no image provided */
            <div className="absolute inset-0 flex items-center justify-center text-gray-300">
              <ImageIcon size={48} strokeWidth={1} />
            </div>
          )}

          {/* Gradient Overlay on Hover */}
          <div className={`absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent transition-opacity duration-300 ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`} />

          {/* Slide-Up Arrow Button */}
          {/* We use primaryColor here for the button background */}
          <div className={`absolute bottom-3 right-3 transition-all duration-300 transform ${
            isHovered ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          }`}>
            <div 
              className="p-3 rounded-full text-white shadow-lg flex items-center justify-center"
              style={{ backgroundColor: primaryColor || '#000' }}
            >
              <ArrowRight className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* --- Content Section --- */}
        <div className="p-4 flex flex-col flex-grow gap-1">
          {/* Category (mapped from tags) */}
          <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">
            {category}
          </p>

          {/* Title - Uses primaryColor on hover */}
          <h3 
            className="text-sm font-semibold text-gray-900 line-clamp-2 leading-tight transition-colors duration-200"
            style={isHovered ? { color: primaryColor } : {}}
          >
            {title}
          </h3>

          {/* Price */}
          <div className="pt-1 mt-auto">
            <span className="text-base font-bold text-gray-900">
              {price}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};