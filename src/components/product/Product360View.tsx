"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Rotate3D } from 'lucide-react';

/* eslint-disable @next/next/no-img-element */
export function Product360View({ frames }: { frames: string[] }) {
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startX = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleStart = (clientX: number) => {
    setIsDragging(true);
    startX.current = clientX;
  };

  const handleMove = (clientX: number) => {
    if (!isDragging) return;
    const dx = clientX - startX.current;
    
    // Sensitivity: Change frame every 10px
    if (Math.abs(dx) > 10) {
      const direction = dx > 0 ? 1 : -1;
      setCurrentFrame((prev) => {
        let next = prev - direction; // Inverted for natural feel
        if (next < 0) next = frames.length - 1;
        if (next >= frames.length) next = 0;
        return next;
      });
      startX.current = clientX;
    }
  };

  const handleEnd = () => setIsDragging(false);

  // Preload images for smoothness
  useEffect(() => {
    frames.forEach(src => {
      const img = new Image();
      img.src = src;
    });
  }, [frames]);

  return (
    <div 
      ref={containerRef}
      className="relative aspect-square w-full bg-white rounded-3xl overflow-hidden cursor-grab active:cursor-grabbing touch-none select-none border border-gray-100"
      onMouseDown={(e) => handleStart(e.clientX)}
      onMouseMove={(e) => handleMove(e.clientX)}
      onMouseUp={handleEnd}
      onMouseLeave={handleEnd}
      onTouchStart={(e) => handleStart(e.touches[0].clientX)}
      onTouchMove={(e) => handleMove(e.touches[0].clientX)}
      onTouchEnd={handleEnd}
    >
      <img 
        src={frames[currentFrame]} 
        alt="360 View" 
        className="w-full h-full object-contain p-8 pointer-events-none"
      />
      
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-slate-900/80 backdrop-blur text-white px-4 py-2 rounded-full flex items-center gap-2 text-xs font-bold pointer-events-none">
        <Rotate3D size={16} className="animate-spin-slow" />
        Drag to Rotate
      </div>
    </div>
  );
}