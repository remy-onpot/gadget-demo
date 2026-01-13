"use client";
import React from 'react';
import { LayoutDashboard, Package, Image as ImageIcon, Users, LogOut, Layers, Sliders, Settings, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MobileExperiencePrompt } from '@/components/ui/MobileExperiencePrompt';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0A2540] text-white hidden md:flex flex-col sticky top-0 h-screen shadow-xl z-20">
        <div className="p-6">
          <span className="text-2xl font-bold tracking-tight">Payless<span className="text-orange-500">Admin</span></span>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 overflow-y-auto scrollbar-hide">
          <p className="text-xs font-bold text-slate-500 uppercase px-4 mt-2 mb-1">Store</p>
          <NavItem href="/admin" active={pathname === '/admin'} icon={<LayoutDashboard size={20} />} label="Overview" />
          <NavItem href="/admin/orders" active={pathname === '/admin/orders'} icon={<ShoppingBag size={20} />} label="Orders" />
          
          <p className="text-xs font-bold text-slate-500 uppercase px-4 mt-6 mb-1">Catalog</p>
          <NavItem href="/admin/inventory" active={pathname === '/admin/inventory'} icon={<Package size={20} />} label="Inventory" />
          <NavItem href="/admin/attributes" active={pathname === '/admin/attributes'} icon={<Sliders size={20} />} label="Attributes" />
          
          <p className="text-xs font-bold text-slate-500 uppercase px-4 mt-6 mb-1">Design</p>
          <NavItem href="/admin/banners" active={pathname === '/admin/banners'} icon={<ImageIcon size={20} />} label="Banners" />
          <NavItem href="/admin/layouts" active={pathname === '/admin/layouts'} icon={<Layers size={20} />} label="Category Layouts" />
          <NavItem href="/admin/settings" active={pathname === '/admin/settings'} icon={<Settings size={20} />} label="Site Settings" />
        </nav>

        <div className="p-4 border-t border-slate-700">
          <button className="flex items-center gap-3 text-gray-400 hover:text-white transition w-full p-2 rounded-lg hover:bg-white/5">
            <LogOut size={20} /> Logout
          </button>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 p-8 overflow-y-auto h-screen bg-slate-50">
        {children}
      </main>
      
      <MobileExperiencePrompt />
    </div>
  );
}

const NavItem = ({ href, icon, label, active }: any) => (
  <Link 
    href={href} 
    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition font-medium text-sm ${
      active 
      ? 'bg-orange-500 text-white shadow-lg shadow-orange-900/20' 
      : 'text-slate-400 hover:bg-slate-800 hover:text-white'
    }`}
  >
    {icon}
    <span>{label}</span>
  </Link>
);