import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase-server';

import { Database } from '@/lib/database.types';

// Components
import { Header } from '@/components/layout/Header';
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

  // 1. FETCH EVERYTHING IN ONE QUERY (Relational Join)
  const { data: storeRaw } = await supabase
    .from('stores')
    .select(`
      *,
      banners(*),
      products(*),
      content_blocks(*)
    `)
    .eq('slug', resolvedParams.site)
    .single();

  if (!storeRaw) return notFound();

  // 2. CAST DATA
  const store = storeRaw as unknown as StoreData;
  const settings = (store.settings as Record<string, string>) || {};

  // 3. ORGANIZE DATA
  const activeBanners = store.banners.filter(b => b.is_active);
  const brandBanners = activeBanners.filter(b => b.slot === 'brand_hero');
  const heroGridBanners = activeBanners.filter(b => ['main_hero', 'side_top', 'side_bottom'].includes(b.slot));
  const branchBanners = activeBanners.filter(b => b.slot === 'branch_slider');

  const featuredProducts = store.products
    .filter(p => p.is_active && p.is_featured)
    .sort((a, b) => new Date(b.created_at!).getTime() - new Date(a.created_at!).getTime())
    .slice(0, 8);

  const categories = Array.from(new Set(store.products.map(p => p.category).filter(Boolean))) as string[];

  return (
    <div className="bg-[#F8FAFC] min-h-screen font-sans">
       <style>{`:root { --primary: ${settings.theme_color || '#f97316'}; }`}</style>
       
       <Header settings={settings} categories={categories} />

       <main className="pt-20 md:pt-28 space-y-0 md:space-y-2">
         <BrandHero banners={brandBanners} storeName={store.name} />
         {heroGridBanners.length > 0 && <HeroGrid banners={heroGridBanners} />}
         <FeaturedRow products={featuredProducts} />
         {categories.slice(0, 3).map(cat => (
            <CategoryRail 
               key={cat} 
               category={cat} 
               products={store.products.filter(p => p.category === cat)} 
            />
         ))}
         <SocialGrid settings={settings} blocks={store.content_blocks} />
         <BranchSlider banners={branchBanners} settings={settings} />
         <RequestCTA settings={settings} />
       </main>

    </div>
  );
}