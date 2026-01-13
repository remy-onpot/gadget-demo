"use client";

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Search, Filter, Edit, Trash2, 
  AlertCircle, CheckCircle, Package, Layers, Plus,
  LayoutGrid, ChevronRight, Loader2
} from 'lucide-react';
import { Product } from '@/lib/types';
import { ProductForm } from '@/components/admin/ProductForm';

// --- TYPES ---
interface InventoryProduct extends Omit<Product, 'variants'> {
  base_images: string[]; 
  product_variants: {
    id: string;
    stock: number;
    price: number;
    condition: string;
  }[];
  totalStock: number;
  minPrice: number;
  maxPrice: number;
}

export default function InventoryPage() {
  // State
  const [products, setProducts] = useState<InventoryProduct[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('All'); // Default View
  
  const [loading, setLoading] = useState(true);
  const [loadingCats, setLoadingCats] = useState(true);
  
  const [search, setSearch] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editingProduct, setEditingProduct] = useState<InventoryProduct | null>(null);

  // 1. INITIAL LOAD: Fetch only Category Names (Lightweight)
  useEffect(() => {
    const fetchCategories = async () => {
      setLoadingCats(true);
      const { data } = await supabase.from('products').select('category');
      if (data) {
        // Extract unique categories
        const unique = Array.from(new Set(data.map(item => item.category || 'Uncategorized')));
        setCategories(unique.sort());
      }
      setLoadingCats(false);
    };
    fetchCategories();
  }, []);

  // 2. LAZY FETCH: Triggered when Active Category changes
  useEffect(() => {
    fetchProducts(activeCategory);
  }, [activeCategory]);

  const fetchProducts = async (category: string) => {
    setLoading(true);
    
    let query = supabase
      .from('products')
      .select(`
        *,
        product_variants ( id, stock, price, condition )
      `)
      .order('created_at', { ascending: false });

    // OPTIMIZATION: Only fetch specific category data
    if (category !== 'All') {
      query = query.eq('category', category);
    } else {
      // If 'All', limit to 50 recent items to prevent massive payloads
      query = query.limit(50);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error:", error);
    } else if (data) {
      // Process Data
      const processed: InventoryProduct[] = data.map((p: any) => {
        const variants = p.product_variants || [];
        const prices = variants.map((v: any) => v.price);
        
        return {
          ...p,
          base_images: p.base_images || [],
          product_variants: variants,
          totalStock: variants.reduce((sum: number, v: any) => sum + v.stock, 0),
          minPrice: prices.length > 0 ? Math.min(...prices) : (p.base_price || 0),
          maxPrice: prices.length > 0 ? Math.max(...prices) : (p.base_price || 0)
        };
      });
      setProducts(processed);
    }
    setLoading(false);
  };

  // 3. SERVER-SIDE SEARCH (Overrides Category Filter)
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!search.trim()) return fetchProducts(activeCategory);

    setLoading(true);
    const { data } = await supabase
      .from('products')
      .select(`*, product_variants ( id, stock, price, condition )`)
      .ilike('name', `%${search}%`); // Search across all categories

    if (data) {
       // ... (Same processing logic as above) ...
       const processed = data.map((p: any) => ({
          ...p,
          base_images: p.base_images || [],
          product_variants: p.product_variants || [],
          totalStock: (p.product_variants || []).reduce((sum: number, v: any) => sum + v.stock, 0),
          minPrice: p.base_price || 0,
          maxPrice: p.base_price || 0
       }));
       setProducts(processed as InventoryProduct[]);
       setActiveCategory('Search Results');
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete product and all variants?")) return;
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (!error) setProducts(prev => prev.filter(p => p.id !== id));
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 h-[calc(100vh-4rem)]">
      
      {/* LEFT SIDEBAR: Categories */}
      <aside className="w-full md:w-64 flex-shrink-0 bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col h-full shadow-sm">
         <div className="p-4 bg-slate-50 border-b border-slate-200 font-black text-slate-500 uppercase text-xs tracking-wider">
            Categories
         </div>
         <div className="flex-1 overflow-y-auto p-2 space-y-1">
            <button 
              onClick={() => setActiveCategory('All')}
              className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold flex justify-between items-center transition ${activeCategory === 'All' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              <div className="flex items-center gap-2"><LayoutGrid size={16}/> All Items</div>
              {activeCategory === 'All' && <ChevronRight size={14}/>}
            </button>
            
            {loadingCats && <div className="p-4 text-center"><Loader2 className="animate-spin text-slate-300 mx-auto"/></div>}
            
            {categories.map(cat => (
               <button 
                 key={cat}
                 onClick={() => { setSearch(''); setActiveCategory(cat); }}
                 className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold flex justify-between items-center transition capitalize ${activeCategory === cat ? 'bg-orange-500 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'}`}
               >
                 {cat}
                 {activeCategory === cat && <ChevronRight size={14}/>}
               </button>
            ))}
         </div>
         <div className="p-4 border-t border-slate-100">
            <button 
              onClick={() => setIsEditing(true)}
              className="w-full bg-[#0A2540] text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition"
            >
              <Plus size={18} /> Add Product
            </button>
         </div>
      </aside>

      {/* RIGHT CONTENT: Table */}
      <div className="flex-1 flex flex-col h-full min-w-0">
         
         {/* Top Bar */}
         <div className="flex items-center justify-between mb-4 bg-white p-2 pl-4 pr-2 rounded-2xl border border-slate-200 shadow-sm">
            <h2 className="font-black text-xl text-slate-800 capitalize flex items-center gap-2">
               {activeCategory} <span className="text-slate-400 font-medium text-sm">({products.length})</span>
            </h2>
            <form onSubmit={handleSearch} className="relative w-64 md:w-96">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16}/>
               <input 
                 className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 text-sm focus:bg-white focus:border-orange-500 outline-none transition-all"
                 placeholder="Search SKU or Name..."
                 value={search}
                 onChange={(e) => setSearch(e.target.value)}
               />
            </form>
         </div>

         {/* Table Area */}
         <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col relative">
            
            {loading && (
               <div className="absolute inset-0 z-10 bg-white/80 backdrop-blur-sm flex items-center justify-center">
                  <div className="flex flex-col items-center gap-3">
                     <Loader2 className="animate-spin text-orange-500" size={32} />
                     <span className="font-bold text-slate-500">Fetching {activeCategory}...</span>
                  </div>
               </div>
            )}

            <div className="flex-1 overflow-auto">
               <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 z-0">
                     <tr>
                        <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">Product</th>
                        <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">Inventory</th>
                        <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">Pricing</th>
                        <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider text-right">Actions</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                     {products.map((product) => (
                        <tr key={product.id} className="hover:bg-slate-50/80 transition-colors group">
                           <td className="px-6 py-4">
                              <div className="flex items-center gap-4">
                                 <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 flex-shrink-0 overflow-hidden">
                                    {product.base_images?.[0] ? (
                                      <img src={product.base_images[0]} className="w-full h-full object-cover" />
                                    ) : <div className="w-full h-full flex items-center justify-center text-slate-300"><Package size={16}/></div>}
                                 </div>
                                 <div>
                                    <h4 className="font-bold text-slate-900 text-sm">{product.name}</h4>
                                    <div className="flex gap-2 text-[10px] font-bold uppercase mt-0.5">
                                       <span className="text-slate-500">{product.brand}</span>
                                       <span className="text-blue-500">{product.category}</span>
                                    </div>
                                 </div>
                              </div>
                           </td>
                           <td className="px-6 py-4">
                              <div className="space-y-1">
                                 <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-bold ${product.totalStock > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                                    {product.totalStock} Units
                                 </div>
                                 <div className="text-xs text-slate-400 pl-1 flex items-center gap-1">
                                    <Layers size={12}/> {product.product_variants.length} Variants
                                 </div>
                              </div>
                           </td>
                           <td className="px-6 py-4">
                              <div className="font-mono font-bold text-slate-700 text-sm">
                                 {product.minPrice === product.maxPrice 
                                   ? `₵${product.minPrice.toLocaleString()}` 
                                   : `₵${product.minPrice.toLocaleString()} - ₵${product.maxPrice.toLocaleString()}`
                                 }
                              </div>
                           </td>
                           <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                 <button onClick={() => { setEditingProduct(product); setIsEditing(true); }} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                    <Edit size={16}/>
                                 </button>
                                 <button onClick={() => handleDelete(product.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                    <Trash2 size={16}/>
                                 </button>
                              </div>
                           </td>
                        </tr>
                     ))}
                     {!loading && products.length === 0 && (
                        <tr>
                           <td colSpan={4} className="p-20 text-center">
                              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                                 <Package size={32}/>
                              </div>
                              <p className="text-slate-400 font-bold">No products found in "{activeCategory}"</p>
                              {activeCategory !== 'All' && <p className="text-xs text-slate-400 mt-2">Try adding a new product or switching categories.</p>}
                           </td>
                        </tr>
                     )}
                  </tbody>
               </table>
            </div>
         </div>
      </div>

      {/* MODAL */}
      {isEditing && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center p-4">
            <div className="w-full max-w-[95vw] h-[90vh] bg-slate-50 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
              <ProductForm 
                  initialData={editingProduct} 
                  onClose={() => { 
                     setIsEditing(false); 
                     setEditingProduct(null); 
                     fetchProducts(activeCategory); // Refresh current view
                  }} 
              />
            </div>
        </div>
      )}
    </div>
  );
}