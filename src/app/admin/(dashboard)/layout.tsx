"use client";
import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Package, 
  Image as ImageIcon, 
  LogOut, 
  Layers, 
  Sliders, 
  Settings, 
  ShoppingBag, 
  Ghost,
  LayoutGrid,
  Menu, 
  X,
  User,
  Users,
  RefreshCw // Added for Switch Store icon
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MobileExperiencePrompt } from '@/components/ui/MobileExperiencePrompt';

interface NavItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick?: () => void; 
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-50 flex-col md:flex-row relative">
      
      {/* 1. MOBILE HEADER (Visible only on Mobile) */}
      <div className="md:hidden bg-[#0A2540] text-white p-4 flex justify-between items-center sticky top-0 z-30 shadow-md">
        <span className="text-xl font-bold tracking-tight">The<span className="text-orange-500">Admin</span></span>
        <button 
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="p-2 hover:bg-white/10 rounded-lg transition"
        >
          {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* 2. OVERLAY (Backdrop for mobile) */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* 3. SIDEBAR (Responsive) */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-[#0A2540] text-white flex flex-col h-screen shadow-xl transition-transform duration-300 ease-in-out
        md:sticky md:top-0 md:translate-x-0 
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6 flex justify-between items-center">
          <span className="text-2xl font-bold tracking-tight">The<span className="text-orange-500">Admin</span></span>
          {/* Mobile Close Button inside sidebar */}
          <button onClick={() => setIsMobileOpen(false)} className="md:hidden text-slate-400 hover:text-white">
            <X size={20} />
          </button>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 overflow-y-auto scrollbar-hide">
          <p className="text-xs font-bold text-slate-500 uppercase px-4 mt-2 mb-1">Store</p>
          <NavItem onClick={() => setIsMobileOpen(false)} href="/admin" active={pathname === '/admin'} icon={<LayoutDashboard size={20} />} label="Overview" />
          <NavItem onClick={() => setIsMobileOpen(false)} href="/admin/orders" active={pathname === '/admin/orders'} icon={<ShoppingBag size={20} />} label="Orders" />
          <NavItem onClick={() => setIsMobileOpen(false)} href="/admin/carts" active={pathname === '/admin/carts'} icon={<Ghost size={20} />} label="Abandoned Carts" />
          
          <p className="text-xs font-bold text-slate-500 uppercase px-4 mt-6 mb-1">Catalog</p>
          <NavItem onClick={() => setIsMobileOpen(false)} href="/admin/inventory" active={pathname === '/admin/inventory'} icon={<Package size={20} />} label="Inventory" />
          <NavItem onClick={() => setIsMobileOpen(false)} href="/admin/attributes" active={pathname === '/admin/attributes'} icon={<Sliders size={20} />} label="Attributes" />
          
          <p className="text-xs font-bold text-slate-500 uppercase px-4 mt-6 mb-1">Design</p>
          <NavItem onClick={() => setIsMobileOpen(false)} href="/admin/banners" active={pathname === '/admin/banners'} icon={<ImageIcon size={20} />} label="Banners" />
          <NavItem onClick={() => setIsMobileOpen(false)} href="/admin/grid" active={pathname === '/admin/grid'} icon={<LayoutGrid size={20} />} label="Home Grid" />
          <NavItem onClick={() => setIsMobileOpen(false)} href="/admin/layouts" active={pathname === '/admin/layouts'} icon={<Layers size={20} />} label="Category Layouts" />
          <NavItem onClick={() => setIsMobileOpen(false)} href="/admin/settings/theme" active={pathname === '/admin/settings/theme'} icon={<Sliders size={20} />} label="Theme" />
          <NavItem onClick={() => setIsMobileOpen(false)} href="/admin/settings" active={pathname === '/admin/settings'} icon={<Settings size={20} />} label="Site Settings" />

          {/* NEW SECTION: SYSTEM */}
          <p className="text-xs font-bold text-slate-500 uppercase px-4 mt-6 mb-1">System</p>
          <NavItem 
            onClick={() => setIsMobileOpen(false)} 
            href="/admin/account" 
            active={pathname === '/admin/account'} 
            icon={<User size={20} />} 
            label="My Account" 
          />
          <NavItem 
            onClick={() => setIsMobileOpen(false)} 
            href="/admin/team" 
            active={pathname === '/admin/team'} 
            icon={<Users size={20} />} 
            label="Team" 
          />
        </nav>

        <div className="p-4 border-t border-slate-700 space-y-2">
          <Link 
            href="/admin/select-store"
            className="flex items-center gap-3 text-gray-400 hover:text-white transition w-full p-2 rounded-lg hover:bg-white/5"
          >
            <RefreshCw size={20} /> Switch Store
          </Link>
          <button className="flex items-center gap-3 text-gray-400 hover:text-white transition w-full p-2 rounded-lg hover:bg-white/5">
            <LogOut size={20} /> Logout
          </button>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto bg-slate-50 min-h-[calc(100vh-64px)] md:min-h-screen">
        {children}
      </main>
      
      <MobileExperiencePrompt />
    </div>
  );
}

const NavItem = ({ href, icon, label, active, onClick }: NavItemProps) => (
  <Link 
    href={href} 
    onClick={onClick}
    prefetch={false}
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