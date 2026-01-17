import React from 'react';
import { Product } from '@/lib/types';
import { 
  ArrowRight, 
  Tag, 
  Sparkles,
  Zap
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export const ProductCard = ({ product }: { product: Product }) => {

  // 1. GENERIC SPECS RENDERER
  // Logic: Grab the first 2 values from the specs object, no matter what keys they are.
  // Works for: { RAM: "8GB", HDD: "512GB" } -> "8GB | 512GB"
  // Works for: { Size: "42", Material: "Leather" } -> "42 | Leather"
  const renderSpecs = () => {
    if (!product.specs || Object.keys(product.specs).length === 0) return "View Details";

    const values = Object.entries(product.specs as Record<string, string>)
      // Optional: Filter out internal keys if you have any (e.g. 'sku', 'weight')
      .filter(([key]) => !['sku', 'weight', 'warranty'].includes(key.toLowerCase())) 
      .map(([, val]) => val)
      .slice(0, 2); // Take top 2

    return values.join(' • ') || 'Premium Quality';
  };

  // 2. DYNAMIC ACCENT COLOR
  // Generates a consistent color based on the category name string
  // 'laptop' -> might be blue, 'shoes' -> might be orange
  const getCategoryColor = (cat: string) => {
    const colors = ['text-blue-500', 'text-orange-500', 'text-purple-500', 'text-green-500', 'text-pink-500'];
    const index = cat.length % colors.length;
    return colors[index];
  };

  const accentColorClass = getCategoryColor(product.category || '');

  return (
    <Link href={`/product/${product.slug}`} className="group block h-full">
      <div className="relative bg-white rounded-3xl p-3 md:p-4 h-full flex flex-col transition-all duration-500 ease-out border border-gray-100 hover:border-transparent hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] hover:-translate-y-2">
        
        {/* Floating Background Glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 to-white rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

        {/* IMAGE CONTAINER */}
        <div className="relative h-50 md:h-52 bg-gray-50/80 rounded-2xl mb-4 overflow-hidden flex items-center justify-center group-hover:bg-white transition-colors z-10">
          {product.images?.[0] ? (
             // eslint-disable-next-line @next/next/no-img-element
             <img 
               src={product.images[0]} 
               alt={product.name}
               className="w-[85%] h-[85%] object-contain mix-blend-multiply transition-transform duration-700 ease-out group-hover:scale-110"
             />
          ) : (
             <div className="text-slate-300 flex flex-col items-center">
                <Tag size={48} className="mb-2 opacity-50"/>
                <span className="text-xs font-bold uppercase">No Image</span>
             </div>
          )}
          
          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {product.isFeatured && (
              <span className="bg-orange-500 text-white text-[9px] md:text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1">
                <Sparkles size={8} fill="currentColor"/> Featured
              </span>
            )}
             {/* Check for 'condition' key case-insensitively */}
             {Object.entries(product.specs || {}).find(([k,v]) => k.toLowerCase() === 'condition' && v === 'Used') && (
               <span className="bg-gray-900 text-white text-[9px] md:text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider shadow-sm">
                 Pre-owned
               </span>
             )}
          </div>
        </div>

        {/* CONTENT */}
        <div className="relative z-10 flex-1 flex flex-col space-y-3">
          
          {/* Category Tag */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider">
               <Zap size={14} className={accentColorClass} fill="currentColor" fillOpacity={0.2} />
               {product.category}
            </div>
            {/* Brand Pill */}
            {product.brand && (
              <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-100">
                {product.brand}
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="font-bold text-slate-900 leading-snug text-sm md:text-base line-clamp-2 min-h-[2.5rem] group-hover:text-[#0A2540] transition-colors">
            {product.name}
          </h3>

          {/* Specs Bar (Universal) */}
          <div className="bg-slate-50 group-hover:bg-white group-hover:shadow-sm border border-transparent group-hover:border-gray-100 transition-all rounded-lg px-2.5 py-2 text-xs font-medium text-slate-500 flex items-center gap-2">
            <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${accentColorClass.replace('text-', 'bg-')}`} />
            <span className="truncate">{renderSpecs()}</span>
          </div>

          <div className="mt-auto pt-3 flex items-end justify-between border-t border-gray-50/50">
            <div>
              {product.originalPrice && product.originalPrice > (product.price || 0) && (
                <p className="text-[10px] text-gray-400 line-through mb-0.5">
                  ₵{product.originalPrice.toLocaleString()}
                </p>
              )}
              <div className="flex items-baseline gap-0.5">
                 <span className="text-xs font-medium text-slate-400 mr-1">from</span>
                 <span className="text-lg md:text-xl font-black text-slate-900">
                   ₵{(product.price || 0).toLocaleString()}
                 </span>
              </div>
            </div>

            {/* Action Button */}
            <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-slate-100 text-slate-900 flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-all duration-300 shadow-sm group-hover:shadow-lg group-hover:scale-110">
              <ArrowRight size={18} />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};