"use client";

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAdminData } from '@/hooks/useAdminData'; // Import the hook
import { MessageCircle, Clock, ShoppingBag, ArrowRight, Loader2 } from 'lucide-react';
import { Database } from '@/lib/database.types';

type CartRow = Database['public']['Tables']['carts']['Row'];

interface CartItem {
  quantity: number;
  product: {
    name: string;
  };
  variant: {
    price: number;
  };
}

interface ContactInfo {
  name?: string;
  phone?: string;
}

export default function AbandonedCartsPage() {
  // 1. Use the hook
  const { storeId, loading: authLoading } = useAdminData();
  
  const [carts, setCarts] = useState<CartRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 2. WAIT for the hook to find the store
    if (!storeId) return;
    
    fetchCarts();
  }, [storeId]); // 👈 Only run when storeId is ready

  const fetchCarts = async () => {
    if (!storeId) return;
    
    setLoading(true);
    const { data } = await supabase
      .from('carts')
      .select('*')
      .eq('store_id', storeId) // ✅ Use the ID from the hook
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(50);
      
    if (data) setCarts(data);
    setLoading(false);
  };

  const generateRecoveryLink = (cart: CartRow) => {
    const info = cart.contact_info as unknown as ContactInfo | null;
    const items = cart.cart_content as unknown as CartItem[] | null;

    if (!info?.phone) return '#';

    const name = info.name || "Customer";
    const firstItem = items?.[0]?.product?.name || "your items";
    const total = items?.reduce((sum, item) => sum + (item.variant.price * item.quantity), 0) || 0;
    
    const msg = `Hi ${name} 👋, I saw you were checking out the *${firstItem}* (Total: ₵${total}) but didn't finish!\n\nDo you need help with payment? I can offer you a small discount if you complete it now.\n\nReply YES to continue!`;
    
    const cleanPhone = info.phone.replace(/[^0-9]/g, '');
    const finalPhone = cleanPhone.startsWith('0') ? '233' + cleanPhone.substring(1) : cleanPhone;

    return `https://wa.me/${finalPhone}?text=${encodeURIComponent(msg)}`;
  };

  if (authLoading) return <div className="p-10 text-center text-slate-400"><Loader2 className="animate-spin inline" /> Loading...</div>;
  if (loading) return <div className="p-10 text-center text-slate-400">Loading sniper data...</div>;

  return (
    <div className="max-w-5xl mx-auto pb-20">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
          👻 Abandoned Carts 
          <span className="bg-orange-100 text-orange-600 text-sm px-3 py-1 rounded-full">{carts.length} Leads</span>
        </h1>
        <p className="text-slate-500">Recover lost sales by messaging customers who dropped off.</p>
      </div>

      <div className="grid gap-4">
        {carts.map((cart) => {
          const info = cart.contact_info as unknown as ContactInfo;
          const items = cart.cart_content as unknown as CartItem[];
          
          const total = items?.reduce((sum, item) => sum + (item.variant.price * item.quantity), 0) || 0;

          if (!info?.phone) return null; 

          return (
            <div key={cart.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group">
               <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="flex items-start gap-4">
                     <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
                        <ShoppingBag size={20} />
                     </div>
                     <div>
                        <h3 className="font-bold text-slate-900 text-lg">{info.name || 'Unknown Guest'}</h3>
                        <p className="text-slate-500 font-mono text-sm mb-2">{info.phone}</p>
                        
                        <div className="flex flex-wrap gap-2">
                           <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-orange-50 text-orange-600 px-2 py-1 rounded border border-orange-100 uppercase tracking-wide">
                              Items: {items?.length || 0}
                           </span>
                           <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-green-50 text-green-600 px-2 py-1 rounded border border-green-100 uppercase tracking-wide">
                              Value: ₵{total.toLocaleString()}
                           </span>
                           <span className="inline-flex items-center gap-1 text-[10px] font-bold text-gray-400 px-2 py-1">
                              <Clock size={10} /> {cart.created_at ? new Date(cart.created_at).toLocaleString() : 'Just now'}
                           </span>
                        </div>
                     </div>
                  </div>

                  <a 
                    href={generateRecoveryLink(cart)}
                    target="_blank"
                    className="w-full md:w-auto bg-[#25D366] hover:bg-[#1ebd5e] text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-green-200 transition-transform active:scale-95"
                  >
                    <MessageCircle size={18} /> Recover via WhatsApp <ArrowRight size={16} className="opacity-50 group-hover:translate-x-1 transition-transform"/>
                  </a>
               </div>
            </div>
          );
        })}

        {carts.length === 0 && (
           <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-gray-200">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                 <Clock size={32} />
              </div>
              <h3 className="text-lg font-bold text-gray-400">No ghosts found yet</h3>
              <p className="text-sm text-gray-300">Wait for customers to visit checkout.</p>
           </div>
        )}
      </div>
    </div>
  );
}