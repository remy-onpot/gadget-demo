"use client";

import React, { useState, useEffect, useTransition } from 'react';
import { supabase } from '@/lib/supabase';
import { createAttribute, updateAttribute, deleteAttribute } from '@/app/admin/actions'; // ✅ Server Actions
import { Database } from '@/lib/database.types'; // ✅ Correct Types
import { Plus, Trash2, Save, X, Loader2, Tags, Edit2, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

// 1. USE PRECISE DB TYPE (Fixes the 'string vs number' error)
type AttributeOption = Database['public']['Tables']['attribute_options']['Row'];

const CATEGORIES = ['laptop', 'phone', 'wearable', 'audio', 'tablet', 'gaming'];

export default function AttributesPage() {
  const [attributes, setAttributes] = useState<AttributeOption[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Editor State
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    category: 'laptop',
    key: 'ram',
    value: '',
    sort_order: 0
  });

  // Server Action State
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    fetchAttributes();
  }, []);

  const fetchAttributes = async () => {
    const { data } = await supabase
      .from('attribute_options')
      .select('*')
      .order('category', { ascending: true })
      .order('sort_order', { ascending: true });
    
    if (data) setAttributes(data);
    setLoading(false);
  };

  // --- ACTIONS ---

  const handleSave = () => {
    if (!formData.value) return toast.error("Value is required");

    startTransition(async () => {
      try {
        if (editingId) {
            // Update Existing
            await updateAttribute(editingId, formData);
            toast.success("Attribute updated");
        } else {
            // Create New
            await createAttribute(formData);
            toast.success("Attribute created");
        }
        
        // Cleanup
        setIsEditing(false);
        setEditingId(null);
        setFormData({ category: 'laptop', key: 'ram', value: '', sort_order: 0 });
        fetchAttributes(); // Refresh list
      } catch (e: any) {
        toast.error("Failed to save: " + e.message);
      }
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm('Delete this option?')) return;

    startTransition(async () => {
        try {
            await deleteAttribute(id); // ✅ Passing string ID to server action
            setAttributes(prev => prev.filter(a => a.id !== id)); // Optimistic update
            toast.success("Deleted successfully");
        } catch (e) {
            toast.error("Failed to delete");
            fetchAttributes(); // Revert
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
    } else {
      setEditingId(null);
      setFormData({ category: 'laptop', key: 'ram', value: '', sort_order: 0 });
    }
    setIsEditing(true);
  };

  // Group by Category for cleaner UI
  const grouped = attributes.reduce((acc, curr) => {
    if (!acc[curr.category]) acc[curr.category] = [];
    acc[curr.category].push(curr);
    return acc;
  }, {} as Record<string, AttributeOption[]>);

  if (loading) return <div className="p-20 flex justify-center"><Loader2 className="animate-spin text-slate-300"/></div>;

  return (
    <div className="max-w-5xl mx-auto pb-20">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
           <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
             <Tags className="text-orange-500" /> Filter Options
           </h1>
           <p className="text-slate-500 font-medium mt-1">Manage the dropdown options (RAM, Storage, Condition) for sidebar filters.</p>
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
                                <div className="font-bold text-slate-800 text-sm">{attr.value}</div>
                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mt-0.5">{attr.key}</div>
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
      </div>

      {/* EDITOR MODAL */}
      {isEditing && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200">
           <div className="bg-white w-full max-w-md rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
             
             <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white">
                 <h3 className="font-black text-xl text-slate-900">{editingId ? 'Edit Option' : 'New Option'}</h3>
                 <button onClick={() => setIsEditing(false)} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-slate-900 transition">
                   <X size={20} />
                 </button>
             </div>
             
             <div className="p-6 space-y-4">
                 <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Category</label>
                    <div className="flex flex-wrap gap-2">
                        {CATEGORIES.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setFormData({...formData, category: cat})}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize border transition-all ${
                                    formData.category === cat 
                                    ? 'bg-slate-900 text-white border-slate-900' 
                                    : 'bg-white text-slate-500 border-gray-200 hover:bg-slate-50'
                                }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                 </div>

                 <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Attribute Key</label>
                    <select 
                        className="w-full p-3 bg-slate-50 border border-gray-200 rounded-xl font-bold text-sm outline-none focus:border-orange-500"
                        value={formData.key}
                        onChange={e => setFormData({...formData, key: e.target.value})}
                    >
                        <option value="ram">RAM (e.g. 8GB, 16GB)</option>
                        <option value="storage">Storage (e.g. 256GB, 1TB)</option>
                        <option value="screen_size">Screen Size (e.g. 13", 15")</option>
                        <option value="processor">Processor (e.g. M1, Intel i7)</option>
                        <option value="condition">Condition (e.g. New, Used)</option>
                    </select>
                 </div>

                 <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Display Value</label>
                    <input 
                        className="w-full p-3 bg-slate-50 border border-gray-200 rounded-xl font-bold text-slate-900 outline-none focus:border-orange-500 focus:bg-white transition"
                        placeholder="e.g. 16GB"
                        value={formData.value}
                        onChange={e => setFormData({...formData, value: e.target.value})}
                    />
                 </div>
                 
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