import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase-server';
import { getGlobalData } from '@/lib/services/global'; // Still needed for content
import { Store } from 'lucide-react';

interface Props {
  params: Promise<{ site: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { site } = await params;
  return { title: `About Us | ${site}` };
}

export default async function AboutPage({ params }: Props) {
  const { site } = await params;
  const supabase = await createClient();

  // 1. Resolve Store ID
  const { data: store } = await supabase.from('stores').select('id, name').eq('slug', site).single();
  if (!store) return notFound();

  // 2. Fetch Settings (Only for the description text)
  const { settings } = await getGlobalData(store.id);

  return (
    <div className="container mx-auto px-4 py-12 md:py-20 max-w-4xl">
       <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100">
          {/* Hero Section */}
          <div className="h-48 md:h-64 bg-slate-900 relative flex items-center justify-center">
             <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
             <Store className="text-white/20 w-32 h-32 absolute z-0" />
             <h1 className="text-4xl md:text-5xl font-black text-white relative z-20">About Us</h1>
          </div>

          {/* Content Section */}
          <div className="p-8 md:p-12">
             <div className="prose prose-slate max-w-none prose-lg">
                <p className="lead font-bold text-xl text-slate-900 mb-6">
                   Welcome to {store.name}.
                </p>
                <div className="whitespace-pre-line text-slate-600 leading-relaxed">
                   {settings.site_description ? settings.site_description : (
                      <span className="italic text-slate-400">The store owner has not added a description yet.</span>
                   )}
                </div>
             </div>
          </div>
       </div>
    </div>
  );
}