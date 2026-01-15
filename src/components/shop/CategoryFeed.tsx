import { CategoryRail } from '@/components/home/CategoryRail'; 
import { getCategoryFeed } from '@/lib/services/products';

const PRIORITY_ORDER = ['laptop', 'phone', 'gaming', 'audio', 'wearable', 'tablet'];

export default async function CategoryFeed() {
  // 1. Instant Fetch (Cached)
  const { grouped, metadata } = await getCategoryFeed();
  
  // 2. Sort Categories
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
      {categoryNames.map((cat) => {
        const meta = metadata[cat];
        
        // FIX: Clean the data. Convert DB 'null' to JS 'undefined'.
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