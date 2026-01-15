"use client";

import React, { useEffect, useState, useTransition } from 'react'; // Added useTransition
import { supabase } from '@/lib/supabase';
import { updateOrderStatus } from '@/app/admin/actions'; // Import the Server Action
import { formatCurrency } from '@/lib/utils';
import { Order } from '@/lib/types';
import { 
  ShoppingBag, 
  Loader2, 
  CheckCircle, 
  Clock, 
  Truck, 
  Copy, 
  Check, 
  MapPin,
  AlertCircle 
} from 'lucide-react';
import { toast } from 'sonner'; // Optional: If you have a toast library, else use alert/console

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  // New Hook for Server Actions
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    fetchOrders();
    
    // REAL-TIME BONUS: Listen for new orders instantly!
    const channel = supabase
      .channel('realtime-orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, (payload) => {
        // Simple strategy: Just refetch when anything changes
        fetchOrders();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const fetchOrders = async () => {
    const { data } = await supabase
      .from('orders')
      .select('*, items:order_items(*)')
      .order('created_at', { ascending: false });
      
    if (data) setOrders(data as Order[]);
    setLoading(false);
  };

  // --- NEW: SERVER ACTION HANDLER ---
  const handleStatusChange = (id: string, newStatus: string) => {
    // 1. Optimistic Update (Immediate UI change)
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus as any } : o));

    // 2. Server Action (The real work)
    startTransition(async () => {
      try {
        await updateOrderStatus(id, newStatus);
        // Toast success if you have one
      } catch (error) {
        // Revert on failure
        console.error("Update failed", error);
        alert("Failed to update status. Check your connection.");
        fetchOrders(); // Re-sync with server
      }
    });
  };

  // ... (handleCopyReceipt logic remains the same) ...
  const handleCopyReceipt = (order: Order) => {
     // ... paste your existing function here ...
     const itemsList = order.items?.map(i => 
      `- ${i.quantity}x ${i.product_name} ${i.variant_name ? `(${i.variant_name})` : ''}`
    ).join('\n') || 'No items listed';

    const receipt = `📦 *DISPATCH ORDER* #${order.id.slice(0, 5).toUpperCase()}
👤 *Customer:* ${order.customer_name}
📞 *Phone:* ${order.customer_phone}
📍 *Loc:* ${order.delivery_address}
${order.delivery_notes ? `📝 *Note:* ${order.delivery_notes}` : ''}

🛒 *Items:*
${itemsList}

💰 *Collect:* ${formatCurrency(order.total_amount)}`.trim();

    navigator.clipboard.writeText(receipt);
    setCopiedId(order.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getStatusBadge = (status: string) => {
    // ... (same as before) ...
    switch(status) {
      case 'completed': return <span className="bg-green-100 text-green-700 px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-fit"><CheckCircle size={12}/> Done</span>;
      case 'shipped': return <span className="bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-fit"><Truck size={12}/> Rider</span>;
      case 'cancelled': return <span className="bg-red-100 text-red-700 px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-fit">Cancelled</span>;
      default: return <span className="bg-yellow-100 text-yellow-700 px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-fit"><Clock size={12}/> New</span>;
    }
  };

  if (loading) return <div className="min-h-[60vh] flex items-center justify-center"><Loader2 className="animate-spin text-slate-300 w-8 h-8"/></div>;

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8">
      {/* HEADER */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
         <div>
            <h1 className="text-3xl font-black text-slate-900 flex items-center gap-2">
               <ShoppingBag className="text-orange-600" /> Dispatch Center
               {isPending && <Loader2 className="animate-spin text-slate-300 ml-2" size={20}/>}
            </h1>
            <p className="text-slate-500 font-medium mt-1">Manage orders and dispatch riders.</p>
         </div>
         {/* ... Stats box ... */}
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
         <div className="overflow-x-auto">
            <table className="w-full text-left whitespace-nowrap">
                {/* ... Thead ... */}
                <thead className="bg-slate-50 border-b border-gray-200">
                  <tr>
                    <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-wider">Order</th>
                    <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-wider">Details</th>
                    <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-wider">Amount</th>
                    <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-wider">Status</th>
                    <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50/80 transition-colors group">
                        {/* ID */}
                        <td className="p-4 align-top">
                            <div className="font-mono text-xs font-bold text-slate-500 mb-1">#{order.id.slice(0, 8)}</div>
                            <div className="text-xs text-slate-400 font-medium">
                                {new Date(order.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'})}
                            </div>
                        </td>
                        
                        {/* Customer */}
                        <td className="p-4 align-top">
                            <div className="font-bold text-slate-900 mb-0.5">{order.customer_name}</div>
                            <div className="flex items-center gap-1 text-xs text-slate-500 mb-1">
                                <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 font-mono">{order.customer_phone}</span>
                            </div>
                            <div className="flex items-start gap-1 text-xs text-slate-400 max-w-[200px] truncate">
                                <MapPin size={12} className="mt-0.5 shrink-0"/> {order.delivery_address}
                            </div>
                        </td>

                        {/* Amount */}
                        <td className="p-4 align-top font-black text-slate-900">
                            {formatCurrency(order.total_amount)}
                            <div className="text-[10px] font-medium text-slate-400 uppercase mt-1">{order.items?.length || 0} Items</div>
                        </td>

                        {/* Status (WIRED UP) */}
                        <td className="p-4 align-top">
                            <div className="flex flex-col gap-2">
                                {getStatusBadge(order.status)}
                                <select 
                                    value={order.status} 
                                    disabled={isPending}
                                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                    className="bg-white border border-gray-200 text-[10px] font-bold rounded-lg p-1.5 outline-none focus:border-orange-500 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity disabled:cursor-not-allowed"
                                >
                                    <option value="pending">Pending</option>
                                    <option value="shipped">On Route</option>
                                    <option value="completed">Delivered</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                            </div>
                        </td>

                        {/* Actions */}
                        <td className="p-4 align-top text-right">
                            <button 
                                onClick={() => handleCopyReceipt(order)}
                                className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                                    copiedId === order.id 
                                    ? 'bg-green-50 border-green-200 text-green-700' 
                                    : 'bg-white border-gray-200 text-slate-600 hover:border-orange-200 hover:text-orange-600 hover:shadow-sm'
                                }`}
                            >
                                {copiedId === order.id ? <Check size={14}/> : <Copy size={14}/>}
                                {copiedId === order.id ? 'Copied!' : 'Rider Info'}
                            </button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
         </div>
      </div>
    </div>
  );
}