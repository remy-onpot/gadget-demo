import React from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight } from 'lucide-react';
import { ProductCardVisualProps } from '@/lib/types/card-types';

export const PosterCard = ({ 
  title, price, imageUrl, href, isFeatured, primaryColor, borderRadius = '1rem', glassMode = false 
}: ProductCardVisualProps) => {
  
  // Calculate inner radius (slightly smaller)
  const innerRadius = `calc(${borderRadius} - 0.25rem)`;
  
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
    <Link href={href} className="group h-full block">
      <div 
        className="p-2 shadow-sm hover:shadow-xl transition-all duration-300 h-full flex flex-col"
        style={cardStyle}
      >
        
        <div 
          className="relative aspect-[4/5] w-full overflow-hidden bg-gray-100"
          style={{ borderRadius: innerRadius }}
        >
          {isFeatured && (
            <div className="absolute top-3 left-3 z-10 px-2 py-1 rounded-md bg-white/40 backdrop-blur-md border border-white/20 text-[10px] font-bold text-white">
              HOT
            </div>
          )}
          
          <div className="absolute top-3 right-3 z-10 w-7 h-7 rounded-full bg-white flex items-center justify-center text-slate-900 shadow-sm">
            <Sparkles size={12} />
          </div>

          {imageUrl ? (
            <img src={imageUrl} alt={title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
          ) : (
             <div className="w-full h-full bg-gray-200" />
          )}
        </div>

        <div className="pt-3 px-2 pb-1 flex-1 flex flex-col">
          <h3 className="font-bold text-slate-900 text-sm leading-tight mb-4 line-clamp-2">{title}</h3>

          <div className="mt-auto flex items-center justify-between gap-2">
            <div className="px-3 py-1.5 rounded-lg bg-gray-50/80 font-bold text-slate-900 text-xs">
              {price}
            </div>
            <div 
              className="flex-1 py-1.5 px-3 rounded-lg flex items-center justify-center gap-2 text-xs font-bold text-white"
              style={{ backgroundColor: primaryColor }}
            >
              View <ArrowRight size={14} />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};