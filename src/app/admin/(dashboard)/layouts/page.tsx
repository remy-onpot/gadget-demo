"use client";

import React, { useEffect, useState, useTransition } from 'react';
import { supabase } from '@/lib/supabase';
import { useAdminData } from '@/hooks/useAdminData';
import { updateCategoryMeta } from '@/app/admin/(dashboard)/actions'; 
import { Database } from '@/lib/database.types';
import { Save, Loader2, ImageIcon, LayoutTemplate, Eye, EyeOff, GripVertical } from 'lucide-react';
import { toast } from 'sonner';

// ✅ 1. Define Type based on Master Table
type CategoryRow = Database['public']['Tables']['categories']['Row'];

export default function LayoutsPage() {
  const { storeId, loading: authLoading } = useAdminData();
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [uploadingId, setUploadingId] = useState<string | null>(null);

  // 2. FETCH DATA (From Master Table)
  useEffect(() => {
    if (!storeId) return;
    
    const fetchData = async () => {
      setLoading(true);
      // ✅ Query directly from 'categories'
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('store_id', storeId)
        .order('sort_order', { ascending: true });

      if (data) {
        setCategories(data);
      } else if (error) {
        toast.error("Failed to load categories");
      }
      setLoading(false);
    };

    fetchData();
  }, [storeId]);

  // 3. HANDLE LOCAL UPDATES
  const updateLocalState = (id: string, updates: Partial<CategoryRow>) => {
    setCategories(prev => prev.map(cat => 
      cat.id === id ? { ...cat, ...updates } : cat
    ));
  };

  // 4. IMAGE UPLOAD LOGIC
  const handleImageUpload = async (id: string, file: File) => {
    setUploadingId(id);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `cat-${id}-${Date.now()}.${fileExt}`;
      const filePath = `categories/${fileName}`;

      // Upload to 'marketing' bucket (Standardized)
      const { error: uploadError } = await supabase.storage
        .from('marketing') 
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('marketing')
        .getPublicUrl(filePath);

      updateLocalState(id, { image_url: publicUrl });
      toast.success("Image uploaded");
    } catch (e: any) {
      toast.error("Upload failed: " + e.message);
    } finally {
      setUploadingId(null);
    }
  };

  // 5. SAVE ACTION
  const handleSave = () => {
    startTransition(async () => {
      try {
        // Calls the updated action which writes to 'categories' table
        await updateCategoryMeta(categories);
        toast.success("Layouts saved successfully");
      } catch (e: any) {
        toast.error("Failed to save: " + e.message);
      }
    });
  };

  if (authLoading || loading) return <div className="h-[60vh] flex items-center justify-center"><Loader2 className="animate-spin text-slate-300" size={32}/></div>;

  return (
    <div className="max-w-5xl mx-auto pb-24 animate-in fade-in duration-500">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
             <LayoutTemplate className="text-indigo-600" /> Category Layouts
          </h1>
          <p className="text-slate-500 mt-1 font-medium">Customize active categories for your storefront.</p>
        </div>
      </div>

      <div className="space-y-4">
        {categories.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border-2 border-dashed border-slate-200 text-slate-400">
                <p className="font-bold">No categories found.</p>
                <p className="text-sm">Create products or attributes to generate categories automatically.</p>
            </div>
        ) : (
            categories.map((cat) => (
                <div key={cat.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-6 items-start md:items-center group hover:border-indigo-100 transition-all">
                    
                    {/* Visual Grip */}
                    <div className="text-slate-200 cursor-grab active:cursor-grabbing hidden md:block">
                        <GripVertical size={20}/>
                    </div>

                    {/* IMAGE UPLOADER */}
                    <div className="relative w-24 h-24 bg-slate-50 rounded-xl flex-shrink-0 border border-slate-200 overflow-hidden flex items-center justify-center group-hover:border-indigo-200 transition-colors">
                        {cat.image_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={cat.image_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                            <ImageIcon className="text-slate-300" />
                        )}
                        
                        {/* Overlay Upload Button */}
                        <label className="absolute inset-0 bg-black/0 hover:bg-black/40 flex items-center justify-center cursor-pointer transition-colors group/img">
                            {uploadingId === cat.id ? (
                                <Loader2 className="animate-spin text-white" />
                            ) : (
                                <div className="bg-white/90 p-2 rounded-full opacity-0 group-hover/img:opacity-100 transition-opacity shadow-sm transform scale-90 group-hover/img:scale-100">
                                    <ImageIcon size={16} className="text-slate-700"/>
                                </div>
                            )}
                            <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleImageUpload(cat.id, e.target.files[0])} />
                        </label>
                    </div>

                    {/* FIELDS */}
                    <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <div className="flex justify-between mb-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Category Name</label>
                                <span className="text-[10px] font-mono text-slate-300">Slug: {cat.slug}</span>
                            </div>
                            {/* Name is read-only here, managed in Attributes/Products */}
                            <div className="font-bold text-lg text-slate-800 capitalize">{cat.name}</div>
                        </div>

                        <div>
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">Subtitle / Marketing Copy</label>
                            <input 
                                className="w-full bg-slate-50 border border-transparent focus:bg-white focus:border-indigo-500 rounded-lg px-3 py-2 text-sm font-medium outline-none transition-all placeholder:text-slate-300"
                                placeholder="e.g. 'Summer Collection 2024'"
                                value={cat.subtitle || ''}
                                onChange={(e) => updateLocalState(cat.id, { subtitle: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* OPTIONS */}
                    <div className="flex items-center gap-4 border-l border-slate-100 pl-6 h-full">
                        <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Sort</label>
                            <input 
                                type="number" 
                                className="w-16 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-center font-bold text-sm outline-none focus:border-indigo-500"
                                value={cat.sort_order || 0}
                                onChange={(e) => updateLocalState(cat.id, { sort_order: parseInt(e.target.value) || 0 })}
                            />
                        </div>

                        <button 
                            onClick={() => updateLocalState(cat.id, { show_overlay: !cat.show_overlay })}
                            className={`p-3 rounded-xl transition-all ${cat.show_overlay !== false ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-50 text-slate-400'}`}
                            title={cat.show_overlay !== false ? "Overlay Visible" : "Overlay Hidden"}
                        >
                            {cat.show_overlay !== false ? <Eye size={20} /> : <EyeOff size={20} />}
                        </button>
                    </div>

                </div>
            ))
        )}
      </div>

      {/* Floating Save Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button 
          onClick={handleSave} 
          disabled={isPending || categories.length === 0}
          className="bg-slate-900 text-white px-8 py-4 rounded-full font-bold shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-3 disabled:opacity-70 disabled:scale-100"
        >
           {isPending ? <Loader2 className="animate-spin" /> : <Save size={20} />}
           Save Layouts
        </button>
      </div>
    </div>
  );
}