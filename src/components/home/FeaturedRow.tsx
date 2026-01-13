"use client";

import React from 'react';
import { ArrowRight, Sparkles, Flame } from 'lucide-react';
import Link from 'next/link';
import { Product } from '@/lib/types';
import { ProductCard } from '@/components/ProductCard';

export const FeaturedRow = ({ products }: { products: Product[] }) => {
  if (!products || products.length === 0) return null;

  return (
    <section className="py-10 md:py-16 px-4 md:px-6">
      <div className="container mx-auto max-w-[1400px]">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 md:mb-10 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-[10px] md:text-xs font-black uppercase tracking-widest mb-3 border border-orange-200">
              <Flame size={14} className="fill-orange-700" /> Hot Picks
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 leading-tight">
              Featured Collection
            </h2>
          </div>
          
          <Link 
            href="/search?filter=featured" 
            className="group flex items-center gap-2 text-slate-500 font-bold hover:text-orange-600 transition-colors text-sm md:text-base"
          >
            View All Featured
            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-orange-100 group-hover:text-orange-600 transition-colors">
               <ArrowRight size={16} />
            </div>
          </Link>
        </div>

        {/* The Grid (Clean & Sharp) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
          {products.map((product) => (
            <div key={product.id} className="animate-in fade-in zoom-in-50 duration-500 fill-mode-backwards">
               <ProductCard product={product} />
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};