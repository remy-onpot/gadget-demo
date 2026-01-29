import React from 'react';
import { Database } from '@/lib/database.types'; 
import { ArrowRight, Tag, Sparkles, Zap } from 'lucide-react';
import Link from 'next/link';
// ✅ Import the Hue Generator for harmonious category colors
import { getCategoryHue } from '@/lib/theme-generator';

// 1. Define Extended Type
type ProductWithCategory = Database['public']['Tables']['products']['Row'] & {
  categories?: { name: string; slug: string } | null;
};

interface ProductCardProps {
  product: ProductWithCategory;
  storeSlug?: string; 
}

export const ProductCard = ({ product, storeSlug }: ProductCardProps) => {

  const categoryName = product.categories?.name || 'Uncategorized';
  
  // ✅ PHASE 4: Dynamic Hue Rotation
  // This generates a unique color rotation (0-360) based on the category name strings.
  // It ensures categories look distinct but share the same saturation/lightness as your brand color.
  const hueRotate = getCategoryHue(categoryName); 
  
  const productUrl = storeSlug 
    ? `/${storeSlug}/product/${product.slug}` 
    : `/product/${product.slug}`;

  return (
    <Link href={productUrl} className="group block h-full">
      {/* CARD CONTAINER */}
      <div 
        className="relative p-2 md:p-4 h-full flex flex-col transition-all duration-500 ease-out border border-gray-100/50 hover:border-transparent hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] hover:-translate-y-2 overflow-hidden"
        style={{ 
            backgroundColor: 'var(--card-bg)', 
            borderRadius: 'var(--radius)',
            // We use a transparent shadow by default so the transition is smooth
            boxShadow: '0 0 0 1px transparent' 
        }}
      >
        
        {/* ✅ GAP 4 FIX: Brand-Colored Hover Border/Glow */}
        {/* This lights up the border with the brand color (at 20% opacity) on hover */}
        <div 
            className="absolute inset-0 border-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-20"
            style={{ 
                borderColor: 'var(--primary-20)', 
                borderRadius: 'var(--radius)',
                boxShadow: 'inset 0 0 20px var(--primary-10)' // Subtle inner glow
            }}
        />

        {/* Floating Background Glow (Generic) */}
        <div 
            className="absolute inset-0 bg-gradient-to-br from-slate-50 to-white opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" 
            style={{ borderRadius: 'var(--radius)' }}
        />

        {/* IMAGE CONTAINER */}
        {/* We use calc() to make the inner radius slightly smaller for a perfect nested look */}
        <div 
            className="relative h-40 md:h-52 bg-gray-50/50 mb-3 md:mb-4 overflow-hidden flex items-center justify-center group-hover:bg-white/80 transition-colors z-10"
            style={{ borderRadius: 'calc(var(--radius) / 1.5)' }}
        >
          {product.base_images?.[0] ? (
             // eslint-disable-next-line @next/next/no-img-element
             <img 
               src={product.base_images[0]} 
               alt={product.name}
               className="w-[85%] h-[85%] object-contain mix-blend-multiply transition-transform duration-700 ease-out group-hover:scale-110"
             />
          ) : (
             <div className="text-slate-300 flex flex-col items-center">
                <Tag size={48} className="mb-2 opacity-50"/>
                <span className="text-xs font-bold uppercase">No Image</span>
             </div>
          )}
          
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {product.is_featured && (
              <span 
                className="text-white text-[9px] md:text-[10px] font-bold px-2 py-1 uppercase tracking-wider shadow-sm flex items-center gap-1"
                style={{ 
                    backgroundColor: 'var(--primary)',
                    borderRadius: 'calc(var(--radius) / 2)'
                }}
              >
                <Sparkles size={8} fill="currentColor"/> Featured
              </span>
            )}
          </div>
        </div>

        {/* CONTENT */}
        <div className="relative z-10 flex-1 flex flex-col space-y-2 md:space-y-3">
          
          {/* ✅ DYNAMIC CATEGORY BADGE */}
          <div className="flex items-center justify-between">
            <div 
                className="flex items-center gap-1 text-[10px] md:text-xs font-bold uppercase tracking-wider px-1.5 md:px-2 py-0.5 md:py-1 rounded-md"
                style={{ 
                    // Magic: Take primary color, rotate hue, lower opacity for bg
                    color: 'var(--primary)', 
                    backgroundColor: 'var(--primary-10)', // Uses the 10% opacity var from layout
                    filter: `hue-rotate(${hueRotate}deg)` 
                }}
            >
               <Zap size={12} className="md:hidden" fill="currentColor" fillOpacity={0.2} />
               <Zap size={14} className="hidden md:block" fill="currentColor" fillOpacity={0.2} />
               <span className="truncate max-w-[80px] md:max-w-none">{categoryName}</span>
            </div>
            {product.brand && (
              <span className="text-[9px] md:text-[10px] font-bold opacity-50 px-1.5 md:px-2 py-0.5 border border-current rounded-full">
                {product.brand}
              </span>
            )}
          </div>

          <h3 className="font-bold text-slate-900 leading-snug text-xs md:text-base line-clamp-2 min-h-[2rem] md:min-h-[2.5rem] opacity-90 group-hover:opacity-100 transition-opacity">
            {product.name}
          </h3>

          {/* ✅ SMART TINTED DESCRIPTION BOX */}
          <div 
            className="transition-all rounded-lg px-2 md:px-2.5 py-1.5 md:py-2 text-[10px] md:text-xs font-medium flex items-center gap-1.5 md:gap-2"
            style={{
                backgroundColor: 'var(--primary-10)', // Matches brand color (light tint)
                color: 'var(--text-main)', 
            }}
          >
            <div 
                className="w-1 h-1 md:w-1.5 md:h-1.5 rounded-full flex-shrink-0" 
                style={{ backgroundColor: 'var(--primary)' }}
            />
            <span className="truncate opacity-70">{product.description || 'Premium Quality'}</span>
          </div>

          <div className="mt-auto pt-2 md:pt-3 flex items-end justify-between border-t border-gray-100/10">
            <div>
              <div className="flex items-baseline gap-0.5">
                  <span className="text-[10px] md:text-xs font-medium opacity-50 mr-0.5 md:mr-1">from</span>
                  <span className="text-base md:text-xl font-black text-slate-900">
                    ₵{(product.base_price || 0).toLocaleString()}
                  </span>
              </div>
            </div>

            {/* ✅ ACTION BUTTON WITH GLOW */}
            <div 
                className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center text-white shadow-sm transition-all duration-300 relative overflow-hidden group-hover:shadow-lg group-hover:scale-110"
                style={{ 
                    backgroundColor: 'var(--primary)', 
                    borderRadius: 'calc(var(--radius) / 2)'
                }}
            >
              {/* Internal glow effect on hover */}
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"/>
              <ArrowRight size={16} className="relative z-10 md:hidden"/>
              <ArrowRight size={18} className="relative z-10 hidden md:block"/>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};