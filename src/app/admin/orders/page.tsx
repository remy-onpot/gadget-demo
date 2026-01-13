"use client";

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { ShoppingBag, Loader2, CheckCircle, Clock, Truck } from 'lucide-react';

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    // Assuming you have an 'orders' table. If not, you need to create one.
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (data) setOrders(data);
    setLoading(false);
  };

  const updateStatus = async (id: number, status: string) => {
    await supabase.from('orders').update({ status }).eq('id', id);
    fetchOrders(); // Refresh
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'completed': return <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold flex items-center gap-1 w-fit"><CheckCircle size={12}/> Completed</span>;
      case 'shipped': return <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-bold flex items-center gap-1 w-fit"><Truck size={12}/> Shipped</span>;
      default: return <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-xs font-bold flex items-center gap-1 w-fit"><Clock size={12}/> Pending</span>;
    }
  };

  if (loading) return <div className="p-10 text-center"><Loader2 className="animate-spin inline"/></div>;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
         <div>
            <h1 className="text-3xl font-black text-slate-900 flex items-center gap-2">
               <ShoppingBag className="text-orange-500" /> Orders
            </h1>
            <p className="text-slate-500">Track and manage customer orders.</p>
         </div>
         <div className="text-right">
            <span className="text-3xl font-black text-slate-900">{orders.length}</span>
            <p className="text-xs text-slate-400 uppercase font-bold">Total Orders</p>
         </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
         <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-gray-200">
               <tr>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase">Order ID</th>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase">Date</th>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase">Customer</th>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase">Total</th>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase">Status</th>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase">Actions</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
               {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition">
                     <td className="p-4 font-mono text-xs text-slate-500">#{order.id.toString().padStart(4, '0')}</td>
                     <td className="p-4 text-sm font-medium text-slate-700">
                        {new Date(order.created_at).toLocaleDateString()}
                     </td>
                     <td className="p-4">
                        <div className="text-sm font-bold text-slate-900">{order.customer_name || 'Guest'}</div>
                        <div className="text-xs text-slate-400">{order.customer_phone || order.customer_email}</div>
                     </td>
                     <td className="p-4 font-bold text-slate-900">
                        ₵{(order.total_amount || 0).toLocaleString()}
                     </td>
                     <td className="p-4">
                        {getStatusBadge(order.status)}
                     </td>
                     <td className="p-4">
                        <select 
                           value={order.status} 
                           onChange={(e) => updateStatus(order.id, e.target.value)}
                           className="bg-white border border-gray-200 text-xs font-bold rounded-lg p-2 outline-none focus:border-orange-500"
                        >
                           <option value="pending">Pending</option>
                           <option value="shipped">Shipped</option>
                           <option value="completed">Completed</option>
                           <option value="cancelled">Cancelled</option>
                        </select>
                     </td>
                  </tr>
               ))}
               {orders.length === 0 && (
                  <tr>
                     <td colSpan={6} className="p-10 text-center text-slate-400 italic">No orders found yet.</td>
                  </tr>
               )}
            </tbody>
         </table>
      </div>
    </div>
  );
}