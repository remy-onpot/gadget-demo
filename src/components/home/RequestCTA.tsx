"use client";

import React from 'react';
import { MessageCircle, ArrowRight, Mail } from 'lucide-react';
import Link from 'next/link';

interface RequestCTAProps {
  settings: Record<string, string>;
}

export const RequestCTA = ({ settings }: RequestCTAProps) => {
  // 1. Fetch values from DB settings
  const title = settings['home_cta_title'] || "Can't find what you need?";
  const description = settings['home_cta_description'] || "We specialize in sourcing specific tech. Tell us what you want, and we'll get it to you in *14-21 days*.";
  const btnText = settings['home_cta_btn_text'] || "Request Custom Order";
  const whatsapp = settings['whatsapp_phone'];

  // 2. Text Formatter (Bolds text between *asterisks*)
  const formatText = (text: string) => {
    const parts = text.split('*');
    return parts.map((part, i) => 
      i % 2 === 1 ? <strong key={i} className="text-slate-900 font-black decoration-orange-500/30 underline decoration-2 underline-offset-2">{part}</strong> : part
    );
  };

  return (
    <section className="py-12 md:py-24 px-4 bg-white border-t border-slate-100">
      <div className="container mx-auto max-w-7xl">
        <div className="relative overflow-hidden bg-slate-50 rounded-3xl md:rounded-[3rem] p-8 md:p-20 border border-slate-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-10 shadow-xl shadow-slate-100/50">
            
            {/* BACKGROUND PATTERN */}
            <div className="absolute inset-0 opacity-[0.4] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
            <div className="absolute -right-20 -top-20 w-96 h-96 bg-orange-100 rounded-full blur-[100px] opacity-50 pointer-events-none" />
            
            <div className="relative z-10 max-w-2xl">
               <div className="inline-flex items-center gap-2 text-orange-600 font-bold tracking-widest text-[10px] md:text-xs uppercase mb-4 bg-orange-50 px-3 py-1 rounded-full border border-orange-100">
                 <span className="w-1.5 h-1.5 rounded-full bg-orange-600 animate-pulse"/> 
                 Custom Requests
               </div>
               
               <h2 className="text-3xl md:text-5xl lg:text-6xl font-black text-slate-900 mb-6 leading-[1.1] tracking-tight">
                 {title}
               </h2>
               
               <p className="text-slate-500 text-base md:text-xl leading-relaxed max-w-lg">
                 {formatText(description)}
               </p>
            </div>

            <div className="relative z-10 w-full md:w-auto">
               {whatsapp ? (
                 <a 
                   href={`https://wa.me/${whatsapp}?text=Hello, I have a custom request...`} 
                   target="_blank" 
                   rel="noopener noreferrer"
                   className="group w-full md:w-auto bg-[#0A2540] text-white px-8 py-5 rounded-2xl font-bold text-lg hover:bg-slate-900 hover:scale-105 transition-all shadow-xl shadow-slate-900/10 flex items-center justify-center gap-3"
                 >
                   <MessageCircle className="group-hover:rotate-12 transition-transform" size={20} />
                   <span>{btnText}</span>
                 </a>
               ) : (
                 <Link 
                    href="/contact"
                    className="group w-full md:w-auto bg-white text-slate-900 border border-slate-200 px-8 py-5 rounded-2xl font-bold text-lg hover:border-slate-300 hover:bg-slate-50 transition-all flex items-center justify-center gap-3"
                 >
                    <Mail size={20} />
                    <span>Contact Support</span>
                    <ArrowRight size={18} className="text-slate-400 group-hover:text-slate-900 group-hover:translate-x-1 transition-all"/>
                 </Link>
               )}
               
               {/* Trust Note */}
               <p className="text-center md:text-right text-xs font-bold text-slate-400 mt-4 uppercase tracking-wide">
                 Typically replies in 1 hour
               </p>
            </div>

        </div>
      </div>
    </section>
  );
};