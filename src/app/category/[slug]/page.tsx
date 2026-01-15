import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getCategoryPageData } from '@/lib/services/products';
import { CategoryClient } from '@/components/shop/CategoryClient';
import { ProductCardSkeleton } from '@/components/skeletons/ProductCardSkeleton';
interface Props {
  params: Promise<{ slug: string }>;
}

// 1. DYNAMIC METADATA (Crucial for SEO)
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const capitalized = slug.charAt(0).toUpperCase() + slug.slice(1);
  
  return {
    title: `Buy ${capitalized}s in Ghana | Best Prices`,
    description: `Shop the best ${capitalized} deals. Brand new & UK used options available. Fast delivery in Accra.`,
    openGraph: {
      title: `Shop Top Rated ${capitalized}s`,
      description: `Check out our curated collection of ${slug}s.`
    }
  };
}

// 2. SERVER COMPONENT
export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;

  // Fetch Data (Cached)
  const { products, sections } = await getCategoryPageData(slug);

  // If literally nothing exists (no product, no layout), maybe 404? 
  // But usually better to show empty state, so we pass empty arrays.
  
  return (
    <CategoryClient 
      slug={slug} 
      allProducts={products} 
      sections={sections} 
    />
  );
}
