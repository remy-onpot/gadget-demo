import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase-server'; 
import { getCategoryPageData } from '@/lib/services/products';
import { CategoryClient } from '@/components/shop/CategoryClient';
import { Database } from '@/lib/database.types';

// Define DB Types
type ProductRow = Database['public']['Tables']['products']['Row'];
type SectionRow = Database['public']['Tables']['category_sections']['Row'];

interface Props {
  params: Promise<{ site: string; slug: string }>;
}

// 1. DYNAMIC METADATA
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, site } = await params;
  
  const capitalized = slug.charAt(0).toUpperCase() + slug.slice(1);
  
  return {
    title: `Buy ${capitalized}s | ${site}`,
    description: `Shop the best ${capitalized} deals on ${site}.`,
    openGraph: {
      title: `Shop Top Rated ${capitalized}s`,
      description: `Check out our curated collection of ${slug}s.`
    }
  };
}

// 2. SERVER COMPONENT
export default async function CategoryPage({ params }: Props) {
  const { site, slug } = await params;
  const supabase = await createClient();

  // A. RESOLVE STORE ID
  const { data: store } = await supabase
    .from('stores')
    .select('id')
    .eq('slug', site)
    .single();

  if (!store) return notFound();

  // B. FETCH DATA (Legacy format)
  const { products: legacyProducts, sections: legacySections } = await getCategoryPageData(slug, store.id);

  // C. TRANSFORM TO DB FORMAT
  // We map the legacy fields (price, images) to the new DB fields (base_price, base_images)
  const products = legacyProducts.map((p: any) => ({
    ...p,
    base_price: p.price,
    base_images: p.images,
    is_active: true, // Default for type satisfaction
    store_id: store.id,
    created_at: new Date().toISOString()
  })) as ProductRow[];

  const sections = legacySections.map((s: any) => ({
    ...s,
    store_id: store.id,
    created_at: new Date().toISOString(),
    is_active: true,
    sort_order: 0
  })) as SectionRow[];

  return (
    <CategoryClient 
      slug={slug} 
      allProducts={products} 
      sections={sections} 
    />
  );
}