"use client";

import React from 'react';
import { ArrowRight, Flame } from 'lucide-react';
import Link from 'next/link';
import { Database } from '@/lib/database.types'; // ✅ Correct Import
import { ProductCard } from '@/components/ProductCard';

// ✅ Use Centralized Type
type ProductRow = Database['public']['Tables']['products']['Row'];

interface FeaturedRowProps {
  products: ProductRow[];
  glassMode?: boolean;
  primaryColor?: string;
}

export const FeaturedRow = ({ products, glassMode = false, primaryColor }: FeaturedRowProps) => {
  if (!products || products.length === 0) return null;

  return (
    <section className="py-12 md:py-20 px-4 md:px-6 border-b border-gray-100">
      <div className="container mx-auto max-w-[1400px]">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 md:mb-12 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 text-orange-600 text-[10px] md:text-xs font-black uppercase tracking-widest mb-3 border border-orange-100 shadow-sm">
              <Flame size={14} className="fill-orange-500 text-orange-600" /> Hot Picks
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 leading-tight tracking-tight">
              Featured Collection
            </h2>
          </div>
          
          <Link 
            href="/search?filter=featured" 
            className="group flex items-center gap-3 text-slate-500 font-bold hover:text-orange-600 transition-colors text-sm md:text-base"
          >
            View All Featured
            <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center group-hover:bg-orange-500 group-hover:text-white group-hover:border-orange-500 transition-all shadow-sm">
               <ArrowRight size={18} />
            </div>
          </Link>
        </div>

        {/* THE GRID (Clean & Sharp) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
          {products.map((product, index) => (
            <div 
                key={product.id} 
                className="animate-in fade-in slide-in-from-bottom-8 duration-700 fill-mode-backwards"
                style={{ animationDelay: `${index * 100}ms` }} // Stagger effect
            >
               {/* Cast to any to ensure compatibility until ProductCard is fully typed */}
               <ProductCard product={product as any} glassMode={glassMode} primaryColor={primaryColor} />
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};