import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase-server'; 
import { ProductClient } from '@/components/product/ProductClient';
import { getProductBySlug, getRelatedProducts } from '@/lib/services/products';

interface Props {
  params: Promise<{ site: string; slug: string }>;
}

// 1. DYNAMIC METADATA (SEO)
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { site, slug } = await params;
  const supabase = await createClient();

  // Resolve Store Identity
  const { data: store } = await supabase.from('stores').select('id, name').eq('slug', site).single();
  if (!store) return {};

  // Fetch Product for Meta Tags
  const product = await getProductBySlug(slug, store.id);
  if (!product) return { title: 'Product Not Found' };

  return {
    title: `${product.name} | ${store.name}`,
    description: product.description?.slice(0, 160),
    openGraph: {
      images: product.images[0] ? [product.images[0]] : [],
    },
  };
}

// 2. SERVER COMPONENT (The Orchestrator)
export default async function ProductPage({ params }: Props) {
  const { site, slug } = await params;
  const supabase = await createClient();

  // A. IDENTITY RESOLUTION (Subdomain -> Store ID)
  const { data: store } = await supabase
    .from('stores')
    .select('id, settings')
    .eq('slug', site)
    .single();

  if (!store) return notFound();

  // B. FETCH MAIN PRODUCT
  // We use the cached service we built earlier
  const product = await getProductBySlug(slug, store.id);
  if (!product) return notFound();

  // C. PARALLEL FETCH (Extras)
  const [related, reviews, view360] = await Promise.all([
    // 1. Related Products
    getRelatedProducts(product.category, product.id, store.id),
    
    // 2. Verified Reviews (New Feature)
    supabase
      .from('reviews')
      .select('*')
      .eq('product_id', product.id)
      .order('created_at', { ascending: false }),

    // 3. 360 View Frames (New Feature)
    supabase
      .from('product_360_sets')
      .select('frame_urls')
      .eq('product_id', product.id)
      .maybeSingle()
  ]);

  // D. RENDER CLIENT COMPONENT
  // We pass all data as props so the client is instant interactive
  return (
    <ProductClient 
      storeSlug={site}
      product={product} 
      relatedItems={related}
      reviews={reviews.data || []}
      frames360={view360.data?.frame_urls || null}
    />
  );
}