"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Product, Variant } from '@/lib/types';
import { useProductLogic } from '@/hooks/useProductLogic';
import { ProductGallery } from '@/components/product/ProductGallery';
import { ProductConfigurator } from '@/components/product/ProductConfigurator';
import { Loader2, ArrowLeft, PackagePlus, Zap } from 'lucide-react';
import Link from 'next/link';
import { ProductCard } from '@/components/ProductCard'; 
import { ProductGridSkeleton } from '@/components/skeletons/ProductCardSkeleton';

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [loading, setLoading] = useState(true);
  const [relatedItems, setRelatedItems] = useState<Product[]>([]);

  // 1. FETCH DATA
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      // A. Get Parent Product
      const { data: parentData, error: parentError } = await supabase
        .from('products')
        .select('*, images:base_images, price:base_price')
        .eq('slug', slug)
        .single();

      if (parentError || !parentData) {
        setLoading(false);
        return; 
      }

      setProduct(parentData as Product);

      // B. Get Variants
      const { data: variantData } = await supabase
        .from('product_variants')
        .select('*')
        .eq('product_id', parentData.id);

      if (variantData) setVariants(variantData as any);

      // C. Get "Smart" Related Items (FIXED IMAGE & PRICE BUG)
      const { data: relatedRaw } = await supabase
        .from('products')
        .select(`
            *, 
            images:base_images,          // <--- Fixes Image Break
            variants:product_variants(price) // <--- Fixes Price showing 0
        `)
        .eq('category', parentData.category)
        .neq('id', parentData.id)
        .limit(4);
        
      if (relatedRaw) {
        // Normalize related items so ProductCard can read them
        const cleanRelated = relatedRaw.map((p: any) => {
            const prices = p.variants?.map((v: any) => v.price) || [];
            const minPrice = prices.length > 0 ? Math.min(...prices) : (p.base_price || 0);
            return {
                ...p,
                price: minPrice,
                images: p.images || []
            };
        });
        setRelatedItems(cleanRelated);
      }

      setLoading(false);
    };

    fetchData();
  }, [slug]);

  // 2. INITIALIZE LOGIC ENGINE
  const logic = useProductLogic(product as Product, variants);

  // 3. IMAGE LOGIC
  const activeImages = logic.currentVariant?.images && logic.currentVariant.images.length > 0
    ? logic.currentVariant.images
    : product?.images || [];

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-orange-500 w-8 h-8"/></div>;
  if (!product) return <div className="h-screen flex items-center justify-center text-slate-500">Product not found</div>;

  return (
    <div className="min-h-screen bg-white pb-20">
      
      {/* HEADER: Breadcrumb */}
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
           
           {/* LEFT: GALLERY */}
           <div className="lg:sticky lg:top-24 h-fit">
              <ProductGallery images={activeImages} />
              
              {/* Tech Specs Summary (Desktop) */}
              <div className="hidden lg:block mt-12 border-t border-gray-100 pt-8 animate-in slide-in-from-bottom-4 duration-700">
                 <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Zap size={18} className="text-orange-500" /> Technical Highlights
                 </h3>
                 <div className="grid grid-cols-2 gap-4 text-sm">
                    {logic.currentVariant && Object.entries(logic.currentVariant.specs).map(([key, val]) => (
                       <div key={key} className="flex justify-between border-b border-gray-50 pb-2">
                          <span className="text-slate-500 capitalize font-medium">{key.replace('_', ' ')}</span>
                          <span className="font-bold text-slate-900">{val}</span>
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
                    {product.description || "No description available for this item."}
                 </div>
              </div>

              {/* Mobile Tech Specs */}
              <div className="lg:hidden mt-12 bg-gray-50 p-6 rounded-2xl">
                 <h3 className="font-bold text-slate-900 mb-4">Specs Sheet</h3>
                 <div className="space-y-3 text-sm">
                    {logic.currentVariant && Object.entries(logic.currentVariant.specs).map(([key, val]) => (
                       <div key={key} className="flex justify-between">
                          <span className="text-slate-500 capitalize">{key}</span>
                          <span className="font-bold text-slate-900">{val}</span>
                       </div>
                    ))}
                 </div>
              </div>
           </div>

        </div>
      </div>

      {/* FOOTER: UPSELL ENGINE (Re-using ProductCard) */}
      {relatedItems.length > 0 && (
          <section className="bg-slate-50 py-16 mt-16 border-t border-gray-200">
             <div className="container mx-auto px-4 max-w-[1400px]">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                   <div className="flex items-center gap-3">
                      <div className="bg-orange-500 p-2.5 rounded-xl shadow-lg shadow-orange-500/20">
                         <PackagePlus className="text-white" size={24} />
                      </div>
                      <div>
                         <h2 className="text-2xl font-black text-slate-900">You might also like</h2>
                         <p className="text-sm font-medium text-slate-500">Popular {product.category} picks</p>
                      </div>
                   </div>
                   <Link href={`/category/${product.category}`} className="text-sm font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1">
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