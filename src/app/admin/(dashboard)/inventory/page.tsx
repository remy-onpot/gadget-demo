"use client";

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Database } from '@/lib/database.types'; 
import { 
  Plus, Search, Filter, MoreVertical, 
  Package, AlertTriangle, CheckCircle, Loader2,
  ChevronRight, Edit2
} from 'lucide-react';
import { ProductForm } from '@/components/admin/ProductForm';

type ProductRow = Database['public']['Tables']['products']['Row'];
type VariantRow = Database['public']['Tables']['product_variants']['Row'];

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
      .select('*, product_variants(*)') 
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching inventory:", error);
    } else if (data) {
        setProducts(data as unknown as InventoryItem[]);
    }
    setLoading(false);
  };

  if (loading) return <div className="h-[50vh] flex items-center justify-center"><Loader2 className="animate-spin text-blue-600" size={32}/></div>;

  return (
    <div className="max-w-6xl mx-auto pb-24 md:pb-20 px-4 md:px-0">
      
      {/* HEADER & SEARCH (Mobile Optimized) */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 md:mb-8 mt-4 md:mt-0">
        <div>
           <h1 className="text-2xl md:text-3xl font-black text-slate-900 flex items-center gap-3">
             <Package className="text-blue-600" /> Inventory
           </h1>
           <p className="text-sm md:text-base text-slate-500 font-medium mt-1">
             {products.length} Items in stock
           </p>
        </div>
        
        <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
           {/* Search Bar */}
           <div className="relative w-full md:w-64">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
             <input 
                 className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl font-bold text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all shadow-sm"
                 placeholder="Search..."
                 value={searchQuery}
                 onChange={e => setSearchQuery(e.target.value)}
             />
           </div>
           
           {/* Desktop Add Button (Hidden on Mobile) */}
           <button 
             onClick={() => { setSelectedProduct(null); setIsEditing(true); }}
             className="hidden md:flex bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-bold items-center gap-2 shadow-lg shadow-blue-200 transition-all active:scale-95"
           >
             <Plus size={20} /> Add Product
           </button>
        </div>
      </div>

      {/* --- CONTENT AREA --- */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
         
         {/* 1. DESKTOP VIEW: TABLE (Hidden on Mobile) */}
         <div className="hidden md:block overflow-x-auto">
             <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-gray-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                   <tr>
                      <th className="px-6 py-4">Product</th>
                      <th className="px-6 py-4">Category</th>
                      <th className="px-6 py-4">Stock</th>
                      <th className="px-6 py-4">Price</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                   {products
                     .filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
                     .map((product) => (
                       <DesktopRow 
                          key={product.id} 
                          product={product} 
                          onEdit={() => { setSelectedProduct(product); setIsEditing(true); }} 
                       />
                   ))}
                </tbody>
             </table>
         </div>

         {/* 2. MOBILE VIEW: CARDS (Visible on Mobile) */}
         <div className="md:hidden divide-y divide-gray-100">
            {products
              .filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
              .map((product) => (
                <MobileCard 
                   key={product.id} 
                   product={product} 
                   onEdit={() => { setSelectedProduct(product); setIsEditing(true); }} 
                />
            ))}
         </div>

         {/* EMPTY STATE */}
         {products.length === 0 && !loading && (
             <div className="p-12 text-center text-slate-400 flex flex-col items-center gap-4">
                 <Package size={48} strokeWidth={1} />
                 <p>No products found.</p>
             </div>
         )}
      </div>

      {/* FLOATING ACTION BUTTON (Mobile Only) */}
      <button 
        onClick={() => { setSelectedProduct(null); setIsEditing(true); }}
        className="md:hidden fixed bottom-6 right-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-2xl shadow-blue-600/40 flex items-center justify-center z-40 active:scale-90 transition-transform"
      >
        <Plus size={28} />
      </button>

      {/* PRODUCT FORM MODAL */}
      {isEditing && (
         <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center bg-slate-900/60 backdrop-blur-sm p-0 md:p-4 animate-in fade-in duration-200">
            <div className="bg-white w-full md:max-w-4xl h-[95vh] md:h-[90vh] rounded-t-3xl md:rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-10 duration-200 flex flex-col">
               <ProductForm 
                  initialData={selectedProduct || undefined} 
                  onClose={() => { setIsEditing(false); fetchInventory(); }} 
               />
            </div>
         </div>
      )}

    </div>
  );
}

// --- SUB COMPONENTS ---

const DesktopRow = ({ product, onEdit }: { product: InventoryItem, onEdit: () => void }) => {
    const variants = product.product_variants || [];
    const totalStock = variants.reduce((sum, v) => sum + (v.stock || 0), 0);
    const isLow = totalStock < 5 && totalStock > 0;
    const isOut = totalStock === 0;

    return (
        <tr className="hover:bg-slate-50 transition-colors group">
            <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200 relative">
                        {product.base_images?.[0] ? (
                            <img src={product.base_images[0]} alt="" className="w-full h-full object-cover"/>
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-300"><Package size={20} /></div>
                        )}
                    </div>
                    <div>
                        <div className="font-bold text-slate-900">{product.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono uppercase">{variants.length} Variants</div>
                    </div>
                </div>
            </td>
            <td className="px-6 py-4"><span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-bold">{product.category}</span></td>
            <td className="px-6 py-4">
                {isOut ? <span className="text-red-600 font-bold text-xs flex items-center gap-1"><AlertTriangle size={12}/> OOS</span> 
                : isLow ? <span className="text-orange-600 font-bold text-xs">Low ({totalStock})</span>
                : <span className="text-green-600 font-bold text-xs">In Stock ({totalStock})</span>}
            </td>
            <td className="px-6 py-4 font-mono font-bold text-slate-700">₵{(product.base_price || 0).toLocaleString()}</td>
            <td className="px-6 py-4 text-right">
                <button onClick={onEdit} className="text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg font-bold text-xs">Manage</button>
            </td>
        </tr>
    );
};

const MobileCard = ({ product, onEdit }: { product: InventoryItem, onEdit: () => void }) => {
    const variants = product.product_variants || [];
    const totalStock = variants.reduce((sum, v) => sum + (v.stock || 0), 0);

    return (
        <div onClick={onEdit} className="p-4 flex items-center gap-4 active:bg-slate-50 transition-colors cursor-pointer">
            {/* Image */}
            <div className="w-16 h-16 bg-slate-100 rounded-xl overflow-hidden flex-shrink-0 border border-gray-200">
                {product.base_images?.[0] ? (
                    <img src={product.base_images[0]} alt="" className="w-full h-full object-cover"/>
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300"><Package size={24} /></div>
                )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1">
                    <h3 className="font-bold text-slate-900 truncate pr-2">{product.name}</h3>
                    <span className="font-mono text-sm font-bold text-slate-700">₵{product.base_price}</span>
                </div>
                
                <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                    <span className="bg-slate-100 px-1.5 py-0.5 rounded">{product.category}</span>
                    <span>•</span>
                    <span>{variants.length} Var</span>
                </div>

                <div className={`text-xs font-bold ${totalStock === 0 ? 'text-red-500' : totalStock < 5 ? 'text-orange-500' : 'text-green-600'}`}>
                    {totalStock === 0 ? 'Out of Stock' : `${totalStock} in stock`}
                </div>
            </div>

            {/* Chevron */}
            <ChevronRight className="text-gray-300" size={20} />
        </div>
    );
};