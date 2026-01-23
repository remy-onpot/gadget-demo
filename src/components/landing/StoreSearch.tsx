"use client";

import { useState, useEffect, useRef } from 'react';
import { Search, Loader2, Store as StoreIcon, ArrowRight, X } from 'lucide-react';
import { searchStores, SearchResult } from '@/actions/landing-actions';
import { useDebounce } from '@/hooks/use-debounce'; 
import { cn } from '@/lib/utils'; // Ensure you have this utility

interface StoreSearchProps {
  variant?: 'hero' | 'minimal';
  className?: string;
}

export function StoreSearch({ variant = 'hero', className }: StoreSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  
  const debouncedQuery = useDebounce(query, 300);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const performSearch = async () => {
      if (debouncedQuery.length < 2) {
        setResults([]);
        return;
      }
      setLoading(true);
      const data = await searchStores(debouncedQuery);
      setResults(data);
      setLoading(false);
      setIsOpen(true);
    };

    performSearch();
  }, [debouncedQuery]);

  const handleSelect = (slug: string) => {
    const protocol = window.location.protocol;
    const rootDomain = window.location.host.replace('www.', '');
    const newUrl = `${protocol}//${slug}.${rootDomain}`;
    window.location.href = newUrl;
  };

  const isHero = variant === 'hero';

  return (
    <div ref={containerRef} className={cn("w-full relative z-50", isHero ? "max-w-xl mx-auto" : "max-w-xs", className)}>
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className={cn("text-gray-400 group-focus-within:text-orange-500 transition-colors", isHero ? "h-5 w-5" : "h-4 w-4")} />
        </div>
        <input
          type="text"
          className={cn(
            "block w-full bg-white border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all",
            isHero 
              ? "pl-11 pr-4 py-4 rounded-2xl shadow-xl shadow-slate-200/50 text-lg" 
              : "pl-9 pr-8 py-2 rounded-full text-sm shadow-sm hover:shadow-md"
          )}
          placeholder={isHero ? "Find a store (e.g. 'Sneakers', 'Bokiek')" : "Find a store..."}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
        />
        
        {/* Loading Spinner */}
        {loading && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <Loader2 className={cn("text-orange-500 animate-spin", isHero ? "h-5 w-5" : "h-3 w-3")} />
          </div>
        )}

        {/* Clear Button (Minimal Mode Only) */}
        {!loading && query && !isHero && (
           <button onClick={() => setQuery('')} className="absolute inset-y-0 right-0 pr-3 flex items-center">
             <X className="h-3 w-3 text-gray-400 hover:text-gray-600" />
           </button>
        )}
      </div>

      {/* DROPDOWN RESULTS */}
      {isOpen && results.length > 0 && (
        <div className={cn(
          "absolute w-full bg-white border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-top-2",
          isHero ? "mt-2 rounded-2xl shadow-2xl" : "mt-2 rounded-xl shadow-lg"
        )}>
          <div className="py-2">
            {!isHero && <p className="px-3 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Stores</p>}
            {results.map((store) => (
              <button
                key={store.slug}
                onClick={() => handleSelect(store.slug)}
                className={cn(
                  "w-full text-left hover:bg-orange-50 transition-colors flex items-center justify-between group",
                  isHero ? "px-4 py-3" : "px-3 py-2"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "bg-slate-100 rounded-full flex items-center justify-center text-slate-500 overflow-hidden shrink-0",
                    isHero ? "h-10 w-10" : "h-7 w-7"
                  )}>
                     {store.logo ? (
                       <img src={store.logo} alt={store.name} className="h-full w-full object-cover" />
                     ) : (
                       <StoreIcon size={isHero ? 18 : 14} />
                     )}
                  </div>
                  <div className="min-w-0">
                    <p className={cn("font-bold text-gray-900 truncate", isHero ? "text-base" : "text-sm")}>{store.name}</p>
                    {isHero && <p className="text-xs text-gray-500">@{store.slug}</p>}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}