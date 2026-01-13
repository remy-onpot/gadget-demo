"use client";

import React, { useState, useEffect } from 'react';
import { Monitor, X, Smartphone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const MobileExperiencePrompt = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // 1. Check if screen is mobile (< 768px)
    const checkScreen = () => {
      const isMobile = window.innerWidth < 768;
      // 2. Check if user already dismissed it this session
      const hasDismissed = sessionStorage.getItem('dismiss_desktop_prompt');
      
      if (isMobile && !hasDismissed) {
        setShow(true);
      }
    };

    checkScreen();
    // Optional: Re-check on resize (e.g. rotating phone)
    window.addEventListener('resize', checkScreen);
    return () => window.removeEventListener('resize', checkScreen);
  }, []);

  const handleDismiss = () => {
    setShow(false);
    sessionStorage.setItem('dismiss_desktop_prompt', 'true');
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-4 left-4 right-4 z-[9999] pointer-events-none flex justify-center"
        >
          <div className="bg-slate-900/95 backdrop-blur-md text-white p-4 rounded-2xl shadow-2xl border border-white/10 max-w-sm pointer-events-auto flex items-start gap-4">
            
            {/* Icon Graphic */}
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-lg">
              <Monitor size={24} className="text-white" />
            </div>

            <div className="flex-1">
              <h3 className="font-bold text-sm mb-1">Switch to Desktop?</h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-3">
                This Admin Panel is packed with data tools. For the best experience, try "Desktop Mode" in your browser settings or use a laptop.
              </p>
              
              <div className="flex gap-2">
                <button 
                  onClick={handleDismiss}
                  className="bg-white text-slate-900 px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-slate-200 transition-colors"
                >
                  Got it
                </button>
                {/* Optional: Instructions button could go here */}
              </div>
            </div>

            <button 
              onClick={handleDismiss} 
              className="text-slate-400 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};