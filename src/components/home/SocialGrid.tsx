"use client";

import React, { useState, useEffect } from 'react';
import { 
  Truck, ShieldCheck, Star, GraduationCap, Zap, 
  Heart, Gift, Globe, MessageCircle
} from 'lucide-react';
import Link from 'next/link';
import { Database } from '@/lib/database.types';

// 1. TYPE DEFINITIONS
type BlockRow = Database['public']['Tables']['content_blocks']['Row'];

interface BlockMeta {
  badge?: string;
  author?: string;
  role?: string;
}

interface ContentBlock extends Omit<BlockRow, 'meta_info'> {
  meta_info: BlockMeta; 
  block_key: string;
  description: string | null;
  icon_key: string | null;
  
}

// 2. ICON MAP
const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Truck, ShieldCheck, Star, GraduationCap, Zap, Heart, Gift, Globe
};

interface SocialGridProps {
  settings: Record<string, string>;
  blocks: BlockRow[];
}

export const SocialGrid = ({ settings, blocks = [] }: SocialGridProps) => {
  const whatsapp = settings['whatsapp_phone'];

  // --- DATA PREPARATION ---

  // Helper: Cast JSON safely
  const parseBlock = (b: BlockRow): ContentBlock => ({
      ...b,
      meta_info: (b.meta_info as unknown as BlockMeta) || {}
  } as ContentBlock);

  const safeBlocks = blocks.map(parseBlock);

  // 1. Main Carousel (List)
  const mainSlides = safeBlocks
      .filter(b => b.block_key === 'main_carousel_item' || b.block_key === 'tile_main')
      .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));

  // 2. Testimonials (List)
  const testimonialSlides = safeBlocks
      .filter(b => b.block_key === 'testimonial_item' || b.block_key === 'testimonial')
      .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));

  // 3. Static Tiles (Single) - THE FIX IS HERE ⬇️
  // We cast the fallback {} as Partial<ContentBlock> so TypeScript allows access to .title, .icon_key etc.
  const tileDelivery = safeBlocks.find(b => b.block_key === 'tile_delivery') || {} as Partial<ContentBlock>;
  const tileWarranty = safeBlocks.find(b => b.block_key === 'tile_warranty') || {} as Partial<ContentBlock>;

  // --- STATE FOR CAROUSELS ---
  
  const [activeMain, setActiveMain] = useState(0);
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  // Auto-Rotate Main Slides (5s)
  useEffect(() => {
    if (mainSlides.length <= 1) return;
    const interval = setInterval(() => {
      setActiveMain(prev => (prev + 1) % mainSlides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [mainSlides.length]);

  // Auto-Rotate Testimonials (7s)
  useEffect(() => {
    if (testimonialSlides.length <= 1) return;
    const interval = setInterval(() => {
      setActiveTestimonial(prev => (prev + 1) % testimonialSlides.length);
    }, 7000);
    return () => clearInterval(interval);
  }, [testimonialSlides.length]);

  // Helper: Icon Renderer
  const renderIcon = (key: string | null | undefined, className: string) => {
      const k = key || 'Star';
      const IconComp = ICON_MAP[k] || Star;
      return <IconComp className={className} />;
  };

  // --- EMPTY STATE HANDLING ---
  // Fallbacks in case the carousel lists are empty
  const currentMain = mainSlides[activeMain] || { 
      title: 'Welcome', 
      description: 'Check out our latest deals.', 
      icon_key: 'Star', 
      meta_info: { badge: 'New' } 
  } as Partial<ContentBlock>;

  const currentReview = testimonialSlides[activeTestimonial] || { 
      title: 'Amazing service!', 
      meta_info: { author: 'Happy Customer', role: 'Verified' } 
  } as Partial<ContentBlock>;

  return (
    <section className="py-12 md:py-24 px-4 md:px-6 bg-[#0A2540] text-white overflow-hidden relative">
      <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>

      <div className="container mx-auto max-w-7xl relative z-10">
        
        {/* HEADLINE */}
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
           
           {/* TILE 1: MAIN CAROUSEL */}
           <div className="col-span-2 relative rounded-3xl md:rounded-[2.5rem] bg-white/5 border border-white/10 p-6 md:p-10 overflow-hidden flex flex-col justify-center group">
              
              {/* Slide Content with Fade Effect */}
              <div key={activeMain} className="relative z-10 max-w-lg animate-in fade-in slide-in-from-right-4 duration-500">
                 {currentMain.meta_info?.badge && (
                    <div className="inline-flex items-center gap-2 bg-orange-500/20 text-orange-400 border border-orange-500/30 rounded-full px-3 py-1 font-bold text-[10px] uppercase tracking-wider mb-3">
                       {renderIcon(currentMain.icon_key, "w-3 h-3")} {currentMain.meta_info.badge}
                    </div>
                 )}
                 <h3 className="text-xl md:text-4xl font-black text-white mb-2 leading-tight">{currentMain.title}</h3>
                 <p className="text-blue-100/80 text-sm md:text-lg leading-relaxed font-medium">
                   {currentMain.description}
                 </p>
              </div>

              {/* Slide Indicators */}
              {mainSlides.length > 1 && (
                 <div className="absolute bottom-6 left-6 md:left-10 flex gap-2">
                    {mainSlides.map((_, idx) => (
                       <button 
                         key={idx}
                         onClick={() => setActiveMain(idx)}
                         className={`h-1.5 rounded-full transition-all duration-300 ${activeMain === idx ? 'w-6 bg-orange-500' : 'w-2 bg-white/20 hover:bg-white/40'}`}
                       />
                    ))}
                 </div>
              )}
           </div>

           {/* TILE 2: DELIVERY (Static) */}
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

           {/* TILE 3: WARRANTY (Static) */}
           <div className="col-span-1 relative rounded-2xl md:rounded-[2.5rem] bg-orange-500 text-white p-4 md:p-8 flex flex-col justify-center items-center text-center shadow-lg min-h-[160px]">
              {renderIcon(tileWarranty.icon_key, "text-white mb-2 md:mb-4 opacity-90 w-8 h-8 md:w-12 md:h-12")}
              <h3 className="text-sm md:text-xl font-black mb-1 leading-tight">{tileWarranty.title || 'Warranty'}</h3>
              <p className="hidden md:block text-white/80 text-sm font-medium">{tileWarranty.description}</p>
           </div>

           {/* TILE 4: TESTIMONIAL CAROUSEL */}
           <div className="col-span-2 relative rounded-3xl md:rounded-[2.5rem] bg-white/5 border border-white/10 p-6 md:p-10 flex flex-col justify-center">
              
              <div className="flex text-yellow-400 gap-0.5 mb-3">
                 {[...Array(5)].map((_,i) => <Star key={i} fill="currentColor" size={16} />)}
              </div>
              
              <div key={activeTestimonial} className="animate-in fade-in duration-500">
                  <blockquote className="text-lg md:text-2xl font-bold text-white leading-snug mb-6 line-clamp-3">
                     "{currentReview.title}"
                  </blockquote>
                  <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                     <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-xs font-bold text-white/50">
                            {currentReview.meta_info?.author?.charAt(0) || 'C'}
                        </div>
                        <div>
                           <div className="font-bold text-white text-sm">{currentReview.meta_info?.author || 'Customer'}</div>
                           <div className="text-[10px] md:text-xs font-bold text-blue-300 uppercase">{currentReview.meta_info?.role || 'Verified Buyer'}</div>
                        </div>
                     </div>
                     
                     {/* Whatsapp & Indicators */}
                     <div className="flex items-center gap-4 w-full md:w-auto">
                        {testimonialSlides.length > 1 && (
                            <div className="flex gap-1 md:hidden">
                                {testimonialSlides.map((_, idx) => (
                                    <div key={idx} className={`h-1 w-1 rounded-full ${activeTestimonial === idx ? 'bg-blue-400' : 'bg-white/20'}`} />
                                ))}
                            </div>
                        )}

                        {whatsapp && (
                           <a href={`https://wa.me/${whatsapp}`} target="_blank" className="ml-auto w-auto inline-flex items-center justify-center gap-2 bg-[#25D366] text-white px-5 py-2 md:py-3 rounded-xl font-bold text-sm shadow-lg hover:scale-105 transition-transform">
                               <MessageCircle size={18} /> <span className="hidden md:inline">Chat & Verify</span><span className="md:hidden">Chat</span>
                           </a>
                        )}
                     </div>
                  </div>
              </div>

           </div>

        </div>
      </div>
    </section>
  );
};