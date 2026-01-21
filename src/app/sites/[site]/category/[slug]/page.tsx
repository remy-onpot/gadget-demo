import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase-server'; 
import { getCategoryPageData } from '@/lib/services/products';
import { CategoryClient } from '@/components/shop/CategoryClient';

interface Props {
  params: Promise<{ site: string; slug: string }>; // Updated to 'slug' to match your folder structure
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

  // ✅ FIX: Added 'await' here
  const supabase = await createClient();

  // A. RESOLVE STORE ID (Identity Step)
  const { data: store } = await supabase
    .from('stores')
    .select('id')
    .eq('slug', site)
    .single();

  if (!store) return notFound();

  // B. FETCH DATA (Pass store.id)
  const { products, sections } = await getCategoryPageData(slug, store.id);

  return (
    <CategoryClient 
      slug={slug} 
      allProducts={products} 
      sections={sections} 
    />
  );
}