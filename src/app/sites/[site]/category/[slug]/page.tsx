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

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, site } = await params;
  
  // Basic decode for metadata (Service handles the real lookup logic)
  const readableTitle = decodeURIComponent(slug).replace(/-/g, ' '); 
  
  return {
    title: `Buy ${readableTitle} | ${site}`,
    description: `Shop the best ${readableTitle} deals on ${site}.`,
  };
}

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

  // B. FETCH DATA (Using the new Service Logic)
  // We pass the raw slug (e.g. "apparel-and-comfort"). 
  // The service now returns 'categoryTitle' which is the REAL DB name ("Apparel & Comfort").
  const { 
    products: legacyProducts, 
    sections: legacySections, 
    categoryTitle 
  } = await getCategoryPageData(slug, store.id);

  // C. TRANSFORM TO DB FORMAT
  // Your service returns legacy types, but client expects DB types.
  const products = legacyProducts.map((p: any) => ({
    ...p,
    base_price: p.price,
    base_images: p.images,
    is_active: true, 
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
      slug={categoryTitle} // ✅ PASS THE CORRECT NAME TO THE UI
      allProducts={products} 
      sections={sections} 
    />
  );
}