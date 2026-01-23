"use client";

import React, { useState, useEffect, useTransition, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { useAdminData } from '@/hooks/useAdminData'; // Import the hook
import { createAttribute, updateAttribute, deleteAttribute } from '@/app/admin/(dashboard)/actions';
import { Database } from '@/lib/database.types'; 
import { Plus, Trash2, Save, X, Loader2, Tags, Edit2, List } from 'lucide-react';
import { toast } from 'sonner';

type AttributeOption = Database['public']['Tables']['attribute_options']['Row'];

export default function AttributesPage() {
  // 1. Use the hook
  const { storeId, loading: authLoading } = useAdminData();
  
  const [attributes, setAttributes] = useState<AttributeOption[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Editor State
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    category: '',
    key: '',
    value: '',
    sort_order: 0
  });

  const [isPending, startTransition] = useTransition();
  
  // 1. FETCH DATA - Wait for storeId
  const fetchAttributes = async () => {
    if (!storeId) return;
    
    const { data, error } = await supabase
      .from('attribute_options')
      .select('*')
      .eq('store_id', storeId) // ✅ Use the ID from the hook
      .order('category', { ascending: true })
      .order('sort_order', { ascending: true });
        
    if (error) {
        toast.error("Failed to load attributes");
    } else if (data) {
        setAttributes(data);
        if (data.length > 0 && !formData.category) {
            setFormData(prev => ({...prev, category: data[0].category}));
        }
    }
    setLoading(false);
  };

  useEffect(() => {
    // 2. WAIT for the hook to find the store
    if (!storeId) return;
    
    fetchAttributes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeId]); // 👈 Only run when storeId is ready
  
  // 2. SUGGESTIONS (Memoized for performance)
  const suggestions = useMemo(() => {
    const cats = Array.from(new Set(attributes.map(a => a.category))).sort();
    const keys = Array.from(new Set(attributes.map(a => a.key))).sort();
    return { cats, keys };
  }, [attributes]);

  const handleSave = () => {
    if (!formData.category) return toast.error("Category is required");
    if (!formData.key) return toast.error("Key is required");
    if (!formData.value) return toast.error("Value is required");
    
    startTransition(async () => {
        try {
            if (editingId) {
                await updateAttribute(editingId, formData);
                toast.success("Attribute updated");
            } else {
                await createAttribute(formData);
                toast.success("Attribute created");
            }
            
            setIsEditing(false);
            setEditingId(null);
            setFormData(prev => ({ ...prev, value: '', sort_order: prev.sort_order + 10 })); 
            fetchAttributes(); 

        } catch (e: any) {
            toast.error(e.message || "Failed to save");
        }
    });
  };
  
  const handleDelete = (id: string) => {
    if (!confirm('Delete this option?')) return;
    
    startTransition(async () => {
        try {
            await deleteAttribute(id);
            setAttributes(prev => prev.filter(a => a.id !== id)); 
            toast.success("Deleted successfully");
        } catch (e) {
            toast.error("Failed to delete");
            fetchAttributes(); 
        }
    });
  };

  const openEditor = (attr?: AttributeOption) => {
    if (attr) {
      setEditingId(attr.id);
      setFormData({
         category: attr.category,
         key: attr.key,
         value: attr.value,
         sort_order: attr.sort_order || 0
      });
      setIsEditing(true);
    } else {
      setEditingId(null);
      setFormData(prev => ({ ...prev, value: '', sort_order: 0 }));
      setIsEditing(true);
    }
  };

  const grouped = attributes.reduce((acc, curr) => {
     if (!acc[curr.category]) acc[curr.category] = [];
     acc[curr.category].push(curr);
     return acc;
  }, {} as Record<string, AttributeOption[]>);

  if (authLoading) return <div className="p-20 flex justify-center"><Loader2 className="animate-spin text-slate-300"/></div>;
  if (loading) return <div className="p-20 flex justify-center"><Loader2 className="animate-spin text-slate-300"/></div>;

  return (
    <div className="max-w-5xl mx-auto pb-20">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
           <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
             <Tags className="text-orange-500" /> Filter Options
           </h1>
           <p className="text-slate-500 font-medium mt-1">Manage the dropdown options for product filtering.</p>
        </div>
        <button 
           onClick={() => openEditor()}
           className="bg-slate-900 text-white px-5 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-800 transition shadow-lg shadow-slate-900/10 active:scale-95"
        >
           <Plus size={18} /> Add Option
        </button>
      </div>

      {/* ATTRIBUTE GRID */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
         {Object.entries(grouped).map(([category, items]) => (
            <div key={category} className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
               <div className="bg-slate-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                  <span className="font-black text-slate-700 uppercase tracking-wider text-sm">{category}</span>
                  <span className="text-xs font-bold bg-white border border-gray-200 px-2 py-0.5 rounded text-slate-400">{items.length} options</span>
               </div>
               <div className="divide-y divide-gray-100">
                  {items.map(attr => (
                     <div key={attr.id} className="p-3 flex items-center justify-between hover:bg-slate-50 group transition-colors">
                        <div>
                           <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mt-0.5">{attr.key}</div>
                           <div className="font-bold text-slate-800 text-sm">{attr.value}</div>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                           <button onClick={() => openEditor(attr)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                              <Edit2 size={14} />
                           </button>
                           <button onClick={() => handleDelete(attr.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                              <Trash2 size={14} />
                           </button>
                        </div>
                     </div>
                  ))}
               </div>
            </div>
         ))}
         
         {Object.keys(grouped).length === 0 && (
            <div className="col-span-full p-12 text-center border-2 border-dashed border-gray-200 rounded-3xl text-gray-400">
               <List className="w-12 h-12 mx-auto mb-4 opacity-50"/>
               <p>No attributes found. Add one to get started.</p>
            </div>
         )}
      </div>

      {/* EDITOR MODAL */}
      {isEditing && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200">
           <div className="bg-white w-full max-w-md rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col">
             
             <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white">
                 <h3 className="font-black text-xl text-slate-900">{editingId ? 'Edit Option' : 'New Option'}</h3>
                 <button onClick={() => setIsEditing(false)} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-slate-900 transition">
                   <X size={20} />
                 </button>
             </div>
             
             <div className="p-6 space-y-5">
                 
                 {/* 1. CATEGORY INPUT */}
                 <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Category</label>
                    <input 
                      list="category-suggestions"
                      className="w-full p-3 bg-slate-50 border border-gray-200 rounded-xl font-bold text-sm outline-none focus:border-orange-500 focus:bg-white transition"
                      placeholder="e.g. shoes, laptops, furniture"
                      value={formData.category}
                      onChange={e => setFormData({...formData, category: e.target.value})}
                    />
                    <datalist id="category-suggestions">
                       {suggestions.cats.map(c => <option key={c} value={c} />)}
                    </datalist>
                 </div>

                 {/* 2. KEY INPUT */}
                 <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Attribute Key</label>
                    <input 
                      list="key-suggestions"
                      className="w-full p-3 bg-slate-50 border border-gray-200 rounded-xl font-bold text-sm outline-none focus:border-orange-500 focus:bg-white transition"
                      placeholder="e.g. Size, Color, Material"
                      value={formData.key}
                      onChange={e => setFormData({...formData, key: e.target.value})}
                    />
                    <datalist id="key-suggestions">
                       {suggestions.keys.map(k => <option key={k} value={k} />)}
                    </datalist>
                 </div>

                 {/* 3. VALUE INPUT */}
                 <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Display Value</label>
                    <input 
                      className="w-full p-3 bg-slate-50 border border-gray-200 rounded-xl font-bold text-sm outline-none focus:border-orange-500 focus:bg-white transition"
                      placeholder="e.g. XL, Red, Leather"
                      value={formData.value}
                      onChange={e => setFormData({...formData, value: e.target.value})}
                    />
                 </div>

                 {/* 4. SORT ORDER */}
                 <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Sort Order</label>
                    <input 
                      type="number"
                      className="w-24 p-3 bg-slate-50 border border-gray-200 rounded-xl font-bold text-slate-900 outline-none focus:border-orange-500"
                      value={formData.sort_order}
                      onChange={e => setFormData({...formData, sort_order: parseInt(e.target.value) || 0})}
                    />
                 </div>

             </div>

             <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                 <button onClick={() => setIsEditing(false)} className="px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-gray-200 transition text-sm">Cancel</button>
                 <button 
                    onClick={handleSave} 
                    disabled={isPending}
                    className="bg-orange-500 text-white px-8 py-3 rounded-xl font-bold hover:bg-orange-600 shadow-lg shadow-orange-200 transition-transform active:scale-95 flex items-center gap-2 text-sm disabled:opacity-70 disabled:cursor-not-allowed"
                 >
                    {isPending ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                    {editingId ? 'Update Option' : 'Create Option'}
                 </button>
             </div>

           </div>
        </div>
      )}

    </div>
  );
}