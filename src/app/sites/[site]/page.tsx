import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase-server';
import { Database } from '@/lib/database.types';
import { generateGradientColors } from '@/lib/theme-generator';

// Components
import { BrandHero } from '@/components/home/BrandHero';
import { HeroGrid } from '@/components/home/HeroGrid';
import { FeaturedRow } from '@/components/home/FeaturedRow';
import { SocialGrid } from '@/components/home/SocialGrid';
import { BranchSlider } from '@/components/home/BranchSlider';
import { RequestCTA } from '@/components/home/RequestCTA';
import { CategoryRail } from '@/components/home/CategoryRail';

type StoreRow = Database['public']['Tables']['stores']['Row'];
type BannerRow = Database['public']['Tables']['banners']['Row'];
type BlockRow = Database['public']['Tables']['content_blocks']['Row'];

// 1. Define Product with Joined Category
type ProductWithCategory = Database['public']['Tables']['products']['Row'] & {
  categories: { name: string; slug: string } | null;
};

// Helper Interface
interface StoreData extends StoreRow {
  banners: BannerRow[];
  products: ProductWithCategory[];
  content_blocks: BlockRow[];
}

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ site: string }> }) {
  const resolvedParams = await params; 
  const supabase = await createClient();
  const { data } = await supabase.from('stores').select('name').eq('slug', resolvedParams.site).single();
  return {
    title: data?.name || 'Store',
  };
}

export default async function StoreHomePage({ params }: { params: Promise<{ site: string }> }) {
  const resolvedParams = await params; 
  const supabase = await createClient();

  // 2. Fetch Data (Deep Join)
  const { data: storeRaw } = await supabase
    .from('stores')
    .select(`
      *,
      banners(*),
      products(*, categories(name, slug)), 
      content_blocks(*)
    `)
    .eq('slug', resolvedParams.site)
    .single();

  if (!storeRaw) return notFound();

  // 3. Cast Data
  // @ts-ignore 
  const store = storeRaw as StoreData;
  
  // 3.1. Check if store is active/published
  if (!store.is_active) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Store Unavailable</h1>
          <p className="text-slate-500">This store is currently not accepting visitors. Please check back later.</p>
        </div>
      </div>
    );
  }

  const settings = (store.settings as Record<string, any>) || {};
  const glassMode = settings.glass_mode === true || settings.glass_mode === 'true';
  const themeColor = settings.theme_color || '#f97316';
  
  // Generate dynamic gradient colors from theme
  const gradientColors = generateGradientColors(themeColor);

  // 4. Organize Content
  const activeBanners = store.banners?.filter(b => b.is_active) || [];
  const brandBanners = activeBanners.filter(b => b.slot === 'brand_hero');
  const heroGridBanners = activeBanners.filter(b => ['main_hero', 'side_top', 'side_bottom'].includes(b.slot));
  const branchBanners = activeBanners.filter(b => b.slot === 'branch_slider');

  // Featured Products (Must be Active AND Featured)
  const featuredProducts = (store.products || [])
    .filter(p => p.is_active && p.is_featured)
    .sort((a, b) => new Date(b.created_at!).getTime() - new Date(a.created_at!).getTime())
    .slice(0, 8);

  // 5. Extract Unique Categories from Products (with both name and slug)
  // We use this to dynamically build the rails
  const categoryMap = new Map<string, { name: string; slug: string }>();
  store.products?.forEach(p => {
    if (p.categories?.name && p.categories?.slug) {
      categoryMap.set(p.categories.slug, { name: p.categories.name, slug: p.categories.slug });
    }
  });
  const categories = Array.from(categoryMap.values());

  return (
    <div className={`min-h-screen font-sans animate-in fade-in duration-500 ${glassMode ? `bg-gradient-to-br ${gradientColors.bg}` : 'bg-white'}`}>
       <style>{`:root { --primary: ${themeColor}; }`}</style>
       
       {/* NOTE: <Header /> is removed because 'SiteLayout' already renders it.
          This prevents the Double Header issue.
       */}

       {glassMode && (
         <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
           <div 
             className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl animate-pulse" 
             style={{ backgroundColor: gradientColors.blob1 }}
           />
           <div 
             className="absolute bottom-0 left-0 w-96 h-96 rounded-full blur-3xl animate-pulse" 
             style={{ backgroundColor: gradientColors.blob2, animationDelay: '1s' }}
           />
           <div 
             className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-3xl animate-pulse" 
             style={{ backgroundColor: gradientColors.blob3, animationDelay: '2s' }}
           />
         </div>
       )}

       <main className="space-y-0 md:space-y-2 relative z-10">
         {/* Hero Section */}
         <BrandHero banners={brandBanners} storeName={store.name} />
         
         {heroGridBanners.length > 0 && <HeroGrid banners={heroGridBanners} />}
         
         {/* Featured Row (Only shows if products exist) */}
         {featuredProducts.length > 0 && (
            <FeaturedRow products={featuredProducts} glassMode={glassMode} primaryColor={themeColor} />
         )}
         
         {/* Category Rails */}
         {categories.length > 0 ? (
            categories.slice(0, 4).map(cat => (
               <CategoryRail 
                  key={cat.slug} 
                  category={cat.name}
                  categorySlug={cat.slug}
                  glassMode={glassMode}
                  primaryColor={themeColor}
                  // Filter products by the joined Category Name
                  products={store.products.filter(p => p.categories?.slug === cat.slug)} 
               />
            ))
         ) : (
            // Fallback State if no categories found (Empty State)
            <div className="py-20 text-center text-slate-400">
               <p>No products found. Add products and assign categories in the Admin Dashboard.</p>
            </div>
         )}
         
         <SocialGrid settings={settings} blocks={store.content_blocks || []} />
         <BranchSlider banners={branchBanners} settings={settings} />
         <RequestCTA settings={settings} />
       </main>
    </div>
  );
}