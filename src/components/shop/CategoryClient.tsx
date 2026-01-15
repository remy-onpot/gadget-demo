'use client';

import React, { useState } from 'react';
import { Product, CategorySection, FilterRule } from '@/lib/types'; // ✅ Import Types
import { matchesRules } from '@/lib/filter-engine'; 
import { ProductCard } from '@/components/ProductCard';
import { ArrowRight, Grid, LayoutList, Filter, ArrowLeft, Plane, PackageSearch } from 'lucide-react';
import Link from 'next/link';

// --- SUB-COMPONENTS ---
// (BrandRow remains the same)

const ProductRow = ({ title, products, onViewAll }: { title: string, products: Product[], onViewAll: () => void }) => {
  if (products.length === 0) return null;
  // ... (render logic remains same) ...
  return (
    <section className="py-10 border-b border-gray-100 last:border-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
       <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-6">
             <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">{title}</h2>
                <p className="text-sm text-gray-500 mt-1 font-medium">Curated selection</p>
             </div>
             <button onClick={onViewAll} className="text-sm font-bold text-orange-600 hover:text-slate-900 flex items-center gap-1 transition-colors">
               View All <ArrowRight size={16} />
             </button>
          </div>
          <div className="flex md:grid md:grid-cols-4 gap-4 overflow-x-auto md:overflow-visible pb-4 md:pb-0 snap-x no-scrollbar">
             {products.slice(0, 4).map(product => (
                <div key={product.id} className="min-w-[260px] md:min-w-0 snap-start">
                   <ProductCard product={product} />
                </div>
             ))}
             {/* ... Mobile See All Button ... */}
          </div>
       </div>
    </section>
  );
};

// (FullGridView remains the same)

// --- MAIN CLIENT COMPONENT ---
interface CategoryClientProps {
    slug: string;
    allProducts: Product[];
    sections: CategorySection[]; // ✅ Strictly Typed
}

export function CategoryClient({ slug, allProducts, sections }: CategoryClientProps) {
  const [activeGrid, setActiveGrid] = useState<{ title: string, products: Product[] } | null>(null);

  // Logic: Map raw sections to processed sections
  const processedSections = sections.map(section => ({
     ...section,
     // matchesRules now expects Product and FilterRule[], which we strictly provide
     products: allProducts.filter(p => matchesRules(p, section.filter_rules || []))
  }));

  // ✅ Strictly typed 'rules' argument
  const handleSectionViewAll = (title: string, rules: FilterRule[]) => {
    const fullFilteredList = allProducts.filter(p => matchesRules(p, rules));
    setActiveGrid({ title, products: fullFilteredList });
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-slate-900 font-sans pb-20">
       {/* ... Header ... */}

       {/* CONTENT */}
       {activeGrid ? (
         // FullGridView Logic
         <div className="container mx-auto px-4 py-8 animate-in zoom-in-95 duration-300">
             {/* ... (Same grid view UI) ... */}
             <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <button onClick={() => setActiveGrid(null)} className="text-sm text-gray-500 hover:text-orange-600 flex items-center gap-1 mb-2 font-bold">
                    <ArrowLeft size={16} /> Back to Overview
                </button>
                <h2 className="text-3xl font-black text-slate-900">{activeGrid.title}</h2>
             </div>
             <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {activeGrid.products.map(p => <ProductCard key={p.id} product={p} />)}
             </div>
         </div>
       ) : (
         <div>
            {processedSections.length === 0 ? (
               // Empty State
               <div className="flex flex-col items-center justify-center py-24 px-4 text-center animate-in zoom-in-95">
                  <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6 animate-bounce">
                     <Plane className="text-blue-600 w-10 h-10" />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-3">No devices in stock.</h2>
                  <p className="text-slate-500 max-w-md text-lg mb-8 leading-relaxed">We source directly from the USA.</p>
                  <Link href="/preorder" className="bg-[#F97316] text-white px-8 py-4 rounded-xl font-bold flex items-center gap-2 hover:scale-105 transition-transform">
                     <PackageSearch size={20} /> Request Order
                  </Link>
               </div>
            ) : (
               processedSections.map(section => {
                  // Type guard for section_type
                  if (section.section_type === 'brand_row') return <div key={section.id}>{/* BrandRow Logic */}</div>;
                  
                  return (
                     <ProductRow 
                        key={section.id} 
                        title={section.title}
                        products={section.products} 
                        onViewAll={() => handleSectionViewAll(section.title, section.filter_rules)} 
                     />
                  );
               })
            )}
         </div>
       )}
    </div>
  );
}