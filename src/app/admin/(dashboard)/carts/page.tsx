"use client";

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAdminData } from '@/hooks/useAdminData';
import { MessageCircle, Clock, ShoppingBag, ArrowRight, Loader2, CheckCircle } from 'lucide-react';
import { Database } from '@/lib/database.types';

// 1. Correct Type Definition (Matches 'abandoned_checkouts' table)
type AbandonedCartRow = Database['public']['Tables']['abandoned_checkouts']['Row'];

// 2. Correct JSON Item Structure (Matches what your Sniper saves)
interface SniperItem {
  product_name: string;
  price: number;
  quantity: number;
  image?: string;
  specs?: Record<string, string>;
}

export default function AbandonedCartsPage() {
  const { storeId, loading: authLoading } = useAdminData();
  const [carts, setCarts] = useState<AbandonedCartRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!storeId) return;
    fetchCarts();
  }, [storeId]);

  const fetchCarts = async () => {
    setLoading(true);
    
    // 3. Fetch from the CORRECT table
  const fetchCarts = async () => {
    // 🛡️ FIX: TypeScript Guard Clause
    // This confirms storeId is not null before using it below
    if (!storeId) return; 

    setLoading(true);
    
    const { data } = await supabase
      .from('abandoned_checkouts')
      .select('*')
      .eq('store_id', storeId) // ✅ TypeScript is happy now
      .eq('recovered', false)
      .order('created_at', { ascending: false })
      .limit(50);
      
    if (data) setCarts(data);
    setLoading(false);
  };

  const generateRecoveryLink = (cart: AbandonedCartRow) => {
    // 4. Access Top-Level Columns directly (No contact_info JSON)
    if (!cart.phone) return '#';

    // 5. Access Cart Items from the correct JSON structure
    const items = cart.cart_items as unknown as SniperItem[] | null;
    
    const name = cart.name || "Customer";
    const firstItem = items?.[0]?.product_name || "your items"; // Flat property
    const total = cart.total_value || 0; // Use the pre-calculated total from DB
    
    const msg = `Hi ${name} 👋, I saw you were checking out the *${firstItem}* (Total: ₵${total}) but didn't finish!\n\nDo you need help with payment? I can offer you a small discount if you complete it now.\n\nReply YES to continue!`;
    
    const cleanPhone = cart.phone.replace(/[^0-9]/g, '');
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
          // Cast the JSON column
          const items = cart.cart_items as unknown as SniperItem[];
          
          return (
            <div key={cart.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group">
               <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="flex items-start gap-4">
                     <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
                        <ShoppingBag size={20} />
                     </div>
                     <div>
                        {/* 6. Use Direct Columns */}
                        <h3 className="font-bold text-slate-900 text-lg">{cart.name || 'Unknown Guest'}</h3>
                        <p className="text-slate-500 font-mono text-sm mb-2">{cart.phone}</p>
                        
                        <div className="flex flex-wrap gap-2">
                           <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-orange-50 text-orange-600 px-2 py-1 rounded border border-orange-100 uppercase tracking-wide">
                              Items: {items?.length || 0}
                           </span>
                           <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-green-50 text-green-600 px-2 py-1 rounded border border-green-100 uppercase tracking-wide">
                              Value: ₵{(cart.total_value || 0).toLocaleString()}
                           </span>
                           <span className="inline-flex items-center gap-1 text-[10px] font-bold text-gray-400 px-2 py-1">
                              <Clock size={10} /> {cart.created_at ? new Date(cart.created_at).toLocaleString() : 'Just now'}
                           </span>
                        </div>
                     </div>
                  </div>

                  {cart.phone ? (
                    <a 
                      href={generateRecoveryLink(cart)}
                      target="_blank"
                      className="w-full md:w-auto bg-[#25D366] hover:bg-[#1ebd5e] text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-green-200 transition-transform active:scale-95"
                    >
                      <MessageCircle size={18} /> Recover <ArrowRight size={16} className="opacity-50 group-hover:translate-x-1 transition-transform"/>
                    </a>
                  ) : (
                    <div className="text-xs text-red-400 bg-red-50 px-3 py-1 rounded-lg">
                       No Phone Captured
                    </div>
                  )}
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
}}