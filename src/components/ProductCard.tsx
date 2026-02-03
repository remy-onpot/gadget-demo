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
    backgroundColor: 'rgba(255, 255, 255, 0.65)',
    backdropFilter: 'blur(16px) saturate(180%)',
    border: '1px solid rgba(255, 255, 255, 0.5)',
    boxShadow: '0 4px 30px rgba(0, 0, 0, 0.05)',
  } : {
    backgroundColor: 'var(--card-bg, #ffffff)',
    border: '1px solid rgba(0,0,0,0.04)',
  };

  return (
    <Link href={productUrl} className="group block h-full w-full">
      <div 
        className={`
          relative flex flex-col h-full rounded-[var(--radius)] overflow-hidden transition-all duration-500
          ${glassMode ? 'hover:bg-white/80 hover:shadow-xl' : 'hover:shadow-lg hover:-translate-y-1 bg-white'}
        `}
        style={containerStyles}
      >
        
        {/* === 1. IMAGE AREA (Aspect Square for perfect mobile grid) === */}
        <div className="relative aspect-square w-full overflow-hidden bg-gray-50/50">
          
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
              className="w-full h-full object-contain p-6 mix-blend-multiply transition-transform duration-700 ease-out group-hover:scale-110 group-hover:rotate-1"
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
        <div className="p-4 flex flex-col flex-1 gap-2">
          
          {/* Title & Price Row */}
          <div className="flex justify-between items-start gap-2">
             <h3 className="font-bold text-slate-900 text-sm md:text-base leading-snug line-clamp-2 group-hover:text-[var(--primary)] transition-colors">
               {product.name}
             </h3>
          </div>

          {/* Smart Description (Hidden on tiny screens, visible on hover/desktop) */}
          <p className="text-xs text-slate-500 line-clamp-1 opacity-70 hidden md:block">
            {product.description || 'Premium quality, verified stock.'}
          </p>

          <div className="mt-auto pt-2 flex items-end justify-between border-t border-gray-100/50">
             
             {/* Price Block */}
             <div>
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Price</div>
                <div className="text-lg font-black text-slate-900 leading-none">
                  <span className="text-xs align-top opacity-60 mr-0.5">₵</span>
                  {(product.base_price || 0).toLocaleString()}
                </div>
             </div>

             {/* Interaction Button */}
             <button 
               className="w-9 h-9 rounded-full flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 transition-all duration-300 active:scale-90 group-hover:scale-110"
               style={{ backgroundColor: 'var(--primary)' }}
             >
                {/* Plus on Mobile (Implies Quick Add) */}
                <Plus size={18} strokeWidth={3} className="md:hidden" />
                {/* Arrow on Desktop (Implies View Details) */}
                <ArrowRight size={18} strokeWidth={3} className="hidden md:block" />
             </button>

          </div>
        </div>

      </div>
    </Link>
  );
};