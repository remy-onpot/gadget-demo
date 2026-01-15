import { createStaticClient } from '@/lib/supabase-server'; // ✅ Fixed Import (No cookies)
import { cacheService } from '@/lib/cache-wrapper';
import { Product, CategorySection, Category, FilterRule } from '@/lib/types';
import { Database } from '@/lib/database.types';
import { matchesRules } from '@/lib/filter-engine';

// 0. AUTO-GENERATED DB TYPES
type ProductRow = Database['public']['Tables']['products']['Row'];
type VariantRow = Database['public']['Tables']['product_variants']['Row'];
type CategoryMetaRow = Database['public']['Tables']['category_metadata']['Row'];
type SectionRow = Database['public']['Tables']['category_sections']['Row'];

// Helper to handle the Join
type ProductWithRelations = ProductRow & {
  variants: VariantRow[];
};

// 1. MAPPER: Database -> Application
const mapToProduct = (raw: ProductWithRelations): Product => {
  const prices = raw.variants?.map((v) => v.price) || [];
  const minPrice = prices.length > 0 ? Math.min(...prices) : (raw.base_price || 0);

  return {
    id: raw.id,
    name: raw.name,
    slug: raw.slug,
    brand: raw.brand,
    category: raw.category as Category, // The DB string becomes the App Category
    description: raw.description || undefined,
    price: minPrice,
    originalPrice: raw.base_price,
    images: raw.base_images || [],
    isFeatured: raw.is_featured ?? false,
    isActive: raw.is_active ?? false,
    variants: raw.variants.map(v => ({
      id: v.id,
      product_id: raw.id,
      condition: v.condition,
      price: v.price,
      stock: v.stock || 0,
      specs: (v.specs as Record<string, any>) || {},
      images: v.images || []
    })),
    specs: {}
  };
};

// ==========================================
// 1. FEATURED PRODUCTS
// ==========================================
const getFeaturedInternal = async (): Promise<Product[]> => {
  const supabase = createStaticClient(); // ✅ Static Client
  const { data } = await supabase
    .from('products')
    .select('*, variants:product_variants(*)')
    .eq('is_active', true)
    .eq('is_featured', true)
    .limit(8);

  if (!data) return [];
  return (data as ProductWithRelations[]).map(mapToProduct);
};

export const getFeaturedProducts = cacheService(getFeaturedInternal, ['featured-products'], { tags: ['products'] });

// ==========================================
// 2. CATEGORY FEED (Homepage Rails)
// ==========================================
type FeedData = {
  grouped: Record<string, Product[]>;
  metadata: Record<string, CategoryMetaRow>;
};

