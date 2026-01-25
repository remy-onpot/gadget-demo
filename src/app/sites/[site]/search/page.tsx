import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase-server';
import { Header } from '@/components/layout/Header';
import { getGlobalData } from '@/lib/services/global';
import { ProductCard } from '@/components/ProductCard';
import { Database } from '@/lib/database.types';
import { Search, PackageX } from 'lucide-react';

type Product = Database['public']['Tables']['products']['Row'];

// ✅ Define the joined type for the ProductCard
type ProductWithCategory = Product & {
  categories?: { name: string; slug: string } | null;
};

interface Props {
  params: Promise<{ site: string }>;
  searchParams: Promise<{ q?: string }>;
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { site } = await params;
  const { q } = await searchParams;
  return {
    title: q ? `Search: "${q}" | ${site}` : `Search | ${site}`,
  };
}

export default async function SearchPage({ params, searchParams }: Props) {
  const { site } = await params;
  const { q } = await searchParams;
  const query = q || '';
  
  const supabase = await createClient();

  // 1. Resolve Store
  const { data: store } = await supabase.from('stores').select('id, name').eq('slug', site).single();
  if (!store) return notFound();

  // 2. Fetch Global Data (Header/Footer)
  const { categories, settings } = await getGlobalData(store.id);

  // 3. Perform Search
  let results: ProductWithCategory[] = [];
  
  if (query) {
    const { data } = await supabase
      .from('products')
      .select('*, categories(name, slug)') // ✅ Join for Card
      .eq('store_id', store.id)
      .eq('is_active', true)
      .ilike('name', `%${query}%`) // Case-insensitive search
      .order('created_at', { ascending: false });
      
    // @ts-ignore - Safe cast for joined data
    results = (data || []) as ProductWithCategory[];
  }

  return (
    <div className="bg-[#F8FAFC] min-h-screen font-sans">
      <Header settings={settings} categories={categories} />

      <main className="container mx-auto px-4 py-12">
        <div className="mb-8">
           <h1 className="text-2xl md:text-3xl font-black text-slate-900 flex items-center gap-3">
             <Search className="text-blue-600" />
             {query ? `Results for "${query}"` : 'Search our store'}
           </h1>
           <p className="text-slate-500 font-medium mt-1">
             {results.length} {results.length === 1 ? 'result' : 'results'} found
           </p>
        </div>

        {results.length > 0 ? (
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {results.map(product => (
                 <div key={product.id} className="h-full">
                    <ProductCard product={product} />
                 </div>
              ))}
           </div>
        ) : (
           <div className="py-20 flex flex-col items-center justify-center text-center bg-white rounded-3xl border border-dashed border-gray-200">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 text-slate-300">
                 <PackageX size={32} />
              </div>
              <h3 className="text-lg font-bold text-slate-900">No matches found</h3>
              <p className="text-slate-500 max-w-md mt-2">
                 We couldn't find any products matching "{query}". Try checking your spelling or using different keywords.
              </p>
           </div>
        )}
      </main>
    </div>
  );
}