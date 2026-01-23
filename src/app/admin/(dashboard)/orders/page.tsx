"use client";

import React, { useEffect, useState, useMemo, useTransition } from 'react';
import { supabase } from '@/lib/supabase';
import { updateOrderStatus } from '@/app/admin/(dashboard)/actions'; 
import { formatCurrency } from '@/lib/utils';
import { Database } from '@/lib/database.types';
import { 
  ShoppingBag, Loader2, CheckCircle, Clock, Truck, 
  Copy, MapPin, Search, ChevronDown, ChevronRight, 
  FileText, Calendar, Filter
} from 'lucide-react';
import { toast } from 'sonner';
import { ReceiptGenerator, ReceiptOrder } from '@/components/admin/ReceiptGenerator';

// Types
// We use the ReceiptOrder type we defined earlier to ensure compatibility
type OrderWithItems = ReceiptOrder;

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedDates, setExpandedDates] = useState<string[]>([]); 
  const [selectedReceiptOrder, setSelectedReceiptOrder] = useState<OrderWithItems | null>(null);
  const [settings, setSettings] = useState<Record<string, string>>({});
  
  const [isPending, startTransition] = useTransition();

 // 1. FETCH DATA
  useEffect(() => {
    const fetchData = async () => {
      // A. Fetch Orders
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*, items:order_items(*)')
        .order('created_at', { ascending: false });

      if (ordersError) {
        toast.error("Failed to load orders");
        console.error(ordersError);
      }

      // B. Fetch Settings
      const { data: storeData } = await supabase
        .from('stores')
        .select('settings')
        .limit(1)
        .single();

      let settingsMap: Record<string, string> = {};
      if (storeData?.settings) {
        settingsMap = storeData.settings as unknown as Record<string, string>;
      }

      if (ordersData) {
        const typedOrders = ordersData as unknown as OrderWithItems[];
        setOrders(typedOrders);

        if (typedOrders.length > 0) {
          const firstOrder = typedOrders[0];
          if (firstOrder.created_at) {
            const firstDate = new Date(firstOrder.created_at).toDateString();
            setExpandedDates([firstDate]);
          }
        }
      }

      setSettings(settingsMap);
      setLoading(false);
    };

    fetchData();

    // 2. Realtime Listener (Optimized)
    // 👇 THIS LINE was likely missing or placed inside the 'if' block by mistake
    const channel = supabase.channel('realtime-orders'); 

    if (orders.length > 0) {
       // We assume the first order belongs to the current store
       // (In a real admin, you might get store_id from the user session instead)
       const currentStoreId = orders[0].store_id; 
       
       channel
         .on(
           'postgres_changes',
           { 
             event: '*', 
             schema: 'public', 
             table: 'orders',
             filter: `store_id=eq.${currentStoreId}` // ✅ Filter by Store ID
           }, 
           () => fetchData()
         )
         .subscribe();
    }

    // Cleanup function
    return () => { supabase.removeChannel(channel); };
    
  }, [orders]);

  // 2. SEARCH & FILTER LOGIC
  const filteredOrders = useMemo(() => {
    if (!searchQuery) return orders;
    const lowerQ = searchQuery.toLowerCase();
    return orders.filter(o => 
      o.id.toLowerCase().includes(lowerQ) ||
      o.customer_name?.toLowerCase().includes(lowerQ) ||
      o.customer_phone?.includes(searchQuery)
    );
  }, [orders, searchQuery]);

  // 3. GROUP BY DATE
  const groupedOrders = useMemo(() => {
    const groups: Record<string, OrderWithItems[]> = {};
    filteredOrders.forEach(order => {
      if (!order.created_at) return;
      const dateKey = new Date(order.created_at).toDateString(); 
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(order);
    });
    return groups;
  }, [filteredOrders]);

  // Actions
  const toggleDate = (date: string) => {
    setExpandedDates(prev => 
      prev.includes(date) ? prev.filter(d => d !== date) : [...prev, date]
    );
  };

  const handleStatusChange = (id: string, newStatus: string) => {
    // Optimistic Update
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o));
    
    startTransition(async () => {
      try {
        await updateOrderStatus(id, newStatus);
        toast.success(`Order status updated to ${newStatus}`);
      } catch (e) {
        toast.error("Update failed");
      }
    });
  };

  const handleCopyRiderInfo = (order: OrderWithItems) => {
    const itemsList = order.items?.map(i => `- ${i.quantity}x ${i.product_name}`).join('\n');
    const txt = `📦 DISPATCH #${order.id.slice(0,5).toUpperCase()}\n👤 ${order.customer_name}\n📞 ${order.customer_phone}\n📍 ${order.delivery_address}\n\n🛒 ITEMS:\n${itemsList}\n\n💰 COLLECT: ${formatCurrency(order.total_amount)}`;
    navigator.clipboard.writeText(txt);
    toast.success("Rider details copied!");
  };

  if (loading) return <div className="h-[80vh] flex items-center justify-center"><Loader2 className="animate-spin text-slate-300 w-10 h-10"/></div>;

  return (
    <div className="max-w-6xl mx-auto pb-20">
      
      {/* --- HEADER & SEARCH --- */}
      <div className="sticky top-0 bg-slate-50/95 backdrop-blur-sm z-10 py-4 border-b border-gray-200 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
           <div>
              <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                 Orders <span className="bg-slate-200 text-slate-600 text-sm px-2 py-1 rounded-full">{orders.length}</span>
              </h1>
           </div>
           
           <div className="relative w-full md:w-96 group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-orange-500 transition-colors" size={18} />
              <input 
                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl font-bold text-slate-700 outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all shadow-sm"
                placeholder="Search ID, Name or Phone..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
           </div>
        </div>
      </div>

      {/* --- DATE GROUPS --- */}
      <div className="space-y-6">
        {Object.entries(groupedOrders).map(([date, dateOrders]) => {
           const isExpanded = expandedDates.includes(date);
           const totalRevenue = dateOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0);

           return (
             <div key={date} className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm transition-all">
                
                {/* Date Header (Clickable) */}
                <button 
                  onClick={() => toggleDate(date)}
                  className="w-full flex items-center justify-between p-4 bg-slate-50/50 hover:bg-slate-100 transition-colors text-left"
                >
                   <div className="flex items-center gap-3">
                      <div className={`p-1.5 rounded-lg transition-transform ${isExpanded ? 'rotate-90 bg-slate-200' : 'bg-white border border-gray-200'}`}>
                         <ChevronRight size={16} className="text-slate-500"/>
                      </div>
                      <div>
                         <h3 className="font-bold text-slate-900 flex items-center gap-2">
                            <Calendar size={16} className="text-orange-500"/> {date}
                         </h3>
                         <p className="text-xs text-slate-500 font-medium">{dateOrders.length} Orders</p>
                      </div>
                   </div>
                   <div className="text-right">
                      <span className="text-sm font-black text-slate-900">{formatCurrency(totalRevenue)}</span>
                   </div>
                </button>

                {/* Orders Table */}
                {isExpanded && (
                   <div className="overflow-x-auto border-t border-gray-100">
                      <table className="w-full text-left text-sm whitespace-nowrap">
                         <thead className="bg-gray-50 text-xs text-gray-400 font-bold uppercase tracking-wider">
                            <tr>
                               <th className="px-6 py-3">ID</th>
                               <th className="px-6 py-3">Customer</th>
                               <th className="px-6 py-3">Items</th>
                               <th className="px-6 py-3">Status</th>
                               <th className="px-6 py-3 text-right">Actions</th>
                            </tr>
                         </thead>
                         <tbody className="divide-y divide-gray-50">
                            {dateOrders.map(order => (
                               <tr key={order.id} className="hover:bg-blue-50/30 transition-colors group">
                                  
                                  {/* ID */}
                                  <td className="px-6 py-4">
                                     <span className="font-mono font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded">#{order.id.slice(0,5).toUpperCase()}</span>
                                  </td>

                                  {/* Customer */}
                                  <td className="px-6 py-4">
                                     <p className="font-bold text-slate-900">{order.customer_name}</p>
                                     <p className="text-xs text-slate-400 font-mono">{order.customer_phone}</p>
                                     <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-1 max-w-[150px] truncate">
                                        <MapPin size={10} /> {order.delivery_address}
                                     </div>
                                  </td>

                                  {/* Items Summary */}
                                  <td className="px-6 py-4">
                                     <div className="flex flex-col gap-1">
                                        {order.items.slice(0, 2).map((item, i) => (
                                           <span key={i} className="text-xs font-medium text-slate-600">
                                              {item.quantity}x {item.product_name}
                                           </span>
                                        ))}
                                        {order.items.length > 2 && <span className="text-[10px] text-gray-400">+{order.items.length - 2} more...</span>}
                                     </div>
                                  </td>

                                  {/* Status Dropdown */}
                                  <td className="px-6 py-4">
                                     <div className="relative w-fit">
                                        <select 
                                           value={order.status || 'pending'}
                                           onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                           className={`appearance-none pl-8 pr-8 py-1.5 rounded-full text-xs font-bold outline-none cursor-pointer transition-all border ${
                                              order.status === 'completed' ? 'bg-green-50 text-green-700 border-green-200' :
                                              order.status === 'shipped' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                              order.status === 'cancelled' ? 'bg-red-50 text-red-700 border-red-200' :
                                              'bg-yellow-50 text-yellow-700 border-yellow-200'
                                           }`}
                                        >
                                           <option value="pending">Pending</option>
                                           <option value="shipped">Dispatched</option>
                                           <option value="completed">Delivered</option>
                                           <option value="cancelled">Cancelled</option>
                                        </select>
                                        <div className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                                           {order.status === 'completed' ? <CheckCircle size={12} className="text-green-600"/> :
                                            order.status === 'shipped' ? <Truck size={12} className="text-blue-600"/> :
                                            <Clock size={12} className="text-yellow-600"/>}
                                        </div>
                                        <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 opacity-50 pointer-events-none"/>
                                     </div>
                                  </td>

                                  {/* Action Buttons */}
                                  <td className="px-6 py-4 text-right">
                                     <div className="flex justify-end gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button 
                                           onClick={() => handleCopyRiderInfo(order)}
                                           className="p-2 bg-white border border-gray-200 text-slate-500 rounded-lg hover:text-orange-600 hover:border-orange-200 transition-colors"
                                           title="Copy Rider Info"
                                        >
                                           <Copy size={16} />
                                        </button>
                                        <button 
                                           onClick={() => setSelectedReceiptOrder(order)}
                                           className="p-2 bg-blue-50 border border-blue-100 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                                           title="Generate Receipt"
                                        >
                                           <FileText size={16} />
                                        </button>
                                     </div>
                                  </td>
                               </tr>
                            ))}
                         </tbody>
                      </table>
                   </div>
                )}
             </div>
           );
        })}

        {Object.keys(groupedOrders).length === 0 && (
           <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
              <Filter className="w-12 h-12 text-gray-300 mx-auto mb-4"/>
              <h3 className="text-lg font-bold text-gray-500">No orders found</h3>
              <p className="text-gray-400">Try changing your search terms.</p>
           </div>
        )}
      </div>

      {/* --- RECEIPT MODAL --- */}
      {selectedReceiptOrder && (
         <ReceiptGenerator 
            order={selectedReceiptOrder} 
            settings={settings} 
            onClose={() => setSelectedReceiptOrder(null)} 
         />
      )}
      
      

    </div>
  );
}