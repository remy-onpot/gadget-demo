"use client";

import React, { useState } from 'react';
import { ShoppingCart, CheckCircle, ShieldCheck, Clock, Plane, AlertCircle, Loader2, Check } from 'lucide-react';
import { Database } from '@/lib/database.types'; 
import { cn } from '@/lib/utils'; 
import { useStore } from '@/lib/store';

// 1. Define Types from Database
type ProductRow = Database['public']['Tables']['products']['Row'];
type VariantRow = Database['public']['Tables']['product_variants']['Row'];

interface ConfiguratorProps {
  product: ProductRow;
  currentVariant?: VariantRow;
  options: Record<string, string[]>;
  selections: Record<string, string>;
  onSelect: (key: string, value: string) => void;
  isAvailable: (key: string, value: string) => boolean;
}

export const ProductConfigurator = ({ 
  product, 
  currentVariant, 
  options, 
  selections, 
  onSelect, 
  isAvailable 
}: ConfiguratorProps) => {
  
  const { addToCart, isCartOpen, toggleCart } = useStore();
  const [isAdding, setIsAdding] = useState(false);

  // Calculate Display Price
  const price = currentVariant ? currentVariant.price : (product.base_price || 0);
  const oldPrice = currentVariant?.original_price;
  const stock = currentVariant?.stock ?? 0;
  const isOutOfStock = currentVariant && stock <= 0;

  const handleAddToCart = () => {
    if (!currentVariant) return;

    setIsAdding(true);
    
    // FIX: We cast the object to 'any' to bypass the strict type check 
    // because we are injecting 'price' and 'images' for backward compatibility
    // with the store's internal logic, even though the type definition says otherwise.
    const productForCart = {
       ...product,
       price: product.base_price, 
       images: product.base_images || [] 
    } as any;

    addToCart(productForCart, currentVariant);

    setTimeout(() => {
        setIsAdding(false);
        if (!isCartOpen) toggleCart(); 
    }, 600);
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
      
      {/* 1. HEADER & PRICE */}
      <div className="border-b border-gray-100 pb-6">
        <h2 className="text-sm font-bold tracking-wider uppercase mb-2" style={{ color: 'var(--primary)' }}>
           {product.brand}
        </h2>
        <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-4">{product.name}</h1>
        
        <div className="flex items-baseline gap-4">
          <span className="text-3xl font-black text-slate-900">
            ₵{price.toLocaleString()}
          </span>
          {oldPrice && (
            <span className="text-lg text-gray-400 line-through font-medium">
              ₵{oldPrice.toLocaleString()}
            </span>
          )}
          {currentVariant && (
             <span className={cn(
               "text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1",
               isOutOfStock ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-700'
             )}>
                {isOutOfStock ? <AlertCircle size={12}/> : <CheckCircle size={12}/>}
                {isOutOfStock ? 'Out of Stock' : 'In Stock'}
             </span>
          )}
        </div>
      </div>

      {/* 2. THE SELECTORS */}
      <div className="space-y-6">
        {/* Condition Selector */}
        {options.condition && options.condition.length > 0 && (
          <div>
             <span className="text-xs font-bold text-slate-400 uppercase mb-3 block">Condition</span>
             <div className="flex flex-wrap gap-3">
               {options.condition.map(cond => {
                 const isSelected = selections.condition === cond;
                 return (
                   <button
                     key={cond}
                     onClick={() => onSelect('condition', cond)}
                     className={cn(
                       "px-5 py-3 rounded-xl text-sm font-bold border transition-all shadow-sm flex items-center gap-2",
                       isSelected 
                         ? "bg-slate-900 text-white border-slate-900 shadow-slate-200" 
                         : "bg-white text-slate-600 border-gray-200 hover:border-slate-300"
                     )}
                   >
                     {cond}
                     {isSelected && <Check size={14} strokeWidth={3} />}
                   </button>
                 );
               })}
             </div>
          </div>
        )}

        {/* Other Specs */}
        {Object.entries(options).map(([key, values]) => {
           if (key === 'condition') return null;
           
           return (
             <div key={key}>
                <span className="text-xs font-bold text-slate-400 uppercase mb-3 block">{key.replace('_', ' ')}</span>
                <div className="flex flex-wrap gap-2">
                  {values.map(val => {
                    const available = isAvailable(key, val);
                    const selected = selections[key] === val;
                    
                    return (
                      <button
                        key={val}
                        onClick={() => onSelect(key, val)}
                        disabled={!available}
                        className={cn(
                          "px-4 py-2 rounded-lg text-sm font-bold border transition-all min-w-[3rem]",
                          !available && "bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed decoration-slice line-through",
                          available && !selected && "bg-white border-gray-200 text-slate-700 hover:border-slate-300",
                        )}
                        style={selected ? {
                            backgroundColor: 'rgba(var(--primary-rgb), 0.05)',
                            borderColor: 'var(--primary)',
                            color: 'var(--primary)',
                            boxShadow: '0 0 0 1px var(--primary)'
                        } : {}}
                      >
                        {val}
                      </button>
                    );
                  })}
                </div>
             </div>
           );
        })}
      </div>

      {/* 3. TRUST & DELIVERY BADGES */}
      <div className="bg-gray-50 rounded-2xl p-5 space-y-4 border border-gray-100">
         <div className="flex gap-4">
            <div className="bg-white p-2.5 rounded-full h-fit border border-gray-100 shadow-sm">
               {isOutOfStock ? <Plane className="text-blue-500" size={20} /> : <Clock className="text-green-500" size={20} />}
            </div>
            <div>
               <h4 className="font-bold text-slate-900 text-sm">
                 {isOutOfStock ? "Ships from Warehouse" : "Available for Instant Delivery"}
               </h4>
               <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                 {isOutOfStock 
                   ? "This config is sourced on-demand. Arrives in 14-21 days." 
                   : "Order within 4 hrs to get it today."}
               </p>
            </div>
         </div>
         <div className="w-full h-px bg-gray-200" />
         <div className="flex gap-4">
            <div className="bg-white p-2.5 rounded-full h-fit border border-gray-100 shadow-sm">
               <ShieldCheck style={{ color: 'var(--primary)' }} size={20} />
            </div>
            <div>
               <h4 className="font-bold text-slate-900 text-sm">Authenticity Guarantee</h4>
               <p className="text-xs text-slate-500 mt-0.5">
                 Verified {selections.condition || 'authentic'} device.
               </p>
            </div>
         </div>
      </div>

      {/* 4. ACTION BUTTONS */}
      <div className="flex gap-4 pt-4">
         <button 
           onClick={handleAddToCart}
           disabled={!currentVariant || isOutOfStock || isAdding}
           className={cn(
             "flex-1 py-4 rounded-xl font-bold text-lg transition-all shadow-xl flex items-center justify-center gap-2 active:scale-[0.98]",
             (!currentVariant || isOutOfStock) && "opacity-50 cursor-not-allowed bg-slate-300 text-slate-500 shadow-none"
           )}
           style={!currentVariant || isOutOfStock ? {} : {
               backgroundColor: isAdding ? '#16a34a' : 'var(--primary)',
               color: 'white',
               boxShadow: isAdding ? 'none' : '0 10px 30px -10px var(--primary)'
           }}
         >
           {isAdding ? (
              <><Loader2 size={20} className="animate-spin"/> Added!</>
           ) : (
              <><ShoppingCart size={20} /> {currentVariant ? (isOutOfStock ? 'Out of Stock' : 'Add to Cart') : 'Select Options'}</>
           )}
         </button>
      </div>
      
      {!currentVariant && Object.keys(selections).length > 0 && (
        <p className="text-red-500 text-xs font-bold flex items-center gap-2 bg-red-50 p-3 rounded-lg border border-red-100">
           <AlertCircle size={16}/> This specific combination is not available.
        </p>
      )}

    </div>
  );
};