"use client";

import React from 'react';
import { Truck, ShieldCheck, Star, GraduationCap, Zap, Heart, Gift, Globe, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import { Database } from '@/lib/database.types';

// 1. TYPE DEFINITIONS
type BlockRow = Database['public']['Tables']['content_blocks']['Row'];

// Typed Meta Information (matches what GridEditor saves)
interface BlockMeta {
  badge?: string;
  author?: string;
  role?: string;
}

// Extended Block Type for usage in this component
interface ContentBlock extends Omit<BlockRow, 'meta_info'> {
  meta_info: BlockMeta; 
  // Explicitly list these to ensure TS finds them even if DB types are slightly stale
  block_key: string;
  description: string | null;
  icon_key: string | null;
}

// 2. ICON MAP (Strictly Typed)
const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Truck, ShieldCheck, Star, GraduationCap, Zap, Heart, Gift, Globe
};

interface SocialGridProps {
  settings: Record<string, string>;
  blocks: BlockRow[]; // Accept raw DB rows
}

export const SocialGrid = ({ settings, blocks = [] }: SocialGridProps) => {
  const whatsapp = settings['whatsapp_phone'];

  // Helper: Find block and safely cast JSON
  const getBlock = (key: string): Partial<ContentBlock> => {
    const block = blocks.find(b => b.block_key === key);
    if (!block) return {};
    
    // Safe cast: DB JSON -> Interface
    return {
      ...block,
      meta_info: (block.meta_info as unknown as BlockMeta) || {}
    } as ContentBlock;
  };

  const tileMain = getBlock('tile_main');
  const tileDelivery = getBlock('tile_delivery');
  const tileWarranty = getBlock('tile_warranty');
  const testimonial = getBlock('testimonial');

  // Helper to render dynamic icon
  const renderIcon = (key: string | null | undefined, className: string) => {
     const k = key || 'Star';
     const IconComp = ICON_MAP[k] || Star;
     return <IconComp className={className} />;
  };

  return (
    <section className="py-12 md:py-24 px-4 md:px-6 bg-[#0A2540] text-white overflow-hidden relative">
      <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>

      <div className="container mx-auto max-w-7xl relative z-10">
        
        <div className="mb-10 md:mb-20 text-center max-w-3xl mx-auto">
           <h2 className="text-2xl md:text-5xl font-black mb-4 leading-tight">
             {settings['home_grid_headline'] || "More Than Just a Tech Store."}
           </h2>
           <p className="text-blue-200 text-sm md:text-xl mb-6 leading-relaxed font-medium px-4">
             {settings['home_grid_subheadline'] || "We started this company with a simple mission: to make premium technology accessible to everyone."}
           </p>
           <Link href="/about" className="text-sm md:text-base inline-block border-b-2 border-orange-500 pb-1 font-bold text-orange-500 hover:text-white transition-colors">
             Read Our Full Story
           </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6 md:auto-rows-[280px]">
           
           {/* TILE 1: MAIN FEATURE (Dynamic) */}
           <div className="col-span-2 relative rounded-3xl md:rounded-[2.5rem] bg-white/5 border border-white/10 p-6 md:p-10 overflow-hidden">
              <div className="relative z-10 max-w-md">
                 {tileMain.meta_info?.badge && (
                    <div className="inline-flex items-center gap-2 bg-orange-500/20 text-orange-400 border border-orange-500/30 rounded-full px-3 py-1 font-bold text-[10px] uppercase tracking-wider mb-3">
                       {renderIcon(tileMain.icon_key, "w-3 h-3")} {tileMain.meta_info.badge}
                    </div>
                 )}
                 <h3 className="text-xl md:text-3xl font-black text-white mb-2">{tileMain.title || 'Student Discounts'}</h3>
                 <p className="text-blue-100/80 text-sm md:text-base leading-relaxed">
                   {tileMain.description}
                 </p>
              </div>
           </div>

           {/* TILE 2: DELIVERY */}
           <div className="col-span-1 relative rounded-2xl md:rounded-[2.5rem] bg-white text-slate-900 p-4 md:p-8 flex flex-col justify-between shadow-lg min-h-[160px]">
              <div>
                 <div className="w-8 h-8 md:w-12 md:h-12 bg-green-100 rounded-xl flex items-center justify-center text-green-600 mb-3 md:mb-6">
                    {renderIcon(tileDelivery.icon_key, "w-4 h-4 md:w-6 md:h-6")}
                 </div>
                 <h3 className="text-sm md:text-2xl font-black mb-1 leading-tight">{tileDelivery.title || 'Fast Delivery'}</h3>
                 <p className="hidden md:block text-slate-500 text-sm font-medium">{tileDelivery.description}</p>
              </div>
              <div className="flex gap-1"><div className="h-1 w-6 bg-green-500 rounded-full"/><div className="h-1 w-3 bg-gray-200 rounded-full"/></div>
           </div>

           {/* TILE 3: WARRANTY */}
           <div className="col-span-1 relative rounded-2xl md:rounded-[2.5rem] bg-orange-500 text-white p-4 md:p-8 flex flex-col justify-center items-center text-center shadow-lg min-h-[160px]">
              {renderIcon(tileWarranty.icon_key, "text-white mb-2 md:mb-4 opacity-90 w-8 h-8 md:w-12 md:h-12")}
              <h3 className="text-sm md:text-xl font-black mb-1 leading-tight">{tileWarranty.title || 'Warranty'}</h3>
              <p className="hidden md:block text-white/80 text-sm font-medium">{tileWarranty.description}</p>
           </div>

           {/* TILE 4: TESTIMONIAL */}
           <div className="col-span-2 relative rounded-3xl md:rounded-[2.5rem] bg-white/5 border border-white/10 p-6 md:p-10 flex flex-col justify-center">
              <div className="flex text-yellow-400 gap-0.5 mb-3">
                 {[...Array(5)].map((_,i) => <Star key={i} fill="currentColor" size={16} />)}
              </div>
              <blockquote className="text-lg md:text-2xl font-bold text-white leading-snug mb-6">
                 "{testimonial.title || 'Great Service!'}"
              </blockquote>
              <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                 <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500" />
                     <div>
                        <div className="font-bold text-white text-sm">{testimonial.meta_info?.author || 'Customer'}</div>
                        <div className="text-[10px] md:text-xs font-bold text-blue-300 uppercase">{testimonial.meta_info?.role || 'Verified Buyer'}</div>
                     </div>
                 </div>
                 {whatsapp && (
                    <a href={`https://wa.me/${whatsapp}`} target="_blank" className="w-full md:w-auto inline-flex items-center justify-center gap-2 bg-[#25D366] text-white px-5 py-3 rounded-xl font-bold text-sm shadow-lg">
                        <MessageCircle size={18} /> Chat & Verify
                    </a>
                 )}
              </div>
           </div>

        </div>
      </div>
    </section>
  );
};