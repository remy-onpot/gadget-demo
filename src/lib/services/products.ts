import { createStaticClient } from '@/lib/supabase-server'; 
import { cacheService } from '@/lib/cache-wrapper';
import { Product, CategorySection, Category, FilterRule } from '@/lib/types';
import { Database } from '@/lib/database.types';
import { matchesRules } from '@/lib/filter-engine';
import { slugify } from '@/lib/utils'; 

// 0. DB TYPES
type ProductRow = Database['public']['Tables']['products']['Row'];
type VariantRow = Database['public']['Tables']['product_variants']['Row'];
type CategoryRow = Database['public']['Tables']['categories']['Row']; // ✅ New Master Table
type SectionRow = Database['public']['Tables']['category_sections']['Row'];

// 1. QUERY RETURN SHAPES (With Joins)
type ProductWithRelations = ProductRow & { 
  variants: VariantRow[]; 
  categories: CategoryRow | null; // ✅ Joined Data
};

type ProductWithPrice = ProductRow & { 
  variants: Pick<VariantRow, 'price'>[]; 
  categories: CategoryRow | null; // ✅ Joined Data
};

// 2. MAPPERS
const mapToProduct = (raw: ProductWithRelations): Product => {
  const prices = raw.variants?.map((v) => v.price) || [];
  const minPrice = prices.length > 0 ? Math.min(...prices) : (raw.base_price || 0);

  // ✅ Extract Name from Join
  const categoryName = raw.categories?.name || 'Uncategorized';

  return {
    id: raw.id,
    name: raw.name,
    slug: raw.slug,
    brand: raw.brand || 'Generic',
    category: categoryName as Category, // Cast to maintain compatibility
    description: raw.description || undefined,
    price: minPrice,
    originalPrice: raw.base_price || undefined,
    images: raw.base_images || [],
    isFeatured: raw.is_featured ?? false,
    isActive: raw.is_active ?? false,
    variants: raw.variants.map(v => ({
      id: v.id,
      product_id: raw.id,
      condition: v.condition,
      price: v.price,
      stock: v.stock || 0,
      specs: (v.specs as Record<string, string>) || {},
      images: v.images || []
    })),
    specs: {}
  };
};

const mapToListProduct = (raw: ProductWithPrice): Product => {
  const prices = raw.variants?.map((v) => v.price) || [];
  const minPrice = prices.length > 0 ? Math.min(...prices) : (raw.base_price || 0);
  
  const categoryName = raw.categories?.name || 'Uncategorized';

  return {
    id: raw.id,
    name: raw.name,
    slug: raw.slug,
    brand: raw.brand || 'Generic',
    category: categoryName as Category,
    description: raw.description || undefined,
    price: minPrice,
    originalPrice: raw.base_price || undefined,
    images: raw.base_images || [],
    isFeatured: raw.is_featured ?? false,
    isActive: raw.is_active ?? false,
    variants: [],
    specs: {}
  };
};

// ==========================================
// 1. FEATURED PRODUCTS 
// ==========================================
const getFeaturedInternal = async (storeId: string): Promise<Product[]> => {
  const supabase = createStaticClient();
  const { data } = await supabase
    .from('products')
    .select('*, variants:product_variants(*), categories(*)') // ✅ Join Categories
    .eq('store_id', storeId) 
    .eq('is_active', true)
    .eq('is_featured', true)
    .limit(8);

  if (!data) return [];
  // @ts-ignore
  return (data as ProductWithRelations[]).map(mapToProduct);
};

export const getFeaturedProducts = cacheService(
  async (storeId: string) => getFeaturedInternal(storeId), 
  ['featured-products'], 
  { tags: ['products'] }
);

// ==========================================
// 2. CATEGORY FEED (Homepage Rails)
// ==========================================
type FeedData = {
  grouped: Record<string, Product[]>;
  metadata: Record<string, CategoryRow>; // Updated to use Master Row
};

const getCategoryFeedInternal = async (storeId: string): Promise<FeedData> => {
  const supabase = createStaticClient();
  const RAIL_LIMIT = 8;

  const [productsRes, sectionsRes, catsRes] = await Promise.all([
    supabase
        .from('products')
        .select('*, variants:product_variants(price), categories(*)') // ✅ Join Categories
        .eq('store_id', storeId)
        .eq('is_active', true)
        .order('created_at', { ascending: false }),
    
    supabase
        .from('category_sections')
        .select('*')
        .eq('store_id', storeId)
        .eq('is_active', true)
        .order('sort_order'),

    supabase
        .from('categories') // ✅ Fetch from Master Table
        .select('*')
        .eq('store_id', storeId)
  ]);

  // @ts-ignore
  const allProducts = (productsRes.data as ProductWithPrice[] || []).map(mapToListProduct);
  const sections = sectionsRes.data || [];
  
  // Map Slug -> Category Row
  const metadataMap: Record<string, CategoryRow> = {};
  catsRes.data?.forEach((c) => {
    metadataMap[c.slug] = c;
  });

  const grouped: Record<string, Product[]> = {};

  // Admin Sections Logic
  if (sections.length > 0) {
      sections.forEach(section => {
          const rules = section.filter_rules as unknown as FilterRule[];
          const matches = allProducts.filter(p => 
              // We compare slugs now for better accuracy
              (metadataMap[p.category.toLowerCase()]?.slug === section.category_slug || 
               p.category.toLowerCase() === section.category_slug.toLowerCase()) &&
              matchesRules(p, rules)
          );

          if (matches.length > 0) {
              if (!grouped[section.category_slug]) grouped[section.category_slug] = [];
              const existingIds = new Set(grouped[section.category_slug].map(p => p.id));
              matches.forEach(p => {
                  if (!existingIds.has(p.id) && grouped[section.category_slug].length < RAIL_LIMIT) {
                      grouped[section.category_slug].push(p);
                      existingIds.add(p.id);
                  }
              });
          }
      });
  }

  // Fallback Grouping (By Slug)
  allProducts.forEach(p => {
      // Find the slug for this product's category name
      const catSlug = Object.values(metadataMap).find(c => c.name === p.category)?.slug || slugify(p.category);
      
      if (!grouped[catSlug]) grouped[catSlug] = [];
      if (grouped[catSlug].length < RAIL_LIMIT) {
          if (!grouped[catSlug].some(ex => ex.id === p.id)) {
              grouped[catSlug].push(p);
          }
      }
  });

  Object.keys(grouped).forEach(key => {
      if (grouped[key].length === 0) delete grouped[key];
  });

  return { grouped, metadata: metadataMap };
};

