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

// Helper Interface for the Join Query
interface StoreData extends StoreRow {
  banners: BannerRow[];
  products: ProductRow[];
  content_blocks: BlockRow[];
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

  // 1. FETCH EVERYTHING IN ONE QUERY (Relational Join)
  // We fetch the store and ask for its banners, products, and blocks immediately.
  const { data: storeRaw } = await supabase
    .from('stores')
    .select(`
      *,
      banners(*),
      products(*),
      content_blocks(*)
    `)
    .eq('slug', params.site)
    .single();

  if (!storeRaw) return notFound();

  // 2. CAST DATA
  // We cast this to our helper interface so TypeScript knows 'store.banners' is an array of BannerRow
  const store = storeRaw as unknown as StoreData;
  const settings = (store.settings as Record<string, string>) || {};

  // 3. ORGANIZE DATA
  
  // Banners
  const activeBanners = store.banners.filter(b => b.is_active);
  const brandBanners = activeBanners.filter(b => b.slot === 'brand_hero');
  const heroGridBanners = activeBanners.filter(b => ['main_hero', 'side_top', 'side_bottom'].includes(b.slot));
  const branchBanners = activeBanners.filter(b => b.slot === 'branch_slider'); // or pass all to BranchSlider, it has internal logic now

  // Products
  // In the future, you can filter by store.products.filter(p => p.is_featured) here
  const featuredProducts = store.products
    .filter(p => p.is_active && p.is_featured)
    .sort((a, b) => new Date(b.created_at!).getTime() - new Date(a.created_at!).getTime())
    .slice(0, 8);

  // Categories (Extract Unique Categories from Products)
  const categories = Array.from(new Set(store.products.map(p => p.category).filter(Boolean))) as string[];

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

         {/* D. Category Rails (Replaces CategoryFeed for now) */}
         {categories.slice(0, 3).map(cat => (
            <CategoryRail 
               key={cat} 
               category={cat} 
               products={store.products.filter(p => p.category === cat)} 
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