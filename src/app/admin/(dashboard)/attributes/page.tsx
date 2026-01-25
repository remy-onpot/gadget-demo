"use client";

import React, { useEffect, useState, useTransition } from 'react';
import { supabase } from '@/lib/supabase';
import { useAdminData } from '@/hooks/useAdminData';
import { Database } from '@/lib/database.types';
import { Save, Loader2, Plus, Trash2, ListFilter, Tag } from 'lucide-react';
import { toast } from 'sonner';

type AttributeRow = Database['public']['Tables']['attribute_options']['Row'];
type CategoryRow = Database['public']['Tables']['categories']['Row'];

export default function AttributesPage() {
  const { storeId, loading: authLoading } = useAdminData();
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [attributes, setAttributes] = useState<AttributeRow[]>([]);
  
  // --- FORM STATE ---
  const [selectedCatId, setSelectedCatId] = useState<string>('');
  const [attrKey, setAttrKey] = useState('');
  const [attrValues, setAttrValues] = useState<string[]>(['']); // Array of inputs
  
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  // 1. INITIAL LOAD
  useEffect(() => {
    if (!storeId) return;
    
    const loadData = async () => {
      setLoading(true);
      const [catsRes, attrsRes] = await Promise.all([
        supabase.from('categories').select('*').eq('store_id', storeId).order('name'),
        supabase.from('attribute_options').select('*').eq('store_id', storeId).order('key')
      ]);

      if (catsRes.data) setCategories(catsRes.data);
      if (attrsRes.data) setAttributes(attrsRes.data);
      setLoading(false);
    };
    loadData();
  }, [storeId]);

  // 2. INPUT HANDLERS (Add/Remove Lines)
  const handleAddInput = () => {
    setAttrValues([...attrValues, '']);
  };

  const handleRemoveInput = (index: number) => {
    const newValues = [...attrValues];
    newValues.splice(index, 1);
    setAttrValues(newValues);
  };

  const handleValueChange = (index: number, val: string) => {
    const newValues = [...attrValues];
    newValues[index] = val;
    setAttrValues(newValues);
  };

  // 3. BULK SAVE ACTION
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeId || !selectedCatId || !attrKey) {
        toast.error("Please select a category and enter an attribute name");
        return;
    }

    // Filter out empty lines
    const validValues = attrValues.filter(v => v.trim() !== '');
    if (validValues.length === 0) {
        toast.error("Please add at least one value");
        return;
    }

    startTransition(async () => {
        // Prepare bulk insert payload
        const payload = validValues.map((val, index) => ({
            store_id: storeId,
            category_id: selectedCatId,
            key: attrKey,   // e.g. "Color"
            value: val,     // e.g. "Red"
            sort_order: index
        }));

        const { data, error } = await supabase
            .from('attribute_options')
            .insert(payload)
            .select();

        if (error) {
            toast.error("Failed to add attributes: " + error.message);
        } else {
            setAttributes([...attributes, ...(data || [])]);
            // Reset Values but keep Category/Key so you can keep working
            setAttrValues(['']); 
            toast.success(`Added ${data.length} options for ${attrKey}`);
        }
    });
  };

  // 4. DELETE ATTRIBUTE
  const handleDelete = async (id: string) => {
      // Optimistic Update
      setAttributes(prev => prev.filter(a => a.id !== id));
      
      const { error } = await supabase.from('attribute_options').delete().eq('id', id);
      if (error) {
          toast.error("Failed to delete");
          // Revert if failed (optional, but good practice)
      } else {
          toast.success("Option deleted");
      }
  };

  if (authLoading || loading) return <div className="h-[60vh] flex items-center justify-center"><Loader2 className="animate-spin text-slate-300" size={32}/></div>;

  return (
    <div className="max-w-6xl mx-auto pb-24 animate-in fade-in duration-500">
      
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
           <ListFilter className="text-indigo-600" /> Attribute Manager
        </h1>
        <p className="text-slate-500 mt-1 font-medium">Define filters like Color, Size, and Material for your categories.</p>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        
        {/* === LEFT COLUMN: THE BULK CREATOR (Fixed Width) === */}
        <div className="lg:col-span-4">
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm sticky top-6">
                <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2 text-lg">
                    <Plus className="bg-indigo-100 text-indigo-600 p-1 rounded-md" size={24}/> 
                    Add New Attributes
                </h3>

                <form onSubmit={handleSave} className="space-y-5">
                    {/* Category Select */}
                    <div>
                        <label className="text-xs font-bold text-slate-400 uppercase mb-1.5 block">1. Target Category</label>
                        <div className="relative">
                            <select 
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-sm font-bold outline-none focus:border-indigo-500 appearance-none"
                                value={selectedCatId}
                                onChange={(e) => setSelectedCatId(e.target.value)}
                            >
                                <option value="">-- Select Category --</option>
                                {categories.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Attribute Name */}
                    <div>
                        <label className="text-xs font-bold text-slate-400 uppercase mb-1.5 block">2. Attribute Name</label>
                        <input 
                            placeholder="e.g. Color, RAM, Size"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-sm font-bold outline-none focus:border-indigo-500 placeholder:font-normal"
                            value={attrKey}
                            onChange={(e) => setAttrKey(e.target.value)}
                        />
                    </div>

                    {/* Dynamic Values */}
                    <div>
                        <label className="text-xs font-bold text-slate-400 uppercase mb-1.5 flex justify-between items-center">
                            <span>3. Options (Values)</span>
                            <span className="text-[10px] bg-slate-100 text-slate-500 px-2 rounded-full py-0.5 font-bold">Bulk Add</span>
                        </label>
                        
                        <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1 custom-scrollbar">
                            {attrValues.map((val, idx) => (
                                <div key={idx} className="flex gap-2 animate-in slide-in-from-left-2 duration-300">
                                    <input 
                                        autoFocus={idx === attrValues.length - 1 && idx > 0}
                                        placeholder={`Value ${idx + 1}`}
                                        className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-50 transition-all font-medium"
                                        value={val}
                                        onChange={(e) => handleValueChange(idx, e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                handleAddInput();
                                            }
                                        }}
                                    />
                                    {attrValues.length > 1 && (
                                        <button 
                                            type="button"
                                            onClick={() => handleRemoveInput(idx)}
                                            className="text-slate-300 hover:text-red-500 p-2 hover:bg-red-50 rounded-lg transition-colors"
                                        >
                                            <Trash2 size={16}/>
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>

                        <button 
                            type="button"
                            onClick={handleAddInput}
                            className="mt-3 text-xs font-bold text-indigo-600 flex items-center gap-1 hover:bg-indigo-50 px-3 py-2 rounded-lg transition-colors w-full justify-center border border-dashed border-indigo-200"
                        >
                            <Plus size={14} /> Add another option
                        </button>
                    </div>

                    <button 
                        type="submit"
                        disabled={isPending || !selectedCatId}
                        className="w-full bg-slate-900 text-white py-3.5 rounded-xl font-bold mt-4 hover:bg-slate-800 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                    >
                        {isPending ? <Loader2 className="animate-spin" /> : <Save size={18} />}
                        Save All Options
                    </button>
                </form>
            </div>
        </div>

        {/* === RIGHT COLUMN: LIST VIEW (Fluid Width) === */}
        <div className="lg:col-span-8 space-y-6">
            {categories.map(cat => {
                const catAttrs = attributes.filter(a => a.category_id === cat.id);
                if (catAttrs.length === 0) return null;

                // Group by Key (e.g. Color: [Red, Blue])
                const grouped: Record<string, AttributeRow[]> = {};
                catAttrs.forEach(a => {
                    if (!grouped[a.key]) grouped[a.key] = [];
                    grouped[a.key].push(a);
                });

                return (
                    <div key={cat.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="bg-slate-50/50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                            <h4 className="font-bold text-slate-800 text-lg">{cat.name}</h4>
                            <span className="text-xs font-bold bg-white border border-gray-200 px-2 py-1 rounded text-slate-500">{catAttrs.length} items</span>
                        </div>
                        
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                            {Object.entries(grouped).map(([key, rows]) => (
                                <div key={key} className="bg-white">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Tag size={14} className="text-indigo-500" />
                                        <span className="text-xs font-bold uppercase text-slate-400 tracking-widest">{key}</span>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {rows.map(opt => (
                                            <div key={opt.id} className="group relative bg-white border border-slate-200 rounded-md pl-3 pr-8 py-1.5 text-sm font-semibold text-slate-600 hover:border-red-200 hover:bg-red-50/30 transition-all cursor-default">
                                                {opt.value}
                                                <button 
                                                    onClick={() => handleDelete(opt.id)}
                                                    className="absolute right-1 top-1.5 p-0.5 text-slate-300 hover:text-red-500 hover:bg-red-100 rounded transition-all opacity-0 group-hover:opacity-100"
                                                >
                                                    <Trash2 size={12} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            })}

            {attributes.length === 0 && (
                <div className="text-center py-24 text-slate-400 border-2 border-dashed border-slate-100 rounded-3xl bg-slate-50/50">
                    <ListFilter size={48} className="mx-auto mb-4 opacity-20" />
                    <p className="font-medium text-lg text-slate-600">No attributes defined yet.</p>
                    <p className="text-sm mt-1">Use the form on the left to start adding filters like Size or Color.</p>
                </div>
            )}
        </div>

      </div>
    </div>
  );
}