export const getCategoryFeed = cacheService(
  async (storeId: string) => getCategoryFeedInternal(storeId), 
  ['category-feed'], 
  { tags: ['products', 'categories', 'layouts'] }
);

// ==========================================
// 3. SINGLE PRODUCT
// ==========================================
const getProductBySlugInternal = async (slug: string, storeId: string): Promise<Product | null> => {
  const supabase = createStaticClient();
  const { data } = await supabase
    .from('products')
    .select('*, variants:product_variants(*), categories(*)') // ✅ Join
    .eq('store_id', storeId)
    .eq('slug', slug)
    .single();

  if (!data) return null;
  // @ts-ignore
  return mapToProduct(data as ProductWithRelations);
};

export const getProductBySlug = cacheService(
  async (slug: string, storeId: string) => getProductBySlugInternal(slug, storeId),
  ['product-by-slug'], 
  { tags: ['products'], revalidate: 3600 }
);

// ==========================================
// 4. RELATED PRODUCTS
// ==========================================
const getRelatedProductsInternal = async (categorySlug: string, excludeId: string, storeId: string): Promise<Product[]> => {
  const supabase = createStaticClient();
  
  // ✅ 1. Find Category ID from Slug first
  const { data: category } = await supabase
    .from('categories')
    .select('id')
    .eq('store_id', storeId)
    .eq('slug', categorySlug)
    .single();

  if (!category) return [];

  // ✅ 2. Filter by Category ID
  const { data } = await supabase
    .from('products')
    .select('*, variants:product_variants(price), categories(*)')
    .eq('store_id', storeId) 
    .eq('category_id', category.id) // Fast ID lookup
    .neq('id', excludeId)
    .eq('is_active', true)
    .limit(4);

  if (!data) return [];
  // @ts-ignore
  return (data as ProductWithPrice[]).map(mapToListProduct);
};

export const getRelatedProducts = cacheService(
  async (category: string, excludeId: string, storeId: string) => getRelatedProductsInternal(category, excludeId, storeId),
  ['related-products'],
  { tags: ['products'], revalidate: 3600 }
);

// ==========================================
// 5. CATEGORY PAGE DATA (Optimized)
// ==========================================
export type CategoryPageData = {
  products: Product[];
  sections: CategorySection[];
  categoryTitle: string;
};

const getCategoryPageDataInternal = async (urlSlug: string, storeId: string): Promise<CategoryPageData> => {
  const supabase = createStaticClient();

  // ✅ 1. Direct Lookup via Master Table (No fuzzy text matching needed!)
  const { data: category } = await supabase
    .from('categories')
    .select('*')
    .eq('store_id', storeId)
    .eq('slug', urlSlug)
    .single();

  if (!category) return { products: [], sections: [], categoryTitle: 'Category Not Found' };

  // ✅ 2. Fetch Products using ID
  const { data: productsRaw } = await supabase
    .from('products')
    .select('*, variants:product_variants(price), categories(*)')
    .eq('store_id', storeId)
    .eq('category_id', category.id) // Robust link
    .eq('is_active', true);

  // @ts-ignore
  const products = (productsRaw as ProductWithPrice[] || []).map(mapToListProduct);

  // 3. Fetch Layouts
  const { data: sectionsRaw } = await supabase
    .from('category_sections')
    .select('*')
    .eq('store_id', storeId)
    .eq('category_slug', urlSlug) // Sections still use slug, which is fine
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  const sections: CategorySection[] = (sectionsRaw || []).map((s: SectionRow) => ({
      id: s.id,
      category_slug: s.category_slug,
      title: s.title,
      section_type: s.section_type as 'product_row' | 'brand_row',
      sort_order: s.sort_order || 0,
      is_active: s.is_active ?? true,
      filter_rules: (s.filter_rules as unknown as FilterRule[]) || []
  }));

  return { products, sections, categoryTitle: category.name };
};

export const getCategoryPageData = cacheService(
  async (slug: string, storeId: string) => getCategoryPageDataInternal(slug, storeId),
  ['category-page-data'],
  { tags: ['products', 'layouts'], revalidate: 3600 }
);