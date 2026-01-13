"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, Loader2, ArrowRight, MessageCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Product } from '@/lib/types';
import Link from 'next/link';

export const HeaderSearch = ({ isMobile = false, onClose }: { isMobile?: boolean, onClose?: () => void }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // DEBOUNCED SEARCH LOGIC
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (query.trim().length < 2) {
        setResults([]);
        setShowDropdown(false);
        return;
      }

      setIsLoading(true);
      setShowDropdown(true);

      const { data } = await supabase
        .from('products')
        .select('*, images:base_images, variants:product_variants(price)')
        .eq('is_active', true)
        .or(`name.ilike.%${query}%,category.ilike.%${query}%,brand.ilike.%${query}%`)
        .limit(5); // Only show top 5 suggestions

      if (data) {
        // Normalize data
        const cleanData = data.map((p: any) => ({
           ...p,
           price: p.variants?.[0]?.price || p.base_price || 0,
           images: p.images || []
        }));
        setResults(cleanData);
      }
      setIsLoading(false);
    }, 300); // Wait 300ms after typing stops

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  // Handle "Enter" key
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
      setShowDropdown(false);
      if (onClose) onClose();
    }
  };

  return (
    <div className={`relative group ${isMobile ? 'w-full' : 'flex-1 max-w-md mx-auto'}`} ref={dropdownRef}>
       
       {/* INPUT FIELD */}
       <form onSubmit={handleSubmit} className="relative z-50">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#F7931E] transition-colors" />
          <input 
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => query.length >= 2 && setShowDropdown(true)}
            placeholder={isMobile ? "Search products..." : "Search laptops, consoles..."}
            className="w-full bg-gray-100/80 border-transparent border focus:bg-white focus:border-orange-200 rounded-full py-2.5 pl-10 pr-10 outline-none transition-all text-sm font-bold text-slate-900 placeholder:text-gray-500 placeholder:font-normal" 
          />
          
          {/* Spinner or Clear Button */}
          {isLoading ? (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-orange-500 animate-spin" />
          ) : query.length > 0 && (
            <button 
              type="button" 
              onClick={() => { setQuery(''); setResults([]); setShowDropdown(false); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500"
            >
              <X size={16} />
            </button>
          )}
       </form>

       {/* PREDICTIVE DROPDOWN */}
       {showDropdown && query.length >= 2 && (
         <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-[60] animate-in fade-in zoom-in-95 duration-200">
            
            {/* 1. HAS RESULTS */}
            {results.length > 0 ? (
               <div className="py-2">
                 <div className="px-4 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Suggested</div>
                 {results.map((product) => (
                    <Link 
                      key={product.id} 
                      href={`/product/${product.slug}`} 
                      onClick={() => { setShowDropdown(false); if(onClose) onClose(); }}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors group/item"
                    >
                       <div className="w-10 h-10 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden border border-gray-100">
                          {product.images?.[0] ? (
                            <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300"><Search size={14}/></div>
                          )}
                       </div>
                       <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-bold text-slate-700 truncate group-hover/item:text-orange-600 transition-colors">
                            {product.name}
                          </h4>
                          <p className="text-xs text-gray-400">GHS {product.price?.toLocaleString()}</p>
                       </div>
                       <ArrowRight size={14} className="text-gray-300 -translate-x-2 opacity-0 group-hover/item:opacity-100 group-hover/item:translate-x-0 transition-all" />
                    </Link>
                 ))}
                 <button 
                    onClick={handleSubmit} 
                    className="w-full text-center py-3 text-xs font-bold text-orange-600 bg-orange-50 hover:bg-orange-100 transition-colors"
                 >
                    See all results for "{query}"
                 </button>
               </div>
            ) : (
               
               /* 2. NO RESULTS - THE "GLOBAL SHIPPING" CTA */
               !isLoading && (
                 <div className="p-5 text-center">
                    <div className="inline-flex items-center gap-2 text-orange-600 font-bold tracking-widest text-[10px] uppercase mb-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-orange-600 animate-pulse"/> Global Shipping
                    </div>
                    <h4 className="text-lg font-black text-slate-900 mb-1">Can't find it?</h4>
                    <p className="text-xs text-slate-500 leading-relaxed mb-4 px-2">
                       We import specific requests directly from the USA & UK. 
                       <span className="block font-medium text-slate-700 mt-1">Delivered in 14-21 days.</span>
                    </p>
                    <a 
                      href={`https://wa.me/233540000000?text=Hi, I am looking for "${query}" but I can't find it on the site.`} 
                      target="_blank" 
                      className="block w-full bg-[#0A2540] text-white py-3 rounded-xl font-bold text-sm hover:scale-[1.02] transition-transform flex items-center justify-center gap-2"
                    >
                       Start Request <MessageCircle size={16} />
                    </a>
                 </div>
               )
            )}
         </div>
       )}
    </div>
  );
};