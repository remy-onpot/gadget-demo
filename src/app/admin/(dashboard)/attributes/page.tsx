"use client";

import React, { useState, useEffect, useTransition, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { useAdminData } from '@/hooks/useAdminData'; 
import { createAttribute, updateAttribute, deleteAttribute } from '@/app/admin/(dashboard)/actions';
import { Database } from '@/lib/database.types'; 
import { Plus, Trash2, Save, X, Loader2, Tags, Edit2, List, CheckCircle2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

type AttributeOption = Database['public']['Tables']['attribute_options']['Row'];

export default function AttributesPage() {
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
  
  // 1. ROBUST FETCHING
  const fetchAttributes = async () => {
    if (!storeId) return;
    setLoading(true);
    
    const { data, error } = await supabase
      .from('attribute_options')
      .select('*')
      .eq('store_id', storeId)
      .order('category', { ascending: true })
      .order('sort_order', { ascending: true });
        
    if (error) {
       toast.error("Failed to load attributes");
    } else if (data) {
       setAttributes(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (storeId) fetchAttributes();
  }, [storeId]);
  
  // 2. SUGGESTIONS (Memoized)
  const suggestions = useMemo(() => {
    const cats = Array.from(new Set(attributes.map(a => a.category))).sort();
    const keys = Array.from(new Set(attributes.map(a => a.key))).sort();
    return { cats, keys };
  }, [attributes]);

  const handleSave = () => {
    if (!formData.category) return toast.error("Category is required");
    if (!formData.key) return toast.error("Key is required");
    if (!formData.value) return toast.error("Value is required");
    
    const promise = editingId 
       ? updateAttribute(editingId, formData) 
       : createAttribute(formData);

    toast.promise(promise, {
       loading: 'Saving attribute...',
       success: () => {
          setIsEditing(false); // ✅ Close Modal
          setEditingId(null);
          // Reset form but keep category for rapid entry
          setFormData(prev => ({ ...prev, value: '', sort_order: prev.sort_order + 10 })); 
          fetchAttributes(); // Refresh List
          return editingId ? "Attribute updated" : "Attribute created";
       },
       error: (err) => `Failed: ${err.message}`
    });
  };
  
  const handleDelete = (id: string) => {
    if (!confirm('Are you sure you want to delete this option?')) return;
    
    toast.promise(deleteAttribute(id), {
       loading: 'Deleting...',
       success: () => {
          setAttributes(prev => prev.filter(a => a.id !== id)); 
          return "Option deleted";
       },
       error: "Could not delete option"
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
    } else {
      setEditingId(null);
      // Smart default: use most recent category if available
      const lastCat = attributes.length > 0 ? attributes[attributes.length - 1].category : '';
      setFormData({ 
         category: lastCat, 
         key: '', 
         value: '', 
         sort_order: 0 
      });
    }
    setIsEditing(true);
  };

  const grouped = attributes.reduce((acc, curr) => {
     if (!acc[curr.category]) acc[curr.category] = [];
     acc[curr.category].push(curr);
     return acc;
  }, {} as Record<string, AttributeOption[]>);

  if (authLoading || (loading && attributes.length === 0)) {
     return <div className="min-h-[60vh] flex items-center justify-center"><Loader2 className="animate-spin text-slate-300" size={32}/></div>;
  }

  return (
    <div className="max-w-6xl mx-auto pb-20 animate-in fade-in duration-500">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
           <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
             <Tags className="text-indigo-600" /> Attribute Options
           </h1>
           <p className="text-slate-500 font-medium mt-2">Define valid variants (Size, Color, Material) for each category.</p>
        </div>
        <button 
           onClick={() => openEditor()}
           className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-800 transition shadow-xl shadow-slate-900/10 active:scale-95"
        >
           <Plus size={20} /> Add New Option
        </button>
      </div>

      {/* ATTRIBUTE GRID */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
         {Object.entries(grouped).map(([category, items]) => (
            <div key={category} className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
               <div className="bg-slate-50 px-5 py-4 border-b border-gray-200 flex justify-between items-center">
                  <span className="font-black text-slate-700 uppercase tracking-wider text-sm">{category}</span>
                  <span className="text-xs font-bold bg-white border border-gray-200 px-2 py-1 rounded text-slate-500">{items.length} options</span>
               </div>
               <div className="divide-y divide-gray-100 max-h-[300px] overflow-y-auto">
                  {items.map(attr => (
                     <div key={attr.id} className="px-5 py-3 flex items-center justify-between hover:bg-slate-50 group transition-colors">
                        <div>
                           <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{attr.key}</div>
                           <div className="font-bold text-slate-800">{attr.value}</div>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                           <button onClick={() => openEditor(attr)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                              <Edit2 size={14} />
                           </button>
                           <button onClick={() => handleDelete(attr.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                              <Trash2 size={14} />
                           </button>
                        </div>
                     </div>
                  ))}
               </div>
            </div>
         ))}
         
         {Object.keys(grouped).length === 0 && (
            <div className="col-span-full py-20 flex flex-col items-center justify-center text-center border-2 border-dashed border-gray-200 rounded-3xl bg-slate-50/50">
               <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                  <List className="text-slate-300" size={32}/>
               </div>
               <h3 className="text-lg font-bold text-slate-900">No attributes defined yet</h3>
               <p className="text-slate-500 max-w-sm mt-2 mb-6">Create options like "Size: S, M, L" or "Color: Red, Blue" to use them in your products.</p>
               <button onClick={() => openEditor()} className="text-indigo-600 font-bold hover:underline">Create your first option</button>
            </div>
         )}
      </div>

      {/* EDITOR MODAL */}
      {isEditing && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200">
           <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col">
             
             <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white">
                 <h3 className="font-black text-xl text-slate-900">{editingId ? 'Edit Option' : 'New Option'}</h3>
                 <button onClick={() => setIsEditing(false)} className="p-2 hover:bg-gray-100 rounded-full text-slate-400 hover:text-slate-900 transition">
                   <X size={20} />
                 </button>
             </div>
             
             <div className="p-6 space-y-5">
                 <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Category</label>
                    <input 
                      list="category-suggestions"
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm outline-none focus:border-indigo-500 focus:bg-white transition"
                      placeholder="e.g. Shoes"
                      value={formData.category}
                      onChange={e => setFormData({...formData, category: e.target.value})}
                      autoFocus={!editingId}
                    />
                    <datalist id="category-suggestions">
                       {suggestions.cats.map(c => <option key={c} value={c} />)}
                    </datalist>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div>
                       <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Key</label>
                       <input 
                         list="key-suggestions"
                         className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm outline-none focus:border-indigo-500 focus:bg-white transition"
                         placeholder="e.g. Size"
                         value={formData.key}
                         onChange={e => setFormData({...formData, key: e.target.value})}
                       />
                       <datalist id="key-suggestions">
                          {suggestions.keys.map(k => <option key={k} value={k} />)}
                       </datalist>
                    </div>
                    <div>
                       <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Value</label>
                       <input 
                         className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm outline-none focus:border-indigo-500 focus:bg-white transition"
                         placeholder="e.g. XL"
                         value={formData.value}
                         onChange={e => setFormData({...formData, value: e.target.value})}
                       />
                    </div>
                 </div>

                 <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Sort Order</label>
                    <input 
                      type="number"
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm outline-none focus:border-indigo-500 focus:bg-white transition"
                      value={formData.sort_order}
                      onChange={e => setFormData({...formData, sort_order: parseInt(e.target.value) || 0})}
                    />
                 </div>
             </div>

             <div className="p-6 border-t border-gray-100 bg-slate-50 flex justify-end gap-3">
                 <button onClick={() => setIsEditing(false)} className="px-5 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-200 transition text-sm">Cancel</button>
                 <button 
                    onClick={handleSave} 
                    className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-transform active:scale-95 flex items-center gap-2 text-sm"
                 >
                    <Save size={18} /> Save Option
                 </button>
             </div>

           </div>
        </div>
      )}

    </div>
  );
}