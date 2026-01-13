"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Monitor, X } from 'lucide-react';

export const DesktopSuggestion = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // 1. Logic: Only show if on mobile AND hasn't been dismissed before
    const isMobile = window.innerWidth < 768;
    const hasSeenSuggestion = localStorage.getItem('seen_desktop_suggestion');

    if (isMobile && !hasSeenSuggestion) {
      // 2. Delay it by 4 seconds so they see the site first (Don't pop up instantly)
      const timer = setTimeout(() => setIsVisible(true), 4000);
      return () => clearTimeout(timer);
    }
  }, []);

  const dismiss = () => {
    setIsVisible(false);
    localStorage.setItem('seen_desktop_suggestion', 'true');
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="fixed bottom-4 left-4 right-4 z-50 flex justify-center pointer-events-none"
        >
          <div className="bg-white/90 backdrop-blur-md border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.12)] p-4 rounded-2xl flex items-center gap-4 max-w-sm w-full pointer-events-auto">
            
            {/* Animated Icon */}
            <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center shrink-0">
               <Monitor className="text-slate-600" size={20} />
            </div>

            <div className="flex-1">
               <h4 className="text-sm font-black text-slate-800 leading-tight">Experience it in 4K</h4>
               <p className="text-xs text-slate-500 mt-0.5 font-medium">
                 Our store has a cinematic mode on desktop screens. Check it out later!
               </p>
            </div>

            <button 
              onClick={dismiss}
              className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-all"
            >
              <X size={18} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};