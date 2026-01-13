"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils'; // Assuming you have a utils file or simple className merger

export const ProductGallery = ({ images }: { images: string[] }) => {
  const [activeImage, setActiveImage] = useState(images[0]);

  // If the parent images change (e.g. switching variant), update the active view
  useEffect(() => {
    setActiveImage(images[0]);
  }, [images]);

  if (!images || images.length === 0) return <div className="aspect-square bg-gray-100 rounded-2xl" />;

  return (
    <div className="flex flex-col gap-4">
      {/* Main Viewport */}
      <div className="relative aspect-square md:aspect-[4/3] w-full bg-white rounded-3xl border border-gray-100 overflow-hidden group">
        <Image 
          src={activeImage} 
          fill 
          className="object-contain p-8 transition-transform duration-500 group-hover:scale-105" 
          alt="Product View" 
          priority
        />
      </div>

      {/* Thumbnails */}
      <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
        {images.map((img, idx) => (
          <button
            key={idx}
            onClick={() => setActiveImage(img)}
            className={cn(
              "relative w-20 h-20 flex-shrink-0 rounded-xl border-2 overflow-hidden transition-all",
              activeImage === img ? "border-orange-500 ring-2 ring-orange-100" : "border-transparent bg-gray-50 hover:border-gray-200"
            )}
          >
            <Image src={img} fill className="object-cover" alt={`View ${idx}`} />
          </button>
        ))}
      </div>
    </div>
  );
};