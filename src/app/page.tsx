import { supabase } from '@/lib/supabase';
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
import { getGlobalData } from '@/lib/services/global'; // ✅ Use unified fetcher

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  
  // 1. FETCH GLOBAL DATA (Settings + Categories for Header/Footer)
  const { settings, categories } = await getGlobalData();

  // 2. FETCH PAGE SPECIFIC DATA
  const [bannersRes, productsRes, blocksRes] = await Promise.all([
    supabase.from('banners').select('*').eq('is_active', true),
    
    supabase.from('products')
      .select('*, images:base_images, price:base_price') 
      .eq('is_active', true)
      .eq('isFeatured', true) 
      .order('created_at', { ascending: false })
      .limit(4),

    // Grid content blocks for SocialGrid
    supabase.from('content_blocks').select('*').eq('section_key', 'home_grid')
  ]);

  const banners = (bannersRes.data || []) as Banner[];
  const featuredProducts = (productsRes.data || []) as Product[];
  const blocks = blocksRes.data || [];

  // Banner Filters
  const brandBanners = banners.filter(b => b.slot === 'brand_hero');
  const heroGridBanners = banners.filter(b => ['main_hero', 'side_top', 'side_bottom'].includes(b.slot));
  const branchBanners = banners.filter(b => b.slot === 'branch_slider');

  return (
    <div className="bg-[#F8FAFC] min-h-screen font-sans">
       
       {/* ✅ HEADER ADDED HERE */}
       <Header settings={settings} categories={categories} />

       <main className="pt-20 md:pt-28 space-y-0 md:space-y-2">
         
         <BrandHero banners={brandBanners} />
         <HeroGrid banners={heroGridBanners} />
         <FeaturedRow products={featuredProducts} />

         <div className="space-y-4 md:space-y-6 mb-8 md:mb-12">
           <CategoryFeed />
         </div>

         <SocialGrid settings={settings} blocks={blocks} />
         <BranchSlider banners={branchBanners} settings={settings} />

         {/* Dynamic CTA */}
         <RequestCTA settings={settings} />

       </main>

       {/* ✅ FOOTER ADDED HERE */}
       <Footer settings={settings} categories={categories} />
    </div>
  );
}