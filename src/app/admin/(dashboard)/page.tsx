// src/app/admin/(dashboard)/page.tsx
import React from 'react';
import { getDashboardStats } from './actions';
import { 
  DollarSign, 
  ShoppingBag, 
  TrendingUp, 
  AlertTriangle, 
  ArrowRight, 
  Clock 
} from 'lucide-react';
import Link from 'next/link';
import { formatCurrency } from '@/lib/utils';

export default async function AdminOverviewPage() {
  // Fetch data on the server
  const stats = await getDashboardStats();

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Dashboard Overview</h1>
        <p className="text-slate-500 mt-1">Here is what's happening with your store today.</p>
      </div>

      {/* KPI GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Metric 1: Revenue */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between h-32">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Revenue</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">{formatCurrency(stats.totalRevenue)}</h3>
            </div>
            <div className="p-2 bg-green-50 text-green-600 rounded-lg">
              <DollarSign size={20} />
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs text-green-600 font-medium">
            <TrendingUp size={14} />
            <span>Lifetime Sales</span>
          </div>
        </div>

        {/* Metric 2: Orders */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between h-32">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Orders</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">{stats.totalOrders}</h3>
            </div>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <ShoppingBag size={20} />
            </div>
          </div>
          <div className="text-xs text-slate-400">All time volume</div>
        </div>

        {/* Metric 3: AOV */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between h-32">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Avg. Order Value</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">{formatCurrency(stats.avgOrderValue)}</h3>
            </div>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
              <TrendingUp size={20} />
            </div>
          </div>
          <div className="text-xs text-slate-400">Per customer average</div>
        </div>

        {/* Metric 4: Low Stock (Actionable!) */}
        <div className="bg-white p-6 rounded-2xl border border-red-50 shadow-sm flex flex-col justify-between h-32 relative overflow-hidden">
          <div className="flex justify-between items-start z-10 relative">
            <div>
              <p className="text-xs font-bold text-red-600 uppercase tracking-wider">Low Stock Alerts</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">{stats.lowStockCount}</h3>
            </div>
            <div className="p-2 bg-red-100 text-red-600 rounded-lg">
              <AlertTriangle size={20} />
            </div>
          </div>
          {stats.lowStockCount > 0 && (
             <Link href="/admin/inventory" className="text-xs font-bold text-red-600 hover:underline z-10 relative flex items-center gap-1">
               Restock Now <ArrowRight size={12}/>
             </Link>
          )}
          {/* Decorative BG */}
          <div className="absolute -right-4 -bottom-4 text-red-50/50">
             <AlertTriangle size={100} />
          </div>
        </div>
      </div>

      {/* RECENT ACTIVITY SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Recent Orders Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-50 flex justify-between items-center">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <Clock size={18} className="text-slate-400" /> Recent Orders
            </h3>
            <Link href="/admin/orders" className="text-sm font-medium text-orange-600 hover:text-orange-700">
              View All
            </Link>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase text-xs">
                <tr>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {stats.recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-8 text-center text-slate-400">
                      No orders yet.
                    </td>
                  </tr>
                ) : (
                  stats.recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50/50 transition">
                      <td className="px-6 py-4 font-medium text-slate-900">
                        {order.customer_name}
                        <div className="text-xs text-slate-400 font-normal">
                          {new Date(order.created_at).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold capitalize
                          ${order.status === 'completed' ? 'bg-green-100 text-green-700' : 
                            order.status === 'pending' ? 'bg-amber-100 text-amber-700' : 
                            'bg-slate-100 text-slate-600'
                          }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-mono font-medium text-slate-700">
                        {formatCurrency(order.total_amount)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions / Tips */}
        <div className="space-y-6">
           {/* Setup Guide Card (Optional) */}
           <div className="bg-[#0A2540] text-white p-6 rounded-2xl shadow-xl">
              <h3 className="font-bold text-lg mb-2">Next Steps</h3>
              <ul className="space-y-3 text-sm text-slate-300">
                 <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                    <span>Customize your banners</span>
                 </li>
                 <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                    <span>Configure payment settings</span>
                 </li>
                 <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                    <span>Review attribute options</span>
                 </li>
              </ul>
              <Link href="/admin/settings" className="mt-6 block w-full bg-orange-500 text-white text-center py-2.5 rounded-xl text-sm font-bold hover:bg-orange-600 transition">
                 Go to Settings
              </Link>
           </div>
        </div>

      </div>
    </div>
  );
}