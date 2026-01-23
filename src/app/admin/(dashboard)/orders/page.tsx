"use client";

import React, { useEffect, useState, useMemo, useTransition } from 'react';
import { supabase } from '@/lib/supabase';
import { useAdminData } from '@/hooks/useAdminData'; // Import the hook
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
type OrderWithItems = ReceiptOrder;

export default function AdminOrdersPage() {
  // 1. Use the hook
  const { storeId, loading: authLoading } = useAdminData();
  
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedDates, setExpandedDates] = useState<string[]>([]); 
  const [selectedReceiptOrder, setSelectedReceiptOrder] = useState<OrderWithItems | null>(null);
  const [settings, setSettings] = useState<Record<string, string>>({});
  
  const [isPending, startTransition] = useTransition();

  // 2. FETCH DATA - Wait for storeId
  useEffect(() => {
    if (!storeId) return;

    const fetchData = async () => {
      setLoading(true);
      
      // A. Fetch Orders
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*, items:order_items(*)')
        .eq('store_id', storeId) // ✅ Use the ID from the hook
        .order('created_at', { ascending: false });

      if (ordersError) {
        toast.error("Failed to load orders");
        console.error(ordersError);
      }

      // B. Fetch Settings
      const { data: storeData } = await supabase
        .from('stores')
        .select('settings')
        .eq('id', storeId)
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

    // 3. Realtime Listener using storeId
    const channel = supabase.channel('realtime-orders')
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'orders',
          filter: `store_id=eq.${storeId}` // ✅ Filter by Store ID
        }, 
        () => fetchData()
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
    
  }, [storeId]); // 👈 Only run when storeId is ready

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

  if (authLoading) return <div className="h-[80vh] flex items-center justify-center"><Loader2 className="animate-spin text-slate-300 w-10 h-10"/></div>;
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
                      </div>
                   </div>
                   <div className="text-sm text-slate-500">
                     {dateOrders.length} orders · {formatCurrency(totalRevenue)}
                   </div>
                </button>
                
                {isExpanded && (
                  <div className="divide-y divide-gray-100">
                    {dateOrders.map((order) => (
                      <div key={order.id} className="p-4">
                        {/* Order details */}
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-bold">{order.customer_name}</div>
                            <div className="text-sm text-slate-500">{order.customer_phone}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-mono font-bold">{formatCurrency(order.total_amount)}</div>
                            <select 
                              value={order.status || 'pending'}
                              onChange={(e) => handleStatusChange(order.id, e.target.value)}
                              className="text-xs mt-1 border rounded px-2 py-1"
                            >
                              <option value="pending">Pending</option>
                              <option value="processing">Processing</option>
                              <option value="completed">Completed</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
             </div>
           );
        })}
      </div>
    </div>
  );
}