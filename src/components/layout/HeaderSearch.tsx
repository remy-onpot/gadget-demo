"use client";

import React, { useState, useEffect, useRef, KeyboardEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, Loader2, ArrowRight, MessageCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Product } from '@/lib/types';
import Link from 'next/link';
import { Database } from '@/lib/database.types';

// 1. DEFINE RAW DB RESULT SHAPE
// This matches exactly what the supabase .select() returns
interface RawSearchResult {
  id: string;
  name: string;
  slug: string;
  base_price: number | null;
  base_images: string[] | null;
  variants: { price: number }[]; // Joined data
}

interface HeaderSearchProps {
  isMobile?: boolean;
  onClose?: () => void;
  whatsappNumber?: string;
}

export const HeaderSearch = ({ isMobile = false, onClose, whatsappNumber }: HeaderSearchProps) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  
  // UX: Keyboard Navigation Index (-1 means nothing selected)
  const [selectedIndex, setSelectedIndex] = useState(-1);

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
      setSelectedIndex(-1); 

      // OPTIMIZATION: Select specific fields only for speed
      const { data } = await supabase
        .from('products')
        .select('id, name, slug, base_price, base_images, variants:product_variants(price)')
        .eq('is_active', true)
        .or(`name.ilike.%${query}%,category.ilike.%${query}%,brand.ilike.%${query}%`)
        .limit(5);

      if (data) {
        // ✅ FIX: Strict Type Casting
        const rawData = data as unknown as RawSearchResult[];
        
        const cleanData: Product[] = rawData.map((p) => {
           // Calculate price safely
           const variantPrice = p.variants?.[0]?.price;
           const finalPrice = variantPrice ?? p.base_price ?? 0;

           return {
             id: p.id,
             name: p.name,
             slug: p.slug,
             price: finalPrice,
             images: p.base_images || [], // Map DB 'base_images' to App 'images'
             
             // Provide defaults for fields we didn't fetch to satisfy Product type
             brand: '',
             category: '',
             description: undefined,
             originalPrice: undefined,
             specs: {},
             variants: [],
             isActive: true,
             isFeatured: false
           };
        });
        
        setResults(cleanData);
      }
      setIsLoading(false);
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  // HANDLE KEYBOARD NAVIGATION (Arrow Keys)
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!showDropdown || results.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < results.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0) {
        // Go to selected product
        const product = results[selectedIndex];
        router.push(`/product/${product.slug}`);
        setShowDropdown(false);
        if (onClose) onClose();
      } else {
        // Regular Search Submit
        handleSubmit(e);
      }
    }
  };

  // Handle "Enter" key (Form Submit)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
      setShowDropdown(false);
      if (onClose) onClose();
    }
  };

  // Use the prop or fallback to a default (safe fallback)
  const safeWhatsapp = whatsappNumber || '233540000000';

  return (
    <div className={`relative group ${isMobile ? 'w-full' : 'flex-1 max-w-md mx-auto'}`} ref={dropdownRef}>
       
       {/* INPUT FIELD */}
       <form onSubmit={handleSubmit} className="relative z-50">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#F7931E] transition-colors" />
          <input 
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown} 
            onFocus={() => query.length >= 2 && setShowDropdown(true)}
            placeholder={isMobile ? "Search products..." : "Search laptops, consoles..."}
            className="w-full bg-gray-100/80 border-transparent border focus:bg-white focus:border-orange-200 rounded-full py-2.5 pl-10 pr-10 outline-none transition-all text-sm font-bold text-slate-900 placeholder:text-gray-500 placeholder:font-normal" 
          />
          
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
                 {results.map((product, idx) => (
                   <Link 
                     key={product.id} 
                     href={`/product/${product.slug}`} 
                     onClick={() => { setShowDropdown(false); if(onClose) onClose(); }}
                     // Added conditional bg color for keyboard selection
                     className={`flex items-center gap-3 px-4 py-3 transition-colors group/item ${idx === selectedIndex ? 'bg-orange-50' : 'hover:bg-gray-50'}`}
                   >
                      <div className="w-10 h-10 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden border border-gray-100">
                         {product.images?.[0] ? (
                           // eslint-disable-next-line @next/next/no-img-element
                           <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                         ) : (
                           <div className="w-full h-full flex items-center justify-center text-gray-300"><Search size={14}/></div>
                         )}
                      </div>
                      <div className="flex-1 min-w-0">
                         <h4 className={`text-sm font-bold truncate transition-colors ${idx === selectedIndex ? 'text-orange-700' : 'text-slate-700 group-hover/item:text-orange-600'}`}>
                           {product.name}
                         </h4>
                         <p className="text-xs text-gray-400">GHS {product.price?.toLocaleString()}</p>
                      </div>
                      <ArrowRight size={14} className={`text-gray-300 transition-all ${idx === selectedIndex ? 'opacity-100 translate-x-0 text-orange-400' : '-translate-x-2 opacity-0 group-hover/item:opacity-100 group-hover/item:translate-x-0'}`} />
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
               
               /* 2. NO RESULTS - CTA */
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
                      href={`https://wa.me/${safeWhatsapp}?text=Hi, I am looking for "${query}" but I can't find it on the site.`} 
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