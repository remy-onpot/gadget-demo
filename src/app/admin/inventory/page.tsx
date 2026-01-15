"use client";

import React, { useEffect, useState, useTransition } from 'react';
import { supabase } from '@/lib/supabase';
import { updateProductStock, toggleProductActive } from '@/app/admin/actions'; // ✅ Import Actions
import { Search, Loader2, Power, AlertTriangle, Save } from 'lucide-react';
import { toast } from 'sonner';

// Simplified type for this view
type InventoryItem = {
  id: string;
  name: string;
  category: string;
  is_active: boolean;
  base_price: number;
  variants: { id: string; condition: string; stock: number; price: number }[];
};

export default function InventoryPage() {
  const [products, setProducts] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // ✅ Server Action Transition State
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    // We still fetch client-side here for the 'Search' feature, 
    // but in a perfect world, this would be a Server Component with URL search params.
    const { data } = await supabase
      .from('products')
      .select('*, variants:product_variants(*)')
      .order('created_at', { ascending: false });

    if (data) setProducts(data as any); // Type casting for simplicity in this view
    setLoading(false);
  };

  // --- ACTION: TOGGLE ACTIVE STATUS ---
  const handleToggleActive = (id: string, currentStatus: boolean) => {
    // 1. Optimistic Update
    setProducts(prev => prev.map(p => p.id === id ? { ...p, is_active: !currentStatus } : p));
    
    // 2. Server Action
    startTransition(async () => {
        try {
            await toggleProductActive(id, !currentStatus);
            toast.success("Product status updated");
        } catch (e) {
            toast.error("Failed to update status");
            fetchInventory(); // Revert
        }
    });
  };

  // --- ACTION: UPDATE STOCK ---
  const handleStockUpdate = (variantId: string, newStock: number) => {
    // Note: We don't optimistically update input fields usually to avoid jumps, 
    // but we can trigger the action on Blur or Enter.
    startTransition(async () => {
        try {
            await updateProductStock(variantId, newStock);
            toast.success("Stock saved");
        } catch (e) {
            toast.error("Failed to save stock");
        }
    });
  };

  const filtered = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.category.includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-slate-300" /></div>;

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8">
      <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
        <div>
           <h1 className="text-3xl font-black text-slate-900">Inventory</h1>
           <p className="text-slate-500 font-medium">Manage stock levels and visibility.</p>
        </div>
        <div className="relative w-full md:w-96">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
           <input 
             type="text" 
             placeholder="Search products..." 
             className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-orange-500 font-bold text-sm transition-all"
             value={searchTerm}
             onChange={e => setSearchTerm(e.target.value)}
           />
        </div>
      </div>

      <div className="space-y-4">
        {filtered.map(product => (
            <div key={product.id} className={`bg-white border rounded-xl overflow-hidden transition-all ${!product.is_active ? 'opacity-60 grayscale border-gray-100' : 'border-gray-200 shadow-sm'}`}>
                <div className="p-4 flex items-center justify-between bg-slate-50 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${product.is_active ? 'bg-green-500' : 'bg-gray-300'}`} />
                        <span className="font-bold text-slate-900">{product.name}</span>
                        <span className="text-xs font-bold bg-white border px-2 py-0.5 rounded text-slate-500 uppercase">{product.category}</span>
                    </div>
                    
                    <button 
                        onClick={() => handleToggleActive(product.id, product.is_active)}
                        disabled={isPending}
                        className={`p-2 rounded-lg transition-colors ${product.is_active ? 'text-green-600 hover:bg-green-50' : 'text-slate-400 hover:bg-slate-100'}`}
                        title={product.is_active ? "Deactivate Product" : "Activate Product"}
                    >
                        <Power size={18} />
                    </button>
                </div>

                <div className="p-4">
                    <table className="w-full text-sm">
                        <thead className="text-left text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                            <tr>
                                <th className="pb-2">Variant / Condition</th>
                                <th className="pb-2">Price</th>
                                <th className="pb-2 w-32">Stock Level</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {product.variants.map(variant => (
                                <tr key={variant.id}>
                                    <td className="py-3 font-medium text-slate-700">{variant.condition}</td>
                                    <td className="py-3 font-mono text-slate-500">GHS {variant.price}</td>
                                    <td className="py-3">
                                        <div className="flex items-center gap-2">
                                            <input 
                                                type="number" 
                                                defaultValue={variant.stock}
                                                // Update on Enter or Blur
                                                onBlur={(e) => handleStockUpdate(variant.id, parseInt(e.target.value))}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        handleStockUpdate(variant.id, parseInt((e.target as HTMLInputElement).value));
                                                        (e.target as HTMLInputElement).blur();
                                                    }
                                                }}
                                                className={`w-20 px-2 py-1 rounded border font-bold text-center outline-none focus:border-orange-500 ${variant.stock < 2 ? 'bg-red-50 text-red-600 border-red-200' : 'bg-white border-gray-200'}`}
                                            />
                                            {variant.stock < 2 && <AlertTriangle size={14} className="text-red-500" />}
                                            {isPending && <Loader2 size={14} className="animate-spin text-slate-300" />}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        ))}
      </div>
    </div>
  );
}