"use client";

import React from 'react';
import Link from 'next/link';
import { Product } from '@/lib/types';
import { Database } from '@/lib/database.types';
import { useProductLogic } from '@/hooks/useProductLogic';
import { ProductGallery } from '@/components/product/ProductGallery'; // Ensure this supports 360 props
import { ProductConfigurator } from '@/components/product/ProductConfigurator';
import { ProductCard } from '@/components/ProductCard';
import { ArrowLeft, PackagePlus, Zap, Star, CheckCircle, Store } from 'lucide-react';

type ReviewRow = Database['public']['Tables']['reviews']['Row'];

interface ProductClientProps {
  storeSlug: string;
  product: Product;
  relatedItems: Product[];
  reviews: ReviewRow[];
  frames360: string[] | null;
}

export function ProductClient({ storeSlug, product, relatedItems, reviews, frames360 }: ProductClientProps) {
  // Logic Engine initialized with Server Data
  const logic = useProductLogic(product, product.variants || []);

  const activeImages = logic.currentVariant?.images?.length 
    ? logic.currentVariant.images 
    : product.images || [];

  return (
    <div className="min-h-screen bg-white pb-20">
      
      {/* HEADER */}
      <div className="border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-30">
        <div className="container mx-auto px-4 h-16 flex items-center gap-4">
           <Link href={`/category/${product.category}`} className="p-2 -ml-2 hover:bg-gray-50 rounded-full transition-colors text-slate-500 group">
             <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
           </Link>
           <span className="text-sm font-bold text-slate-400 capitalize hidden md:inline">{product.category}</span>
           <span className="text-slate-300 hidden md:inline">/</span>
           <span className="text-sm font-bold text-slate-900 truncate">{product.name}</span>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-[1400px]">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
           
           {/* LEFT: GALLERY (Now supports 360) */}
           <div className="lg:sticky lg:top-24 h-fit">
              <ProductGallery 
                images={activeImages} 
                frames360={frames360 || undefined} 
              />
              
              {/* Tech Specs Summary */}
              <div className="hidden lg:block mt-12 border-t border-gray-100 pt-8 animate-in slide-in-from-bottom-4 duration-700">
                 <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                    {/* ✅ THEME FIX */}
                    <Zap size={18} className="text-[var(--primary)]" /> Technical Highlights
                 </h3>
                 <div className="grid grid-cols-2 gap-4 text-sm">
                    {logic.currentVariant && Object.entries(logic.currentVariant.specs).map(([key, val]) => (
                       <div key={key} className="flex justify-between border-b border-gray-50 pb-2">
                          <span className="text-slate-500 capitalize font-medium">{key.replace('_', ' ')}</span>
                          <span className="font-bold text-slate-900">{String(val)}</span>
                       </div>
                    ))}
                 </div>
              </div>
           </div>

           {/* RIGHT: CONFIGURATOR */}
           <div>
              <ProductConfigurator 
                 product={product}
                 currentVariant={logic.currentVariant}
                 options={logic.options}
                 selections={logic.selections}
                 onSelect={logic.handleSelection}
                 isAvailable={logic.isOptionAvailable}
              />
              
              {/* Description Body */}
              <div className="mt-12 prose prose-slate prose-sm max-w-none">
                 <h3 className="text-lg font-bold text-slate-900 not-prose mb-4">Product Overview</h3>
                 <div className="text-slate-600 leading-relaxed whitespace-pre-line">
                   {product.description || "No description available."}
                 </div>
              </div>

              {/* REVIEWS SECTION (New) */}
              <div className="mt-12 border-t border-gray-100 pt-8">
                 <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                    Verified Reviews 
                    <span className="text-xs bg-slate-100 px-2 py-1 rounded-full text-slate-600">{reviews.length}</span>
                 </h3>
                 
                 {reviews.length === 0 ? (
                    <div className="text-sm text-slate-400 italic bg-slate-50 p-6 rounded-xl flex items-center gap-3">
                        <Store className="text-slate-300" /> 
                        No reviews yet. Be the first to verify this product!
                    </div>
                 ) : (
                    <div className="space-y-6">
                       {reviews.map(review => (
                          <div key={review.id} className="bg-slate-50 p-6 rounded-2xl">
                             <div className="flex items-center justify-between mb-3">
                                <div className="flex gap-1">
                                   {Array.from({ length: 5 }).map((_, i) => (
                                      <Star key={i} size={14} className={i < review.rating ? "text-orange-400 fill-orange-400" : "text-gray-300"} />
                                   ))}
                                </div>
                                {review.is_verified_purchase && (
                                   <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                                      <CheckCircle size={10} /> Verified Purchase
                                   </span>
                                )}
                             </div>
                             <p className="text-slate-700 text-sm leading-relaxed">{review.comment}</p>
                          </div>
                       ))}
                    </div>
                 )}
              </div>
           </div>
        </div>
      </div>

      {/* FOOTER: UPSELL ENGINE */}
      {relatedItems.length > 0 && (
          <section className="bg-slate-50 py-16 mt-16 border-t border-gray-200">
             <div className="container mx-auto px-4 max-w-[1400px]">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                   <div className="flex items-center gap-3">
                      {/* ✅ THEME FIX */}
                      <div className="bg-[var(--primary)] p-2.5 rounded-xl shadow-lg shadow-orange-500/20">
                         <PackagePlus className="text-white" size={24} />
                      </div>
                      <div>
                         <h2 className="text-2xl font-black text-slate-900">You might also like</h2>
                         <p className="text-sm font-medium text-slate-500">Popular {product.category} picks</p>
                      </div>
                   </div>
                   {/* ✅ THEME FIX */}
                   <Link href={`/category/${product.category}`} className="text-sm font-bold text-[var(--primary)] hover:opacity-80 flex items-center gap-1">
                      View all {product.category}s <ArrowLeft className="rotate-180" size={16}/>
                   </Link>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                   {relatedItems.map(item => (
                      <div key={item.id} className="h-full">
                         <ProductCard product={item} />
                      </div>
                   ))}
                </div>
             </div>
          </section>
      )}

    </div>
  );
}