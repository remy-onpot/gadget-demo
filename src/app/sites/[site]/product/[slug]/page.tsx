import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase-server'; 
import { ProductClient, ProductWithRelations } from '@/components/product/ProductClient';
import { Database } from '@/lib/database.types';

type ProductRow = Database['public']['Tables']['products']['Row'];

interface Props {
  params: Promise<{ site: string; slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { site, slug } = await params;
  const supabase = await createClient();

  const { data: store } = await supabase.from('stores').select('id, name').eq('slug', site).single();
  if (!store) return {};

  const { data: product } = await supabase
    .from('products')
    .select('name, description, base_images')
    .eq('store_id', store.id)
    .eq('slug', slug)
    .single();

  if (!product) return { title: 'Product Not Found' };

  return {
    title: `${product.name} | ${store.name}`,
    description: product.description?.slice(0, 160),
    openGraph: {
      images: product.base_images && product.base_images[0] ? [product.base_images[0]] : [],
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { site, slug } = await params;
  const supabase = await createClient();

  // A. IDENTITY RESOLUTION
  const { data: store } = await supabase
    .from('stores')
    .select('id, settings')
    .eq('slug', site)
    .single();

  if (!store) return notFound();

  // B. FETCH MAIN PRODUCT (With Variants AND Category)
  const { data: productRaw } = await supabase
    .from('products')
    .select(`
      *,
      variants:product_variants(*),
      categories(name, slug)
    `)
    .eq('store_id', store.id)
    .eq('slug', slug)
    .single();

  if (!productRaw) return notFound();

  const product = productRaw as unknown as ProductWithRelations;

  // C. PARALLEL FETCH (Extras)
  const [related, reviews, view360] = await Promise.all([
    // 1. Related Products (✅ FIX: Only run if category_id exists)
    product.category_id 
      ? supabase
          .from('products')
          .select(`
            *,
            variants:product_variants(*),
            categories(name, slug)
          `)
          .eq('store_id', store.id)
          .eq('category_id', product.category_id) // TS is happy now
          .neq('id', product.id)
          .limit(4)
      : Promise.resolve({ data: [] }), // Fallback for uncategorized items
    
    // 2. Verified Reviews
    supabase
      .from('reviews')
      .select('*')
      .eq('product_id', product.id)
      .order('created_at', { ascending: false }),

    // 3. 360 View Frames
    supabase
      .from('product_360_sets')
      .select('frame_urls')
      .eq('product_id', product.id)
      .maybeSingle()
  ]);

  return (
    <ProductClient 
      storeSlug={site}
      product={product} 
      // Cast related items to the correct joined type
      relatedItems={(related.data as unknown as ProductWithRelations[]) || []}
      reviews={reviews.data || []}
      frames360={view360.data?.frame_urls || null}
    />
  );
}