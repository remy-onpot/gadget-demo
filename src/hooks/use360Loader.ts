import { useState, useEffect } from 'react';

export const use360Loader = (imageUrls: string[], shouldLoad: boolean) => {
  const [progress, setProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!shouldLoad || imageUrls.length === 0) return;
    if (isLoaded) return; // Already loaded

    let loadedCount = 0;
    const total = imageUrls.length;
    let isMounted = true;

    // Parallel loading for maximum speed
    imageUrls.forEach((url) => {
      const img = new Image();
      img.src = url;
      img.onload = () => {
        if (!isMounted) return;
        loadedCount++;
        const percent = Math.round((loadedCount / total) * 100);
        setProgress(percent);
        
        if (loadedCount === total) {
          setIsLoaded(true);
        }
      };
      img.onerror = () => {
         // Even if one fails, we count it to avoid getting stuck at 99%
         if (!isMounted) return;
         loadedCount++;
         if (loadedCount === total) setIsLoaded(true);
      };
    });

    return () => { isMounted = false; };
  }, [imageUrls, shouldLoad]);

  return { progress, isLoaded };
};