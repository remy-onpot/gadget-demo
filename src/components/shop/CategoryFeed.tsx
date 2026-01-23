import { createClient } from '@/lib/supabase-server';
import { CategoryRail } from '@/components/home/CategoryRail';
import { Database } from '@/lib/database.types';

type ProductRow = Database['public']['Tables']['products']['Row'];
type CategoryMetaRow = Database['public']['Tables']['category_metadata']['Row'];

interface CategoryFeedProps {
  storeId: string;
}

export default async function CategoryFeed({ storeId }: CategoryFeedProps) {
  const supabase = await createClient();

  // 2. Fetch Products & Metadata in Parallel
  const [productsRes, metaRes] = await Promise.all([
    supabase
      .from('products')
      .select('*')
      .eq('store_id', storeId)
      .eq('is_active', true)
      .order('created_at', { ascending: false }),
    
    supabase
      .from('category_metadata')
      .select('*')
      .eq('store_id', storeId)
  ]);

  const products = (productsRes.data || []) as ProductRow[];
  const metaData = (metaRes.data || []) as CategoryMetaRow[];

  if (products.length === 0) return null;

  // 3. Group Products by Category
  const grouped: Record<string, ProductRow[]> = {};
  products.forEach((p) => {
    if (!p.category) return;
    if (!grouped[p.category]) grouped[p.category] = [];
    grouped[p.category].push(p);
  });

  // 4. Create Metadata Map for easy lookup
  const metaMap = metaData.reduce((acc, item) => {
    acc[item.slug] = item;
    return acc;
  }, {} as Record<string, CategoryMetaRow>);

  // 5. Sort Categories
  // Priority: 1. Metadata Sort Order, 2. Alphabetical
  const categories = Object.keys(grouped).sort((a, b) => {
    const orderA = metaMap[a]?.sort_order ?? 999;
    const orderB = metaMap[b]?.sort_order ?? 999;
    if (orderA !== orderB) return orderA - orderB;
    return a.localeCompare(b);
  });

  return (
    <div className="space-y-4">
      {categories.map((cat) => {
        const meta = metaMap[cat];
        
        // Map DB metadata to the shape CategoryRail expects
        const settings = meta ? {
            title: meta.title || undefined,
            subtitle: meta.subtitle || undefined,
            image_url: meta.image_url || undefined
        } : undefined;

        return (
           <CategoryRail 
              key={cat} 
              category={cat} 
              products={grouped[cat]}
              settings={settings}
           />
        );
      })}
    </div>
  );
}