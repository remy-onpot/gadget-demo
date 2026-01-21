"use client";

import React, { useState } from 'react';
import { ArrowRight, MessageCircle, Store, X } from 'lucide-react';

interface GetStartedButtonProps {
  className?: string;
  text?: string;
  variant?: 'primary' | 'secondary' | 'nav';
}

export const GetStartedButton = ({ className, text = "Start Selling", variant = 'primary' }: GetStartedButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [storeName, setStoreName] = useState('');

  // 🟢 The WhatsApp Destination (Replace with your number)
  const PHONE_NUMBER = "233543511863"; // e.g., 233541234567
  
  const handleWhatsAppRedirect = () => {
    const name = storeName.trim() || "My New Store";
    const message = encodeURIComponent(
      `👋 Hi NimdeShop! I want to start my online store.\n\n🛒 Store Name: *${name}*\n\nI'm ready to set up.`
    );
    window.open(`https://wa.me/${PHONE_NUMBER}?text=${message}`, '_blank');
    setIsOpen(false);
  };

  // Base Button Styles
  const baseStyles = "transition-all font-bold flex items-center justify-center gap-2";
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-500 shadow-xl shadow-blue-600/20 px-8 py-4 rounded-2xl text-lg",
    secondary: "bg-[#25D366] text-[#01030d] hover:bg-[#20bd5a] shadow-lg shadow-green-900/20 px-8 py-4 rounded-xl text-lg font-black",
    nav: "bg-white text-[#020617] hover:bg-slate-200 px-5 py-2.5 rounded-full text-sm"
  };

  return (
    <>
      {/* 1. The Trigger Button */}
      <button 
        onClick={() => setIsOpen(true)} 
        className={`${baseStyles} ${variants[variant]} ${className || ''}`}
      >
        {text} {variant !== 'nav' && <ArrowRight size={20} />}
      </button>

      {/* 2. The Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-[#020617]/80 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setIsOpen(false)}
          />

          {/* Modal Content */}
          <div className="relative w-full max-w-md bg-[#0f172a] border border-white/10 rounded-3xl p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>

            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-blue-600/20 text-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-500/20">
                <Store size={32} />
              </div>
              <h3 className="text-2xl font-black text-white mb-2">Name Your Empire</h3>
              <p className="text-slate-400 text-sm">
                What should we call your new store? Don't worry, you can change this later.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-blue-400 uppercase ml-1 mb-1.5 block">Store Name</label>
                <input 
                  autoFocus
                  type="text" 
                  placeholder="e.g. Kojo's Kicks"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  className="w-full bg-[#1e293b] border-2 border-slate-700 focus:border-blue-500 rounded-xl px-4 py-3 text-white font-bold outline-none transition-all placeholder:text-slate-600"
                  onKeyDown={(e) => e.key === 'Enter' && handleWhatsAppRedirect()}
                />
              </div>

              <button 
                onClick={handleWhatsAppRedirect}
                className="w-full bg-[#25D366] text-[#020617] py-4 rounded-xl font-black text-lg hover:bg-[#20bd5a] transition-all flex items-center justify-center gap-2 shadow-lg shadow-green-500/10 group"
              >
                <MessageCircle size={20} className="group-hover:scale-110 transition-transform" />
                Continue on WhatsApp
              </button>
              
              <p className="text-center text-xs text-slate-500 font-medium">
                You'll be chatting with a Nimde Setup Expert.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};