const getCategoryFeedInternal = async (): Promise<FeedData> => {
  const supabase = createStaticClient(); // ✅ Static Client
  const RAIL_LIMIT = 8;

  // A. Fetch Everything (In parallel for speed)
  const [productsRes, sectionsRes, metaRes] = await Promise.all([
    supabase
        .from('products')
        .select('*, variants:product_variants(price)')
        .eq('is_active', true)
        .order('created_at', { ascending: false }),
    
    supabase
        .from('category_sections')
        .select('*')
        .eq('is_active', true)
        .order('sort_order'),

    supabase.from('category_metadata').select('*')
  ]);

  const allProducts = (productsRes.data as ProductWithRelations[] || []).map(mapToProduct);
  const sections = sectionsRes.data || [];
  
  // B. Map Metadata
  const metadataMap: Record<string, CategoryMetaRow> = {};
  metaRes.data?.forEach((m) => {
    metadataMap[m.slug.toLowerCase()] = m;
  });

  // C. Group Products
  const grouped: Record<string, Product[]> = {};

  // STRATEGY 1: Use Admin-Defined Sections (Priority)
  if (sections.length > 0) {
      sections.forEach(section => {
          // Parse Rules
          const rules = section.filter_rules as unknown as FilterRule[];
          
          // Filter Global Products against these Rules
          const matches = allProducts.filter(p => 
              // Must match the section's category scope (e.g. 'laptop')
              p.category.toLowerCase() === section.category_slug.toLowerCase() &&
              // AND match the specific rules (e.g. price < 2000)
              matchesRules(p, rules)
          );

          if (matches.length > 0) {
              // We use the category slug as the key, but we might have multiple rows for one category.
              // For the Homepage Feed, usually we just want "Laptops", "Phones".
              // If you want granular rows on Home, we'd need a different structure. 
              // For now, let's group by Category Slug, taking the best matches.
              
              if (!grouped[section.category_slug]) {
                  grouped[section.category_slug] = [];
              }
              // Add uniques only
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

  // STRATEGY 2: Fallback (Fill gaps for categories that have products but no sections)
  allProducts.forEach(p => {
      const catKey = (p.category || 'uncategorized').toLowerCase();
      if (!grouped[catKey]) {
          grouped[catKey] = [];
      }
      if (grouped[catKey].length < RAIL_LIMIT) {
          // Check if already added (unlikely here but safe)
          if (!grouped[catKey].some(ex => ex.id === p.id)) {
              grouped[catKey].push(p);
          }
      }
  });

  // Remove empty groups
  Object.keys(grouped).forEach(key => {
      if (grouped[key].length === 0) delete grouped[key];
  });

  return { grouped, metadata: metadataMap };
};

export const getCategoryFeed = cacheService(getCategoryFeedInternal, ['category-feed'], { tags: ['products', 'categories', 'layouts'] });

// ==========================================
// 3. SINGLE PRODUCT
// ==========================================
const getProductBySlugInternal = async (slug: string): Promise<Product | null> => {
  const supabase = createStaticClient(); // ✅ Static Client
  const { data } = await supabase
    .from('products')
    .select('*, variants:product_variants(*)')
    .eq('slug', slug)
    .single();

  if (!data) return null;
  return mapToProduct(data as ProductWithRelations);
};

export const getProductBySlug = cacheService(
  async (slug: string) => getProductBySlugInternal(slug),
  ['product-by-slug'], 
  { tags: ['products'], revalidate: 3600 }
);

// ==========================================
// 4. RELATED PRODUCTS
// ==========================================
const getRelatedProductsInternal = async (category: string, excludeId: string): Promise<Product[]> => {
  const supabase = createStaticClient(); // ✅ Static Client
  const { data } = await supabase
    .from('products')
    .select('*, variants:product_variants(price)')
    .eq('category', category)
    .neq('id', excludeId)
    .eq('is_active', true)
    .limit(4);

  if (!data) return [];
  
  return (data as ProductWithRelations[]).map(p => ({
    ...mapToProduct(p),
    variants: [] // Optimization: Don't need full variant details for cards
  }));
};

export const getRelatedProducts = cacheService(
  async (category: string, excludeId: string) => getRelatedProductsInternal(category, excludeId),
  ['related-products'],
  { tags: ['products'], revalidate: 3600 }
);

// ==========================================
// 5. CATEGORY PAGE DATA (The Full Layout)
// ==========================================
export type CategoryPageData = {
  products: Product[];
  sections: CategorySection[];
};

const getCategoryPageDataInternal = async (slug: string): Promise<CategoryPageData> => {
  const supabase = createStaticClient(); // ✅ Static Client

  // A. Products
  const { data: productsRaw } = await supabase
    .from('products')
    .select('*, variants:product_variants(price)')
    .eq('category', slug)
    .eq('is_active', true);

  const products = (productsRaw as ProductWithRelations[] || []).map(p => ({
     ...mapToProduct(p),
     variants: []
  }));

  // B. Layouts (Admin Configured Rows)
  const { data: sectionsRaw } = await supabase
    .from('category_sections')
    .select('*')
    .eq('category_slug', slug)
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  // Safe casting
  const sections: CategorySection[] = (sectionsRaw || []).map((s: SectionRow) => ({
      id: s.id,
      category_slug: s.category_slug,
      title: s.title,
      section_type: s.section_type as 'product_row' | 'brand_row',
      sort_order: s.sort_order || 0,
      is_active: s.is_active ?? true,
      filter_rules: (s.filter_rules as unknown as FilterRule[]) || []
  }));

  return { products, sections };
};

export const getCategoryPageData = cacheService(
  async (slug: string) => getCategoryPageDataInternal(slug),
  ['category-page-data'],
  { tags: ['products', 'layouts'], revalidate: 3600 }
);