"use client";

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Database } from '@/lib/database.types'; 
import { 
  Plus, Search, Filter, MoreVertical, 
  Package, AlertTriangle, CheckCircle 
} from 'lucide-react';
import { ProductForm } from '@/components/admin/ProductForm';

type ProductRow = Database['public']['Tables']['products']['Row'];
type VariantRow = Database['public']['Tables']['product_variants']['Row'];

// ✅ FIX 1: Rename key to match DB relation (and ProductForm expectation)
type InventoryItem = ProductRow & {
  product_variants: VariantRow[]; 
};

export default function InventoryPage() {
  const [products, setProducts] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<InventoryItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    const { data, error } = await supabase
      .from('products')
      // ✅ FIX 2: Remove the alias 'variants:'. Fetch raw relation name.
      .select('*, product_variants(*)') 
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching inventory:", error);
      return;
    }

    if (data) {
        setProducts(data as unknown as InventoryItem[]);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-6xl mx-auto pb-20">
      
      {/* HEADER & SEARCH */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
           <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
             <Package className="text-blue-600" /> Inventory
           </h1>
           <p className="text-slate-500 font-medium">Manage stock levels, prices, and product details.</p>
        </div>
        
        <div className="flex gap-3 w-full md:w-auto">
           <div className="relative flex-1 md:w-64">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
             <input 
                 className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl font-bold text-slate-700 outline-none focus:border-blue-500"
                 placeholder="Search products..."
                 value={searchQuery}
                 onChange={e => setSearchQuery(e.target.value)}
             />
           </div>
           <button 
             onClick={() => { setSelectedProduct(null); setIsEditing(true); }}
             className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-blue-200 transition-all active:scale-95"
           >
             <Plus size={20} /> <span className="hidden md:inline">Add Product</span>
           </button>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
         <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-gray-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
               <tr>
                  <th className="px-6 py-4">Product</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Stock Status</th>
                  <th className="px-6 py-4">Price Range</th>
                  <th className="px-6 py-4 text-right">Actions</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
               {products
                 .filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
                 .map((product) => {
                   // ✅ FIX 3: Update property accessors to 'product_variants'
                   const totalStock = product.product_variants?.reduce((sum, v) => sum + (v.stock || 0), 0) || 0;
                   const isLowStock = totalStock < 5 && totalStock > 0;
                   const isOutOfStock = totalStock === 0;

                   return (
                     <tr key={product.id} className="hover:bg-slate-50 transition-colors group">
                        <td className="px-6 py-4">
                           <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0">
                                 {product.base_images?.[0] && (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={product.base_images[0]} alt="" className="w-full h-full object-cover"/>
                                 )}
                              </div>
                              <div>
                                 <div className="font-bold text-slate-900">{product.name}</div>
                                 <div className="text-[10px] text-slate-400 font-mono uppercase">
                                    {/* ✅ FIX 3b: Update property access */}
                                    {product.product_variants.length} Variants
                                 </div>
                              </div>
                           </div>
                        </td>
                        <td className="px-6 py-4">
                           <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold bg-slate-100 text-slate-600 capitalize">
                              {product.category}
                           </span>
                        </td>
                        <td className="px-6 py-4">
                           {isOutOfStock ? (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-50 text-red-600">
                                 <AlertTriangle size={12}/> Out of Stock
                              </span>
                           ) : isLowStock ? (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-orange-50 text-orange-600">
                                 <Package size={12}/> Low: {totalStock}
                              </span>
                           ) : (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-50 text-green-600">
                                 <CheckCircle size={12}/> In Stock: {totalStock}
                              </span>
                           )}
                        </td>
                        <td className="px-6 py-4 font-mono text-slate-600">
                           {/* Safe check for price */}
                           ₵{(product.base_price || 0).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-right">
                           <button 
                             onClick={() => { setSelectedProduct(product); setIsEditing(true); }}
                             className="text-blue-600 hover:text-blue-800 font-bold text-xs"
                           >
                             Edit
                           </button>
                        </td>
                     </tr>
                   );
               })}
            </tbody>
         </table>
      </div>

      {/* PRODUCT FORM MODAL */}
      {isEditing && (
         <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white w-full max-w-4xl h-[90vh] rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95">
               <ProductForm 
                  // ✅ FIX 4: Explicit undefined cast if null (though optional usually handles null)
                  initialData={selectedProduct || undefined} 
                  onClose={() => { setIsEditing(false); fetchInventory(); }} 
               />
            </div>
         </div>
      )}

    </div>
  );
}