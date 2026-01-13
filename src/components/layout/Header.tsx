"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingCart, Menu, X } from 'lucide-react'; // Search removed (handled by component)
import { useStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { HeaderSearch } from './HeaderSearch'; // <--- Import the new component

export const Header = () => {
  const { cart } = useStore();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header 
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b",
        isScrolled 
          ? "bg-white/90 backdrop-blur-md border-gray-200 py-3" 
          : "bg-white border-transparent py-5"
      )}
    >
      <div className="container mx-auto px-4 flex items-center justify-between gap-4">
        
        {/* LOGO */}
        <Link href="/" className="flex items-center gap-0.5 z-50 select-none group">
           <span className="font-black text-2xl md:text-3xl tracking-tighter text-[#00AEEF] group-hover:opacity-80 transition-opacity">
             Payless
           </span>
           <span className="bg-[#F7931E] text-white px-1.5 py-0.5 font-black text-2xl md:text-3xl tracking-tighter leading-none -mb-1 group-hover:scale-105 transition-transform">
             4tech
           </span>
        </Link>

        {/* DESKTOP SMART SEARCH */}
        <div className="hidden md:block flex-1 mx-4">
           <HeaderSearch /> 
        </div>

        {/* ACTIONS */}
        <div className="flex items-center gap-3 z-50">
           <Link href="/cart" className="relative p-2.5 bg-gray-100 rounded-full hover:bg-orange-50 text-slate-700 hover:text-[#F7931E] transition-colors group">
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
        <div className="absolute top-full left-0 w-full bg-white border-b border-gray-100 p-4 flex flex-col gap-4 md:hidden shadow-xl animate-in slide-in-from-top-5">
           
           {/* MOBILE SMART SEARCH */}
           <HeaderSearch isMobile={true} onClose={() => setMobileMenuOpen(false)} />

           <nav className="flex flex-col gap-1 font-bold text-slate-600 mt-2">
              <Link href="/category/laptop" className="p-3 hover:bg-gray-50 rounded-lg flex justify-between items-center group" onClick={() => setMobileMenuOpen(false)}>
                Laptops <ArrowRightIcon className="w-4 h-4 text-gray-300 group-hover:text-orange-400" />
              </Link>
              <Link href="/category/phone" className="p-3 hover:bg-gray-50 rounded-lg flex justify-between items-center group" onClick={() => setMobileMenuOpen(false)}>
                Phones <ArrowRightIcon className="w-4 h-4 text-gray-300 group-hover:text-orange-400" />
              </Link>
              <Link href="/category/gaming" className="p-3 hover:bg-gray-50 rounded-lg flex justify-between items-center group" onClick={() => setMobileMenuOpen(false)}>
                Gaming <ArrowRightIcon className="w-4 h-4 text-gray-300 group-hover:text-orange-400" />
              </Link>
           </nav>
        </div>
      )}
    </header>
  );
};

// Helper Icon
const ArrowRightIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
);