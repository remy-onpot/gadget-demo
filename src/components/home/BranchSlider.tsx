"use client";

import React, { useState, useEffect } from 'react';
import { MapPin, Clock, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Database } from '@/lib/database.types';

type BannerRow = Database['public']['Tables']['banners']['Row'];

interface BranchSliderProps {
  banners: BannerRow[];
  settings: Record<string, string>;
}

export const BranchSlider = ({ banners, settings }: BranchSliderProps) => {
  const [current, setCurrent] = useState(0);

  // 1. SMART FILTER: Look for specific showroom images to avoid reusing Hero Banners
  const branchBanners = banners.filter(b => 
     b.title?.toLowerCase().includes('showroom') || 
     b.title?.toLowerCase().includes('branch') ||
     b.label?.toLowerCase() === 'location'
  );

  // 2. FALLBACK LOGIC
  // If we found specific branch photos, use them. 
  // If not, use empty array (which triggers the unsplash fallback below).
  const activeBanners = branchBanners.length > 0 ? branchBanners : [];
  
  useEffect(() => {
    if (activeBanners.length <= 1) return;
    const timer = setInterval(() => setCurrent(prev => (prev + 1) % activeBanners.length), 5000);
    return () => clearInterval(timer);
  }, [activeBanners.length]);

  // 3. IMAGE SELECTION
  // If no banners match, show a nice default map image
  const activeImage = activeBanners.length > 0 
    ? activeBanners[current].image_url
    : "https://images.unsplash.com/photo-1577412647305-991150c7d163?auto=format&fit=crop&q=80&w=1200"; 

  const mapLink = settings['map_link'];
  const address = settings['address_display'];
  const hours = settings['opening_hours'];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex flex-col lg:flex-row gap-12 items-center">
           
           {/* LEFT: INFO */}
           <div className="w-full lg:w-1/3 space-y-8">
             <div>
               <span className="text-orange-600 font-bold tracking-widest text-xs uppercase mb-2 block">Visit Our Branch</span>
               <h2 className="text-4xl md:text-5xl font-black text-slate-900 leading-[1.1]">Come see us at <br/>our showroom.</h2>
             </div>
             
             <div className="space-y-6 text-slate-600 font-medium">
                {address && (
                   <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center shrink-0 text-orange-600"><MapPin size={20} /></div>
                      <div><p className="text-slate-900 font-bold">Location</p><p className="text-sm whitespace-pre-line">{address}</p></div>
                   </div>
                )}
                {hours && (
                   <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0 text-blue-600"><Clock size={20} /></div>
                      <div><p className="text-slate-900 font-bold">Opening Hours</p><p className="text-sm">{hours}</p></div>
                   </div>
                )}
             </div>
             
             {mapLink && (
                 <a href={mapLink} target="_blank" className="inline-flex items-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold hover:bg-slate-800 transition-transform hover:scale-105 shadow-xl shadow-slate-900/10">
                   Get Directions <ArrowRight size={18}/>
                 </a>
             )}
           </div>

           {/* RIGHT: SLIDER */}
           <div className="w-full lg:w-2/3 aspect-video md:aspect-[2/1] relative rounded-[2.5rem] overflow-hidden shadow-2xl group cursor-pointer border border-gray-100">
              <Wrapper href={mapLink}>
                  <AnimatePresence mode="wait">
                      <motion.div
                          key={current} 
                          initial={{ opacity: 0, scale: 1.1 }} 
                          animate={{ opacity: 1, scale: 1 }} 
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.8 }}
                          className="absolute inset-0"
                      >
                          <Image 
                            src={activeImage} 
                            fill 
                            className="object-cover" 
                            alt="Location" 
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60" />
                      </motion.div>
                  </AnimatePresence>
                  
                  <div className="absolute bottom-6 left-6 bg-white/95 backdrop-blur px-5 py-3 rounded-xl text-xs font-bold shadow-lg flex items-center gap-2 text-slate-900 z-10">
                      <MapPin size={16} className="text-red-500" /> View on Google Maps
                  </div>
              </Wrapper>
           </div>

        </div>
      </div>
    </section>
  );
};

// Helper to optionally wrap content in a link
const Wrapper = ({ href, children }: { href?: string, children: React.ReactNode }) => {
    if (href) return <a href={href} target="_blank" className="block w-full h-full relative">{children}</a>;
    return <div className="w-full h-full relative">{children}</div>;
}