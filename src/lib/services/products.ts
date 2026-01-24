import { createStaticClient } from '@/lib/supabase-server'; 
import { cacheService } from '@/lib/cache-wrapper';
import { Product, CategorySection, Category, FilterRule } from '@/lib/types';
import { Database } from '@/lib/database.types';
import { matchesRules } from '@/lib/filter-engine';
import { slugify } from '@/lib/utils'; // ✅ Import slugify

// 0. AUTO-GENERATED DB TYPES
type ProductRow = Database['public']['Tables']['products']['Row'];
type VariantRow = Database['public']['Tables']['product_variants']['Row'];
type CategoryMetaRow = Database['public']['Tables']['category_metadata']['Row'];
type SectionRow = Database['public']['Tables']['category_sections']['Row'];

// 1. QUERY RETURN SHAPES
type ProductWithFullVariants = ProductRow & { variants: VariantRow[]; };
type ProductWithPrice = ProductRow & { variants: Pick<VariantRow, 'price'>[]; };

// 2. MAPPERS
const mapToProduct = (raw: ProductWithFullVariants): Product => {
  const prices = raw.variants?.map((v) => v.price) || [];
  const minPrice = prices.length > 0 ? Math.min(...prices) : (raw.base_price || 0);

  return {
    id: raw.id,
    name: raw.name,
    slug: raw.slug,
    brand: raw.brand || 'Generic',
    category: raw.category as Category,
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

  return {
    id: raw.id,
    name: raw.name,
    slug: raw.slug,
    brand: raw.brand || 'Generic',
    category: raw.category as Category,
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
// 1. FEATURED PRODUCTS (Full Detail)
// ==========================================
const getFeaturedInternal = async (storeId: string): Promise<Product[]> => {
  const supabase = createStaticClient();
  const { data } = await supabase
    .from('products')
    .select('*, variants:product_variants(*)')
    .eq('store_id', storeId) 
    .eq('is_active', true)
    .eq('is_featured', true)
    .limit(8);

  if (!data) return [];
  return (data as unknown as ProductWithFullVariants[]).map(mapToProduct);
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
  metadata: Record<string, CategoryMetaRow>;
};

const getCategoryFeedInternal = async (storeId: string): Promise<FeedData> => {
  const supabase = createStaticClient();
  const RAIL_LIMIT = 8;

  const [productsRes, sectionsRes, metaRes] = await Promise.all([
    supabase
        .from('products')
        .select('*, variants:product_variants(price)')
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
        .from('category_metadata')
        .select('*')
        .eq('store_id', storeId)
  ]);

  const allProducts = (productsRes.data as unknown as ProductWithPrice[] || []).map(mapToListProduct);
  const sections = sectionsRes.data || [];
  
  const metadataMap: Record<string, CategoryMetaRow> = {};
  metaRes.data?.forEach((m) => {
    metadataMap[m.slug.toLowerCase()] = m;
  });

  const grouped: Record<string, Product[]> = {};

  // Admin Sections
  if (sections.length > 0) {
      sections.forEach(section => {
          const rules = section.filter_rules as unknown as FilterRule[];
          const matches = allProducts.filter(p => 
              p.category.toLowerCase() === section.category_slug.toLowerCase() &&
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

  // Fallback
  allProducts.forEach(p => {
      const catKey = (p.category || 'uncategorized').toLowerCase();
      if (!grouped[catKey]) grouped[catKey] = [];
      if (grouped[catKey].length < RAIL_LIMIT) {
          if (!grouped[catKey].some(ex => ex.id === p.id)) {
              grouped[catKey].push(p);
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
    .select('*, variants:product_variants(*)')
    .eq('store_id', storeId)
    .eq('slug', slug)
    .single();

  if (!data) return null;
  return mapToProduct(data as unknown as ProductWithFullVariants);
};

export const getProductBySlug = cacheService(
  async (slug: string, storeId: string) => getProductBySlugInternal(slug, storeId),
  ['product-by-slug'], 
  { tags: ['products'], revalidate: 3600 }
);

// ==========================================
// 4. RELATED PRODUCTS
// ==========================================
const getRelatedProductsInternal = async (category: string, excludeId: string, storeId: string): Promise<Product[]> => {
  const supabase = createStaticClient();
  const { data } = await supabase
    .from('products')
    .select('*, variants:product_variants(price)')
    .eq('store_id', storeId) 
    .eq('category', category)
    .neq('id', excludeId)
    .eq('is_active', true)
    .limit(4);

  if (!data) return [];
  return (data as unknown as ProductWithPrice[]).map(mapToListProduct);
};

export const getRelatedProducts = cacheService(
  async (category: string, excludeId: string, storeId: string) => getRelatedProductsInternal(category, excludeId, storeId),
  ['related-products'],
  { tags: ['products'], revalidate: 3600 }
);

// ==========================================
// 5. CATEGORY PAGE DATA (Updated with Reverse Lookup)
// ==========================================
export type CategoryPageData = {
  products: Product[];
  sections: CategorySection[];
  categoryTitle: string; // ✅ Added title
};

const getCategoryPageDataInternal = async (urlSlug: string, storeId: string): Promise<CategoryPageData> => {
  const supabase = createStaticClient();

  // 1. REVERSE LOOKUP: Find the Real Category Name
  // Fetch all unique categories to see which one matches the slug
  const { data: categories } = await supabase
    .from('products')
    .select('category')
    .eq('store_id', storeId)
    .not('category', 'is', null);

  const uniqueCategories = Array.from(new Set(categories?.map(c => c.category)));
  
  // Find the match: slugify("Apparel & Comfort") === "apparel-and-comfort"
  const realCategoryName = uniqueCategories.find(cat => 
    slugify(cat || '') === urlSlug
  );

  // Fallback to decodeURIComponent if no smart match found
  const searchName = realCategoryName || decodeURIComponent(urlSlug);

  // 2. Fetch Products using the REAL Database Name
  const { data: productsRaw } = await supabase
    .from('products')
    .select('*, variants:product_variants(price)')
    .eq('store_id', storeId)
    .eq('category', searchName) // ✅ Correct Name
    .eq('is_active', true);

  const products = (productsRaw as unknown as ProductWithPrice[] || []).map(mapToListProduct);

  // 3. Fetch Layouts
  // We check both the slug (if Admin saved it as slug) and the name
  const { data: sectionsRaw } = await supabase
    .from('category_sections')
    .select('*')
    .eq('store_id', storeId)
    .or(`category_slug.eq.${urlSlug},category_slug.eq.${searchName}`)
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

  return { products, sections, categoryTitle: searchName };
};

export const getCategoryPageData = cacheService(
  async (slug: string, storeId: string) => getCategoryPageDataInternal(slug, storeId),
  ['category-page-data'],
  { tags: ['products', 'layouts'], revalidate: 3600 }
);