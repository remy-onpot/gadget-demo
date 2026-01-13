import React from 'react';
import Link from 'next/link';
import { Search, Home, ArrowRight } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        
        {/* Animated Icon */}
        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-slate-200 relative">
          <div className="absolute inset-0 rounded-full border-2 border-dashed border-slate-200 animate-[spin_10s_linear_infinite]" />
          <Search size={40} className="text-slate-300" />
          <div className="absolute bottom-0 right-0 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full">
            404
          </div>
        </div>

        <h1 className="text-4xl font-black text-slate-900 mb-3 tracking-tight">
          Lost in the Matrix?
        </h1>
        
        <p className="text-slate-500 mb-8 font-medium leading-relaxed">
          We couldn't find the page you're looking for. It might have been sold, moved, or never existed.
        </p>

        <div className="space-y-3">
          <Link 
            href="/" 
            className="block w-full bg-[#0A2540] text-white py-4 rounded-xl font-bold hover:scale-[1.02] transition-transform shadow-lg shadow-slate-900/20 flex items-center justify-center gap-2"
          >
            <Home size={18} /> Back to Homepage
          </Link>
          
          <Link 
            href="/search" 
            className="block w-full bg-white text-slate-700 border border-slate-200 py-4 rounded-xl font-bold hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
          >
            Search Products <ArrowRight size={18} />
          </Link>
        </div>

      </div>
    </div>
  );
}