"use client";

import React, { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { ArrowLeft, User, Loader2, Send, ShieldCheck, AlertCircle, LogOut } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { submitOrder } from '@/actions/order-actions'; 
import { captureAbandonedCart } from './actions';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import type { Database } from '@/lib/database.types';

type ProfileRow = Database['public']['Tables']['profiles']['Row'];

interface CheckoutClientProps {
  storeId: string;
  storeSlug: string;
  contactPhone: string | null;
  user: SupabaseUser | null;
  profile: ProfileRow | null;
}

export default function CheckoutClient({ storeId, storeSlug, contactPhone, user, profile }: CheckoutClientProps) {
  const { cart, removeSelected } = useStore();
  const router = useRouter();
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: user?.email || profile?.email || '', 
    name: profile?.full_name || '',
    phone: profile?.phone || '',
    address: profile?.shipping_address || '',
    notes: ''
  });

  const checkoutItems = cart.filter(item => item.selected);
  const total = checkoutItems.reduce((sum, item) => sum + (item.variant.price * item.quantity), 0);

  useEffect(() => {
    if (checkoutItems.length === 0) {
      router.push('/cart');
    }
  }, [checkoutItems, router]);

  // 🔫 SNIPER LOGIC
  const handleContactBlur = async () => {
    if (formData.email.includes('@') && checkoutItems.length > 0) {
       const snapshotItems = checkoutItems.map(item => ({
           uniqueId: item.uniqueId,
           quantity: item.quantity,
           variant: item.variant as any,
           product: {
               ...item.product,
               base_images: item.product.base_images,
               base_price: item.product.base_price    
           } as any 
       }));
       await captureAbandonedCart(storeSlug, formData, snapshotItems);
    }
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Prepare Payload
      const itemsPayload = checkoutItems.map(item => {
        const specs = (item.variant.specs as Record<string, string>) || {};
        const specLabel = Object.values(specs).slice(0, 2).join('/');

        return {
          product_id: item.product.id,
          variant_id: item.variant.id,
          variant_name: `${specLabel} - ${item.variant.condition}`, 
          quantity: item.quantity,
        };
      });

      // 2. Submit Order (use storeId instead of slug)
      const result = await submitOrder({
        storeId: storeId,
        customer: formData,
        items: itemsPayload,
      });

      if (!result.success) throw new Error(result.error);

      // 3. WhatsApp Message
      const orderId = result.orderId!.slice(0, 6).toUpperCase();
      const lineItems = checkoutItems.map(item => {
        const specs = (item.variant.specs as Record<string, string>) || {};
        const specSummary = Object.values(specs).slice(0, 2).join('/');
        return `• ${item.quantity}x ${item.product.name} (${specSummary}) - ₵${item.variant.price}`;
      }).join('%0a');

      const message = 
        `*🆕 NEW ORDER: #${orderId}*%0a` +
        `--------------------------------%0a` +
        `👤 *Name:* ${formData.name}%0a` +
        `📍 *Location:* ${formData.address}%0a` +
        `📞 *Phone:* ${formData.phone}%0a` +
        (formData.notes ? `📝 *Note:* ${formData.notes}%0a` : ``) +
        `--------------------------------%0a` +
        `*🛒 ITEMS:*%0a${lineItems}%0a` +
        `--------------------------------%0a` +
        `💰 *TOTAL: ₵${total.toLocaleString()}*%0a` +
        `--------------------------------%0a` +
        `I would like to confirm availability.`;

      removeSelected();
      
      const adminPhone = contactPhone || '233551578335'; 
      window.location.href = `https://wa.me/${adminPhone}?text=${message}`;

    } catch (err: any) {
      alert("Order failed: " + (err.message || "Unknown error"));
      setLoading(false);
    }
  };

  if (checkoutItems.length === 0) return null; 

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-12 px-4 font-sans">
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* LEFT COL: FORM */}
        <div className="md:col-span-7 space-y-6">
          <Link href="/cart" className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-900 font-bold transition-colors">
              <ArrowLeft size={18} /> Back to Cart
          </Link>

          {/* Logged In Indicator */}
          {user && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 p-4 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-black">
                  {profile?.full_name?.charAt(0) || user.email?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-bold text-slate-900 text-sm">
                    {profile?.full_name || 'Valued Customer'}
                  </p>
                  <p className="text-xs text-slate-500">{user.email}</p>
                </div>
              </div>
              <Link 
                href="/account" 
                className="text-xs font-bold text-green-600 hover:text-green-700 flex items-center gap-1"
              >
                <LogOut size={12} /> View Profile
              </Link>
            </div>
          )}
          
          <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
              <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[var(--primary)]/10 text-[var(--primary)]">
                  <User size={20} />
                </div>
                Delivery Details
                {profile && (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-bold ml-auto">
                    Pre-filled
                  </span>
                )}
              </h2>
              
              <form id="checkout-form" onSubmit={handlePlaceOrder} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                   <div>
                      <label className="text-xs font-bold uppercase text-slate-500 ml-1 mb-1.5 block">Full Name</label>
                      <input 
                        required
                        className="checkout-input"
                        placeholder="e.g. Kofi Mensah"
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                      />
                   </div>
                   <div>
                      <label className="text-xs font-bold uppercase text-slate-500 ml-1 mb-1.5 block">Phone Number</label>
                      <input 
                        required
                        type="tel"
                        className="checkout-input"
                        placeholder="e.g. 024 123 4567"
                        value={formData.phone}
                        onChange={e => setFormData({...formData, phone: e.target.value})}
                      />
                   </div>
                </div>

                <div>
                   <label className="text-xs font-bold uppercase text-slate-500 ml-1 mb-1.5 block">Email Address</label>
                   <input 
                     required
                     type="email"
                     className="checkout-input"
                     placeholder="e.g. kofi@example.com"
                     value={formData.email}
                     onChange={e => setFormData({...formData, email: e.target.value})}
                     onBlur={handleContactBlur} 
                   />
                </div>

                <div>
                   <label className="text-xs font-bold uppercase text-slate-500 ml-1 mb-1.5 block">Delivery Address</label>
                   <textarea 
                     required
                     className="checkout-input h-32 resize-none leading-relaxed"
                     placeholder="Detailed Address (e.g. GPS Code, Street Name, Landmark)"
                     value={formData.address}
                     onChange={e => setFormData({...formData, address: e.target.value})}
                   />
                </div>

                <div>
                   <label className="text-xs font-bold uppercase text-slate-500 ml-1 mb-1.5 block">Order Notes (Optional)</label>
                   <input 
                     className="checkout-input"
                     placeholder="e.g. Call before arrival..."
                     value={formData.notes}
                     onChange={e => setFormData({...formData, notes: e.target.value})}
                   />
                </div>
              </form>
          </div>

          <div className="p-6 rounded-3xl border flex items-start gap-4 bg-[var(--primary)]/5 border-[var(--primary)]/10">
              <ShieldCheck className="shrink-0 mt-1 text-[var(--primary)]" size={24} />
              <div>
                 <h4 className="font-bold text-slate-900">Pay on Delivery Available</h4>
                 <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                    For customers in Accra, we offer payment upon delivery.
                 </p>
              </div>
          </div>
        </div>

        {/* RIGHT COL: SUMMARY */}
        <div className="md:col-span-5 space-y-6">
           <div className="bg-white p-6 rounded-[2rem] shadow-lg shadow-slate-200/50 border border-gray-100 sticky top-8">
              <h2 className="text-xl font-black text-slate-900 mb-6 flex justify-between items-center">
                 Summary
                 <span className="text-xs bg-slate-100 px-3 py-1 rounded-full text-slate-600 font-bold">{checkoutItems.length} Items</span>
              </h2>
              
              <div className="space-y-6 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
                 {checkoutItems.map((item) => {
                   const specs = (item.variant.specs as Record<string, string>) || {};
                   
                   return (
                   <div key={item.uniqueId} className="flex gap-4">
                      <div className="w-20 h-20 bg-gray-100 rounded-2xl relative overflow-hidden flex-shrink-0 border border-gray-200">
                         {/* eslint-disable-next-line @next/next/no-img-element */}
                         <img 
                           src={item.variant.images?.[0] || item.product.base_images?.[0] || ''} 
                           className="w-full h-full object-cover" 
                           alt={item.product.name} 
                         />
                      </div>
                      <div className="flex-1 min-w-0">
                         <h4 className="font-bold text-slate-900 text-sm truncate pr-4">{item.product.name}</h4>
                         <div className="flex flex-wrap gap-1 mt-1.5">
                            <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded border border-gray-200 uppercase">
                               {item.variant.condition}
                            </span>
                            {Object.values(specs).slice(0, 2).map((spec, i) => (
                               <span key={i} className="text-[10px] font-bold bg-gray-50 text-slate-400 px-1.5 py-0.5 rounded border border-gray-100 uppercase">
                                  {String(spec)}
                               </span>
                            ))}
                         </div>
                         <div className="flex justify-between items-end mt-2">
                            <p className="text-xs text-slate-400 font-bold">Qty: {item.quantity}</p>
                            <p className="font-black text-slate-900">₵{(item.variant.price * item.quantity).toLocaleString()}</p>
                         </div>
                      </div>
                   </div>
                 )})}
              </div>

              <div className="border-t-2 border-dashed border-gray-100 mt-6 pt-6 space-y-3">
                 <div className="flex justify-between text-slate-500 text-sm font-medium">
                    <span>Subtotal</span>
                    <span>₵{total.toLocaleString()}</span>
                 </div>
                 <div className="flex justify-between text-slate-500 text-sm font-medium">
                    <span>Delivery Fee</span>
                    <span className="text-xs bg-[var(--primary)]/10 text-[var(--primary)] px-2 py-1 rounded font-bold">Calculated on WhatsApp</span>
                 </div>
                 <div className="flex justify-between text-slate-900 font-black text-2xl pt-2">
                    <span>Total</span>
                    <span>₵{total.toLocaleString()}</span>
                 </div>
              </div>

              <button 
                onClick={handlePlaceOrder}
                disabled={loading || !formData.name || !formData.phone || !formData.address || !formData.email}
                className="w-full mt-6 bg-[#25D366] text-white py-4 rounded-xl font-bold text-lg hover:bg-[#1ebc57] transition-all shadow-xl shadow-green-900/10 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
              >
                {loading ? <Loader2 className="animate-spin" /> : (
                  <>
                    <span>Confirm Order</span>
                    <Send size={20} className="-rotate-45 mb-1" />
                  </>
                )}
              </button>
              
              <div className="mt-4 flex items-center justify-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                 <AlertCircle size={12} /> Secure WhatsApp Checkout
              </div>
           </div>
        </div>

      </div>
      
      <style jsx>{`
        .checkout-input {
            @apply w-full p-4 bg-slate-50 border border-gray-200 rounded-xl font-bold text-slate-900 outline-none transition;
        }
        .checkout-input:focus {
            @apply bg-white border-[var(--primary)] ring-4;
            --tw-ring-color: rgba(var(--primary-rgb), 0.1); 
            box-shadow: 0 0 0 4px var(--primary-ring, rgba(0,0,0,0.05));
            border-color: var(--primary);
        }
      `}</style>
    </div>
  );
}
