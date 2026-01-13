import React from 'react';
import { Product } from '@/lib/types';
import { 
  ShoppingCart, Cpu, Tv, Camera, Zap, ArrowRight, 
  Smartphone, Gamepad2, Headphones, Watch, Tablet, Monitor 
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils'; // Ensure you have this utility, or remove cn() usage

export const ProductCard = ({ product }: { product: Product }) => {

  // 1. SMART ICON LOGIC
  const getCategoryIcon = () => {
    const cat = (product.category || '').toLowerCase();
    switch (cat) {
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

  // 2. SMART SPECS RENDERER (Finds the best info to show)
  const renderSpecs = () => {
    if (!product.specs) return "View Details";

    // Helper to safely get a value (case-insensitive key search could be added here if needed)
    const s = product.specs as Record<string, string>;

    // Strategy A: Category Specific Priorities
    const cat = (product.category || '').toLowerCase();
    
    if (cat === 'laptop') {
      return `${s.Processor || s.CPU || 'Intel/AMD'} | ${s.RAM || '8GB'}`;
    }
    if (cat === 'phone' || cat === 'tablet') {
      return `${s.Storage || '256GB'} | ${s.Color || 'Standard'}`;
    }
    if (cat === 'gaming') {
      return `${s.Platform || 'Console'} | ${s.Storage || '1TB'}`;
    }
    if (cat === 'audio') {
      return s.Type || s.Color || 'High Fidelity'; // e.g. "Over-Ear" or "Black"
    }
    if (cat === 'monitor') {
      return `${s['Screen Size'] || ''} ${s['Refresh Rate'] || ''}`.trim() || '4K Display';
    }

    // Strategy B: Fallback - Just grab the first 2 relevant looking values
    const values = Object.entries(s)
      .filter(([key]) => !['condition', 'warranty'].includes(key.toLowerCase())) // Filter out boring specs
      .map(([, val]) => val)
      .slice(0, 2);

    return values.join(' | ') || 'Premium Quality';
  };

  return (
    <Link href={`/product/${product.slug}`} className="group block h-full">
      <div className="relative bg-white rounded-3xl p-3 md:p-4 h-full flex flex-col transition-all duration-500 ease-out border border-gray-100 hover:border-transparent hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] hover:-translate-y-2">
        
        {/* Floating Background Glow (Visible on Hover) */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-50/50 to-blue-50/50 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

        {/* IMAGE CONTAINER */}
        <div className="relative h-50 md:h-52 bg-gray-50/80 rounded-2xl mb-4 overflow-hidden flex items-center justify-center group-hover:bg-white transition-colors z-10">
          <img 
            src={product.images?.[0] || '/placeholder.png'} 
            alt={product.name}
            className="w-[85%] h-[85%] object-contain mix-blend-multiply transition-transform duration-700 ease-out group-hover:scale-110"
          />
          
          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {product.isFeatured && (
              <span className="bg-orange-500 text-white text-[9px] md:text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider shadow-sm">
                Featured
              </span>
            )}
             {/* Dynamic Badge based on condition if available */}
             {(product.specs as any)?.Condition === 'Used' && (
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
               <span className="text-orange-500">{getCategoryIcon()}</span>
               {product.category}
            </div>
            {/* Brand Pill */}
            {product.brand && (
              <span className="text-[10px] font-bold text-slate-300 bg-slate-50 px-2 py-0.5 rounded-full">
                {product.brand}
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="font-bold text-slate-900 leading-snug text-sm md:text-base line-clamp-2 min-h-[2.5rem]">
            {product.name}
          </h3>

          {/* Specs Bar (The "Chameleon" Line) */}
          <div className="bg-slate-50 group-hover:bg-white group-hover:shadow-sm border border-transparent group-hover:border-gray-100 transition-all rounded-lg px-2.5 py-2 text-xs font-medium text-slate-500 flex items-center gap-2">
            <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${product.category === 'laptop' ? 'bg-blue-500' : 'bg-orange-500'}`} />
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
            <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-slate-100 text-slate-900 flex items-center justify-center group-hover:bg-[#00AEEF] group-hover:text-white transition-all duration-300 shadow-sm group-hover:shadow-blue-200 group-hover:scale-110">
              <ArrowRight size={18} />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};