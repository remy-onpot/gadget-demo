'use client';

import { useEffect } from "react";

export function ThemeInjector({ color }: { color?: string }) {
  useEffect(() => {
    if (color) {
      // 1. Set the CSS Variable dynamically
      document.documentElement.style.setProperty('--primary', color);
    }
  }, [color]);

  // Render nothing, just run logic
  return null;
}