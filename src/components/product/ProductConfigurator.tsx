"use client";

import React, { useState } from 'react';
import { ShoppingCart, CheckCircle, ShieldCheck, Clock, Plane, AlertCircle, Loader2 } from 'lucide-react';
import { Product, Variant } from '@/lib/types';
import { cn } from '@/lib/utils'; 
import { useStore } from '@/lib/store'; // <--- 1. Import Store

interface ConfiguratorProps {
  product: Product;
  currentVariant?: Variant;
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
  
  const { addToCart, isCartOpen, toggleCart } = useStore(); // <--- 2. Get Actions
  const [isAdding, setIsAdding] = useState(false); // Local loading state

  // Calculate Display Price
  const price = currentVariant ? currentVariant.price : (product.price || 0);
  const oldPrice = currentVariant?.originalPrice || product.originalPrice;
  const isOutOfStock = currentVariant && currentVariant.stock <= 0;

  // --- 3. THE MISSING HANDLER ---
  const handleAddToCart = () => {
    if (!currentVariant) return;

    setIsAdding(true);
    
    // Add to Global State
    addToCart(product, currentVariant);

    // Visual Feedback Loop
    setTimeout(() => {
        setIsAdding(false);
        // Optional: Open the cart drawer automatically to show confirmation
        if (!isCartOpen) toggleCart(true);
    }, 600);
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
      
      {/* 1. HEADER & PRICE */}
      <div className="border-b border-gray-100 pb-6">
        <h2 className="text-sm font-bold text-orange-600 tracking-wider uppercase mb-2">{product.brand}</h2>
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
             <span className={`text-xs font-bold px-2 py-1 rounded-full ${isOutOfStock ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-700'}`}>
                {isOutOfStock ? 'Out of Stock' : 'In Stock'}
             </span>
          )}
        </div>
      </div>

      {/* 2. THE SELECTORS (The Matrix) */}
      <div className="space-y-6">
        {/* Render Condition First */}
        {options.condition && (
          <div>
             <span className="text-xs font-bold text-slate-400 uppercase mb-3 block">Condition</span>
             <div className="flex flex-wrap gap-3">
               {options.condition.map(opt => (
                 <button
                   key={opt}
                   onClick={() => onSelect('condition', opt)}
                   className={cn(
                     "px-5 py-3 rounded-xl text-sm font-bold border transition-all shadow-sm",
                     selections.condition === opt 
                       ? "bg-slate-900 text-white border-slate-900 shadow-slate-200" 
                       : "bg-white text-slate-600 border-gray-200 hover:border-orange-200 hover:text-orange-600"
                   )}
                 >
                   {opt}
                 </button>
               ))}
             </div>
          </div>
        )}

        {/* Render Other Specs */}
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
                          selected 
                            ? "bg-blue-50 border-blue-500 text-blue-700 ring-1 ring-blue-500" 
                            : available 
                               ? "bg-white border-gray-200 text-slate-700 hover:border-blue-300"
                               : "bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed decoration-slice"
                        )}
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
                 {isOutOfStock ? "Ships from USA Warehouse" : "Available for Instant Delivery"}
               </h4>
               <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                 {isOutOfStock 
                   ? "This config is sourced on-demand. Arrives in 14-21 days." 
                   : "Order within 4 hrs to get it today in Accra."}
               </p>
            </div>
         </div>
         <div className="w-full h-px bg-gray-200" />
         <div className="flex gap-4">
            <div className="bg-white p-2.5 rounded-full h-fit border border-gray-100 shadow-sm">
               <ShieldCheck className="text-orange-500" size={20} />
            </div>
            <div>
               <h4 className="font-bold text-slate-900 text-sm">Authenticity Guarantee</h4>
               <p className="text-xs text-slate-500 mt-0.5">
                 Verified {selections.condition} device with 6-month warranty.
               </p>
            </div>
         </div>
      </div>

      {/* 4. ACTION BUTTONS */}
      <div className="flex gap-4 pt-4">
         <button 
           onClick={handleAddToCart} // <--- LINKED HERE
           disabled={!currentVariant || isOutOfStock || isAdding}
           className={cn(
             "flex-1 py-4 rounded-xl font-bold text-lg transition-all shadow-xl flex items-center justify-center gap-2 active:scale-[0.98]",
             isAdding 
                ? "bg-green-600 text-white shadow-green-900/20 scale-[0.98]"
                : "bg-[#F97316] text-white hover:bg-orange-600 shadow-orange-900/10",
             (!currentVariant || isOutOfStock) && "opacity-50 cursor-not-allowed bg-slate-300 text-slate-500 shadow-none"
           )}
         >
           {isAdding ? (
              <><CheckCircle size={20} className="animate-in zoom-in spin-in-180"/> Added to Cart</>
           ) : (
              <><ShoppingCart size={20} /> {currentVariant ? 'Add to Cart' : 'Select Options'}</>
           )}
         </button>
      </div>
      
      {!currentVariant && Object.keys(selections).length > 0 && (
        <p className="text-red-500 text-xs font-bold flex items-center gap-2 bg-red-50 p-3 rounded-lg border border-red-100">
           <AlertCircle size={16}/> This specific combination is not available in stock.
        </p>
      )}

    </div>
  );
};