import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Product, CategorySection, FilterRule } from '@/lib/types'; // ✅ Import shared types
import { matchesRules } from '@/lib/filter-engine';

// Helper type for the hook's return value
export interface SectionWithData extends CategorySection {
  products: Product[];
}

export const useCategory = (slug: string) => {
  const [sections, setSections] = useState<SectionWithData[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);

        // 1. Fetch Layout Configuration
        const { data: layoutData, error: layoutError } = await supabase
          .from('category_sections')
          .select('*')
          .eq('category_slug', slug)
          .eq('is_active', true)
          .order('sort_order', { ascending: true });

        if (layoutError) throw layoutError;

        // 2. Fetch ALL products for this category
        const { data: productsRaw, error: prodError } = await supabase
          .from('products')
          .select(`
            *,
            images:base_images,          
            variants:product_variants ( price )
          `)
          .eq('is_active', true)
          .ilike('category', slug);

        if (prodError) throw prodError;

        // 3. Normalize Data
        const cleanProducts = (productsRaw || []).map((p: any) => {
           const prices = p.variants?.map((v: any) => v.price) || [];
           const minPrice = prices.length > 0 ? Math.min(...prices) : (p.base_price || 0);
           return { 
             ...p, 
             price: minPrice, 
             images: p.images || [], 
             variants: p.variants || []
           } as Product;
        });

        setAllProducts(cleanProducts);

        // 4. Process Sections (The Fix)
        let processedSections: CategorySection[] = [];

        if (layoutData && layoutData.length > 0) {
            // ✅ FIX: "Double Cast" + Fallback for sort_order
            processedSections = layoutData.map(row => ({
                id: row.id,
                category_slug: row.category_slug,
                title: row.title,
                section_type: row.section_type as 'product_row' | 'brand_row',
                filter_rules: (row.filter_rules as unknown as FilterRule[]) || [],
                sort_order: row.sort_order || 0, // <--- Handles null from DB
                is_active: row.is_active ?? true 
            }));
        } else {
           // Fallback Defaults
           processedSections = [
             { id: 'def-1', category_slug: slug, title: 'Featured', section_type: 'product_row', filter_rules: [], sort_order: 1, is_active: true },
             { id: 'def-2', category_slug: slug, title: 'Shop by Brand', section_type: 'brand_row', filter_rules: [], sort_order: 2, is_active: true }
           ];
        }

        // 5. Apply Rules Engine
        const hydratedSections = processedSections.map(section => {
          if (section.section_type === 'brand_row') {
             return { ...section, products: cleanProducts };
          }
          
          // Filter products based on rules
          const filtered = cleanProducts.filter(p => matchesRules(p, section.filter_rules || []));
          return { ...section, products: filtered.slice(0, 8) };
        });

        // Remove empty sections
        setSections(hydratedSections.filter(s => s.products.length > 0));

      } catch (err: any) {
        console.error("Category Load Error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    if (slug) fetchData();
  }, [slug]);

  return { sections, allProducts, loading, error };
};