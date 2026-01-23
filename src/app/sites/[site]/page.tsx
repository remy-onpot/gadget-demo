import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase-server';

import { Database } from '@/lib/database.types';

// Components
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { BrandHero } from '@/components/home/BrandHero';
import { HeroGrid } from '@/components/home/HeroGrid';
import { FeaturedRow } from '@/components/home/FeaturedRow';
import { SocialGrid } from '@/components/home/SocialGrid';
import { BranchSlider } from '@/components/home/BranchSlider';
import { RequestCTA } from '@/components/home/RequestCTA';
import { CategoryRail } from '@/components/home/CategoryRail';

type StoreRow = Database['public']['Tables']['stores']['Row'];
type BannerRow = Database['public']['Tables']['banners']['Row'];
type ProductRow = Database['public']['Tables']['products']['Row'];
type BlockRow = Database['public']['Tables']['content_blocks']['Row'];

// Helper Interface
interface StoreData extends StoreRow {
  banners: BannerRow[];
  content_blocks: BlockRow[];
  // Note: We removed 'products' from here because we fetch them separately now
}

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: { site: string } }) {
  const supabase = await createClient();
  const { data } = await supabase.from('stores').select('name').eq('slug', params.site).single();
  return {
    title: data?.name || 'Store',
  };
}

export default async function StoreHomePage({ params }: { params: { site: string } }) {
  const supabase = await createClient();

  // 1. FETCH STORE CORE DATA (Fast)
  // We removed 'products(*)' from this query to prevent the "Product Dump" crash.
  const { data: storeRaw } = await supabase
    .from('stores')
    .select(`
      *,
      banners(*),
      content_blocks(*)
    `)
    .eq('slug', params.site)
    .single();

  if (!storeRaw) return notFound();

  const store = storeRaw as unknown as StoreData;
  const settings = (store.settings as Record<string, string>) || {};

  // 2. PARALLEL PRODUCT FETCHING (Scalable)
  // We fetch only what we need for the homepage, limiting the rows.
  const [featuredRes, latestRes] = await Promise.all([
    // A. Get top 8 featured items
    supabase
      .from('products')
      .select('*')
      .eq('store_id', store.id)
      .eq('is_active', true)
      .eq('is_featured', true)
      .order('created_at', { ascending: false })
      .limit(8),

    // B. Get 12 latest items (to discover categories/populate rails)
    supabase
      .from('products')
      .select('*')
      .eq('store_id', store.id)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(12)
  ]);

  const featuredProducts = (featuredRes.data as ProductRow[]) || [];
  const latestProducts = (latestRes.data as ProductRow[]) || [];

  // 3. ORGANIZE DATA
  
  // Banners
  const activeBanners = store.banners?.filter(b => b.is_active) || [];
  const brandBanners = activeBanners.filter(b => b.slot === 'brand_hero');
  const heroGridBanners = activeBanners.filter(b => ['main_hero', 'side_top', 'side_bottom'].includes(b.slot));
  const branchBanners = activeBanners.filter(b => b.slot === 'branch_slider');

  // Categories
  // We derive categories from the products we actually fetched. 
  // (In the future, you should switch to fetching from the 'category_metadata' table directly)
  const allFetchedProducts = [...featuredProducts, ...latestProducts];
  const categories = Array.from(new Set(allFetchedProducts.map(p => p.category).filter(Boolean))) as string[];

  return (
    <div className="bg-[#F8FAFC] min-h-screen font-sans">
      
       {/* Inject CSS Variable for Store Theme */}
       <style>{`:root { --primary: ${settings.theme_color || '#f97316'}; }`}</style>
       
       {/* HEADER */}
       <Header settings={settings} categories={categories} />

       <main className="pt-20 md:pt-28 space-y-0 md:space-y-2">
         
         {/* A. Brand Hero */}
         <BrandHero banners={brandBanners} storeName={store.name} />
         
         {/* B. Hero Grid */}
         {heroGridBanners.length > 0 && <HeroGrid banners={heroGridBanners} />}
         
         {/* C. Featured Products */}
         <FeaturedRow products={featuredProducts} />

         {/* D. Category Rails */}
         {/* We filter the 'latestProducts' to populate these rails */}
         {categories.slice(0, 3).map(cat => (
            <CategoryRail 
               key={cat} 
               category={cat} 
               products={latestProducts.filter(p => p.category === cat)} 
            />
         ))}

         {/* E. Social Grid */}
         <SocialGrid settings={settings} blocks={store.content_blocks} />
         
         {/* F. Branch/Location Slider */}
         <BranchSlider banners={branchBanners} settings={settings} />

         {/* G. Request CTA */}
         <RequestCTA settings={settings} />

       </main>

       {/* FOOTER */}
       <Footer settings={settings} categories={categories} />
    </div>
  );
}