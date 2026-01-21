import { createClient } from "@/lib/supabase-server"; // Use server client
// ✅ Import Layout Components
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

// Page Components
import { BrandHero } from '@/components/home/BrandHero'; 
import { HeroGrid } from '@/components/home/HeroGrid'; 
import { FeaturedRow } from '@/components/home/FeaturedRow'; 
import CategoryFeed from '@/components/shop/CategoryFeed'; 
import { BranchSlider } from '@/components/home/BranchSlider';
import { SocialGrid } from '@/components/home/SocialGrid';
import { RequestCTA } from '@/components/home/RequestCTA'; 

import { Product, Banner } from '@/lib/types'; 

export const dynamic = 'force-dynamic';

export default async function StoreHomePage({ params }: { params: { site: string } }) {
  const resolvedParams = await params;
  const supabase = await createClient();

  // 1. IDENTIFY THE STORE
  const { data: store } = await supabase
    .from('stores')
    .select('id, settings')
    .eq('slug', resolvedParams.site)
    .single();

  if (!store) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
           <div className="text-center">
             <h1 className="text-2xl font-bold text-slate-900">Store Not Found</h1>
             <p className="text-slate-500">The store "{resolvedParams.site}" does not exist.</p>
           </div>
        </div>
      );
  }

  const storeId = store.id;
  const settings = (store.settings as any) || {};

  // 2. FETCH STORE-SPECIFIC DATA (Parallel Fetch)
  const [bannersRes, productsRes, blocksRes, categoriesRes] = await Promise.all([
    // A. Banners for THIS store
    supabase.from('banners')
      .select('*')
      .eq('store_id', storeId) // <--- FILTER
      .eq('is_active', true),
    
    // B. Featured Products for THIS store
    supabase.from('products')
      .select('*, images:base_images, price:base_price') 
      .eq('store_id', storeId) // <--- FILTER
      .eq('is_active', true)
      .eq('is_featured', true) // Note: database column is usually snake_case 'is_featured'
      .order('created_at', { ascending: false })
      .limit(8),

    // C. Content Blocks for THIS store
    supabase.from('content_blocks')
      .select('*')
      .eq('store_id', storeId) // <--- FILTER
      .eq('section_key', 'home_grid'),

    // D. Categories for THIS store
    supabase.from('category_metadata')
       .select('*')
       .eq('store_id', storeId) // <--- FILTER
       .order('sort_order', { ascending: true })
  ]);

  const banners = (bannersRes.data || []) as Banner[];
  // Fix casting if needed, assuming 'price' alias works or mapping is handled in component
  const featuredProducts = (productsRes.data || []) as any[]; 
  const blocks = blocksRes.data || [];
const rawCategories = categoriesRes.data || [];
  const categorySlugs = rawCategories.map(c => c.slug); // ['laptops', 'phones']
  // Banner Filters
  const brandBanners = banners.filter(b => b.slot === 'brand_hero');
  const heroGridBanners = banners.filter(b => ['main_hero', 'side_top', 'side_bottom'].includes(b.slot));
  const branchBanners = banners.filter(b => b.slot === 'branch_slider');

  return (
    <div className="bg-[#F8FAFC] min-h-screen font-sans">
       
       {/* ✅ HEADER (Passed Store Settings) */}
       <Header settings={settings} categories={categorySlugs} />

       <main className="pt-20 md:pt-28 space-y-0 md:space-y-2">
         
         {/* Only show components if they have data (Optional Polish) */}
         {brandBanners.length > 0 && <BrandHero banners={brandBanners} />}
         
         {heroGridBanners.length > 0 && <HeroGrid banners={heroGridBanners} />}
         
         {featuredProducts.length > 0 ? (
             <FeaturedRow products={featuredProducts} />
         ) : (
             <div className="py-20 text-center text-slate-400">
               {/* Empty State for new stores */}
               <p>No featured products yet.</p>
             </div>
         )}

         <div className="space-y-4 md:space-y-6 mb-8 md:mb-12">
           {/* You need to update CategoryFeed to accept storeId too, or pass data directly */}
           <CategoryFeed storeId={storeId} /> 
         </div>

         <SocialGrid settings={settings} blocks={blocks} />
         <BranchSlider banners={branchBanners} settings={settings} />

         {/* Dynamic CTA */}
         <RequestCTA settings={settings} />

       </main>

       {/* ✅ FOOTER (Passed Store Settings) */}
       <Footer settings={settings} categories={categorySlugs} />
    </div>
  );
}