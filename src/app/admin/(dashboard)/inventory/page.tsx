"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { useAdminData } from '@/hooks/useAdminData'; 
import { deleteProduct } from '@/actions/product-actions'; 
import { Database } from '@/lib/database.types'; 
import { 
  Plus, Search, Package, AlertTriangle, Loader2, Edit2, Trash2, ChevronRight, ChevronDown, Layers
} from 'lucide-react';
import { ProductForm } from '@/components/admin/ProductForm';
import { toast } from 'sonner'; 
import { SecurityModal } from '@/components/admin/SecurityModal'; 

type ProductRow = Database['public']['Tables']['products']['Row'];
type VariantRow = Database['public']['Tables']['product_variants']['Row'];

type InventoryItem = ProductRow & {
  product_variants: VariantRow[]; 
  categories: { id: string; name: string } | null;
};

type CategoryWithCount = {
  id: string;
  name: string;
  product_count: number;
};

type CategoryProductCache = {
  products: InventoryItem[];
  hasMore: boolean;
  currentPage: number;
};

const PAGE_SIZE = 20;

export default function InventoryPage() {
  const { storeId, loading: authLoading } = useAdminData();
  
  // Category Mode State
  const [categories, setCategories] = useState<CategoryWithCount[]>([]);
  const [categoryCache, setCategoryCache] = useState<Record<string, CategoryProductCache>>({});
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [loadingCategories, setLoadingCategories] = useState<Set<string>>(new Set());
  
  // Search Mode State
  const [searchResults, setSearchResults] = useState<InventoryItem[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  
  // Shared State
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<InventoryItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string, name: string } | null>(null);

  // Determine current view mode
  const isSearchMode = searchQuery.trim().length > 0;

  // 🚀 INITIAL LOAD: Fetch Categories + Counts
  useEffect(() => {
    if (!storeId) return;
    fetchCategories();
  }, [storeId]); 

  const fetchCategories = async () => {
    if (!storeId) return;
    
    setLoading(true);
    try {
      // Fetch categories with product counts
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('id, name')
        .eq('store_id', storeId)
        .order('name');

      if (categoriesError) throw categoriesError;

      // Get product counts for each category
      const categoriesWithCounts = await Promise.all(
        (categoriesData || []).map(async (cat) => {
          const { count } = await supabase
            .from('products')
            .select('id', { count: 'exact', head: true })
            .eq('store_id', storeId)
            .eq('category_id', cat.id);
          
          return {
            id: cat.id,
            name: cat.name,
            product_count: count || 0
          };
        })
      );

      setCategories(categoriesWithCounts.filter(c => c.product_count > 0));
    } catch (e) {
      console.error(e);
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  // 🎯 LAZY LOAD: Fetch Products for Category
  const fetchCategoryProducts = async (categoryId: string, page = 0) => {
    if (!storeId) return;

    setLoadingCategories(prev => new Set(prev).add(categoryId));

    try {
      const from = page * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      const { data, error, count } = await supabase
        .from('products')
        .select('*, product_variants(*), categories(id, name)', { count: 'exact' })
        .eq('store_id', storeId)
        .eq('category_id', categoryId)
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) throw error;

      const newProducts = (data || []) as InventoryItem[];
      const hasMore = (count || 0) > (page + 1) * PAGE_SIZE;

      // Update cache
      setCategoryCache(prev => {
        const existing = prev[categoryId];
        return {
          ...prev,
          [categoryId]: {
            products: page === 0 ? newProducts : [...(existing?.products || []), ...newProducts],
            hasMore,
            currentPage: page
          }
        };
      });

    } catch (e) {
      console.error('Failed to load category products:', e);
      toast.error("Failed to load products");
    } finally {
      setLoadingCategories(prev => {
        const next = new Set(prev);
        next.delete(categoryId);
        return next;
      });
    }
  };

  // 🔍 GLOBAL SEARCH: Fetch All Matching Products
  useEffect(() => {
    if (!storeId) return;
    
    if (isSearchMode) {
      performGlobalSearch();
    }
  }, [searchQuery, storeId]);

  const performGlobalSearch = async () => {
    if (!storeId || !searchQuery.trim()) return;

    setSearchLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*, product_variants(*), categories(id, name)')
        .eq('store_id', storeId)
        .ilike('name', `%${searchQuery}%`)
        .order('created_at', { ascending: false })
        .limit(100); // Cap at 100 results for performance

      if (error) throw error;

      setSearchResults((data || []) as InventoryItem[]);
    } catch (e) {
      console.error('Search failed:', e);
      toast.error("Search failed");
    } finally {
      setSearchLoading(false);
    }
  };

  // 📂 CATEGORY ACCORDION HANDLERS
  const toggleCategory = (categoryId: string) => {
    const isExpanded = expandedCategories.has(categoryId);
    
    if (isExpanded) {
      // Collapse
      setExpandedCategories(prev => {
        const next = new Set(prev);
        next.delete(categoryId);
        return next;
      });
    } else {
      // Expand
      setExpandedCategories(prev => new Set(prev).add(categoryId));
      
      // Fetch products if not cached
      if (!categoryCache[categoryId]) {
        fetchCategoryProducts(categoryId, 0);
      }
    }
  };

  const loadMoreInCategory = (categoryId: string) => {
    const cache = categoryCache[categoryId];
    if (!cache) return;
    
    fetchCategoryProducts(categoryId, cache.currentPage + 1);
  };

  // 🗑️ DELETE HANDLERS
  const requestDelete = (id: string, name: string) => {
    setDeleteTarget({ id, name });
  };

  const executeDelete = async () => {
    if (!deleteTarget) return;

    const targetId = deleteTarget.id;

    // Optimistic Update: Remove from all caches
    setCategoryCache(prev => {
      const updated = { ...prev };
      Object.keys(updated).forEach(catId => {
        updated[catId] = {
          ...updated[catId],
          products: updated[catId].products.filter(p => p.id !== targetId)
        };
      });
      return updated;
    });
    setSearchResults(prev => prev.filter(p => p.id !== targetId));

    const res = await deleteProduct(targetId);
    
    if (res.success) {
       toast.success("Product deleted");
       setDeleteTarget(null);
       // Refresh counts
       fetchCategories();
    } else {
       toast.error("Delete failed: " + res.error);
       // Refetch to restore data
       fetchCategories();
    }
  };

  // ✏️ EDIT HANDLER: Refresh Both Caches
  const handleProductUpdated = () => {
    setIsEditing(false);
    
    // Refresh categories and counts
    fetchCategories();
    
    // Refresh expanded category caches
    expandedCategories.forEach(catId => {
      fetchCategoryProducts(catId, 0);
    });
    
    // Refresh search if active
    if (isSearchMode) {
      performGlobalSearch();
    }
  };

  // 📊 PRODUCT ROW COMPONENT
  const ProductRow = ({ product }: { product: InventoryItem }) => {
    const variants = product.product_variants || [];
    const totalStock = variants.reduce((sum, v) => sum + (v.stock || 0), 0);
    const isLow = totalStock < 5 && totalStock > 0;
    const isOut = totalStock === 0;

    return (
      <tr className="hover:bg-slate-50 transition-colors group">
        <td className="px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200">
              {product.base_images?.[0] ? (
                <img src={product.base_images[0]} alt="" className="w-full h-full object-cover"/>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-300">
                  <Package size={20} />
                </div>
              )}
            </div>
            <div>
              <div className="font-bold text-slate-900 line-clamp-1">{product.name}</div>
              <div className="text-[10px] text-slate-400 font-mono uppercase">{variants.length} Variants</div>
            </div>
          </div>
        </td>
        
        <td className="px-6 py-4">
          <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-bold capitalize">
            {product.categories?.name || 'Uncategorized'}
          </span>
        </td>

        <td className="px-6 py-4">
          {isOut ? (
            <span className="text-red-600 font-bold text-xs flex items-center gap-1">
              <AlertTriangle size={12}/> OOS
            </span>
          ) : isLow ? (
            <span className="text-orange-600 font-bold text-xs">Low ({totalStock})</span>
          ) : (
            <span className="text-green-600 font-bold text-xs">In Stock ({totalStock})</span>
          )}
        </td>
        
        <td className="px-6 py-4 font-mono font-bold text-slate-700">
          ₵{(product.base_price || 0).toLocaleString()}
        </td>
        
        <td className="px-6 py-4 text-right">
          <div className="flex items-center justify-end gap-2">
            <button 
              onClick={() => { setSelectedProduct(product); setIsEditing(true); }} 
              className="text-slate-400 hover:text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-all"
              title="Edit Product"
            >
              <Edit2 size={16} />
            </button>
            <button 
              onClick={() => requestDelete(product.id, product.name)}
              className="text-slate-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-all"
              title="Delete Product"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </td>
      </tr>
    );
  };

  // Calculate total products
  const totalProducts = categories.reduce((sum, cat) => sum + cat.product_count, 0);

  if (authLoading) return <div className="h-[50vh] flex items-center justify-center"><Loader2 className="animate-spin text-blue-600" size={32}/></div>;

  return (
    <div className="max-w-6xl mx-auto pb-24 md:pb-20 px-4 md:px-0 animate-in fade-in duration-500">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 md:mb-8 mt-4 md:mt-0">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 flex items-center gap-3">
            <Package className="text-blue-600" /> Inventory
          </h1>
          <p className="text-sm md:text-base text-slate-500 font-medium mt-1">
            {isSearchMode ? `${searchResults.length} results` : `${totalProducts} items in ${categories.length} categories`}
          </p>
        </div>
        
        <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl font-bold text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all shadow-sm"
              placeholder="Search products..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          
          <button 
            onClick={() => { setSelectedProduct(null); setIsEditing(true); }}
            className="hidden md:flex bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-bold items-center gap-2 shadow-lg shadow-blue-200 transition-all active:scale-95"
          >
            <Plus size={20} /> Add Product
          </button>
        </div>
      </div>

      {/* INITIAL LOADING */}
      {loading && (
        <div className="h-[50vh] flex items-center justify-center">
          <Loader2 className="animate-spin text-blue-600" size={32}/>
        </div>
      )}

      {/* SEARCH MODE: Flat List */}
      {!loading && isSearchMode && (
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          {searchLoading ? (
            <div className="p-12 flex items-center justify-center">
              <Loader2 className="animate-spin text-blue-600" size={32}/>
            </div>
          ) : searchResults.length === 0 ? (
            <div className="p-12 text-center text-slate-400 flex flex-col items-center gap-4">
              <Search size={48} strokeWidth={1} />
              <p>No products found for "{searchQuery}"</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
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
                  {searchResults.map(product => (
                    <ProductRow key={product.id} product={product} />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* CATEGORY MODE: Accordion View */}
      {!loading && !isSearchMode && (
        <div className="space-y-4">
          {categories.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center text-slate-400 flex flex-col items-center gap-4">
              <Layers size={48} strokeWidth={1} />
              <p>No categories found. Add products to get started.</p>
            </div>
          ) : (
            categories.map(category => {
              const isExpanded = expandedCategories.has(category.id);
              const cache = categoryCache[category.id];
              const isLoadingCategory = loadingCategories.has(category.id);

              return (
                <div 
                  key={category.id} 
                  className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden transition-all"
                >
                  {/* Category Header */}
                  <button
                    onClick={() => toggleCategory(category.id)}
                    className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-1.5 rounded-lg transition-transform ${isExpanded ? 'rotate-90 bg-blue-100' : 'bg-slate-100'}`}>
                        <ChevronRight size={16} className={isExpanded ? 'text-blue-600' : 'text-slate-500'} />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 capitalize">{category.name}</h3>
                        <p className="text-xs text-slate-500">{category.product_count} products</p>
                      </div>
                    </div>
                    {isLoadingCategory && !cache && (
                      <Loader2 size={18} className="animate-spin text-blue-600" />
                    )}
                  </button>

                  {/* Expanded Products */}
                  {isExpanded && cache && (
                    <div className="border-t border-gray-100">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                          <thead className="bg-slate-50 border-b border-gray-100 text-xs font-bold text-slate-500 uppercase tracking-wider">
                            <tr>
                              <th className="px-6 py-3">Product</th>
                              <th className="px-6 py-3">Category</th>
                              <th className="px-6 py-3">Stock</th>
                              <th className="px-6 py-3">Price</th>
                              <th className="px-6 py-3 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {cache.products.map(product => (
                              <ProductRow key={product.id} product={product} />
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Load More Button */}
                      {cache.hasMore && (
                        <div className="p-4 border-t border-gray-100 flex justify-center">
                          <button
                            onClick={() => loadMoreInCategory(category.id)}
                            disabled={isLoadingCategory}
                            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold text-sm transition disabled:opacity-50 flex items-center gap-2"
                          >
                            {isLoadingCategory ? (
                              <>
                                <Loader2 size={14} className="animate-spin" />
                                Loading...
                              </>
                            ) : (
                              <>
                                <ChevronDown size={14} />
                                Load More
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* FLOATING ACTION BUTTON (Mobile) */}
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
              onClose={handleProductUpdated} 
            />
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      <SecurityModal 
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={executeDelete}
        title="Confirm Deletion"
        description={`You are about to delete "${deleteTarget?.name}". This cannot be undone.`}
      />
    </div>
  );
}