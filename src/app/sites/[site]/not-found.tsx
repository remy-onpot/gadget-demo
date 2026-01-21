import React from 'react';
import Link from 'next/link';
import { Store, ArrowRight, Home, Search, AlertTriangle } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-lg w-full text-center">
        
        {/* 1. Animated Icon & Status Badge */}
        <div className="relative w-24 h-24 mx-auto mb-8 group">
           <div className="absolute inset-0 bg-slate-200 rounded-full animate-ping opacity-20 duration-1000" />
           <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-xl shadow-slate-200 border border-slate-100 relative z-10">
              <Store size={40} className="text-slate-300 group-hover:text-slate-900 transition-colors duration-500" />
           </div>
           <div className="absolute -bottom-2 -right-2 bg-slate-900 text-white text-xs font-bold px-3 py-1 rounded-full border-4 border-slate-50 flex items-center gap-1">
              <AlertTriangle size={10} className="text-orange-400" /> 404
           </div>
        </div>

        {/* 2. Headline */}
        <h1 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">
          Page Not Found
        </h1>
        
        <p className="text-slate-500 mb-10 font-medium leading-relaxed max-w-sm mx-auto">
          The page you are looking for might have been removed, had its name changed, or the store is temporarily unavailable.
        </p>

        {/* 3. Smart Action Grid */}
        <div className="grid sm:grid-cols-2 gap-3 w-full">
          
          {/* Primary: Back to Store Home */}
          <Link 
            href="/" 
            className="col-span-2 sm:col-span-1 bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10 flex items-center justify-center gap-2 group"
          >
            <Home size={18} className="group-hover:-translate-y-0.5 transition-transform" /> 
            Store Home
          </Link>
          
          {/* Secondary: Search (Keeps them in the funnel) */}
          <Link 
            href="/search" 
            className="col-span-2 sm:col-span-1 bg-white text-slate-700 border border-slate-200 py-4 rounded-xl font-bold hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center justify-center gap-2"
          >
            <Search size={18} /> 
            Search Items
          </Link>

          {/* Tertiary: Safety Hatch to Platform (If store is dead) */}
          <Link 
            href="https://nimdeshop.com"
            className="col-span-2 mt-4 text-xs font-bold text-slate-400 hover:text-slate-600 uppercase tracking-widest flex items-center justify-center gap-1 transition-colors"
          >
            Powered by Nimde <ArrowRight size={12} />
          </Link>
        </div>

      </div>
    </div>
  );
}