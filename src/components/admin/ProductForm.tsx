"use client";

import React, { useState, useEffect, useRef } from 'react';
import { 
  X, Upload, Loader2, Trash2, 
  CheckCircle, Sparkles, Tag, Package, 
  TrendingUp, ChevronRight, Image as ImageIcon, FileText, Lock, Lightbulb
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { upsertProduct } from '@/actions/product-actions';
import { useAdminRole } from '@/hooks/useAdminRole';
import { useAdminData } from '@/hooks/useAdminData';
import { Database } from '@/lib/database.types';
import { toast } from 'sonner';
import { VideoTo360Uploader } from '@/components/product/VideoTo360Uploader';

// TYPES
type ProductRow = Database['public']['Tables']['products']['Row'];
type VariantRowDB = Database['public']['Tables']['product_variants']['Row'];

interface ProductWithRelations extends ProductRow {
  product_variants: VariantRowDB[];
  categories?: { id: string; name: string } | null;
}

type AttributeOption = { id: string; key: string; value: string };

type VariantUI = {
  id: string;
  condition: string;
  specs: Record<string, string>;
  price: number;
  stock: number;
};

type ImageItem = { id: string; url?: string; file?: File; };

interface ProductFormProps {
  onClose: () => void;
  initialData?: ProductWithRelations | null; 
}

const CONDITIONS = ['New', 'Used', 'Refurbished', 'Open Box'];

export const ProductForm = ({ onClose, initialData }: ProductFormProps) => {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isStaff } = useAdminRole();
  const { storeId } = useAdminData();
  
  // --- PARENT STATE ---
  const [images, setImages] = useState<ImageItem[]>([]);
  const [productData, setProductData] = useState({
    name: '',
    brand: '',
    category_id: '', 
    description: '',
    basePrice: '',
    slug: ''
  });

  const [categories, setCategories] = useState<{id: string, name: string}[]>([]);

  // --- MATRIX STATE ---
  const [availableOptions, setAvailableOptions] = useState<AttributeOption[]>([]);
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string[]>>({});
  const [selectedConditions, setSelectedConditions] = useState<string[]>(['New']); // ✅ Added Condition State
  const [generatedVariants, setGeneratedVariants] = useState<VariantUI[]>([]);

  // 0. LOAD CATEGORIES
  useEffect(() => {
    const fetchCats = async () => {
        if (!storeId) return;
        const { data } = await supabase
          .from('categories')
          .select('id, name')
          .eq('store_id', storeId)
          .order('name');
        
        if (data) {
            setCategories(data);
            if (!initialData && data.length > 0 && !productData.category_id) {
                setProductData(prev => ({ ...prev, category_id: data[0].id }));
            }
        }
    };
    fetchCats();
  }, [initialData, storeId]);

  // 1. HYDRATE DATA
  useEffect(() => {
    if (initialData) {
      setProductData({
        name: initialData.name,
        brand: initialData.brand || '',
        category_id: initialData.category_id || initialData.categories?.id || '',
        description: initialData.description || '',
        basePrice: initialData.base_price?.toString() || '',
        slug: initialData.slug
      });

      if (initialData.base_images && Array.isArray(initialData.base_images)) {
        setImages(initialData.base_images.map((url: string) => ({ id: url, url: url })));
      }

      if (initialData.product_variants) {
        setGeneratedVariants(initialData.product_variants.map((v) => ({
          id: v.id,
          condition: v.condition || 'New',
          specs: (v.specs as Record<string, string>) || {},
          price: v.price || 0,
          stock: v.stock || 0
        })));
      }
    }
  }, [initialData]);

  // 2. FETCH ATTRIBUTES
  useEffect(() => {
    let isMounted = true;
    const fetchOptions = async () => {
      setAvailableOptions([]); 
      if (!initialData || productData.category_id !== initialData.category_id) {
         setSelectedAttributes({});
      }

      if (!productData.category_id) return;

      const { data } = await supabase
        .from('attribute_options')
        .select('*')
        .eq('category_id', productData.category_id) 
        .order('sort_order');
      
      if (isMounted && data) {
        setAvailableOptions(data);
      }
    };
    fetchOptions();
    return () => { isMounted = false; };
  }, [productData.category_id, initialData]);

  // 3. AUTO SLUG
  useEffect(() => {
    if (!initialData) {
      const slug = productData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      setProductData(prev => ({ ...prev, slug }));
    }
  }, [productData.name, initialData]);

  // Validation
  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};
    if (!productData.name.trim()) newErrors.name = 'Required';
    if (!productData.brand.trim()) newErrors.brand = 'Required';
    if (!productData.category_id) newErrors.category = 'Required';
    if (!productData.basePrice || Number(productData.basePrice) <= 0) newErrors.basePrice = 'Invalid';
    if (images.length === 0) newErrors.images = 'Required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Image Logic
  const handleFiles = (files: File[]) => {
    const newImages = files.map(file => ({ id: Math.random().toString(36).substr(2, 9), file }));
    setImages(prev => [...prev, ...newImages]);
    setErrors(prev => ({ ...prev, images: '' }));
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/')));
    }
  };

  // --- MATRIX LOGIC ---
  const toggleAttribute = (key: string, value: string) => {
    setSelectedAttributes(prev => {
      const current = prev[key] || [];
      const exists = current.includes(value);
      const updated = exists ? current.filter(v => v !== value) : [...current, value];
      return { ...prev, [key]: updated };
    });
  };

  const toggleCondition = (cond: string) => {
      setSelectedConditions(prev => prev.includes(cond) ? prev.filter(c => c !== cond) : [...prev, cond]);
  };

  const generateMatrix = () => {
    // We combine Attributes AND Conditions
    const attrKeys = Object.keys(selectedAttributes).filter(k => selectedAttributes[k].length > 0);
    
    if (attrKeys.length === 0 && selectedConditions.length === 0) {
        toast.error("Select at least one condition or attribute.");
        return;
    }

    // Helper to generate combinations
    const combine = ([head, ...tail]: string[]): Record<string, string>[] => {
      if (!head) return [{}];
      const tailCombos = combine(tail);
      return selectedAttributes[head].flatMap(val => {
        return tailCombos.map(combo => ({ ...combo, [head]: val }));
      });
    };

    // 1. Generate Attribute Combinations (e.g. {Color: Red, Size: XL})
    const attributeCombos = attrKeys.length > 0 ? combine(attrKeys) : [{}];

    // 2. Multiply by Conditions (e.g. {Color: Red} + Condition: New)
    const finalCombos = selectedConditions.flatMap(cond => {
        return attributeCombos.map(attrs => ({
            condition: cond,
            specs: attrs
        }));
    });
    
    const newRows: VariantUI[] = finalCombos.map((combo, idx) => ({
        id: `temp-${Date.now()}-${idx}`,
        condition: combo.condition,
        specs: combo.specs,
        price: Number(productData.basePrice) || 0,
        stock: 1
    }));

    setGeneratedVariants(prev => {
      // Deduplicate against existing items
      const uniqueNewRows = newRows.filter(newRow => {
        const isDuplicate = prev.some(existing => 
          existing.condition === newRow.condition && 
          JSON.stringify(existing.specs) === JSON.stringify(newRow.specs)
        );
        return !isDuplicate;
      });
      return [...prev, ...uniqueNewRows];
    });
  };

  const handleFinalSave = async () => {
    if (generatedVariants.length === 0) {
        toast.error("Please generate variants first!");
        return;
    }
    setLoading(true);
    
    try {
      // Upload Images
      const finalImageUrls = await Promise.all(
        images.map(async (img) => {
           if (img.file) {
             const fileName = `${Date.now()}-${img.file.name.replace(/[^a-zA-Z0-9.]/g, '')}`;
             const path = `products/${fileName}`;
             const { error } = await supabase.storage.from('products').upload(path, img.file);
             if (error) throw new Error("Image upload failed");
             const { data } = supabase.storage.from('products').getPublicUrl(path);
             return data.publicUrl;
           }
           return img.url!;
        })
      );

      const productPayload = {
        id: initialData?.id, 
        name: productData.name,
        slug: productData.slug + (initialData ? '' : `-${Math.floor(Math.random() * 1000)}`),
        brand: productData.brand,
        category_id: productData.category_id, 
        description: productData.description,
        base_price: Number(productData.basePrice),
        base_images: finalImageUrls,
        is_active: true
      };

      const variantsPayload = generatedVariants.map(v => ({
        condition: v.condition,
        specs: v.specs, 
        price: v.price,
        stock: v.stock
      }));

      const res = await upsertProduct(productPayload, variantsPayload);

      if (res?.success) {
         toast.success(initialData ? "Updated" : "Published");
         onClose(); 
      } else {
         throw new Error(res?.error || "Save failed");
      }

    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  const groupedOptions = availableOptions.reduce((acc, opt) => {
    if (!acc[opt.key]) acc[opt.key] = [];
    acc[opt.key].push(opt);
    return acc;
  }, {} as Record<string, AttributeOption[]>);

  const selectedCategoryName = categories.find(c => c.id === productData.category_id)?.name || 'Uncategorized';
  const inputBaseClass = "w-full bg-white text-slate-900 border-2 border-slate-200 rounded-xl font-bold px-4 py-3.5 outline-none transition-all placeholder:text-slate-400 placeholder:font-medium focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 hover:border-slate-300";

  return (
    <div className="flex flex-col h-full bg-[#F8FAFC]">
      {/* HEADER */}
      <div className="bg-white border-b border-slate-200 px-6 py-5 sticky top-0 z-50 shadow-sm flex justify-between items-center">
         <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Package className="text-white" size={20} />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">
                {initialData ? 'Edit Product' : 'Add New Product'}
              </h2>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                {initialData ? 'Update Inventory' : `Step ${step} of 2`}
              </p>
            </div>
         </div>
         <button onClick={onClose} className="p-2 bg-white border-2 border-slate-100 hover:bg-red-50 hover:text-red-600 rounded-xl text-slate-400 transition-all"><X size={20}/></button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 lg:p-8">
        <div className="max-w-7xl mx-auto">
          
          {step === 1 && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* IMAGES */}
              <div className="lg:col-span-5 space-y-5">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                  <div className="flex justify-between mb-4">
                    <h3 className="font-black text-xs text-slate-900 uppercase tracking-widest flex items-center gap-2"><ImageIcon size={16} className="text-blue-600"/> Media</h3>
                    <span className="text-[10px] font-bold bg-slate-100 px-2 py-1 rounded text-slate-500">{images.length} Added</span>
                  </div>

                  {/* 💡 Pro Tips Section */}
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-4 mb-6">
                    <div className="flex items-start gap-3">
                      <div className="bg-blue-500 p-1.5 rounded-lg flex-shrink-0">
                        <Lightbulb size={16} className="text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-blue-900 text-sm mb-2">Pro Tips for Best Results</h4>
                        <ul className="space-y-1.5 text-xs text-blue-800">
                          <li className="flex items-start gap-2">
                            <span className="text-blue-500 mt-0.5">•</span>
                            <span><strong>360° Video:</strong> Place product on a turntable, keep camera steady, rotate smoothly in 10-20 seconds</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-blue-500 mt-0.5">•</span>
                            <span><strong>Lighting:</strong> Use natural light or soft white lights from multiple angles to avoid harsh shadows</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-blue-500 mt-0.5">•</span>
                            <span><strong>Background:</strong> Plain white/light gray backgrounds make products pop and look professional</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-blue-500 mt-0.5">•</span>
                            <span><strong>Resolution:</strong> 1080p is perfect - higher resolutions slow down page load times</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* ✨ 360° VIDEO UPLOADER (Optional) */}
                  <div className="mb-6">
  {initialData?.id && storeId ? (
    <VideoTo360Uploader 
      storeId={storeId}
      productId={initialData.id}
      onSuccess={() => toast.success("360° view added successfully!")}
    />
  ) : (
    <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl p-6 text-center">
      <div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-400">
        <Sparkles size={20} />
      </div>
      <h4 className="font-bold text-slate-700">360° Video Feature</h4>
      <p className="text-xs text-slate-500 mt-1">
        Please <strong>save this product</strong> first to upload a 360° video.
      </p>
    </div>
  )}
</div>

                  {/* Standard Image Upload */}
                  <div 
                    className={`border-2 border-dashed rounded-xl p-8 mb-6 text-center cursor-pointer transition-all ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-slate-300 hover:border-blue-400'}`}
                    onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                  >
                      <Upload size={24} className="mx-auto text-slate-400 mb-2"/>
                      <p className="text-sm font-bold text-slate-700">Click or Drag images</p>
                      <input ref={fileInputRef} type="file" multiple accept="image/*" className="hidden" onChange={e => e.target.files && handleFiles(Array.from(e.target.files))} />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {images.map((img, i) => (
                      <div key={img.id} className="aspect-square bg-slate-100 rounded-xl relative group overflow-hidden border border-slate-200">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={img.file ? URL.createObjectURL(img.file) : img.url} className="w-full h-full object-cover" alt="preview" />
                        <button onClick={(e) => { e.stopPropagation(); setImages(prev => prev.filter((_, idx) => idx !== i)); }} className="absolute top-1 right-1 bg-white/90 text-red-600 rounded p-1 opacity-0 group-hover:opacity-100 transition"><Trash2 size={12}/></button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* DETAILS */}
              <div className="lg:col-span-7">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-6">
                  <div className="w-full">
                    <label className="input-label">Product Title</label>
                    <input className={`${inputBaseClass} ${errors.name ? 'border-red-300' : ''}`} value={productData.name} onChange={e => setProductData({...productData, name: e.target.value})} placeholder="e.g. Leather Sofa" />
                  </div>
                  <div className="grid grid-cols-2 gap-6 w-full">
                    <div className="w-full">
                      <label className="input-label">Category</label>
                      <div className="relative group w-full">
                          <select 
                             className={`${inputBaseClass} appearance-none capitalize`} 
                             value={productData.category_id} 
                             onChange={(e) => setProductData({...productData, category_id: e.target.value})}
                          >
                             <option value="">Select Category...</option>
                             {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                          </select>
                          <ChevronRight className="absolute right-4 top-3.5 rotate-90 text-slate-400 pointer-events-none" size={16}/>
                      </div>
                    </div>
                    <div className="w-full">
                      <label className="input-label">Brand</label>
                      <input className={inputBaseClass} value={productData.brand} onChange={e => setProductData({...productData, brand: e.target.value})} placeholder="e.g. Nike" />
                    </div>
                  </div>
                  <div className="w-full">
                    <label className="input-label">Base Price</label>
                    <div className="relative group w-full">
                      <span className="absolute left-4 top-3.5 text-sm font-black text-slate-500">GHS</span>
                      <input 
                        type="number" 
                        className={`${inputBaseClass} pl-14 ${isStaff ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : ''}`} 
                        value={productData.basePrice} 
                        onChange={e => setProductData({...productData, basePrice: e.target.value})} 
                        disabled={isStaff}
                      />
                      {isStaff && <Lock className="absolute right-4 top-3.5 text-red-400" size={16} />}
                    </div>
                  </div>
                  
                  <div className="col-span-12 w-full">
                    <div className="flex justify-between items-end mb-2">
                        <label className="input-label mb-0">Product Description</label>
                        <span className="text-xs text-slate-400 font-mono">{productData.description.length}/500 chars</span>
                    </div>
                    <div className="relative group w-full">
                        <FileText className="absolute left-4 top-5 text-slate-400 group-focus-within:text-blue-500 transition-colors pointer-events-none" size={20}/>
                        <textarea className={`${inputBaseClass} h-64 py-5 pl-12 leading-relaxed resize-none text-base`} value={productData.description} onChange={e => setProductData({...productData, description: e.target.value})} placeholder="Describe key features..." />
                    </div>
                  </div>

                  <div className="flex justify-end pt-4 border-t border-slate-100">
                    <button onClick={() => validateStep1() && setStep(2)} className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-600 transition">Continue <ChevronRight size={18}/></button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              {/* Product Summary */}
              <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  {images.length > 0 && <div className="w-14 h-14 rounded-lg bg-white/10 p-1"><img src={images[0].file ? URL.createObjectURL(images[0].file!) : images[0].url} className="w-full h-full object-cover rounded" alt="cover" /></div>}
                  <div>
                    <h3 className="text-lg font-black">{productData.name}</h3>
                    <div className="flex gap-3 text-sm text-slate-300 font-medium"><span>{productData.brand}</span><span>•</span><span className="capitalize">{selectedCategoryName}</span></div>
                  </div>
                </div>
                <button onClick={() => setStep(1)} className="text-xs font-bold bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-colors">Edit Details</button>
              </div>

              {/* MATRIX BUILDER */}
              <div className="bg-white p-6 lg:p-8 rounded-2xl border border-slate-200 shadow-sm">
                 <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 pb-6 border-b border-slate-100 gap-4">
                    <div>
                        <h3 className="text-lg font-black text-slate-900 flex items-center gap-2 mb-1"><Sparkles className="text-amber-500" size={20}/> Bulk Matrix Generator</h3>
                        <p className="text-sm text-slate-500 font-medium">Select attributes and conditions to generate variants.</p>
                    </div>
                    <button onClick={generateMatrix} className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg hover:bg-blue-700 transition-all">
                         <Tag size={18}/> Generate
                    </button>
                 </div>
                 
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* 1. CONDITION SELECTOR */}
                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                        <h4 className="font-black text-xs text-blue-500 uppercase mb-3 flex justify-between">Condition <span className="bg-blue-200 px-2 rounded-full text-[10px] text-blue-700">{selectedConditions.length}</span></h4>
                        <div className="flex flex-wrap gap-2">
                            {CONDITIONS.map(cond => {
                                const isSelected = selectedConditions.includes(cond);
                                return (
                                    <button key={cond} onClick={() => toggleCondition(cond)} className={`px-3 py-1.5 text-xs font-bold rounded-lg border-2 transition ${isSelected ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-200 hover:border-blue-400'}`}>
                                        {cond}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* 2. ATTRIBUTE SELECTORS */}
                    {Object.entries(groupedOptions).map(([key, options]) => (
                       <div key={key} className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                          <h4 className="font-black text-xs text-slate-500 uppercase mb-3 flex justify-between">{key} <span className="bg-slate-200 px-2 rounded-full text-[10px] text-slate-600">{selectedAttributes[key]?.length || 0}</span></h4>
                          <div className="flex flex-wrap gap-2">
                             {options.map(opt => {
                                const isSelected = selectedAttributes[key]?.includes(opt.value);
                                return (
                                    <button key={opt.id} onClick={() => toggleAttribute(key, opt.value)} className={`px-3 py-1.5 text-xs font-bold rounded-lg border-2 transition ${isSelected ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200 hover:border-blue-400'}`}>
                                        {opt.value}
                                    </button>
                                );
                             })}
                          </div>
                       </div>
                    ))}
                 </div>
              </div>

              {/* TABLE */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="p-5 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                    <h3 className="font-bold text-slate-900 flex items-center gap-2"><TrendingUp size={18} className="text-green-600"/> SKU List <span className="bg-white border border-slate-200 text-slate-600 px-2 py-0.5 rounded text-xs ml-2">{generatedVariants.length} Variants</span></h3>
                    <button onClick={() => setGeneratedVariants([])} className="text-red-500 text-xs font-bold hover:text-red-700 bg-white border border-red-100 hover:border-red-200 px-3 py-1.5 rounded-lg transition-all flex items-center gap-1"><Trash2 size={14} /> Clear All</button>
                  </div>
                  <div className="overflow-x-auto max-h-[500px]">
                    <table className="w-full text-sm text-left">
                       <thead className="bg-slate-50 text-xs text-slate-500 uppercase font-black sticky top-0 z-10">
                          <tr><th className="px-6 py-3">Variant</th><th className="px-6 py-3">Price (GHS)</th><th className="px-6 py-3">Stock</th><th className="px-6 py-3"></th></tr>
                       </thead>
                       <tbody className="divide-y divide-slate-300">
                          {generatedVariants.map((v, i) => (
                             <tr key={i} className="hover:bg-blue-50/10">
                                <td className="px-6 py-3 font-medium text-slate-700"><span className="font-black mr-2 bg-slate-100 px-2 py-0.5 rounded text-xs uppercase">{v.condition}</span> {Object.values(v.specs).join(' • ')}</td>
                                <td className="px-6 py-3"><input type="number" className="w-28 p-2 border-2 border-slate-200 rounded-lg font-bold focus:border-blue-500 outline-none" value={v.price} onChange={e => { const copy = [...generatedVariants]; copy[i].price = Number(e.target.value); setGeneratedVariants(copy); }} /></td>
                                <td className="px-6 py-3"><input type="number" className="w-20 p-2 border-2 border-slate-200 rounded-lg font-bold text-center focus:border-blue-500 outline-none" value={v.stock} onChange={e => { const copy = [...generatedVariants]; copy[i].stock = Number(e.target.value); setGeneratedVariants(copy); }} /></td>
                                <td className="px-6 py-3 text-right"><button onClick={() => setGeneratedVariants(p => p.filter((_, idx) => idx !== i))} className="text-slate-300 hover:text-red-500 transition"><Trash2 size={18}/></button></td>
                             </tr>
                          ))}
                       </tbody>
                    </table>
                  </div>
              </div>

              <div className="flex justify-end pt-6 border-t border-slate-200">
                 <button onClick={handleFinalSave} disabled={loading} className="bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 shadow-xl hover:bg-emerald-700 transition">
                    {loading ? <Loader2 className="animate-spin"/> : <CheckCircle/>} {initialData ? 'Update Inventory' : 'Publish Product'}
                 </button>
              </div>
            </div>
          )}
        </div>
      </div>
      <style jsx>{`.input-label { @apply block text-xs font-extrabold text-slate-600 uppercase mb-2 ml-1 tracking-wider; }`}</style>
    </div>
  );
}