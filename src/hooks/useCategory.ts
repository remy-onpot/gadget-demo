import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Product } from '@/lib/types';
import { matchesRules, FilterRule } from '@/lib/filter-engine';

export interface CategorySection {
  id: string;
  title: string;
  section_type: 'product_row' | 'brand_row';
  filter_rules: FilterRule[];
  sort_order: number;
}

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

        // 2. Fetch ALL products for this category (With IMAGE FIX)
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

        // 3. Normalize Data (Fix Prices & Images)
        const cleanProducts = productsRaw.map((p: any) => {
           const prices = p.variants?.map((v: any) => v.price) || [];
           const minPrice = prices.length > 0 ? Math.min(...prices) : (p.base_price || 0);
           return { 
             ...p, 
             price: minPrice, 
             images: p.images || [], // Ensure array exists
             variants: p.variants || []
           };
        });

        setAllProducts(cleanProducts);

        // 4. Default Sections if none exist in DB
        let processedSections = layoutData as CategorySection[];
        
        if (!processedSections || processedSections.length === 0) {
           // Create fallback sections so the page isn't empty
           processedSections = [
             { id: 'def-1', title: 'Featured', section_type: 'product_row', filter_rules: [], sort_order: 1 },
             { id: 'def-2', title: 'Shop by Brand', section_type: 'brand_row', filter_rules: [], sort_order: 2 }
           ];
        }

        // 5. Apply Rules Engine
        const hydratedSections = processedSections.map(section => {
          if (section.section_type === 'brand_row') {
             return { ...section, products: cleanProducts };
          }
          
          // Filter products based on rules
          const filtered = cleanProducts.filter(p => matchesRules(p, section.filter_rules));
          return { ...section, products: filtered.slice(0, 8) }; // Limit row to 8
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