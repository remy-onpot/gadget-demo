"use client";

import React from 'react';
import { MessageCircle } from 'lucide-react';

interface RequestCTAProps {
  settings: Record<string, string>;
}

export const RequestCTA = ({ settings }: RequestCTAProps) => {
  // 1. Fetch values from DB settings (with generic fallbacks)
  const title = settings['home_cta_title'] || "Looking for something else?";
  const description = settings['home_cta_description'] || "Contact us for custom orders and specific requests.";
  const btnText = settings['home_cta_btn_text'] || "Contact Us";
  const whatsapp = settings['whatsapp_phone'];

  // 2. Parse Description for HTML-like formatting
  // This allows you to put "14-21 days" in bold by wrapping it in *asterisks* in the Admin text input
  // e.g. "Delivered in *14-21 days*"
  const formatText = (text: string) => {
    const parts = text.split('*');
    return parts.map((part, i) => 
      i % 2 === 1 ? <strong key={i} className="text-slate-900 font-black">{part}</strong> : part
    );
  };

  return (
    <section className="py-12 md:py-20 px-4 bg-white">
      <div className="container mx-auto max-w-7xl">
        <div className="bg-[#F8FAFC] rounded-3xl md:rounded-[2.5rem] p-6 md:p-16 border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-10 text-center md:text-left shadow-sm">
            
            <div className="max-w-2xl">
               <div className="inline-flex items-center gap-2 text-orange-600 font-bold tracking-widest text-[10px] md:text-xs uppercase mb-3">
                 <span className="w-1.5 h-1.5 rounded-full bg-orange-600 animate-pulse"/> 
                 Custom Requests
               </div>
               <h2 className="text-2xl md:text-5xl font-black text-slate-900 mb-2 md:mb-6 leading-tight">
                 {title}
               </h2>
               <p className="text-slate-500 text-sm md:text-lg leading-relaxed">
                 {formatText(description)}
               </p>
            </div>

            <div className="flex-shrink-0 w-full md:w-auto">
               {whatsapp && (
                 <a 
                   href={`https://wa.me/${whatsapp}?text=Hello, I have a custom request...`} 
                   target="_blank" 
                   className="w-full md:w-auto bg-[#0A2540] text-white px-8 py-4 rounded-xl font-bold text-sm md:text-lg hover:scale-105 transition-transform shadow-lg shadow-slate-900/10 flex items-center justify-center gap-3"
                 >
                   {btnText} <MessageCircle size={18} />
                 </a>
               )}
            </div>

        </div>
      </div>
    </section>
  );
};