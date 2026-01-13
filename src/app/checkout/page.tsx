"use client";

import React, { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, User, ShoppingBag, Loader2, Send, ShieldCheck, AlertCircle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function CheckoutPage() {
  const { cart, removeSelected, settings } = useStore();
  const router = useRouter();
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    notes: ''
  });

  // 1. FILTER: Only process items that were checked in the cart
  const checkoutItems = cart.filter(item => item.selected);
  
  // Calculate Total based on SELECTED items
  const total = checkoutItems.reduce((sum, item) => sum + (item.variant.price * item.quantity), 0);

  // Redirect if nothing selected
  useEffect(() => {
    if (checkoutItems.length === 0) {
      router.push('/cart');
    }
  }, [checkoutItems, router]);

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 2. SAVE ORDER TO SUPABASE
      const { data: order, error: orderErr } = await supabase.from('orders').insert({
        customer_name: formData.name,
        customer_phone: formData.phone,
        delivery_address: formData.address,
        delivery_notes: formData.notes,
        total_amount: total,
        status: 'pending',
        payment_method: 'pay_on_delivery'
      }).select().single();

      if (orderErr) throw orderErr;

      // 3. SAVE ORDER ITEMS
      const orderItems = checkoutItems.map(item => ({
        order_id: order.id,
        product_id: item.product.id,
        variant_id: item.variant.id,
        product_name: item.product.name,
        // Create readable string: "16GB/512GB - UK Used"
        variant_name: `${Object.values(item.variant.specs).slice(0, 2).join('/')} - ${item.variant.condition}`, 
        quantity: item.quantity,
        unit_price: item.variant.price
      }));

      const { error: itemsErr } = await supabase.from('order_items').insert(orderItems);
      if (itemsErr) throw itemsErr;

      // 4. GENERATE WHATSAPP RECEIPT
      const lineItems = checkoutItems.map(item => {
        const specSummary = Object.values(item.variant.specs).slice(0, 2).join('/');
        return `• ${item.quantity}x ${item.product.name} (${specSummary}) - ₵${item.variant.price}`;
      }).join('%0a');

      const message = 
        `*🆕 NEW ORDER: #${order.id.slice(0, 6).toUpperCase()}*%0a` +
        `--------------------------------%0a` +
        `👤 *Customer:* ${formData.name}%0a` +
        `📍 *Location:* ${formData.address}%0a` +
        `📞 *Phone:* ${formData.phone}%0a` +
        (formData.notes ? `📝 *Note:* ${formData.notes}%0a` : ``) +
        `--------------------------------%0a` +
        `*🛒 ITEMS:*%0a${lineItems}%0a` +
        `--------------------------------%0a` +
        `💰 *TOTAL: ₵${total.toLocaleString()}*%0a` +
        `--------------------------------%0a` +
        `I would like to confirm availability and delivery fees.`;

      // 5. CLEAN UP & REDIRECT
      // Only remove the items we just bought!
      removeSelected();
      
      const adminPhone = settings['whatsapp_phone'] || "233245151416"; 
      window.location.href = `https://wa.me/${adminPhone}?text=${message}`;

    } catch (err: any) {
      alert("Order failed: " + err.message);
      setLoading(false);
    }
  };

  if (checkoutItems.length === 0) return null; // Handled by useEffect redirect

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-12 px-4 font-sans">
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* LEFT COL: FORM (Span 7) */}
        <div className="md:col-span-7 space-y-6">
          <Link href="/cart" className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-900 font-bold transition-colors">
             <ArrowLeft size={18} /> Back to Cart
          </Link>
          
          <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
             <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                  <User className="text-orange-600" size={20} />
                </div>
                Delivery Details
             </h2>
             
             <form id="checkout-form" onSubmit={handlePlaceOrder} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                   <div>
                      <label className="text-xs font-bold uppercase text-slate-500 ml-1 mb-1.5 block">Full Name</label>
                      <input 
                        required
                        className="w-full p-4 bg-slate-50 border border-gray-200 rounded-xl font-bold text-slate-900 outline-none focus:bg-white focus:border-orange-500 focus:ring-4 ring-orange-500/10 transition"
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
                        className="w-full p-4 bg-slate-50 border border-gray-200 rounded-xl font-bold text-slate-900 outline-none focus:bg-white focus:border-orange-500 focus:ring-4 ring-orange-500/10 transition"
                        placeholder="e.g. 024 123 4567"
                        value={formData.phone}
                        onChange={e => setFormData({...formData, phone: e.target.value})}
                      />
                   </div>
                </div>

                <div>
                   <label className="text-xs font-bold uppercase text-slate-500 ml-1 mb-1.5 block">Delivery Address</label>
                   <textarea 
                     required
                     className="w-full p-4 bg-slate-50 border border-gray-200 rounded-xl font-bold text-slate-900 outline-none focus:bg-white focus:border-orange-500 focus:ring-4 ring-orange-500/10 transition h-32 resize-none leading-relaxed"
                     placeholder="Detailed Address (e.g. GPS Code, Street Name, Landmark)"
                     value={formData.address}
                     onChange={e => setFormData({...formData, address: e.target.value})}
                   />
                </div>

                <div>
                   <label className="text-xs font-bold uppercase text-slate-500 ml-1 mb-1.5 block">Order Notes (Optional)</label>
                   <input 
                     className="w-full p-4 bg-slate-50 border border-gray-200 rounded-xl font-bold text-slate-900 outline-none focus:bg-white focus:border-orange-500 focus:ring-4 ring-orange-500/10 transition"
                     placeholder="e.g. Call before arrival, leave at reception..."
                     value={formData.notes}
                     onChange={e => setFormData({...formData, notes: e.target.value})}
                   />
                </div>
             </form>
          </div>

          <div className="bg-blue-50/50 p-6 rounded-3xl border border-blue-100 flex items-start gap-4">
             <ShieldCheck className="text-blue-600 shrink-0 mt-1" size={24} />
             <div>
                <h4 className="font-bold text-slate-900">Pay on Delivery Available</h4>
                <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                   For customers in Accra, we offer payment upon delivery. Orders outside Accra may require a delivery fee deposit.
                </p>
             </div>
          </div>
        </div>

        {/* RIGHT COL: SUMMARY (Span 5) */}
        <div className="md:col-span-5 space-y-6">
           <div className="bg-white p-6 rounded-[2rem] shadow-lg shadow-slate-200/50 border border-gray-100 sticky top-8">
              <h2 className="text-xl font-black text-slate-900 mb-6 flex justify-between items-center">
                 Summary
                 <span className="text-xs bg-slate-100 px-3 py-1 rounded-full text-slate-600 font-bold">{checkoutItems.length} Items</span>
              </h2>
              
              <div className="space-y-6 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
                 {checkoutItems.map((item) => (
                    <div key={item.uniqueId} className="flex gap-4">
                       <div className="w-20 h-20 bg-gray-100 rounded-2xl relative overflow-hidden flex-shrink-0 border border-gray-200">
                          <Image 
                            src={item.variant.images?.[0] || item.product.images[0]} 
                            fill 
                            className="object-cover" 
                            alt={item.product.name} 
                          />
                       </div>
                       <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-slate-900 text-sm truncate pr-4">{item.product.name}</h4>
                          <div className="flex flex-wrap gap-1 mt-1.5">
                             <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded border border-gray-200 uppercase">
                                {item.variant.condition}
                             </span>
                             {Object.values(item.variant.specs).slice(0, 2).map((spec, i) => (
                                <span key={i} className="text-[10px] font-bold bg-gray-50 text-slate-400 px-1.5 py-0.5 rounded border border-gray-100 uppercase">
                                   {spec}
                                </span>
                             ))}
                          </div>
                          <div className="flex justify-between items-end mt-2">
                             <p className="text-xs text-slate-400 font-bold">Qty: {item.quantity}</p>
                             <p className="font-black text-slate-900">₵{(item.variant.price * item.quantity).toLocaleString()}</p>
                          </div>
                       </div>
                    </div>
                 ))}
              </div>

              <div className="border-t-2 border-dashed border-gray-100 mt-6 pt-6 space-y-3">
                 <div className="flex justify-between text-slate-500 text-sm font-medium">
                    <span>Subtotal</span>
                    <span>₵{total.toLocaleString()}</span>
                 </div>
                 <div className="flex justify-between text-slate-500 text-sm font-medium">
                    <span>Delivery Fee</span>
                    <span className="text-xs bg-orange-50 text-orange-600 px-2 py-1 rounded font-bold">Calculated on WhatsApp</span>
                 </div>
                 <div className="flex justify-between text-slate-900 font-black text-2xl pt-2">
                    <span>Total</span>
                    <span>₵{total.toLocaleString()}</span>
                 </div>
              </div>

              <button 
                onClick={handlePlaceOrder}
                disabled={loading || !formData.name || !formData.phone || !formData.address}
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
    </div>
  );
}