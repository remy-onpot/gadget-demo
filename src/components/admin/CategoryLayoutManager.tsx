"use client";

import React, { useState, useEffect, useTransition } from 'react';
import { supabase } from '@/lib/supabase';
import { CategorySection, FilterRule } from '@/lib/types';
import { saveCategorySection, deleteCategorySection } from '@/app/admin/actions'; 
import { Plus, Trash2, Save, Layout, Filter, Settings2, ChevronRight, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export const CategoryLayoutManager = () => {
  // WHITE-LABEL: No hardcoded categories. Start empty.
  const [categories, setCategories] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState('');
  
  const [sections, setSections] = useState<CategorySection[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Editor State
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formState, setFormState] = useState<{
    title: string;
    type: 'product_row' | 'brand_row';
    rules: FilterRule[];
  }>({ title: '', type: 'product_row', rules: [] });

  const [isPending, startTransition] = useTransition();

  // 1. FETCH CATEGORIES (White-Label)
  useEffect(() => {
    const fetchCats = async () => {
        const { data } = await supabase.from('products').select('category');
        if (data && data.length > 0) {
            const unique = Array.from(new Set(data.map(p => p.category.toLowerCase()))).filter(Boolean);
            const sorted = unique.sort();
            setCategories(sorted);
            if (sorted.length > 0) setActiveCategory(sorted[0]);
        }
    };
    fetchCats();
  }, []);

  // 2. FETCH SECTIONS
  useEffect(() => {
    if (!activeCategory) return;
    
    const fetchSections = async () => {
        setLoading(true);
        const { data } = await supabase
        .from('category_sections')
        .select('*')
        .eq('category_slug', activeCategory)
        .order('sort_order', { ascending: true });
        
        if (data) {
            const parsedData = data.map(d => ({
                ...d,
                filter_rules: d.filter_rules as unknown as FilterRule[]
            }));
            setSections(parsedData as CategorySection[]);
        }
        setLoading(false);
    };
    fetchSections();
  }, [activeCategory]);

  const addRule = () => {
    setFormState(prev => ({
      ...prev,
      rules: [...prev.rules, { key: 'price', field: 'price', operator: 'lte', value: '' }]
    }));
  };

  const updateRule = (index: number, key: keyof FilterRule, value: any) => {
    const newRules = [...formState.rules];
    newRules[index] = { ...newRules[index], [key]: value };
    setFormState({ ...formState, rules: newRules });
  };

  const removeRule = (index: number) => {
    setFormState(prev => ({
      ...prev,
      rules: prev.rules.filter((_, i) => i !== index)
    }));
  };

  const handleSave = () => {
    if (!formState.title) return toast.error("Title is required");

    const payload = {
      ...(editingId && { id: editingId }), 
      category_slug: activeCategory,
      title: formState.title,
      section_type: formState.type,
      filter_rules: formState.rules as any, 
      sort_order: sections.length + 1,
      is_active: true
    };

    startTransition(async () => {
        try {
            await saveCategorySection(payload);
            toast.success("Section saved successfully");
            setIsEditing(false);
            setEditingId(null);
            setFormState({ title: '', type: 'product_row', rules: [] });
            
            // Re-fetch manually
            const { data } = await supabase
                .from('category_sections')
                .select('*')
                .eq('category_slug', activeCategory)
                .order('sort_order', { ascending: true });
            
            if (data) {
                const parsedData = data.map(d => ({ ...d, filter_rules: d.filter_rules as unknown as FilterRule[] }));
                setSections(parsedData as CategorySection[]);
            }

        } catch (e: any) {
            toast.error("Failed to save: " + e.message);
        }
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm('Delete this layout section?')) return;

    startTransition(async () => {
        try {
            await deleteCategorySection(id);
            toast.success("Section deleted");
            setSections(prev => prev.filter(s => s.id !== id));
        } catch (e: any) {
            toast.error("Failed to delete: " + e.message);
        }
    });
  };

  const openEditor = (section?: CategorySection) => {
    if (section) {
      setEditingId(section.id);
      setFormState({ 
        title: section.title, 
        type: section.section_type, 
        rules: section.filter_rules || [] 
      });
    } else {
      setEditingId(null);
      setFormState({ title: '', type: 'product_row', rules: [] });
    }
    setIsEditing(true);
  };

  if (categories.length === 0) {
      return (
          <div className="p-10 text-center border-2 border-dashed border-gray-200 rounded-xl">
             <Layout className="w-12 h-12 text-gray-300 mx-auto mb-4"/>
             <h3 className="text-lg font-bold text-gray-600">No Categories Found</h3>
             <p className="text-gray-400">Add products with categories first to configure layouts.</p>
          </div>
      )
  }

  return (
    <div className="space-y-8 pb-20">
      {/* 1. CATEGORY TABS (DYNAMIC) */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-white border border-gray-200 rounded-2xl w-fit shadow-sm">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => { setActiveCategory(cat); setIsEditing(false); }}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold capitalize transition-all ${
              activeCategory === cat 
              ? 'bg-[#0A2540] text-white shadow-md' 
              : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

       {/* 2. HEADER & ACTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
           <h2 className="text-2xl font-black text-slate-900 capitalize flex items-center gap-2">
             <Layout className="text-orange-500" /> 
             {activeCategory} Layout
           </h2>
           <p className="text-slate-500 text-sm mt-1">Define the curated rows that appear on the {activeCategory} page.</p>
        </div>
        <button 
          onClick={() => openEditor()}
          className="bg-slate-900 text-white px-5 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-800 transition shadow-lg shadow-slate-900/10 active:scale-95"
        >
          <Plus size={18} /> New Section
        </button>
      </div>

      {/* 3. SECTION LIST */}
      {loading ? (
        <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-slate-400 w-8 h-8"/></div>
      ) : (
        <div className="grid gap-4 max-w-4xl">
          {sections.map((section, idx) => (
            <div key={section.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between group hover:border-orange-200 hover:shadow-md transition-all">
               <div className="flex items-center gap-5">
                  <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center font-black text-slate-300 text-sm border border-slate-100">
                    {idx + 1}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-slate-900 tracking-tight">{section.title}</h3>
                    <div className="flex flex-wrap items-center gap-2 mt-1.5">
                       <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${section.section_type === 'brand_row' ? 'bg-purple-50 text-purple-700 border-purple-100' : 'bg-blue-50 text-blue-700 border-blue-100'}`}>
                          {section.section_type === 'brand_row' ? 'Brand Logos' : 'Product Row'}
                       </span>
                       
                       {section.filter_rules.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            <span className="text-[10px] text-gray-400 font-bold px-1">Rules:</span>
                            {section.filter_rules.map((r, i) => (
                              <span key={i} className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded border border-gray-200 font-mono">
                                  {r.key || r.field} {r.operator} {r.value}
                              </span>
                            ))}
                          </div>
                       )}
                    </div>
                  </div>
               </div>
               
               <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEditor(section)} className="p-2.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors">
                    <Settings2 size={18} />
                  </button>
                  <button onClick={() => handleDelete(section.id)} disabled={isPending} className="p-2.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors">
                    <Trash2 size={18} />
                  </button>
               </div>
            </div>
          ))}
          {sections.length === 0 && (
             <div className="p-8 text-center text-slate-400 border border-dashed border-gray-200 rounded-2xl">
                No sections defined for {activeCategory}. Default rows will appear.
             </div>
          )}
        </div>
      )}

      {/* 4. EDITOR MODAL */}
      {isEditing && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200">
           <div className="bg-white w-full max-w-xl rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
             
             {/* Header */}
             <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
                 <div>
                    <h3 className="font-black text-xl text-slate-900">{editingId ? 'Edit Section' : 'Create Section'}</h3>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wide mt-1">Row Configuration</p>
                 </div>
                 <button onClick={() => setIsEditing(false)} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-slate-900 transition">
                   <X size={20} />
                 </button>
             </div>
             
             <div className="p-6 overflow-y-auto space-y-8">
                 <div className="space-y-5">
                    <div>
                       <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Display Title</label>
                       <input 
                         className="w-full p-4 bg-slate-50 border-transparent rounded-xl font-bold text-slate-900 outline-none focus:bg-white focus:ring-2 ring-orange-100 transition-all placeholder:text-gray-300" 
                         placeholder="e.g. Under ₵2000"
                         value={formState.title}
                         onChange={e => setFormState({...formState, title: e.target.value})}
                       />
                    </div>
                    <div>
                       <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Content Type</label>
                       <div className="grid grid-cols-2 gap-3">
                          {['product_row', 'brand_row'].map((type) => (
                             <button 
                               key={type}
                               onClick={() => setFormState({...formState, type: type as any})}
                               className={`py-3 rounded-xl border text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                                  formState.type === type 
                                  ? 'bg-slate-900 text-white border-slate-900 shadow-md' 
                                  : 'bg-white text-slate-500 border-gray-200 hover:bg-slate-50'
                               }`}
                             >
                               {type === 'product_row' ? <Layout size={16}/> : <Settings2 size={16}/>}
                               {type === 'product_row' ? 'Product Grid' : 'Brand Logos'}
                             </button>
                          ))}
                       </div>
                    </div>
                 </div>

                 {/* Rule Engine */}
                 {formState.type === 'product_row' && (
                   <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
                      <div className="flex justify-between items-center mb-4">
                         <h4 className="text-sm font-black text-slate-700 flex items-center gap-2">
                            <Filter size={16} className="text-orange-500"/> Smart Filter Rules
                         </h4>
                         <button onClick={addRule} className="text-xs font-bold bg-white border border-gray-200 px-3 py-1.5 rounded-lg hover:border-orange-300 hover:text-orange-600 transition shadow-sm">
                           + Add Rule
                         </button>
                      </div>
                      
                      <div className="space-y-3">
                         {formState.rules.map((rule, idx) => (
                           <div key={idx} className="flex gap-2 items-center animate-in slide-in-from-left-2">
                             <div className="relative w-1/3">
                               <select 
                                    className="w-full appearance-none bg-white text-xs font-bold p-3 pr-8 rounded-xl border border-gray-200 outline-none focus:border-orange-300"
                                    value={rule.key || rule.field} 
                                    onChange={e => {
                                        updateRule(idx, 'key', e.target.value);
                                        updateRule(idx, 'field', e.target.value);
                                    }}
                               >
                                   <option value="price">Price (GHS)</option>
                                   <option value="brand">Brand</option>
                                   <option value="specs.ram">RAM</option>
                                   <option value="condition">Condition</option>
                                   <option value="isFeatured">Featured?</option>
                               </select>
                               <ChevronRight className="absolute right-3 top-3.5 text-gray-400 w-3 h-3 rotate-90 pointer-events-none"/>
                             </div>
                             
                             <div className="relative w-1/3">
                               <select 
                                   className="w-full appearance-none bg-white text-xs font-bold p-3 pr-8 rounded-xl border border-gray-200 outline-none focus:border-orange-300"
                                   value={rule.operator}
                                   onChange={e => updateRule(idx, 'operator', e.target.value)}
                               >
                                   <option value="eq">Equals (=)</option>
                                   <option value="contains">Contains</option>
                                   <option value="gt">Greater (&gt;)</option>
                                   <option value="lt">Less (&lt;)</option>
                                   <option value="gte">At Least (&ge;)</option>
                                   <option value="lte">At Most (&le;)</option>
                               </select>
                               <ChevronRight className="absolute right-3 top-3.5 text-gray-400 w-3 h-3 rotate-90 pointer-events-none"/>
                             </div>

                             <input 
                               className="w-1/3 text-xs font-bold p-3 rounded-xl border border-gray-200 outline-none focus:border-orange-300"
                               placeholder="Value..."
                               value={rule.value}
                               onChange={e => updateRule(idx, 'value', e.target.value)}
                             />
                             
                             <button onClick={() => removeRule(idx)} className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                               <Trash2 size={16}/>
                             </button>
                           </div>
                         ))}
                         
                         {formState.rules.length === 0 && (
                            <div className="text-center py-6 border border-dashed border-gray-200 rounded-xl bg-white/50 text-gray-400 text-xs">
                               No active filters. Shows all products.
                            </div>
                         )}
                      </div>
                   </div>
                 )}
             </div>

             <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                 <button onClick={() => setIsEditing(false)} className="px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-gray-200 transition text-sm">Cancel</button>
                 <button 
                    onClick={handleSave} 
                    disabled={isPending}
                    className="bg-[#F97316] text-white px-8 py-3 rounded-xl font-bold hover:bg-orange-600 shadow-lg shadow-orange-200 transition-transform active:scale-95 flex items-center gap-2 text-sm disabled:opacity-70 disabled:cursor-not-allowed"
                 >
                    {isPending ? <Loader2 className="animate-spin" size={18}/> : <Save size={18} />} 
                    Save Layout
                 </button>
             </div>
           </div>
        </div>
      )}

    </div>
  );
};