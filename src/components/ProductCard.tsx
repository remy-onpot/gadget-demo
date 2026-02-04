'use client';

import React from 'react';
import { Database } from '@/lib/database.types';
import { TechCard } from '@/components/TechCard';
import { BodegaCard } from '@/components/BodegaCard';
import { PosterCard } from '@/components/PosterCard';
import { GadgetCard } from '@/components/GadgetCard';
import { useStorefrontTheme } from '@/contexts/ThemeContext';
import { CardType } from '@/lib/types';

// 1. The Input Props (Raw Data from Supabase)
type ProductWithRelations = Database['public']['Tables']['products']['Row'] & {
  categories?: { name: string; slug: string } | null;
  variants?: Database['public']['Tables']['product_variants']['Row'][];
};

interface SmartCardProps {
  product: ProductWithRelations;
  storeSlug?: string;
  // Optional overrides - if not provided, uses ThemeContext
  primaryColor?: string;
  cardType?: CardType;
  borderRadius?: string;
  glassMode?: boolean;
}

export const ProductCard = ({ 
  product, 
  storeSlug, 
  primaryColor,
  cardType,
  borderRadius,
  glassMode,
}: SmartCardProps) => {
  
  // Get theme from context (provides defaults if props not passed)
  const theme = useStorefrontTheme();
  
  // Resolve values: prop > context > fallback
  const resolvedPrimaryColor = primaryColor ?? theme.primaryColor;
  const resolvedCardType = cardType ?? theme.cardType;
  const resolvedBorderRadius = borderRadius ?? theme.borderRadius;
  const resolvedGlassMode = glassMode ?? theme.glassMode;

  // === 🧠 LOGIC LAYER (The Brains) ===

  // 1. Generate URL
  const href = storeSlug 
    ? `/sites/${storeSlug}/product/${product.slug}` 
    : `/product/${product.slug}`;

  // 2. Format Price
  const formattedPrice = new Intl.NumberFormat('en-GH', {
    style: 'currency',
    currency: 'GHS',
    minimumFractionDigits: product.base_price % 1 === 0 ? 0 : 2, // No decimals for round numbers
  }).format(product.base_price || 0);

  // 3. Resolve Image (First image or null)
  const imageUrl = product.base_images?.[0] || null;

  // 4. Resolve Tags: [condition, ...specs]
  // First tag = condition (e.g., "Brand New", "UK Used")
  // Remaining tags = key specs from variant or product metadata
  const tags: string[] = [];
  
  // Get condition from first variant
  const condition = product.variants?.[0]?.condition;
  if (condition) tags.push(condition);
  
  // Add category as a spec if available
  if (product.categories?.name) tags.push(product.categories.name);
  
  // Add brand if available
  if (product.brand) tags.push(product.brand);
  
  // Add any additional specs from variant (e.g., storage, color)
  const variant = product.variants?.[0];
  if (variant) {
    // Check for common spec fields that might exist
    const specs = variant as Record<string, unknown>;
    if (specs.storage) tags.push(String(specs.storage));
    if (specs.color) tags.push(String(specs.color));
    if (specs.ram) tags.push(String(specs.ram));
  }

  // 5. Actions
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    console.log('Add to cart:', product.id);
    // Add your cart logic here
  };

  // === 📦 PREP DATA PACKAGE ===
  const cleanProps = {
    title: product.name,
    price: formattedPrice,
    imageUrl,
    category: product.categories?.name || 'Item',
    href,
    primaryColor: resolvedPrimaryColor,
    borderRadius: resolvedBorderRadius,
    glassMode: resolvedGlassMode,
    tags,
    isFeatured: product.is_featured || false,
    onAddToCart: handleAddToCart,
  };

  // === 🎨 RENDER LAYER (The Switch) ===
  switch (resolvedCardType) {
    case 'bodega':
      return <BodegaCard {...cleanProps} />;
    case 'poster':
      return <PosterCard {...cleanProps} />;
    case 'gadget':
      return <GadgetCard {...cleanProps} />;
    case 'tech':
    default:
      return <TechCard {...cleanProps} />;
  }
};