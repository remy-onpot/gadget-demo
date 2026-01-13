"use client";

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { useCategory, SectionWithData } from '@/hooks/useCategory';
import { ProductCard } from '@/components/ProductCard';
import { Product } from '@/lib/types';
import { ArrowRight, Grid, LayoutList, Filter, Loader2, Plane, PackageSearch, SlidersHorizontal, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
// Import the logic engine to re-filter the full list on demand
import { matchesRules } from '@/lib/filter-engine'; 

// --- COMPONENT: BRAND ROW ---
const BrandRow = ({ products }: { products: Product[] }) => {
  const brands = Array.from(new Set(products.map(p => p.brand).filter(Boolean)));
  if (brands.length === 0) return null;

  return (
    <div className="py-8 border-b border-gray-100">
       <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 px-4">Shop by Brand</h3>
       <div className="flex gap-4 overflow-x-auto px-4 no-scrollbar">
          {brands.map(brand => (
             <button key={brand} className="min-w-[120px] h-16 bg-white border border-gray-200 rounded-xl flex items-center justify-center font-black text-slate-700 hover:border-orange-500 hover:text-orange-600 transition-all shadow-sm snap-start">
                {brand}
             </button>
          ))}
       </div>
    </div>
  );
};

// --- COMPONENT: PRODUCT ROW ---
const ProductRow = ({ section, onViewAll }: { section: SectionWithData, onViewAll: () => void }) => {
  if (section.products.length === 0) return null;

  return (
    <section className="py-10 border-b border-gray-100 last:border-0">
       <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-6">
             <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">{section.title}</h2>
                <p className="text-sm text-gray-500 mt-1 font-medium">Curated selection</p>
             </div>
             <button onClick={onViewAll} className="text-sm font-bold text-orange-600 hover:text-slate-900 flex items-center gap-1 transition-colors">
               View All <ArrowRight size={16} />
             </button>
          </div>
          <div className="flex md:grid md:grid-cols-4 gap-4 overflow-x-auto md:overflow-visible pb-4 md:pb-0 snap-x no-scrollbar">
             {section.products.map(product => (
                <div key={product.id} className="min-w-[260px] md:min-w-0 snap-start">
                   <ProductCard product={product} />
                </div>
             ))}
             <button onClick={onViewAll} className="min-w-[150px] md:hidden flex flex-col items-center justify-center bg-gray-50 rounded-2xl border border-gray-200 snap-start text-gray-500 hover:bg-orange-50 hover:text-orange-600 transition-colors">
                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm mb-2"><ArrowRight size={24} /></div>
                <span className="font-bold text-sm">See All</span>
             </button>
          </div>
       </div>
    </section>
  );
};

// --- COMPONENT: FULL GRID VIEW ---
const FullGridView = ({ title, products, onBack }: { title: string, products: Product[], onBack: () => void }) => {
  return (
    <div className="container mx-auto px-4 py-8">
       <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
             <button onClick={onBack} className="text-sm text-gray-500 hover:text-orange-600 flex items-center gap-1 mb-2 font-bold">
                <ArrowLeft size={16} /> Back to Overview
             </button>
             <h2 className="text-3xl font-black text-slate-900">{title}</h2>
             <p className="text-gray-500">{products.length} devices found</p>
          </div>
          <div className="flex gap-2">
             <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-gray-50">
                <Filter size={16} /> Filters
             </button>
          </div>
       </div>
       
       {products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
             {products.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
       ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
             <p className="text-gray-400 font-bold">No products match this exact criteria.</p>
          </div>
       )}
    </div>
  );
};

// --- MAIN PAGE ---
export default function CategoryPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const { sections, allProducts, loading, error } = useCategory(slug);

  // STATE: 
  // null = Show Curated Rows (Default)
  // object = Show Grid with specific data
  const [activeGrid, setActiveGrid] = useState<{ title: string, products: Product[] } | null>(null);

  // 🧠 SMART FILTER LOGIC
  const handleSectionViewAll = (section: SectionWithData) => {
    // 1. Take the MASTER list of products
    // 2. Re-run the rules for this specific section (but do NOT slice/limit results)
    const fullFilteredList = allProducts.filter(p => matchesRules(p, section.filter_rules));
    
    // 3. Open the grid with ONLY these items
    setActiveGrid({
      title: section.title, // e.g., "Student Picks"
      products: fullFilteredList
    });
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-slate-400" /></div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-500">Error: {error}</div>;

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-slate-900 font-sans pb-20">
       
       {/* HEADER */}
       <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
             <div className="flex items-center gap-4">
                <Link href="/" className="p-2 hover:bg-gray-100 rounded-full"><ArrowRight className="rotate-180" size={20}/></Link>
                <h1 className="text-xl font-black capitalize text-slate-900">{slug} Store</h1>
             </div>

             {/* View Toggle */}
             <div className="flex bg-gray-100 p-1 rounded-lg">
                <button 
                  onClick={() => setActiveGrid(null)} // Reset to Rows
                  className={`p-2 rounded-md transition-all ${!activeGrid ? 'bg-white shadow-sm text-slate-900' : 'text-gray-400 hover:text-gray-600'}`}
                  title="Curated View"
                >
                   <LayoutList size={18} />
                </button>
                <button 
                  onClick={() => setActiveGrid({ title: `All ${slug}s`, products: allProducts })} // Show EVERYTHING
                  className={`p-2 rounded-md transition-all ${activeGrid ? 'bg-white shadow-sm text-slate-900' : 'text-gray-400 hover:text-gray-600'}`}
                  title="Grid View (All Items)"
                >
                   <Grid size={18} />
                </button>
             </div>
          </div>
       </header>

       {/* CONTENT AREA */}
       {activeGrid ? (
         // MODE B: Specific Grid (e.g., "Student Picks" OR "All Laptops")
         <div className="animate-in fade-in duration-300 slide-in-from-bottom-4">
            <FullGridView 
               title={activeGrid.title} 
               products={activeGrid.products} 
               onBack={() => setActiveGrid(null)} 
            />
         </div>
       ) : (
         // MODE A: The Curated Rows
         <div className="animate-in fade-in duration-500">
            {sections.length === 0 ? (
               // EMPTY STATE: Pre-Order CTA
               <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
                  <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6 animate-bounce">
                     <Plane className="text-blue-600 w-10 h-10" />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-3">No devices in stock right now.</h2>
                  <p className="text-slate-500 max-w-md text-lg mb-8 leading-relaxed">
                     Looking for a specific model? We source directly from the <strong className="text-slate-900">USA</strong> and deliver to Ghana within <strong className="text-slate-900">21 days</strong>.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4">
                     <Link href="/preorder" className="bg-[#F97316] text-white px-8 py-4 rounded-xl font-bold hover:bg-orange-600 hover:scale-105 transition-all shadow-xl shadow-orange-900/20 flex items-center justify-center gap-2">
                        <PackageSearch size={20} /> Request Custom Order
                     </Link>
                     <Link href="/" className="px-8 py-4 rounded-xl font-bold text-slate-500 hover:text-slate-900 border border-transparent hover:border-gray-200 transition-all">
                        Browse Other Categories
                     </Link>
                  </div>
               </div>
            ) : (
               // RENDER ROWS
               sections.map(section => {
                  if (section.section_type === 'brand_row') {
                     return <BrandRow key={section.id} products={section.products} />;
                  }
                  return (
                     <ProductRow 
                        key={section.id} 
                        section={section} 
                        // HERE IS THE FIX: Pass logic to open Grid with filtered items
                        onViewAll={() => handleSectionViewAll(section)} 
                     />
                  );
               })
            )}
         </div>
       )}
    </div>
  );
}