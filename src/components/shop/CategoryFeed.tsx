import { createClient } from '@/lib/supabase-server';
import { CategoryRail } from '@/components/home/CategoryRail';
import { Database } from '@/lib/database.types';

// ✅ 1. Define Type with Join
// We get the full Category object attached to the product
type ProductWithCategory = Database['public']['Tables']['products']['Row'] & {
  categories: Database['public']['Tables']['categories']['Row'] | null;
};

interface CategoryFeedProps {
  storeId: string;
}

interface GroupedCategory {
  id: string;
  name: string;
  data: Database['public']['Tables']['categories']['Row'];
  products: ProductWithCategory[];
}

export default async function CategoryFeed({ storeId }: CategoryFeedProps) {
  const supabase = await createClient();

  // ✅ 2. SINGLE EFFICIENT QUERY
  // Instead of fetching metadata separately, we join the 'categories' table directly.
  const { data } = await supabase
    .from('products')
    .select(`
      *,
      categories (*) 
    `)
    .eq('store_id', storeId)
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  const products = (data || []) as ProductWithCategory[];

  if (products.length === 0) return null;

  // 3. Group Products by Category (Using the Joined Data)
  const groupedMap = new Map<string, GroupedCategory>();

  products.forEach((p) => {
    // Skip products that have broken/missing category links
    if (!p.categories) return;

    const catName = p.categories.name;
    
    // Initialize group if not exists
    if (!groupedMap.has(catName)) {
      groupedMap.set(catName, {
        id: p.categories.id,
        name: catName,
        data: p.categories, // We now have the metadata (image, subtitle) right here!
        products: []
      });
    }
    
    groupedMap.get(catName)!.products.push(p);
  });

  // 4. Sort Categories
  // Priority: 1. Database Sort Order, 2. Alphabetical
  const categories = Array.from(groupedMap.values()).sort((a, b) => {
    const orderA = a.data.sort_order ?? 999;
    const orderB = b.data.sort_order ?? 999;
    
    if (orderA !== orderB) return orderA - orderB;
    return a.name.localeCompare(b.name);
  });

  return (
    <div className="space-y-4">
      {categories.map((group) => {
        // Map the Master Table columns to the settings object
        const settings = {
            title: group.name,
            subtitle: group.data.subtitle || undefined,
            image_url: group.data.image_url || undefined
        };

        return (
           <CategoryRail 
              key={group.id} 
              category={group.name} 
              products={group.products}
              settings={settings}
           />
        );
      })}
    </div>
  );
}