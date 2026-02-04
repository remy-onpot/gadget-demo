import React from 'react';
import Link from 'next/link';
import { ArrowRight, Heart, ShoppingBag } from 'lucide-react';
import { ProductCardVisualProps } from '@/lib/types/card-types';

export const TechCard = ({ 
  title, price, imageUrl, href, primaryColor, borderRadius = '1rem', glassMode = false 
}: ProductCardVisualProps) => {
  
  // Glass mode styles
  const cardStyle = glassMode ? {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    border: '1px solid rgba(255, 255, 255, 0.5)',
    borderRadius,
  } : {
    backgroundColor: 'white',
    borderRadius,
  };

  return (
    <Link href={href} className="group h-full block select-none">
      <div 
        className="h-full border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden"
        style={cardStyle}
      >
        
        {/* Image Area */}
        <div className="relative h-56 w-full p-6 flex items-center justify-center">
          <button className="absolute top-4 right-4 z-10 p-2 rounded-xl bg-gray-50/80 text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors">
            <Heart size={18} />
          </button>
          
          {imageUrl ? (
            <img src={imageUrl} alt={title} className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500" />
          ) : (
            <div className="flex flex-col items-center text-gray-300">
              <ShoppingBag size={40} strokeWidth={1} />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="px-6 pb-6 pt-2 flex-1 flex flex-col">
          <h3 className="font-bold text-slate-900 text-base leading-tight line-clamp-2 mb-4">{title}</h3>
          
          <div className="mt-auto bg-slate-50/80 rounded-full p-1.5 pl-4 flex items-center justify-between group-hover:bg-slate-100 transition-colors">
            <span className="font-bold text-slate-900 text-sm">{price}</span>
            <div 
              className="w-8 h-8 rounded-full flex items-center justify-center text-white shadow-md"
              style={{ backgroundColor: primaryColor }}
            >
              <ArrowRight size={16} strokeWidth={2.5} />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};