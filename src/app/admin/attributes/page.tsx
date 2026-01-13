"use client";

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Sliders, Plus, Trash2, Loader2, Tag } from 'lucide-react';

// 1. Define strict types
interface AttributeOption {
  id: number;
  category: string;
  key: string;
  value: string;
  sort_order: number;
}

interface CategoryMeta {
  slug: string;
  title: string;
}

// Type for the nested structure: Category -> AttributeKey -> List of Options
type GroupedOptions = Record<string, Record<string, AttributeOption[]>>;

export default function AttributesPage() {
  const [options, setOptions] = useState<AttributeOption[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  
  // New Attribute Form
  const [newCat, setNewCat] = useState('');
  const [newKey, setNewKey] = useState('');
  const [newVal, setNewVal] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { 
    initData(); 
  }, []);

  const initData = async () => {
    setLoading(true);
    await Promise.all([fetchOptions(), fetchCategories()]);
    setLoading(false);
  };

  const fetchOptions = async () => {
    const { data } = await supabase
      .from('attribute_options')
      .select('*')
      .order('category')
      .order('key');
      
    if (data) setOptions(data as AttributeOption[]);
  };

  const fetchCategories = async () => {
    // 1. Get categories from your layouts table
    const { data: meta } = await supabase.from('category_metadata').select('slug');
    
    // 2. Get categories currently used in attributes (in case some have no layout yet)
    const { data: existingAttrs } = await supabase.from('attribute_options').select('category');

    // 3. Merge and unique
    const uniqueCats = Array.from(new Set([
      ...(meta?.map(m => m.slug) || []),
      ...(existingAttrs?.map(a => a.category) || [])
    ])).sort();

    setCategories(uniqueCats);
    // Set default category to the first one if available and not set
    if (uniqueCats.length > 0 && !newCat) setNewCat(uniqueCats[0]);
  };

  const addOption = async () => {
    if (!newVal || !newKey || !newCat) return;
    setSubmitting(true);
    
    // Normalize input
    const cleanCat = newCat.toLowerCase().trim();
    const cleanKey = newKey.trim(); // Keep case for display (e.g. "Screen Size")

    const { error } = await supabase.from('attribute_options').insert({ 
      category: cleanCat, 
      key: cleanKey, 
      value: newVal.trim(), 
      sort_order: 99 
    });

    if (!error) {
      setNewVal(''); 
      // Refresh list
      await fetchOptions();
      // If user typed a brand new category, add it to our local list
      if (!categories.includes(cleanCat)) setCategories(prev => [...prev, cleanCat].sort());
    } else {
        alert("Error adding attribute: " + error.message);
    }
    setSubmitting(false);
  };

  const deleteOption = async (id: number) => {
    if(!confirm("Delete this option? It will disappear from product selectors.")) return;
    await supabase.from('attribute_options').delete().eq('id', id);
    fetchOptions();
  };

  // 2. Grouping Logic
  const grouped: GroupedOptions = options.reduce((acc, curr) => {
    const cat = curr.category || 'uncategorized';
    const key = curr.key || 'General';

    if (!acc[cat]) acc[cat] = {};
    if (!acc[cat][key]) acc[cat][key] = [];
    
    acc[cat][key].push(curr);
    return acc;
  }, {} as GroupedOptions);

  if (loading) return <div className="p-20 text-center flex flex-col items-center gap-4"><Loader2 className="animate-spin text-orange-500" size={32}/><p className="text-slate-400 font-medium">Loading attributes...</p></div>;

  return (
    <div className="max-w-6xl mx-auto pb-20">
      <div className="mb-8">
         <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
            <Sliders className="text-orange-500 fill-orange-100" size={32} /> 
            Attribute Dictionary
         </h1>
         <p className="text-slate-500 mt-2 font-medium">Define the dropdown options available for each product category.</p>
      </div>

      {/* ADD NEW BAR */}
      <div className="bg-slate-900 p-6 md:p-8 rounded-3xl text-white mb-12 shadow-2xl shadow-slate-900/20">
         <div className="flex items-center gap-2 mb-6 opacity-80">
            <Plus size={16} className="text-orange-400" />
            <span className="text-xs font-bold uppercase tracking-widest">Add New Attribute Option</span>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
             {/* Dynamic Category Input */}
             <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase ml-1">Device / Category</label>
                <div className="relative">
                    <input 
                        list="category-list"
                        value={newCat} 
                        onChange={e => setNewCat(e.target.value)} 
                        className="w-full bg-slate-800 border-2 border-slate-700 hover:border-slate-600 focus:border-orange-500 p-3 rounded-xl text-white font-bold transition outline-none"
                        placeholder="Select or Type..."
                    />
                    <datalist id="category-list">
                        {categories.map(c => (
                            <option key={c} value={c} />
                        ))}
                    </datalist>
                </div>
             </div>

             {/* Attribute Key */}
             <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase ml-1">Attribute Name</label>
                <div className="relative">
                    <input 
                        list="keys-list" 
                        value={newKey} 
                        onChange={e => setNewKey(e.target.value)} 
                        className="w-full bg-slate-800 border-2 border-slate-700 hover:border-slate-600 focus:border-orange-500 p-3 rounded-xl text-white font-medium placeholder:text-slate-500 transition outline-none" 
                        placeholder="e.g. Storage" 
                    />
                    {/* Common suggestions */}
                    <datalist id="keys-list">
                       <option value="Color"/><option value="Storage"/><option value="RAM"/><option value="Processor"/><option value="Screen Size"/><option value="Condition"/>
                    </datalist>
                </div>
             </div>

             {/* Value */}
             <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase ml-1">Value Option</label>
                <div className="flex gap-3">
                    <input 
                        value={newVal} 
                        onChange={e => setNewVal(e.target.value)} 
                        className="flex-1 bg-white text-slate-900 border-2 border-white p-3 rounded-xl font-bold placeholder:text-gray-300 outline-none focus:ring-4 focus:ring-orange-500/30" 
                        placeholder="e.g. 512GB SSD" 
                    />
                    <button 
                        onClick={addOption} 
                        disabled={submitting || !newVal} 
                        className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white p-3 rounded-xl font-bold flex items-center justify-center gap-2 transition shadow-lg shadow-orange-500/20 aspect-square"
                    >
                        {submitting ? <Loader2 className="animate-spin" size={24} /> : <Plus size={24} />}
                    </button>
                </div>
             </div>
         </div>
      </div>

      {/* LIST */}
      <div className="columns-1 md:columns-2 gap-8 space-y-8">
         {Object.entries(grouped).map(([category, keys]) => (
            <div key={category} className="break-inside-avoid bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
               <div className="bg-slate-50 p-5 border-b border-gray-100 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                      <div className="bg-white p-2 rounded-lg border border-gray-200 text-slate-400">
                          <Tag size={16} />
                      </div>
                      <h3 className="font-black text-xl capitalize text-slate-800">{category}</h3>
                  </div>
                  <span className="text-[10px] font-bold bg-white border border-gray-200 px-2 py-1 rounded-md text-slate-400 uppercase tracking-wider">
                    {Object.keys(keys).length} Keys
                  </span>
               </div>
               
               <div className="p-6 space-y-8">
                  {Object.entries(keys).map(([key, values]) => (
                     <div key={key}>
                        <div className="flex items-center gap-2 mb-3">
                            <div className="h-px flex-1 bg-gray-100"></div>
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">{key}</h4>
                            <div className="h-px flex-1 bg-gray-100"></div>
                        </div>
                        
                        <div className="flex flex-wrap gap-2 justify-center">
                           {values.map((opt) => (
                              <div key={opt.id} className="group relative bg-white border-2 border-slate-100 px-4 py-2 rounded-xl text-sm font-bold text-slate-600 flex items-center gap-2 hover:border-red-100 hover:bg-red-50 hover:text-red-600 transition cursor-default">
                                 {opt.value}
                                 <button 
                                   onClick={() => deleteOption(opt.id)} 
                                   className="text-red-300 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-all scale-0 group-hover:scale-100"
                                   title="Remove option"
                                 >
                                    <Trash2 size={14} />
                                 </button>
                              </div>
                           ))}
                        </div>
                     </div>
                  ))}
               </div>
            </div>
         ))}

         {Object.keys(grouped).length === 0 && (
             <div className="col-span-full text-center py-20 opacity-50">
                 <p>No attributes defined yet.</p>
             </div>
         )}
      </div>
    </div>
  );
}