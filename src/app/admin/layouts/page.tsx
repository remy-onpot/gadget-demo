"use client";

import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { Save, Loader2, Layers, RefreshCw, ImagePlus, Upload, Trash2, AlertCircle } from 'lucide-react';

interface CategoryMeta {
  slug: string;
  title: string;
  subtitle: string;
  image_url: string;
  show_overlay: boolean;
}

export default function LayoutsPage() {
  const [categories, setCategories] = useState<CategoryMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  
  // UX: Track unsaved changes
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  // Warn user if they try to leave with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const fetchData = async () => {
    setLoading(true);
    const { data: meta } = await supabase.from('category_metadata').select('*');
    const metaMap = new Map(meta?.map(m => [m.slug, m]) || []);

    const { data: products } = await supabase
      .from('products')
      .select('category')
      .eq('is_active', true);
      
    const activeSlugs = Array.from(new Set(
      products?.map(p => (p.category || 'uncategorized').toLowerCase()) || []
    ));

    const mergedList: CategoryMeta[] = activeSlugs.map(slug => {
      const existing = metaMap.get(slug);
      return existing || { 
        slug, 
        title: slug.charAt(0).toUpperCase() + slug.slice(1) + 's',
        subtitle: 'Shop Collection', 
        image_url: '',
        show_overlay: true 
      };
    });

    setCategories(mergedList);
    setLoading(false);
    setHasUnsavedChanges(false); // Reset dirty state on load
  };

  const handleUpdate = (slug: string, field: keyof CategoryMeta, value: any) => {
    setCategories(prev => prev.map(c => c.slug === slug ? { ...c, [field]: value } : c));
    setHasUnsavedChanges(true); // <--- UX: Mark as dirty immediately
  };

  const handleImageUpload = async (slug: string, file: File) => {
    if (!file) return;
    setUploading(slug);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${slug}-${Date.now()}.${fileExt}`;
      const filePath = `categories/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('media')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('media')
        .getPublicUrl(filePath);

      // ONLY update local state. Do not save to DB yet.
      handleUpdate(slug, 'image_url', publicUrl);

    } catch (error: any) {
      alert('Upload failed: ' + error.message);
    } finally {
      setUploading(null);
    }
  };

  const saveAll = async () => {
    setSaving(true);
    try {
      const { error } = await supabase.from('category_metadata').upsert(categories);
      if (error) throw error;
      
      // UX: Success feedback
      setHasUnsavedChanges(false);
      // Optional: Show a toast here instead of alert
    } catch (err: any) {
      alert("❌ Error: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-20 text-center flex flex-col items-center gap-4"><Loader2 className="animate-spin text-orange-500" size={32}/><p className="text-slate-400 font-medium">Loading your categories...</p></div>;

  return (
    <div className="max-w-5xl mx-auto pb-32">
      
      {/* STICKY HEADER: Always visible so you can't miss the Save button */}
      <div className="sticky top-0 z-50 bg-slate-50/95 backdrop-blur-sm py-6 border-b border-gray-200 mb-10 -mx-4 px-4 md:mx-0 md:px-0 transition-all">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3 tracking-tight">
              <Layers className="text-orange-500 fill-orange-100" size={32} /> 
              Storefront Layouts
            </h1>
          </div>
          
          <div className="flex items-center gap-3">
              {/* Unsaved Changes Indicator */}
              {hasUnsavedChanges && (
                <span className="text-xs font-bold text-amber-600 bg-amber-100 px-3 py-1 rounded-full animate-pulse flex items-center gap-1">
                   <AlertCircle size={12} /> Unsaved Changes
                </span>
              )}

              <button 
                onClick={fetchData}
                className="p-3 rounded-xl border border-gray-200 text-slate-500 hover:bg-white hover:text-slate-900 transition"
                title="Discard Changes / Refresh"
              >
                <RefreshCw size={20} />
              </button>

              <button 
                onClick={saveAll}
                disabled={saving || !hasUnsavedChanges}
                className={`
                  px-8 py-3 rounded-xl font-bold transition shadow-lg flex items-center gap-2
                  ${hasUnsavedChanges 
                    ? 'bg-orange-500 text-white hover:bg-orange-600 shadow-orange-500/20 scale-105' 
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                  }
                `}
              >
                {saving ? <Loader2 className="animate-spin" /> : <><Save size={18} /> Save Changes</>}
              </button>
          </div>
        </div>
      </div>

      {/* Grid of Editors */}
      <div className="grid gap-8">
        {categories.map((cat) => (
          <div key={cat.slug} className="bg-white p-6 md:p-8 rounded-3xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row gap-8">
            
            {/* Visual Preview */}
            <div className="w-full md:w-64 flex-shrink-0">
               <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold uppercase text-slate-400 tracking-wider">Preview Card</label>
                  {!cat.show_overlay && (
                    <span className="text-[10px] bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded font-bold">GRAPHIC MODE</span>
                  )}
               </div>
               
               <div className="aspect-[4/5] rounded-2xl bg-slate-900 overflow-hidden relative border border-slate-200 group">
                  {cat.image_url ? (
                    <>
                      <img 
                        src={cat.image_url} 
                        alt="Preview" 
                        className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 ${cat.show_overlay ? 'opacity-80' : 'opacity-100'}`} 
                      />
                      {cat.show_overlay && (
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                      )}
                    </>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-600 bg-slate-100 border-2 border-dashed border-slate-200">
                        <ImagePlus size={32} className="mb-2 opacity-50" />
                        <span className="text-xs font-bold">No Image</span>
                    </div>
                  )}
                  
                  {cat.show_overlay && (
                    <div className="absolute bottom-0 left-0 p-5 w-full">
                       <h4 className="text-2xl font-black text-white leading-none mb-2">{cat.title}</h4>
                       <p className="text-xs text-gray-300 font-medium">{cat.subtitle}</p>
                    </div>
                  )}
               </div>
            </div>

            {/* Edit Fields */}
            <div className="flex-1 space-y-6">
               <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                  <h3 className="font-black text-xl capitalize text-slate-900">{cat.slug}</h3>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-medium text-slate-500">Show Text Overlay?</span>
                    <button 
                      onClick={() => handleUpdate(cat.slug, 'show_overlay', !cat.show_overlay)}
                      className={`relative w-11 h-6 rounded-full transition-colors duration-200 ease-in-out ${cat.show_overlay ? 'bg-slate-900' : 'bg-gray-200'}`}
                    >
                      <span className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform duration-200 ${cat.show_overlay ? 'translate-x-5' : 'translate-x-0'}`} />
                    </button>
                  </div>
               </div>

               <div className="grid md:grid-cols-2 gap-5">
                   
                   <div className={`space-y-1.5 transition-opacity ${!cat.show_overlay ? 'opacity-50' : 'opacity-100'}`}>
                      <label className="text-xs font-bold uppercase text-slate-500">Display Title</label>
                      <input 
                        value={cat.title || ''} 
                        onChange={e => handleUpdate(cat.slug, 'title', e.target.value)}
                        className="w-full p-3 bg-slate-50 border border-gray-200 rounded-xl font-bold text-slate-900 focus:border-orange-500 focus:bg-white outline-none transition" 
                        placeholder="e.g. Laptops"
                      />
                   </div>
                   
                   <div className={`space-y-1.5 transition-opacity ${!cat.show_overlay ? 'opacity-50' : 'opacity-100'}`}>
                      <label className="text-xs font-bold uppercase text-slate-500">Subtitle</label>
                      <input 
                        value={cat.subtitle || ''} 
                        onChange={e => handleUpdate(cat.slug, 'subtitle', e.target.value)}
                        className="w-full p-3 bg-slate-50 border border-gray-200 rounded-xl font-medium text-slate-700 focus:border-orange-500 focus:bg-white outline-none transition" 
                        placeholder="e.g. Shop Collection"
                      />
                   </div>

                   {/* Image Uploader */}
                   <div className="md:col-span-2 space-y-2 pt-2">
                      <label className="text-xs font-bold uppercase text-slate-500 flex items-center justify-between">
                         Background Image
                         {cat.image_url && (
                           <button 
                             onClick={() => handleUpdate(cat.slug, 'image_url', '')} 
                             className="text-red-500 text-[10px] hover:underline flex items-center gap-1"
                           >
                             <Trash2 size={10} /> Clear Image
                           </button>
                         )}
                      </label>

                      <div className="flex items-center gap-4">
                        <div className="relative">
                           <input 
                              type="file" 
                              accept="image/*"
                              onChange={(e) => {
                                if (e.target.files?.[0]) handleImageUpload(cat.slug, e.target.files[0]);
                              }}
                              disabled={uploading === cat.slug}
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                           />
                           <button className="flex items-center gap-2 bg-white border border-gray-300 text-slate-700 px-4 py-3 rounded-xl font-bold hover:bg-slate-50 hover:border-slate-400 transition w-full sm:w-auto">
                              {uploading === cat.slug ? (
                                <Loader2 className="animate-spin text-orange-500" size={18} />
                              ) : (
                                <Upload size={18} />
                              )}
                              {uploading === cat.slug ? 'Uploading...' : 'Upload Image'}
                           </button>
                        </div>

                        <div className="text-xs text-slate-400 font-medium">
                           {cat.image_url ? '✅ Image staged (Unsaved)' : 'No image selected'}
                        </div>
                      </div>
                   </div>
               </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}