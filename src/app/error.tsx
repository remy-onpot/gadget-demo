"use client";

import React, { useEffect } from 'react';
import { AlertTriangle, RefreshCw, MessageCircle } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        
        <div className="w-20 h-20 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-6 rotate-3">
           <AlertTriangle size={32} className="text-red-500" />
        </div>

        <h2 className="text-3xl font-black text-slate-900 mb-2">System Glitch</h2>
        
        <p className="text-slate-500 mb-8 font-medium">
          Something went wrong on our end. We've been notified and are fixing it.
        </p>

        <div className="space-y-4">
           <button
            onClick={() => reset()}
            className="w-full bg-slate-900 text-white py-3.5 rounded-xl font-bold hover:bg-slate-800 transition flex items-center justify-center gap-2"
          >
            <RefreshCw size={18} /> Try Again
          </button>

          <a
            href="https://wa.me/233555178584" // Replace with your WhatsApp
            target="_blank" 
            rel="noreferrer"
            className="w-full bg-green-50 text-green-700 py-3.5 rounded-xl font-bold hover:bg-green-100 transition flex items-center justify-center gap-2"
          >
            <MessageCircle size={18} /> Contact Support
          </a>
        </div>
        
        {error.digest && (
          <p className="mt-8 text-xs font-mono text-slate-300">
            Error ID: {error.digest}
          </p>
        )}
      </div>
    </div>
  );
}