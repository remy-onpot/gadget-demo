import React from 'react';
import { Database } from '@/lib/database.types'; 
import { ArrowRight, Sparkles, Plus, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import { getCategoryHue } from '@/lib/theme-generator';
import clsx from 'clsx';

// 1. Types
type ProductWithCategory = Database['public']['Tables']['products']['Row'] & {
  categories?: { name: string; slug: string } | null;
};

interface ProductCardProps {
  product: ProductWithCategory;
  storeSlug?: string; 
  glassMode?: boolean;
  primaryColor?: string; // Store's brand color
}

export const ProductCard = ({ 
  product, 
  storeSlug, 
  glassMode = false,
  primaryColor = '#f97316'
}: ProductCardProps) => {

  const categoryName = product.categories?.name || 'Uncategorized';
  const hueRotate = getCategoryHue(categoryName); 
  
  const productUrl = storeSlug 
    ? `/sites/${storeSlug}/product/${product.slug}` 
    : `/product/${product.slug}`;

  // Format price with proper currency
  const price = new Intl.NumberFormat('en-GH', {
    style: 'currency',
    currency: 'GHS',
  }).format(product.base_price || 0);

  return (
    <Link 
      href={productUrl}
      style={{ '--store-accent': primaryColor } as React.CSSProperties}
      className={clsx(
        "group flex flex-col h-full overflow-hidden rounded-2xl transition-all duration-500",
        glassMode 
          ? "bg-white/70 backdrop-blur-md border border-white/30 shadow-lg hover:bg-white/90 hover:shadow-2xl hover:scale-[1.02]" 
          : "bg-white border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-2"
      )}
    >
        
        {/* === 1. IMAGE AREA === */}
        <div className="relative w-full h-48 md:h-56 overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100/50">
          
          {/* Category Tag (Dynamic Color per Category) */}
          <div className="absolute top-3 left-3 z-10">
            <span 
              className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full shadow-sm backdrop-blur-sm"
              style={{ 
                backgroundColor: glassMode ? 'rgba(255,255,255,0.9)' : 'var(--store-accent)',
                color: glassMode ? 'var(--store-accent)' : '#ffffff',
                filter: glassMode ? `hue-rotate(${hueRotate}deg)` : 'none'
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
                  style={{ backgroundColor: 'var(--store-accent)' }}
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
          
          {/* Title */}
          <h3 className="font-bold text-slate-900 text-xs md:text-sm leading-tight line-clamp-2 group-hover:text-[var(--store-accent)] transition-colors">
            {product.name}
          </h3>

          {/* Description (Desktop only) */}
          <p className="text-xs text-slate-500 line-clamp-1 opacity-70 hidden md:block">
            {product.description || 'Premium quality, verified stock.'}
          </p>

          {/* Footer: Price + Action Button */}
          <div className="mt-auto pt-2 flex items-end justify-between">
            
            {/* Price Block */}
            <div>
              <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wide">Price</div>
              <div className="text-base md:text-lg font-black text-slate-900 leading-none">
                {price}
              </div>
            </div>

            {/* Dynamic Action Button */}
            <button 
              className="w-8 h-8 md:w-9 md:h-9 rounded-full flex items-center justify-center text-white transition-all duration-300 active:scale-90 group-hover:scale-110"
              style={{ 
                backgroundColor: 'var(--store-accent)',
                boxShadow: glassMode ? '0 4px 12px -2px var(--store-accent)' : 'none'
              }}
              onClick={(e) => {
                e.preventDefault();
                // Could trigger add to cart here
              }}
            >
              {/* Plus on Mobile, Arrow on Desktop */}
              <Plus size={16} strokeWidth={2.5} className="md:hidden" />
              <ArrowRight size={16} strokeWidth={2.5} className="hidden md:block" />
            </button>

          </div>
        </div>

      </div>
    </Link>
  );
};