import { CategoryRail } from '@/components/home/CategoryRail'; 
import { getCategoryFeed } from '@/lib/services/products';

interface CategoryFeedProps {
  storeId: string;
}

export default async function CategoryFeed({ storeId }: CategoryFeedProps) {
  // 1. Fetch with Store ID
  const { grouped, metadata } = await getCategoryFeed(storeId);
  
  // 2. DYNAMIC SORT
  const categoryNames = Object.keys(grouped).sort((a, b) => {
    const orderA = metadata[a]?.sort_order ?? 999;
    const orderB = metadata[b]?.sort_order ?? 999;

    if (orderA !== orderB) {
        return orderA - orderB;
    }
    return a.localeCompare(b);
  });

  if (categoryNames.length === 0) return null;

  return (
    <div className="space-y-4">
      {categoryNames.map((cat) => {
        const meta = metadata[cat];
        
        const cleanSettings = meta ? {
            title: meta.title || undefined,
            subtitle: meta.subtitle || undefined,
            image_url: meta.image_url || undefined,
        } : undefined;

        return (
            <CategoryRail 
               key={cat} 
               category={cat} 
               products={grouped[cat]}
               settings={cleanSettings} 
            />
        );
      })}
    </div>
  );
}