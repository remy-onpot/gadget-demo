import { supabase } from '@/lib/supabase';
import { CategoryRail } from '@/components/home/CategoryRail'; 
import { Product } from '@/lib/types';

const RAIL_LIMIT = 6;
const PRIORITY_ORDER = ['laptop', 'phone', 'gaming', 'audio', 'wearable', 'tablet'];

async function getCategoryData() {
  // 1. Fetch Products
  const { data: productsRaw } = await supabase
    .from('products')
    .select('*, images:base_images, variants:product_variants(price)')
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (!productsRaw) return { grouped: {}, metadata: {} };

  // 2. Fetch Category Metadata (Images & Labels)
  const { data: metaRaw } = await supabase
    .from('category_metadata')
    .select('*');

  // Convert metadata array to a Map for easy lookup: { 'laptop': { image_url: ... } }
  const metadataMap: Record<string, any> = {};
  metaRaw?.forEach((m: any) => {
    metadataMap[m.slug.toLowerCase()] = m;
  });

  // 3. Group Products
  const grouped: Record<string, Product[]> = {};

  productsRaw.forEach((rawProduct: any) => {
    const catKey = (rawProduct.category || 'uncategorized').toLowerCase();
    
    // Calculate Min Price
    const prices = rawProduct.variants?.map((v: any) => v.price) || [];
    const minPrice = prices.length > 0 ? Math.min(...prices) : (rawProduct.base_price || 0);

    const cleanProduct: Product = {
      ...rawProduct,
      price: minPrice,
      images: rawProduct.images || [],
      variants: rawProduct.variants || []
    };

    if (!grouped[catKey]) grouped[catKey] = [];
    if (grouped[catKey].length < RAIL_LIMIT) grouped[catKey].push(cleanProduct);
  });

  return { grouped, metadata: metadataMap };
}

export default async function CategoryFeed() {
  const { grouped, metadata } = await getCategoryData();
  
  // Sort Categories
  const categoryNames = Object.keys(grouped).sort((a, b) => {
    const indexA = PRIORITY_ORDER.indexOf(a);
    const indexB = PRIORITY_ORDER.indexOf(b);
    if (indexA !== -1 && indexB !== -1) return indexA - indexB;
    if (indexA !== -1) return -1;
    if (indexB !== -1) return 1;
    return a.localeCompare(b);
  });

  if (categoryNames.length === 0) return null;

  return (
    <div className="space-y-4">
      {categoryNames.map((cat) => (
        <CategoryRail 
           key={cat} 
           category={cat} 
           products={grouped[cat]}
           // Pass the metadata specifically for this category
           settings={metadata[cat]} 
        />
      ))}
    </div>
  );
}