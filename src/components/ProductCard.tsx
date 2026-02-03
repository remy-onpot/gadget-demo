import React from 'react';
import { Database } from '@/lib/database.types'; 
import { ArrowRight, Sparkles, Plus, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import { getCategoryHue } from '@/lib/theme-generator';

// 1. Types
type ProductWithCategory = Database['public']['Tables']['products']['Row'] & {
  categories?: { name: string; slug: string } | null;
};

interface ProductCardProps {
  product: ProductWithCategory;
  storeSlug?: string; 
  glassMode?: boolean; // Controls the "Frost" effect
}

export const ProductCard = ({ product, storeSlug, glassMode = false }: ProductCardProps) => {

  const categoryName = product.categories?.name || 'Uncategorized';
  const hueRotate = getCategoryHue(categoryName); 
  
  const productUrl = storeSlug 
    ? `/sites/${storeSlug}/product/${product.slug}` 
    : `/product/${product.slug}`;

  // 🎨 DYNAMIC STYLES
  const containerStyles = glassMode ? {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    backdropFilter: 'blur(20px) saturate(200%)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
  } : {
    backgroundColor: 'var(--card-bg, #ffffff)',
    border: '1px solid rgba(0,0,0,0.06)',
  };

  return (
    <Link href={productUrl} className="group block h-full w-full">
      <div 
        className={`
          relative flex flex-col h-full rounded-2xl overflow-hidden transition-all duration-500
          ${glassMode ? 'hover:bg-white/90 hover:shadow-2xl hover:scale-[1.02]' : 'hover:shadow-xl hover:-translate-y-2 bg-white shadow-sm'}
        `}
        style={containerStyles}
      >
        
        {/* === 1. IMAGE AREA === */}
        <div className="relative w-full h-48 md:h-56 overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100/50">
          
          {/* Category Tag (Floating Pill) */}
          <div className="absolute top-3 left-3 z-10">
            <span 
              className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full shadow-sm backdrop-blur-md"
              style={{ 
                backgroundColor: glassMode ? 'rgba(255,255,255,0.9)' : 'var(--card-bg, #fff)',
                color: 'var(--primary)',
                filter: `hue-rotate(${hueRotate}deg)` 
              }}
            >
              {categoryName}
            </span>
          </div>

          {/* Featured Badge */}
          {product.is_featured && (
             <div className="absolute top-3 right-3 z-10 animate-pulse">
                <div 
                  className="w-6 h-6 flex items-center justify-center rounded-full text-white shadow-md"
                  style={{ backgroundColor: 'var(--primary)' }}
                >
                   <Sparkles size={12} fill="currentColor" />
                </div>
             </div>
          )}

          {/* Product Image (Zoom Effect) */}
          {product.base_images?.[0] ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img 
              src={product.base_images[0]} 
              alt={product.name}
              className="w-full h-full object-contain p-3 md:p-4 mix-blend-multiply transition-transform duration-700 ease-out group-hover:scale-110 group-hover:rotate-1"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-slate-200">
               <ShoppingBag size={48} strokeWidth={1} />
            </div>
          )}

          {/* Desktop Quick Add Overlay */}
          <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden md:block pointer-events-none" />
        </div>

        {/* === 2. INFO AREA === */}
        <div className="p-3 md:p-4 flex flex-col flex-1 gap-1.5">
          
          {/* Title & Price Row */}
          <div className="flex justify-between items-start gap-2">
             <h3 className="font-bold text-slate-900 text-xs md:text-sm leading-tight line-clamp-2 group-hover:text-[var(--primary)] transition-colors">
               {product.name}
             </h3>
          </div>

          {/* Smart Description (Hidden on tiny screens, visible on hover/desktop) */}
          <p className="text-xs text-slate-500 line-clamp-1 opacity-70 hidden md:block">
            {product.description || 'Premium quality, verified stock.'}
          </p>

          <div className="mt-auto pt-2 flex items-end justify-between">
             
             {/* Price Block */}
             <div>
                <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wide">Price</div>
                <div className="text-base md:text-lg font-black text-slate-900 leading-none">
                  <span className="text-xs align-top opacity-60 mr-0.5">₵</span>
                  {(product.base_price || 0).toLocaleString()}
                </div>
             </div>

             {/* Interaction Button */}
             <button 
               className="w-8 h-8 md:w-9 md:h-9 rounded-full flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 transition-all duration-300 active:scale-90 group-hover:scale-110"
               style={{ backgroundColor: 'var(--primary)' }}
             >
                {/* Plus on Mobile (Implies Quick Add) */}
                <Plus size={16} strokeWidth={3} className="md:hidden" />
                {/* Arrow on Desktop (Implies View Details) */}
                <ArrowRight size={16} strokeWidth={3} className="hidden md:block" />
             </button>

          </div>
        </div>

      </div>
    </Link>
  );
};