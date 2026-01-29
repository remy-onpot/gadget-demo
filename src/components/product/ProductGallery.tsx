"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Rotate3D, Image as ImageIcon } from 'lucide-react';
import { Product360Viewer } from '@/components/shop/Product360Viewer';

interface GalleryProps {
  images: string[];
  frames360?: string[]; // Optional 360 frames
}

export const ProductGallery = ({ images, frames360 }: GalleryProps) => {
  const [activeImage, setActiveImage] = useState(images[0]);
  const [viewMode, setViewMode] = useState<'image' | '360'>('image');

  useEffect(() => {
    setActiveImage(images[0]);
  }, [images]);

  return (
    <div className="flex flex-col gap-4">
      {/* Main Viewport */}
      {viewMode === '360' && frames360 && frames360.length > 0 ? (
        <Product360Viewer frames={frames360} />
      ) : (
        <div className="relative aspect-square md:aspect-[4/3] w-full bg-white rounded-3xl border border-gray-100 overflow-hidden group">
          <Image 
            src={activeImage} 
            fill 
            className="object-contain p-8 transition-transform duration-500 group-hover:scale-105" 
            alt="Product View" 
            priority
          />
        </div>
      )}

      {/* Thumbnails & Toggles */}
      <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar items-center">
        
        {/* 360 Toggle Button */}
        {frames360 && frames360.length > 0 && (
           <button
             onClick={() => setViewMode(viewMode === '360' ? 'image' : '360')}
             className={cn(
               "relative w-20 h-20 flex-shrink-0 rounded-xl border-2 flex flex-col items-center justify-center gap-1 transition-all",
               viewMode === '360' ? "border-orange-500 bg-orange-50 text-orange-600" : "border-gray-200 bg-gray-50 text-gray-500"
             )}
           >
             <Rotate3D size={24} />
             <span className="text-[10px] font-bold">360°</span>
           </button>
        )}

        {/* Standard Images */}
        {images.map((img, idx) => (
          <button
            key={idx}
            onClick={() => { setActiveImage(img); setViewMode('image'); }}
            className={cn(
              "relative w-20 h-20 flex-shrink-0 rounded-xl border-2 overflow-hidden transition-all",
              activeImage === img && viewMode === 'image' 
                ? "border-orange-500 ring-2 ring-orange-100" 
                : "border-transparent bg-gray-50 hover:border-gray-200"
            )}
          >
            <Image src={img} fill className="object-cover" alt={`View ${idx}`} />
          </button>
        ))}
      </div>
    </div>
  );
};