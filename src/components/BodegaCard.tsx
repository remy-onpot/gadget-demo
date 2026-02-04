import React from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { ProductCardVisualProps } from '@/lib/types/card-types';

export const BodegaCard = ({ 
  title, price, imageUrl, href, tags, primaryColor, borderRadius = '1rem' 
}: ProductCardVisualProps) => {
  return (
    <Link href={href} className="group h-full block">
      <div 
        className="relative h-full flex flex-col overflow-hidden transition-transform duration-300 hover:scale-[1.02]"
        style={{ backgroundColor: primaryColor, borderRadius }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20" />
        
        <div className="relative z-10 w-full h-56 p-6 flex items-center justify-center">
          {imageUrl && (
            <img src={imageUrl} alt={title} className="w-full h-full object-contain drop-shadow-2xl" />
          )}
        </div>

        <div className="relative z-20 mt-auto p-5 text-white">
          <h3 className="text-lg font-bold leading-tight mb-3 line-clamp-2">{title}</h3>
          
          <div className="flex flex-wrap gap-1.5 mb-4">
            {tags?.slice(0, 3).map((tag, i) => (
              <span key={i} className="px-2.5 py-1 rounded-full bg-white/20 text-[10px] font-bold border border-white/10 backdrop-blur-sm">
                {tag}
              </span>
            ))}
          </div>

          <div className="flex items-end justify-between border-t border-white/20 pt-3">
             <div className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider opacity-90">
                Order <ArrowUpRight size={14} />
             </div>
             <div className="text-2xl font-black tracking-tight">{price}</div>
          </div>
        </div>
      </div>
    </Link>
  );
};