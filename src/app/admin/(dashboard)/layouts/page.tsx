"use client";

import React, { useEffect, useState, useTransition } from 'react';
import { supabase } from '@/lib/supabase';
import { useAdminData } from '@/hooks/useAdminData';
import { updateCategoryMeta } from '@/app/admin/(dashboard)/actions'; 
import { Database } from '@/lib/database.types';
import { Save, Loader2, ImageIcon, LayoutTemplate, Eye, EyeOff, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { slugify } from '@/lib/utils'; // Make sure you have this helper or use a simple string replace

type CategoryRow = Database['public']['Tables']['categories']['Row'];

export default function CategoryManagerPage() {
  const { storeId, loading: authLoading } = useAdminData();
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [newCatName, setNewCatName] = useState(''); // State for new input

  // 1. FETCH DATA
  useEffect(() => {
    if (!storeId) return;
    fetchData();
  }, [storeId]);

  const fetchData = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('categories')
      .select('*')
      .eq('store_id', storeId!)
      .order('sort_order', { ascending: true });
    
    if (data) setCategories(data);
    setLoading(false);
  };

  // 2. CREATE CATEGORY
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim() || !storeId) return;

    const tempSlug = newCatName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    const { data, error } = await supabase
        .from('categories')
        .insert({
            store_id: storeId,
            name: newCatName,
            slug: tempSlug,
            sort_order: categories.length + 1
        })
        .select()
        .single();

    if (error) {
        toast.error("Failed to create: " + error.message);
    } else {
        setCategories([...categories, data]);
        setNewCatName('');
        toast.success("Category created!");
    }
  };

  // 3. DELETE CATEGORY
  const handleDelete = async (id: string) => {
      if(!confirm("Are you sure? Products in this category will become uncategorized.")) return;
      
      const { error } = await supabase.from('categories').delete().eq('id', id);
      if (error) {
          toast.error("Delete failed");
      } else {
          setCategories(prev => prev.filter(c => c.id !== id));
          toast.success("Category deleted");
      }
  };

  // 4. SAVE CHANGES (Updates existing ones)
  const handleSave = () => {
    startTransition(async () => {
      try {
        await updateCategoryMeta(categories);
        toast.success("Changes saved successfully");
      } catch (e: any) {
        toast.error("Failed to save: " + e.message);
      }
    });
  };

  // Local State Update Helper
  const updateLocalState = (id: string, updates: Partial<CategoryRow>) => {
    setCategories(prev => prev.map(cat => cat.id === id ? { ...cat, ...updates } : cat));
  };

  // Image Upload Helper
  const handleImageUpload = async (id: string, file: File) => {
    // ... (Keep your existing upload logic here, omitted for brevity but same as before) ...
    // Assuming you have the logic from previous step, effectively:
    const filePath = `categories/${id}-${Date.now()}`;
    await supabase.storage.from('marketing').upload(filePath, file);
    const { data } = supabase.storage.from('marketing').getPublicUrl(filePath);
    updateLocalState(id, { image_url: data.publicUrl });
    toast.success("Image uploaded (Click Save to persist)");
  };

  if (authLoading || loading) return <div className="h-[60vh] flex items-center justify-center"><Loader2 className="animate-spin text-slate-300" size={32}/></div>;

  return (
    <div className="max-w-5xl mx-auto pb-24 animate-in fade-in duration-500">
      
      {/* HEADER */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
             <LayoutTemplate className="text-indigo-600" /> Categories
          </h1>
          <p className="text-slate-500 mt-1 font-medium">Create and manage your store categories.</p>
        </div>
      </div>

      {/* CREATE NEW CARD */}
      <div className="bg-indigo-50 border border-indigo-100 p-6 rounded-2xl mb-8">
         <form onSubmit={handleCreate} className="flex gap-4 items-end">
            <div className="flex-1">
                <label className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2 block">New Category Name</label>
                <input 
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    className="w-full p-3 rounded-xl border border-indigo-200 focus:border-indigo-500 outline-none font-bold text-slate-700"
                    placeholder="e.g. Summer Collection"
                />
            </div>
            <button 
                type="submit"
                disabled={!newCatName.trim()}
                className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
                <Plus size={20} /> Create
            </button>
         </form>
      </div>

      {/* LIST */}
      <div className="space-y-4">
        {categories.map((cat) => (
            <div key={cat.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-6 items-start md:items-center group">
                
                {/* IMAGE (Simplified for display) */}
                <div className="relative w-20 h-20 bg-slate-50 rounded-xl flex-shrink-0 border border-slate-200 overflow-hidden flex items-center justify-center">
                    {cat.image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={cat.image_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                        <ImageIcon className="text-slate-300" />
                    )}
                    <label className="absolute inset-0 bg-black/0 hover:bg-black/20 cursor-pointer transition-colors">
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleImageUpload(cat.id, e.target.files[0])} />
                    </label>
                </div>

                {/* INFO */}
                <div className="flex-1 w-full">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="font-bold text-lg text-slate-800">{cat.name}</h3>
                            <div className="text-xs font-mono text-slate-400 mt-1">Slug: {cat.slug}</div>
                        </div>
                        <button 
                            onClick={() => handleDelete(cat.id)}
                            className="text-red-300 hover:text-red-500 p-2 transition-colors"
                        >
                            <Trash2 size={18} />
                        </button>
                    </div>
                    
                    {/* Extra Fields */}
                    <div className="mt-4 grid grid-cols-2 gap-4">
                        <input 
                            placeholder="Marketing Subtitle"
                            className="bg-slate-50 px-3 py-2 rounded-lg text-sm w-full outline-none focus:bg-white border border-transparent focus:border-indigo-200 transition-all"
                            value={cat.subtitle || ''}
                            onChange={(e) => updateLocalState(cat.id, { subtitle: e.target.value })}
                        />
                        <div className="flex items-center gap-2">
                             <input 
                                type="number"
                                className="bg-slate-50 px-3 py-2 rounded-lg text-sm w-20 outline-none text-center font-bold"
                                value={cat.sort_order || 0}
                                onChange={(e) => updateLocalState(cat.id, { sort_order: parseInt(e.target.value) })}
                             />
                             <button 
                                onClick={() => updateLocalState(cat.id, { show_overlay: !cat.show_overlay })}
                                className={`p-2 rounded-lg ${cat.show_overlay ? 'text-indigo-500 bg-indigo-50' : 'text-slate-300 bg-slate-50'}`}
                             >
                                {cat.show_overlay ? <Eye size={18}/> : <EyeOff size={18}/>}
                             </button>
                        </div>
                    </div>
                </div>
            </div>
        ))}
      </div>

      {/* SAVE */}
      <div className="fixed bottom-6 right-6 z-50">
        <button 
          onClick={handleSave} 
          disabled={isPending}
          className="bg-slate-900 text-white px-8 py-4 rounded-full font-bold shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
        >
           {isPending ? <Loader2 className="animate-spin" /> : <Save size={20} />}
           Save All Changes
        </button>
      </div>
    </div>
  );
}