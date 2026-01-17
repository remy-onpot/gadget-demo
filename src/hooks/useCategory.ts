import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Product, CategorySection, FilterRule } from '@/lib/types';
import { matchesRules } from '@/lib/filter-engine';
import { Database } from '@/lib/database.types';

// 1. DEFINE RAW DB TYPES
type ProductRow = Database['public']['Tables']['products']['Row'];
type VariantRow = Database['public']['Tables']['product_variants']['Row'];

// Define the "Raw" shape returned by the join query
interface RawProduct extends ProductRow {
  variants: Pick<VariantRow, 'price'>[]; // We only fetch price in the select
}

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

        // 3. Normalize Data (Strictly Typed)
        // ✅ FIX: Use 'RawProduct' instead of 'any'
        const rawItems = (productsRaw as unknown as RawProduct[]) || [];

       const cleanProducts: Product[] = rawItems.map((p) => {
           const prices = p.variants?.map((v) => v.price) || [];
           const minPrice = prices.length > 0 ? Math.min(...prices) : (p.base_price || 0);
           
           return {
             id: p.id,
             name: p.name,
             slug: p.slug,
             brand: p.brand || 'Generic',
             category: p.category,
             
             description: p.description || undefined, 
             
             price: minPrice, 
             originalPrice: undefined, 
             images: p.base_images || [], 
             specs: {}, 
             variants: [], 
             isActive: p.is_active || false,
             isFeatured: p.is_featured || false
           };
        });

        setAllProducts(cleanProducts);

        // 4. Process Sections
        let processedSections: CategorySection[] = [];

        if (layoutData && layoutData.length > 0) {
            processedSections = layoutData.map(row => ({
                id: row.id,
                category_slug: row.category_slug,
                title: row.title,
                section_type: row.section_type as 'product_row' | 'brand_row',
                // ✅ FIX: Cast JSON to strict FilterRule[]
                filter_rules: (row.filter_rules as unknown as FilterRule[]) || [],
                sort_order: row.sort_order || 0, 
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

      } catch (err: unknown) { // ✅ FIX: Safe error handling
        console.error("Category Load Error:", err);
        const msg = err instanceof Error ? err.message : "Failed to load category";
        setError(msg);
      } finally {
        setLoading(false);
      }
    }

    if (slug) fetchData();
  }, [slug]);

  return { sections, allProducts, loading, error };
};