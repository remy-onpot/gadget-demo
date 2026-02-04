'use client';

import React from 'react';
import Link from 'next/link';
import { ProductCardVisualProps } from '@/lib/types/card-types';
import { 
  Cpu, Smartphone, Gamepad2, Headphones, Watch, 
  Tablet, Monitor, Camera, Tv, Zap, ArrowRight, 
  ShoppingBag, Star 
} from 'lucide-react';

/**
 * GadgetCard - Tech-forward design with category icons and specs emphasis
 * Features glow effects, specs bar, and detailed product info
 * 
 * ✨ IMPROVED VERSION - Better matches original design while keeping all logic
 */
export const GadgetCard = ({ 
  title, 
  price, 
  imageUrl, 
  category, 
  href, 
  tags, 
  isFeatured,
  primaryColor,
  borderRadius = '1.5rem',
  glassMode = false
}: ProductCardVisualProps) => {

  // ✅ Keep your radius calculation logic
  const innerRadius = `calc(${borderRadius} - 0.5rem)`;

  // ✅ Keep your tag extraction logic
  const condition = tags?.[0] || 'New';
  const specs = tags?.slice(1, 3) || [];

  // ✅ Keep your complete icon mapping function
  const getCategoryIcon = (cat: string) => {
    const c = (cat || '').toLowerCase();
    switch (c) {
      case 'laptop': case 'laptops': return <Cpu size={12} />;
      case 'phone': case 'phones': return <Smartphone size={12} />;
      case 'gaming': return <Gamepad2 size={12} />;
      case 'audio': return <Headphones size={12} />;
      case 'wearable': case 'wearables': return <Watch size={12} />;
      case 'tablet': case 'tablets': return <Tablet size={12} />;
      case 'monitor': case 'monitors': return <Monitor size={12} />;
      case 'camera': case 'cameras': return <Camera size={12} />;
      case 'tv': case 'televisions': return <Tv size={12} />;
      default: return <Zap size={12} />;
    }
  };

  // ✅ Keep your card style logic
  const cardStyle = glassMode ? {
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    border: '1px solid rgba(255, 255, 255, 0.4)',
    borderRadius,
  } : {
    backgroundColor: 'white',
    borderRadius,
  };

  return (
    <Link href={href} className="group block h-full select-none">
      <div 
        className="relative p-4 h-full flex flex-col transition-all duration-500 ease-out border border-slate-100 hover:border-transparent hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.15)] hover:-translate-y-1 overflow-hidden"
        style={cardStyle}
      >
        
        {/* ✅ Keep your dynamic glow effect */}
        <div 
          className="absolute inset-0 opacity-0 group-hover:opacity-[0.08] transition-opacity duration-500 pointer-events-none"
          style={{ background: `radial-gradient(circle at 50% 0%, ${primaryColor}, transparent 70%)` }}
        />

        {/* Image Container - IMPROVED: Bigger, cleaner image treatment */}
        <div 
          className="relative h-48 bg-slate-50/80 mb-4 overflow-hidden flex items-center justify-center group-hover:bg-white transition-colors z-10"
          style={{ borderRadius: innerRadius }}
        >
          {/* ✅ Keep your imageUrl conditional logic */}
          {imageUrl ? (
            <img 
              src={imageUrl} 
              alt={title} 
              className="w-full h-full object-contain drop-shadow-lg transition-transform duration-700 ease-out group-hover:scale-110"
            />
          ) : (
            <div className="text-slate-300 flex flex-col items-center">
              <ShoppingBag size={40} strokeWidth={1} />
            </div>
          )}
          
          {/* Badges - ✅ Keep your conditional rendering logic */}
          <div className="absolute top-2 left-2 flex flex-col gap-1.5">
            {isFeatured && (
              <span 
                className="text-white text-[9px] font-bold px-2 py-1 rounded-md uppercase tracking-wider shadow-sm flex items-center gap-1"
                style={{ backgroundColor: primaryColor }}
              >
                <Star size={8} fill="currentColor" /> Featured
              </span>
            )}
            <span className="bg-slate-900/80 backdrop-blur-sm text-white text-[9px] font-bold px-2 py-1 rounded-md uppercase tracking-wider">
              {condition}
            </span>
          </div>
        </div>

        {/* Content - IMPROVED: Better spacing and text sizes */}
        <div className="relative z-10 flex-1 flex flex-col">
          
          {/* Category Line - ✅ Keep your icon function logic */}
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            <span style={{ color: primaryColor }}>{getCategoryIcon(category)}</span>
            {category}
          </div>

          {/* Title - IMPROVED: Larger text */}
          <h3 className="font-bold text-slate-900 leading-snug text-base line-clamp-2 mb-3 min-h-[2.5rem]">
            {title}
          </h3>

          {/* Specs Bar - ✅ Keep your conditional specs display */}
          <div 
            className="bg-slate-50 group-hover:bg-white group-hover:shadow-sm border border-transparent group-hover:border-slate-100 transition-all rounded-lg px-2.5 py-2 text-[10px] font-medium text-slate-500 flex items-center gap-2 mb-4"
          >
            <div 
              className="w-1.5 h-1.5 rounded-full flex-shrink-0" 
              style={{ backgroundColor: primaryColor }}
            />
            <span className="truncate">
              {specs.length > 0 ? specs.join(' · ') : 'View Details'}
            </span>
          </div>

          {/* Footer: Price & Action - IMPROVED: Larger price text */}
          <div className="mt-auto pt-3 flex items-center justify-between border-t border-slate-100/80">
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-[9px] font-medium text-slate-400">from</span>
                <span className="text-2xl font-black text-slate-900">{price}</span>
              </div>
            </div>

            {/* Action Button - ✅ Keep your dynamic primaryColor */}
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 shadow-md group-hover:scale-110 text-white"
              style={{ backgroundColor: primaryColor }}
            >
              <ArrowRight size={16} />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};