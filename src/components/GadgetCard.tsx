import React from 'react';
import Link from 'next/link';
import { ProductCardVisualProps } from '@/lib/types/card-types';
import { 
  Cpu, Tv, Camera, Zap, ArrowRight, Smartphone, 
  Gamepad2, Headphones, Watch, Tablet, Monitor, 
  ShoppingBag 
} from 'lucide-react';

export const GadgetCard = ({ 
  title, 
  price, 
  imageUrl, 
  category, 
  href, 
  tags, 
  isFeatured,
  primaryColor,
  borderRadius = '1rem',
  glassMode = false
}: ProductCardVisualProps) => {

  // Calculate inner radius for nested elements
  const innerRadius = `calc(${borderRadius} - 0.5rem)`;

  // Visual Helper: Maps the category string to an icon
  const getCategoryIcon = (cat: string) => {
    const c = (cat || '').toLowerCase();
    switch (c) {
      case 'laptop': return <Cpu size={14} />;
      case 'phone': return <Smartphone size={14} />;
      case 'gaming': return <Gamepad2 size={14} />;
      case 'audio': return <Headphones size={14} />;
      case 'wearable': return <Watch size={14} />;
      case 'tablet': return <Tablet size={14} />;
      case 'monitor': return <Monitor size={14} />;
      case 'camera': return <Camera size={14} />;
      case 'tv': return <Tv size={14} />;
      default: return <Zap size={14} />;
    }
  };

  // Card container styles
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
    <Link href={href} className="group block h-full select-none">
      <div 
        className="relative p-3 md:p-4 h-full flex flex-col transition-all duration-500 ease-out border border-gray-100 hover:border-transparent hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] hover:-translate-y-2 overflow-hidden"
        style={cardStyle}
      >
        
        {/* 1. Dynamic Glow Effect (Uses Store Primary Color) */}
        <div 
          className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none"
          style={{ background: `linear-gradient(135deg, ${primaryColor}, transparent)` }}
        />

        {/* 2. Image Container */}
        <div 
          className="relative h-48 md:h-52 bg-gray-50/80 mb-4 overflow-hidden flex items-center justify-center group-hover:bg-white transition-colors z-10"
          style={{ borderRadius: innerRadius }}
        >
          
          {imageUrl ? (
             <img 
               src={imageUrl} 
               alt={title} 
               className="w-[85%] h-[85%] object-contain mix-blend-multiply transition-transform duration-700 ease-out group-hover:scale-110"
             />
          ) : (
             <div className="text-slate-300 flex flex-col items-center">
                <ShoppingBag size={32} />
             </div>
          )}
          
          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {isFeatured && (
              <span 
                className="text-white text-[9px] md:text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider shadow-sm"
                style={{ backgroundColor: primaryColor }}
              >
                Featured
              </span>
            )}
          </div>
        </div>

        {/* 3. Content */}
        <div className="relative z-10 flex-1 flex flex-col space-y-3">
          
          {/* Category Line */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider">
               <span style={{ color: primaryColor }}>{getCategoryIcon(category)}</span>
               {category}
            </div>
          </div>

          {/* Title */}
          <h3 className="font-bold text-slate-900 leading-snug text-sm md:text-base line-clamp-2 min-h-[2.5rem]">
            {title}
          </h3>

          {/* Specs Bar (The "Chameleon" Line) */}
          {/* We now populate this purely from the 'tags' prop passed by the wrapper */}
          <div className="bg-slate-50 group-hover:bg-white group-hover:shadow-sm border border-transparent group-hover:border-gray-100 transition-all rounded-lg px-2.5 py-2 text-xs font-medium text-slate-500 flex items-center gap-2">
            <div 
              className="w-1.5 h-1.5 rounded-full flex-shrink-0" 
              style={{ backgroundColor: primaryColor }}
            />
            <span className="truncate">
              {tags && tags.length > 0 ? tags.slice(0, 2).join(' | ') : 'View Details'}
            </span>
          </div>

          {/* Footer: Price & Action */}
          <div className="mt-auto pt-3 flex items-end justify-between border-t border-gray-50/50">
            <div>
              <div className="flex items-baseline gap-0.5">
                 <span className="text-xs font-medium text-slate-400 mr-1">from</span>
                 <span className="text-lg md:text-xl font-black text-slate-900">
                   {price}
                 </span>
              </div>
            </div>

            {/* Action Button */}
            <div 
                className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm group-hover:scale-110 text-white"
                style={{ backgroundColor: primaryColor }}
            >
                <ArrowRight size={18} />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};