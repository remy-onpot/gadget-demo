"use client";

import React from 'react';
import { useStore } from '@/lib/store';
import { Trash2, Minus, Plus, ArrowRight, CheckSquare, Square, ShoppingBag, ArrowLeft, ShieldCheck } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function CartPage() {
  const { cart, updateQuantity, toggleItemSelection, toggleAllSelection, removeSelected } = useStore();
  const router = useRouter();

  // Derived State
  const selectedItems = cart.filter(item => item.selected);
  const isAllSelected = cart.length > 0 && selectedItems.length === cart.length;
  const subtotal = selectedItems.reduce((sum, item) => sum + (item.variant.price * item.quantity), 0);

  const handleCheckout = () => {
    if (selectedItems.length === 0) return;
    router.push('/checkout');
  };

  // EMPTY STATE
  if (cart.length === 0) return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center bg-[#F8FAFC] p-4 text-center">
      <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm border border-gray-100">
        <ShoppingBag className="text-gray-300" size={40} />
      </div>
      <h2 className="text-2xl font-black text-slate-900 mb-2">Your cart is empty</h2>
      <p className="text-slate-500 mb-8 max-w-xs mx-auto">Looks like you haven't added any gear yet. Check out our latest drops.</p>
      <Link href="/" className="bg-[#0A2540] text-white px-8 py-3.5 rounded-xl font-bold hover:scale-105 transition-transform shadow-lg shadow-slate-900/10">
        Start Shopping
      </Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-32 md:pb-12 pt-20 md:pt-28 font-sans">
      <div className="container mx-auto px-4 max-w-6xl">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 md:mb-8">
           <div>
             <h1 className="text-2xl md:text-3xl font-black text-slate-900 flex items-center gap-3">
               Shopping Cart 
               <span className="text-sm bg-orange-100 text-orange-700 px-3 py-1 rounded-full font-bold">{cart.length}</span>
             </h1>
           </div>
           <Link href="/" className="text-slate-500 font-bold hover:text-slate-900 flex items-center gap-2 text-sm md:text-base">
              <ArrowLeft size={18} /> Continue Shopping
           </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative">
          
          {/* LEFT: CART ITEMS (Span 8) */}
          <div className="lg:col-span-8 space-y-4 md:space-y-6">
             
             {/* Toolbar */}
             <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center sticky top-20 z-10 md:static">
                <button 
                  onClick={() => toggleAllSelection(!isAllSelected)}
                  className="flex items-center gap-3 font-bold text-slate-700 hover:text-orange-600 transition text-sm md:text-base"
                >
                   {isAllSelected ? <CheckSquare className="text-orange-500" /> : <Square className="text-gray-300" />}
                   Select All
                </button>
                
                {selectedItems.length > 0 && selectedItems.length < cart.length && (
                   <button 
                     onClick={removeSelected}
                     className="text-red-500 font-bold text-xs md:text-sm flex items-center gap-2 hover:bg-red-50 px-3 py-1.5 rounded-lg transition"
                   >
                      <Trash2 size={16} /> <span className="hidden md:inline">Remove Selected</span>
                   </button>
                )}
             </div>

             {/* Items Loop */}
             <div className="space-y-3 md:space-y-4">
                {cart.map((item) => (
                   <div key={item.uniqueId} className={`group bg-white p-3 md:p-5 rounded-2xl border transition-all ${item.selected ? 'border-orange-200 shadow-sm' : 'border-gray-100 opacity-80'}`}>
                      <div className="flex gap-3 md:gap-5 items-start">
                         
                         {/* Checkbox */}
                         <button 
                           onClick={() => toggleItemSelection(item.uniqueId)}
                           className="mt-6 md:mt-8 shrink-0 text-gray-300 hover:text-orange-500 transition-colors p-2 -ml-2"
                         >
                            {item.selected ? <CheckSquare className="text-orange-500" size={20} /> : <Square size={20} />}
                         </button>

                         {/* Product Image */}
                         <div className="w-20 h-20 md:w-28 md:h-28 bg-gray-50 rounded-xl relative overflow-hidden shrink-0 border border-gray-100">
                            <Image 
                              src={item.variant.images?.[0] || item.product.images[0]} 
                              fill 
                              className="object-contain p-2" 
                              alt={item.product.name} 
                            />
                         </div>

                         {/* Details Column */}
                         <div className="flex-1 min-w-0 flex flex-col justify-between self-stretch">
                            <div>
                               <div className="flex justify-between items-start gap-2">
                                  <h3 className="font-bold text-slate-900 text-sm md:text-lg leading-tight line-clamp-2">
                                    {item.product.name}
                                  </h3>
                                  <div className="text-right">
                                     <div className="font-black text-slate-900 text-sm md:text-lg">₵{(item.variant.price * item.quantity).toLocaleString()}</div>
                                     <div className="text-[10px] md:text-xs text-slate-400 font-medium">₵{item.variant.price.toLocaleString()} ea</div>
                                  </div>
                               </div>

                               {/* Variant Chips */}
                               <div className="flex flex-wrap gap-1.5 mt-2">
                                  <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded uppercase border border-slate-200">
                                     {item.variant.condition}
                                  </span>
                                  {Object.values(item.variant.specs).slice(0, 2).map((s, i) => (
                                     <span key={i} className="text-[10px] font-bold bg-white border border-gray-200 text-slate-400 px-2 py-0.5 rounded truncate max-w-[100px]">
                                        {s}
                                     </span>
                                  ))}
                               </div>
                            </div>

                            {/* Mobile Actions */}
                            <div className="flex justify-between items-end mt-3 md:mt-0">
                               <button 
                                 onClick={() => updateQuantity(item.uniqueId, -1000)}
                                 className="text-slate-400 hover:text-red-500 text-xs font-bold flex items-center gap-1 transition-colors py-2"
                               >
                                  <Trash2 size={14} /> <span className="hidden md:inline">Remove</span>
                               </button>

                               {/* Quantity Stepper */}
                               <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-1 border border-gray-200">
                                  <button 
                                    onClick={() => updateQuantity(item.uniqueId, -1)}
                                    className="w-7 h-7 flex items-center justify-center bg-white border border-gray-200 rounded shadow-sm text-slate-600 disabled:opacity-50"
                                    disabled={item.quantity <= 1}
                                  >
                                     <Minus size={12} />
                                  </button>
                                  <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                                  <button 
                                    onClick={() => updateQuantity(item.uniqueId, 1)}
                                    className="w-7 h-7 flex items-center justify-center bg-white border border-gray-200 rounded shadow-sm text-slate-600"
                                  >
                                     <Plus size={12} />
                                  </button>
                               </div>
                            </div>
                         </div>
                      </div>
                   </div>
                ))}
             </div>
          </div>

          {/* RIGHT: DESKTOP SUMMARY (Hidden on Mobile) */}
          <div className="hidden lg:block lg:col-span-4">
             <div className="bg-white p-8 rounded-[2rem] shadow-lg shadow-slate-200 border border-gray-100 sticky top-28">
                <h2 className="text-xl font-black text-slate-900 mb-6">Order Summary</h2>
                
                <div className="space-y-4 mb-8">
                   <div className="flex justify-between text-slate-500 font-medium">
                      <span>Selected Items</span>
                      <span>{selectedItems.length}</span>
                   </div>
                   <div className="flex justify-between text-slate-500 font-medium">
                      <span>Subtotal</span>
                      <span>₵{subtotal.toLocaleString()}</span>
                   </div>
                   <div className="pt-4 border-t border-dashed border-gray-200 flex justify-between items-end">
                      <span className="font-bold text-slate-900">Total</span>
                      <span className="font-black text-3xl text-slate-900">₵{subtotal.toLocaleString()}</span>
                   </div>
                </div>

                <div className="bg-blue-50 p-3 rounded-xl flex gap-3 mb-6">
                    <ShieldCheck className="text-blue-600 shrink-0" />
                    <p className="text-xs text-blue-700 font-medium leading-tight">
                        Payments are secured. Delivery fees calculated at next step.
                    </p>
                </div>

                <button 
                  onClick={handleCheckout}
                  disabled={selectedItems.length === 0}
                  className="w-full bg-[#0A2540] text-white py-4 rounded-xl font-bold text-lg hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                >
                   Checkout ({selectedItems.length}) <ArrowRight size={20} />
                </button>
             </div>
          </div>

        </div>
      </div>

      {/* MOBILE STICKY CHECKOUT BAR (Visible only on Mobile) */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 pb-8 md:hidden shadow-[0_-10px_40px_rgba(0,0,0,0.1)] z-40">
         <div className="flex items-center justify-between mb-3">
            <div className="text-xs font-medium text-slate-400">Total ({selectedItems.length} items)</div>
            <div className="text-2xl font-black text-slate-900">₵{subtotal.toLocaleString()}</div>
         </div>
         <button 
            onClick={handleCheckout}
            disabled={selectedItems.length === 0}
            className="w-full bg-[#0A2540] text-white py-3.5 rounded-xl font-bold text-lg flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95 transition-transform"
         >
            Checkout Now <ArrowRight size={20} />
         </button>
      </div>

    </div>
  );
}