// types/card-types.ts
import { ReactNode } from 'react';

// The 'Clean' data every dumb card receives
export interface ProductCardVisualProps {
  title: string;
  price: string; // Pre-formatted currency string (e.g., "GHS 150.00")
  imageUrl: string | null;
  category: string;
  href: string;
  primaryColor: string;
  
  // Theme-driven styling
  borderRadius?: string;  // e.g., '1rem', '0.5rem'
  glassMode?: boolean;    // Frosted glass effect
  
  // Optional extras that might not be on every card
  tags?: string[];
  isFeatured?: boolean;
  onAddToCart?: (e: React.MouseEvent) => void;
  onToggleWishlist?: (e: React.MouseEvent) => void;
}