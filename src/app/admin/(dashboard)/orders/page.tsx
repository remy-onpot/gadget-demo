"use client";

import React, { useEffect, useState, useMemo, useTransition } from 'react';
import { supabase } from '@/lib/supabase';
import { useAdminData } from '@/hooks/useAdminData';
import { updateOrderStatus } from '@/app/admin/(dashboard)/actions'; 
import { formatCurrency } from '@/lib/utils';
import { 
  Loader2, Copy, Search, ChevronDown, ChevronRight, 
  Calendar, Package, MapPin, Phone, User
} from 'lucide-react';
import { toast } from 'sonner';

// 🎯 LIGHTWEIGHT ORDER TYPE (List View)
type LightweightOrder = {
  id: string;
  customer_name: string | null;
  customer_phone: string | null;
  total_amount: number;
  status: string;
  created_at: string;
  // Lazy-loaded fields:
  items?: Array<{
    id: string;
    product_name: string;
    quantity: number;
    price: number;
  }>;
  delivery_address?: string;
};

type DateRange = 'today' | '7days' | '30days' | 'all';

export default function AdminOrdersPage() {
  const { storeId, loading: authLoading } = useAdminData();
  
  // State
  const [orders, setOrders] = useState<LightweightOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState<DateRange>('7days');
  const [hasMore, setHasMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [expandedDates, setExpandedDates] = useState<string[]>([]);
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());
  const [loadingDetails, setLoadingDetails] = useState<Set<string>>(new Set());
  
  const [isPending, startTransition] = useTransition();

  const PAGE_SIZE = 20;

  // Calculate date range bounds
  const getDateBounds = (range: DateRange) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch(range) {
      case 'today':
        return { start: today.toISOString(), end: null };
      case '7days':
        const week = new Date(today);
        week.setDate(week.getDate() - 7);
        return { start: week.toISOString(), end: null };
      case '30days':
        const month = new Date(today);
        month.setDate(month.getDate() - 30);
        return { start: month.toISOString(), end: null };
      case 'all':
        return { start: null, end: null };
    }
  };

  // 🚀 LIGHTWEIGHT INITIAL FETCH
  const fetchOrders = async (page = 0, append = false) => {
    if (!storeId) return;
    
    if (append) setLoadingMore(true);
    else setLoading(true);

    try {
      const { start, end } = getDateBounds(dateRange);
      const from = page * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      // ⚡ ONLY FETCH LIGHTWEIGHT FIELDS
      let query = supabase
        .from('orders')
        .select('id, customer_name, customer_phone, total_amount, status, created_at', { count: 'exact' })
        .eq('store_id', storeId)
        .order('created_at', { ascending: false })
        .range(from, to);

      if (start) {
        query = query.gte('created_at', start);
      }

      const { data, error, count } = await query;

      if (error) {
        toast.error("Failed to load orders");
        console.error(error);
        return;
      }

      const newOrders = (data || []) as LightweightOrder[];
      
      if (append) {
        setOrders(prev => [...prev, ...newOrders]);
      } else {
        setOrders(newOrders);
        // Auto-expand first date
        if (newOrders.length > 0 && newOrders[0].created_at) {
          const firstDate = new Date(newOrders[0].created_at).toDateString();
          setExpandedDates([firstDate]);
        }
      }

      // Check if more pages exist
      setHasMore((count || 0) > (page + 1) * PAGE_SIZE);
      setCurrentPage(page);

    } catch (e) {
      console.error(e);
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // 🎯 ON-DEMAND DETAIL FETCHING
  const fetchOrderDetails = async (orderId: string) => {
    if (expandedOrders.has(orderId)) {
      // Already loaded, just toggle
      setExpandedOrders(prev => {
        const next = new Set(prev);
        next.delete(orderId);
        return next;
      });
      return;
    }

    // Mark as loading
    setLoadingDetails(prev => new Set(prev).add(orderId));

    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          delivery_address,
          items:order_items(id, product_name, quantity, price)
        `)
        .eq('id', orderId)
        .single();

      if (error) throw error;

      // Merge details into the order
      if (data) {
        setOrders(prev => prev.map(o => 
          o.id === orderId 
            ? { ...o, delivery_address: data.delivery_address, items: (data.items as any) || [] }
            : o
        ));
      }

      // Mark as expanded
      setExpandedOrders(prev => new Set(prev).add(orderId));

    } catch (e) {
      console.error('Failed to load order details:', e);
      toast.error("Failed to load order details");
    } finally {
      setLoadingDetails(prev => {
        const next = new Set(prev);
        next.delete(orderId);
        return next;
      });
    }
  };

  // Initial load
  useEffect(() => {
    if (!storeId) return;
    setCurrentPage(0);
    fetchOrders(0, false);
  }, [storeId, dateRange]);

  // 🔔 REALTIME (Lightweight updates only)
  useEffect(() => {
    if (!storeId) return;

    const channel = supabase.channel('realtime-orders')
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'orders',
          filter: `store_id=eq.${storeId}`
        }, 
        (payload) => {
          if (payload.eventType === 'INSERT') {
            // Prepend new order if it matches current date range
            const newOrder = payload.new as LightweightOrder;
            setOrders(prev => [newOrder, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            // Update lightweight fields only
            setOrders(prev => prev.map(o => 
              o.id === payload.new.id 
                ? { ...o, status: payload.new.status, total_amount: payload.new.total_amount }
                : o
            ));
          } else if (payload.eventType === 'DELETE') {
            setOrders(prev => prev.filter(o => o.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [storeId]);

  // Search & filter
  const filteredOrders = useMemo(() => {
    if (!searchQuery) return orders;
    const lowerQ = searchQuery.toLowerCase();
    return orders.filter(o => 
      o.id.toLowerCase().includes(lowerQ) ||
      o.customer_name?.toLowerCase().includes(lowerQ) ||
      o.customer_phone?.includes(searchQuery)
    );
  }, [orders, searchQuery]);

  // Group by date
  const groupedOrders = useMemo(() => {
    const groups: Record<string, LightweightOrder[]> = {};
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
        toast.success(`Order updated to ${newStatus}`);
      } catch (e) {
        toast.error("Update failed");
      }
    });
  };

  const handleCopyRiderInfo = (order: LightweightOrder) => {
    if (!order.items || !order.delivery_address) {
      toast.error("Load order details first");
      return;
    }
    
    const itemsList = order.items.map(i => `- ${i.quantity}x ${i.product_name}`).join('\n');
    const txt = `📦 ORDER #${order.id.slice(0,5).toUpperCase()}\n👤 ${order.customer_name}\n📞 ${order.customer_phone}\n📍 ${order.delivery_address}\n\n🛒 ITEMS:\n${itemsList}\n\n💰 COLLECT: ${formatCurrency(order.total_amount)}`;
    navigator.clipboard.writeText(txt);
    toast.success("Copied to clipboard!");
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'completed': return 'bg-green-100 text-green-700 border-green-200';
      case 'processing': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'cancelled': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-orange-100 text-orange-700 border-orange-200';
    }
  };

  if (authLoading) return <div className="h-[80vh] flex items-center justify-center"><Loader2 className="animate-spin text-slate-300 w-10 h-10"/></div>;

  return (
    <div className="max-w-6xl mx-auto pb-20">
      
      {/* HEADER WITH DATE TABS */}
      <div className="sticky top-0 bg-slate-50/95 backdrop-blur-sm z-10 py-4 border-b border-gray-200 mb-6">
        <div className="flex flex-col gap-4">
          {/* Title & Search */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                Orders <span className="bg-slate-200 text-slate-600 text-sm px-2 py-1 rounded-full">{orders.length}</span>
              </h1>
            </div>
            
            <div className="relative w-full md:w-96 group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={18} />
              <input 
                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl font-bold text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all shadow-sm"
                placeholder="Search ID, Name or Phone..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* 📅 DATE RANGE TABS */}
          <div className="flex gap-2 overflow-x-auto">
            {[
              { key: 'today' as DateRange, label: 'Today' },
              { key: '7days' as DateRange, label: 'Last 7 Days' },
              { key: '30days' as DateRange, label: 'Last 30 Days' },
              { key: 'all' as DateRange, label: 'All Time' }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setDateRange(tab.key)}
                className={`px-4 py-2 rounded-xl font-bold text-sm whitespace-nowrap transition-all ${
                  dateRange === tab.key
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-gray-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* LOADING STATE */}
      {loading && (
        <div className="h-[60vh] flex items-center justify-center">
          <Loader2 className="animate-spin text-blue-600 w-10 h-10"/>
        </div>
      )}

      {/* DATE GROUPS */}
      {!loading && (
        <div className="space-y-6">
          {Object.entries(groupedOrders).map(([date, dateOrders]) => {
            const isExpanded = expandedDates.includes(date);
            const totalRevenue = dateOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0);

            return (
              <div key={date} className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                
                {/* Date Header */}
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
                        <Calendar size={16} className="text-blue-500"/> {date}
                      </h3>
                    </div>
                  </div>
                  <div className="text-sm text-slate-500">
                    {dateOrders.length} orders · {formatCurrency(totalRevenue)}
                  </div>
                </button>
                
                {/* Orders List */}
                {isExpanded && (
                  <div className="divide-y divide-gray-100">
                    {dateOrders.map((order) => {
                      const isDetailExpanded = expandedOrders.has(order.id);
                      const isDetailLoading = loadingDetails.has(order.id);

                      return (
                        <div key={order.id} className="hover:bg-slate-50/50 transition-colors">
                          {/* Order Summary Row */}
                          <button
                            onClick={() => fetchOrderDetails(order.id)}
                            className="w-full p-4 text-left"
                          >
                            <div className="flex justify-between items-start gap-4">
                              {/* Left: Customer Info */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <User size={14} className="text-slate-400 flex-shrink-0"/>
                                  <div className="font-bold text-slate-900 truncate">{order.customer_name || 'Guest'}</div>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-slate-500">
                                  <Phone size={12} className="flex-shrink-0"/>
                                  <span>{order.customer_phone}</span>
                                </div>
                                <div className="text-xs text-slate-400 mt-1">
                                  ID: {order.id.slice(0, 8)}...
                                </div>
                              </div>

                              {/* Right: Amount & Status */}
                              <div className="text-right flex-shrink-0">
                                <div className="font-mono font-bold text-slate-900 mb-2">
                                  {formatCurrency(order.total_amount)}
                                </div>
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold border ${getStatusColor(order.status)}`}>
                                  {order.status}
                                </span>
                              </div>
                            </div>
                          </button>

                          {/* Expanded Details */}
                          {isDetailLoading && (
                            <div className="px-4 pb-4 flex items-center justify-center text-slate-400">
                              <Loader2 size={16} className="animate-spin mr-2"/>
                              Loading details...
                            </div>
                          )}

                          {isDetailExpanded && !isDetailLoading && order.items && (
                            <div className="px-4 pb-4 space-y-3 bg-slate-50/30 border-t border-gray-100">
                              {/* Delivery Info */}
                              {order.delivery_address && (
                                <div className="flex items-start gap-2 text-sm">
                                  <MapPin size={14} className="text-slate-400 mt-0.5 flex-shrink-0"/>
                                  <span className="text-slate-600">{order.delivery_address}</span>
                                </div>
                              )}

                              {/* Items */}
                              <div className="space-y-1">
                                <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase">
                                  <Package size={12}/>
                                  Items ({order.items.length})
                                </div>
                                {order.items.map(item => (
                                  <div key={item.id} className="flex justify-between text-sm bg-white p-2 rounded-lg">
                                    <span className="text-slate-700">{item.quantity}x {item.product_name}</span>
                                    <span className="font-mono text-slate-900">{formatCurrency(item.price * item.quantity)}</span>
                                  </div>
                                ))}
                              </div>

                              {/* Actions */}
                              <div className="flex gap-2 pt-2">
                                <select 
                                  value={order.status}
                                  onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                  onClick={(e) => e.stopPropagation()}
                                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm font-bold focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                  <option value="pending">Pending</option>
                                  <option value="processing">Processing</option>
                                  <option value="completed">Completed</option>
                                  <option value="cancelled">Cancelled</option>
                                </select>
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleCopyRiderInfo(order); }}
                                  className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-bold hover:bg-slate-800 transition flex items-center gap-2"
                                >
                                  <Copy size={14}/>
                                  Copy
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}

          {/* LOAD MORE BUTTON */}
          {hasMore && !loading && (
            <div className="flex justify-center pt-4">
              <button
                onClick={() => fetchOrders(currentPage + 1, true)}
                disabled={loadingMore}
                className="px-6 py-3 bg-white border-2 border-gray-200 text-slate-700 rounded-xl font-bold hover:border-blue-500 hover:text-blue-600 transition disabled:opacity-50 flex items-center gap-2"
              >
                {loadingMore ? (
                  <>
                    <Loader2 size={16} className="animate-spin"/>
                    Loading...
                  </>
                ) : (
                  <>
                    <ChevronDown size={16}/>
                    Load More Orders
                  </>
                )}
              </button>
            </div>
          )}

          {/* EMPTY STATE */}
          {!loading && orders.length === 0 && (
            <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package size={32} className="text-slate-400"/>
              </div>
              <h3 className="font-bold text-slate-900 mb-2">No orders found</h3>
              <p className="text-slate-500 text-sm">
                {dateRange === 'today' ? 'No orders today yet' : 'Try selecting a different date range'}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}