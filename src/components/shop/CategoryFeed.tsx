import { CategoryRail } from '@/components/home/CategoryRail'; 
import { getCategoryFeed } from '@/lib/services/products';

export default async function CategoryFeed() {
  // 1. Instant Fetch (Cached)
  const { grouped, metadata } = await getCategoryFeed();
  
  // 2. DYNAMIC SORT
  // Priority: 
  // A. Database Sort Order (if available in metadata)
  // B. Alphabetical (fallback)
  const categoryNames = Object.keys(grouped).sort((a, b) => {
    // Get sort_order from metadata, default to 999 (bottom) if missing
    const orderA = metadata[a]?.sort_order ?? 999;
    const orderB = metadata[b]?.sort_order ?? 999;

    // If both have explicit sorting, use it
    if (orderA !== orderB) {
        return orderA - orderB;
    }

    // Otherwise, alphabetical
    return a.localeCompare(b);
  });

  if (categoryNames.length === 0) return null;

  return (
    <div className="space-y-4">
      {categoryNames.map((cat) => {
        const meta = metadata[cat];
        
        // Prepare settings object, converting nulls to undefined for React props
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