"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingCart, Menu, X, ArrowRight } from 'lucide-react'; 
import { useStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { HeaderSearch } from './HeaderSearch'; 

interface HeaderProps {
  settings: Record<string, string>;
  categories: string[];
}

export const Header = ({ settings, categories }: HeaderProps) => {
  const { cart } = useStore();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // ✅ LOGO LOGIC
  const siteName = settings['site_name'] || "My Store";
  const logoUrl = settings['site_logo']; // Expecting a URL from Supabase Storage

  return (
    <header 
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out border-b",
        isScrolled 
          ? "bg-white/70 backdrop-blur-xl border-white/20 shadow-sm supports-[backdrop-filter]:bg-white/60 py-3" 
          : "bg-white/95 backdrop-blur-sm border-transparent py-4 md:py-5"
      )}
    >
      <div className="container mx-auto px-4 flex items-center justify-between gap-4">
        
        {/* BRANDING */}
        <Link href="/" className="flex items-center gap-2 z-50 select-none group">
           {logoUrl ? (
             <img 
               src={logoUrl} 
               alt={siteName} 
               className="h-8 md:h-10 w-auto object-contain group-hover:opacity-90 transition-opacity" 
             />
           ) : (
             <span className="font-black text-2xl md:text-3xl tracking-tighter text-slate-900 group-hover:text-slate-700 transition-colors">
               {siteName}
             </span>
           )}
        </Link>

        {/* DESKTOP SEARCH */}
        <div className="hidden md:block flex-1 mx-8 max-w-2xl">
           <HeaderSearch whatsappNumber={settings['whatsapp_phone']} /> 
        </div>

        {/* ACTIONS */}
        <div className="flex items-center gap-3 z-50">
           <Link href="/cart" className="relative p-2.5 bg-gray-100/80 rounded-full hover:bg-orange-50 text-slate-700 hover:text-[#F7931E] transition-colors group backdrop-blur-md">
              <ShoppingCart size={20} className="group-hover:scale-110 transition-transform" />
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 border-2 border-white rounded-full text-[10px] font-bold text-white flex items-center justify-center animate-in zoom-in">
                  {cart.length}
                </span>
              )}
           </Link>
           
           <button className="md:hidden p-2 text-slate-700" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
             {mobileMenuOpen ? <X /> : <Menu />}
           </button>
        </div>
      </div>
      
      {/* MOBILE MENU */}
      {mobileMenuOpen && (
        <div className="absolute top-full left-0 w-full h-screen bg-white/95 backdrop-blur-xl border-t border-gray-100 p-6 flex flex-col gap-6 md:hidden shadow-xl animate-in fade-in duration-200">
           <div className="w-full">
              <HeaderSearch isMobile={true} onClose={() => setMobileMenuOpen(false)} whatsappNumber={settings['whatsapp_phone']} />
           </div>

           <nav className="flex flex-col gap-2 font-bold text-slate-700">
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Categories</span>
              {categories.map((cat) => (
                <Link 
                    key={cat} 
                    href={`/category/${cat}`} 
                    className="p-4 bg-gray-50/50 rounded-2xl flex justify-between items-center group active:scale-95 transition-all capitalize" 
                    onClick={() => setMobileMenuOpen(false)}
                >
                  {cat} <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-orange-400" />
                </Link>
              ))}
           </nav>
        </div>
      )}
    </header>
  );
};