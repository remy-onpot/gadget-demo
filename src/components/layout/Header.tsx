"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingCart, Menu, X, ArrowRight, Search } from 'lucide-react'; 
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

  const siteName = settings['site_name'] || "My Store";
  const logoUrl = settings['site_logo']; 

  return (
    <header 
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out border-b",
        isScrolled 
          ? "border-black/5 shadow-sm py-3 backdrop-blur-md" 
          : "border-transparent py-4 md:py-5 backdrop-blur-sm"
      )}
      style={{ 
          // Dynamic Background with slight transparency using CSS color-mix if supported, 
          // or falling back to the theme card color
          backgroundColor: isScrolled ? 'var(--card-bg)' : 'transparent',
          color: 'var(--text-main)'
      }}
    >
      {/* If transparent at top, we might need a gradient overlay or ensure text is readable. 
          For safety in a "No-Code" tool, we usually force a background or ensure contrast. 
          Let's enforce card-bg background on scroll, and transparent at top assuming hero image? 
          Actually, safer to always have background for readability unless configured otherwise.
      */}
      <div 
        className="absolute inset-0 -z-10 opacity-95" 
        style={{ backgroundColor: 'var(--card-bg)' }} 
      />

      <div className="container mx-auto px-4 flex items-center justify-between gap-4">
        
        {/* BRANDING */}
        <Link href="/" className="flex items-center gap-2 z-50 select-none group">
           {logoUrl ? (
             // eslint-disable-next-line @next/next/no-img-element
             <img 
               src={logoUrl} 
               alt={siteName} 
               className="h-8 md:h-10 w-auto object-contain group-hover:opacity-90 transition-opacity" 
             />
           ) : (
             <span className="font-black text-2xl md:text-3xl tracking-tighter transition-colors">
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
           <Link 
             href="/cart" 
             className="relative p-2.5 rounded-full transition-colors group"
             style={{ 
                 backgroundColor: 'var(--page-bg)', // Slight contrast from header
                 color: 'var(--text-main)'
             }}
           >
             <ShoppingCart size={20} className="group-hover:scale-110 transition-transform" />
             {cart.length > 0 && (
               <span 
                 className="absolute -top-1 -right-1 w-5 h-5 border-2 border-white rounded-full text-[10px] font-bold text-white flex items-center justify-center animate-in zoom-in"
                 style={{ backgroundColor: 'var(--primary)' }}
               >
                 {cart.length}
               </span>
             )}
           </Link>
           
           <button 
             className="md:hidden p-2" 
             onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
             style={{ color: 'var(--text-main)' }}
           >
             {mobileMenuOpen ? <X /> : <Menu />}
           </button>
        </div>
      </div>
      
      {/* MOBILE MENU */}
      {mobileMenuOpen && (
        <div 
            className="absolute top-full left-0 w-full h-screen border-t border-black/5 p-6 flex flex-col gap-6 md:hidden shadow-xl animate-in fade-in duration-200"
            style={{ backgroundColor: 'var(--card-bg)', color: 'var(--text-main)' }}
        >
           <div className="w-full">
              <HeaderSearch isMobile={true} onClose={() => setMobileMenuOpen(false)} whatsappNumber={settings['whatsapp_phone']} />
           </div>

           <nav className="flex flex-col gap-2 font-bold">
              <span className="text-xs font-black opacity-50 uppercase tracking-widest mb-2">Categories</span>
              {categories.map((cat) => (
                <Link 
                   key={cat} 
                   href={`/category/${cat}`} 
                   className="p-4 rounded-2xl flex justify-between items-center group active:scale-95 transition-all capitalize border border-transparent hover:border-black/5" 
                   style={{ backgroundColor: 'var(--page-bg)' }}
                   onClick={() => setMobileMenuOpen(false)}
                >
                  {cat} 
                  <ArrowRight className="w-4 h-4 opacity-30 group-hover:opacity-100 transition-opacity" style={{ color: 'var(--primary)' }} />
                </Link>
              ))}
           </nav>
        </div>
      )}
    </header>
  );
};