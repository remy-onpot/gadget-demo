"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Rotate3D, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Product360ViewerProps {
  frames: string[];
  className?: string;
  autoSpin?: boolean; // New prop to control auto-rotation
}

export const Product360Viewer = ({ 
  frames, 
  className,
  autoSpin = true 
}: Product360ViewerProps) => {
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);
  const [hasError, setHasError] = useState(false);
  const [hasAutoSpun, setHasAutoSpun] = useState(false);

  const startX = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const autoSpinInterval = useRef<NodeJS.Timeout | null>(null);

  // --- 1. Intelligent Preloading ---
  useEffect(() => {
    if (!frames || frames.length === 0) {
      setHasError(true);
      setIsLoading(false);
      return;
    }

    let loadedCount = 0;
    const total = frames.length;
    const imageCache: HTMLImageElement[] = [];
    let isMounted = true;

    // Reset state when frames change
    setIsLoading(true);
    setHasError(false);
    setLoadProgress(0);

    frames.forEach((url, index) => {
      const img = new Image();
      img.src = url;
      
      img.onload = () => {
        if (!isMounted) return;
        loadedCount++;
        imageCache[index] = img;
        setLoadProgress(Math.round((loadedCount / total) * 100));
        
        if (loadedCount === total) {
          setIsLoading(false);
        }
      };
      
      img.onerror = () => {
        if (!isMounted) return;
        loadedCount++; // Still count it to finish loading state
        if (loadedCount === total) {
          setIsLoading(false);
          // Only error if ALL failed, or maybe just log warning
          if (loadedCount === 1) setHasError(true); 
        }
      };
    });

    return () => {
      isMounted = false;
      imageCache.forEach(img => { img.src = ''; });
    };
  }, [frames]);

  // --- 2. Auto-Spin Logic ---
  useEffect(() => {
    if (!isLoading && autoSpin && !hasAutoSpun && !isDragging) {
      // Small delay before starting spin
      const startTimeout = setTimeout(() => {
        autoSpinInterval.current = setInterval(() => {
          setCurrentFrame(prev => {
            const next = prev + 1;
            if (next >= frames.length) {
              // Stop after one full rotation
              if (autoSpinInterval.current) clearInterval(autoSpinInterval.current);
              setHasAutoSpun(true);
              return 0;
            }
            return next;
          });
        }, 50); // Speed of auto-spin (approx 20fps)
      }, 500);

      return () => {
        clearTimeout(startTimeout);
        if (autoSpinInterval.current) clearInterval(autoSpinInterval.current);
      };
    }
  }, [isLoading, autoSpin, hasAutoSpun, isDragging, frames.length]);

  // Stop auto-spin on user interaction
  const stopAutoSpin = useCallback(() => {
    if (autoSpinInterval.current) {
      clearInterval(autoSpinInterval.current);
      autoSpinInterval.current = null;
      setHasAutoSpun(true); // Treat as "done" so it doesn't restart
    }
  }, []);

  // --- 3. Interaction Logic ---
  const handleStart = (clientX: number) => {
    stopAutoSpin();
    setIsDragging(true);
    startX.current = clientX;
  };

  const handleMove = (clientX: number) => {
    if (!isDragging || isLoading) return;
    
    const dx = clientX - startX.current;
    const sensitivity = 10; // Pixels per frame (Higher = Slower/Smoother)
    
    if (Math.abs(dx) > sensitivity) {
      const direction = dx > 0 ? -1 : 1; // Invert drag for natural feel
      
      setCurrentFrame((prev) => {
        let next = prev + direction;
        // Loop logic
        if (next < 0) next = frames.length - 1;
        if (next >= frames.length) next = 0;
        return next;
      });
      
      // Reset start X to current position to prevent acceleration
      startX.current = clientX;
    }
  };

  const handleEnd = () => setIsDragging(false);

  // --- 4. Render ---
  if (hasError || !frames || frames.length === 0) {
    return (
      <div className={cn("relative aspect-square bg-slate-50 rounded-3xl flex items-center justify-center border border-slate-100", className)}>
        <div className="text-center p-8">
          <AlertCircle size={48} className="text-slate-300 mx-auto mb-3" />
          <p className="text-sm font-medium text-slate-400">360° View Unavailable</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className={cn(
        "relative aspect-square bg-white rounded-3xl overflow-hidden cursor-grab active:cursor-grabbing touch-none select-none border border-gray-100 shadow-sm",
        className
      )}
      onMouseDown={(e) => handleStart(e.clientX)}
      onMouseMove={(e) => handleMove(e.clientX)}
      onMouseUp={handleEnd}
      onMouseLeave={handleEnd}
      onTouchStart={(e) => handleStart(e.touches[0].clientX)}
      onTouchMove={(e) => handleMove(e.touches[0].clientX)}
      onTouchEnd={handleEnd}
    >
      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 z-20 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center transition-opacity duration-300">
          <div className="relative w-16 h-16 mb-4">
            <svg className="w-full h-full -rotate-90">
              <circle 
                cx="32" cy="32" r="28" 
                stroke="currentColor" strokeWidth="3" fill="transparent" 
                className="text-slate-100" 
              />
              <circle 
                cx="32" cy="32" r="28" 
                stroke="currentColor" strokeWidth="3" fill="transparent" 
                className="text-black transition-all duration-300 ease-out"
                strokeDasharray="175"
                strokeDashoffset={175 - (175 * loadProgress) / 100}
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-slate-900">
              {loadProgress}%
            </span>
          </div>
          <p className="text-xs font-medium text-slate-500 animate-pulse">Loading 360° Experience...</p>
        </div>
      )}

      {/* 360 Image Display */}
      {/* We use standard img tag for performance in high-frequency updates */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img 
        src={frames[currentFrame]} 
        alt="Product 360 view"
        className={cn(
            "w-full h-full object-contain p-4 select-none transition-opacity duration-300",
            isLoading ? "opacity-0" : "opacity-100"
        )}
        draggable={false}
        decoding="sync" // Prevents white flash on fast rotation
      />
      
      {/* Interaction Hint (Only shows when not loading) */}
      {!isLoading && (
        <div className={cn(
            "absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur shadow-sm border border-gray-200 text-slate-800 px-4 py-1.5 rounded-full flex items-center gap-2 text-[10px] font-bold pointer-events-none transition-opacity duration-500",
            isDragging ? "opacity-0" : "opacity-100"
        )}>
          <Rotate3D size={12} className={cn("text-indigo-600", !hasAutoSpun && "animate-spin-slow")} />
          <span>Drag to Rotate</span>
        </div>
      )}
    </div>
  );
};