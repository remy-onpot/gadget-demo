"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Banner, BANNER_RULES, BannerSlot } from '@/lib/types';
import { Trash2, AlertCircle, CheckCircle, Loader2, Link as LinkIcon, ImagePlus, Palette } from 'lucide-react';
import Image from 'next/image';

// --- CONFIGURATION ---
const SLOT_GROUPS = {
  'Homepage Hero': ['main_hero', 'side_top', 'side_bottom'],
  'Discovery Tiles': ['tile_new', 'tile_student', 'flash'],
  'Store Info': ['branch_slider', 'brand_hero']
};

// Slots that allow Text Overlays (Title, Label, Description)
const RICH_CONTENT_SLOTS = ['main_hero', 'side_top', 'side_bottom', 'brand_hero'];

export const MarketingManager = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<BannerSlot>('brand_hero'); // Default to brand_hero for easier testing
  
  // FORM STATE
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  
  // RICH CONTENT STATE
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    label: '',
    cta_text: 'Shop Now',
    link_url: '',
    bg_color: '#0A2540'
  });

  const rule = BANNER_RULES[selectedSlot];
  const isRichContent = RICH_CONTENT_SLOTS.includes(selectedSlot);

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    const { data } = await supabase.from('banners').select('*').order('created_at', { ascending: false });
    if (data) setBanners(data as any);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');
    const objectUrl = URL.createObjectURL(file);
    setImageFile(file);
    setPreviewUrl(objectUrl);
  };

  const handleUpload = async () => {
    if (!imageFile || !formData.link_url) return setError("Image and Link are required");
    
    // Validation for Text Slots
    if (isRichContent) {
       if (!formData.title) return setError("This slot requires a Title (e.g., 'PS5 Pro') to display correctly.");
    }

    setUploading(true);

    try {
      const fileName = `${selectedSlot}-${Date.now()}.${imageFile.name.split('.').pop()}`;
      const { error: upErr } = await supabase.storage.from('marketing').upload(fileName, imageFile);
      if (upErr) throw upErr;

      const { data: { publicUrl } } = supabase.storage.from('marketing').getPublicUrl(fileName);

      const { data, error } = await supabase.from('banners').insert({
        slot: selectedSlot,
        image_url: publicUrl,
        is_active: true,
        // Spread the rich text data (only saves if fields are filled)
        title: formData.title,
        description: formData.description,
        label: formData.label,
        bg_color: formData.bg_color,
        cta_text: formData.cta_text,
        link_url: formData.link_url
      }).select().single();

      if (error) throw error;
      
      setBanners([data as any, ...banners]);
      
      // Reset Form
      setImageFile(null);
      setPreviewUrl('');
      setFormData({ title: '', description: '', label: '', cta_text: 'Shop Now', link_url: '', bg_color: '#0A2540' });
    } catch (e: any) {
      setError(e.message);
    } finally {
      setUploading(false);
    }
  };

  const deleteBanner = async (id: string) => {
    if(!confirm("Remove this asset? It will disappear from the homepage immediately.")) return;
    setBanners(banners.filter(b => b.id !== id));
    await supabase.from('banners').delete().eq('id', id);
  };

  // Helper to render asset cards
  const renderAssetList = (title: string, filterFn: (b: Banner) => boolean) => {
    const assets = banners.filter(filterFn);
    if (assets.length === 0) return null;

    return (
      <div className="mb-10">
        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2 border-b border-gray-100 pb-2">
           {title} <span className="text-xs bg-gray-100 px-2 py-1 rounded-full text-slate-500">{assets.length}</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assets.map((b) => (
            <div key={b.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden group hover:border-orange-200 transition-all">
              {/* Image Preview Area */}
              <div 
                className="h-40 relative flex items-center justify-center overflow-hidden"
                style={{ backgroundColor: b.bg_color || '#f3f4f6' }}
              >
                 <div className="relative w-full h-full">
                    {/* Brand Hero uses cover, others use contain */}
                    <Image 
                        src={b.image_url} 
                        fill 
                        className={b.slot === 'brand_hero' ? "object-cover" : "object-contain p-4"} 
                        alt="Banner" 
                    />
                 </div>
                 {/* Slot Badge */}
                 <div className="absolute top-2 left-2 bg-black/70 backdrop-blur text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider z-10">
                    {BANNER_RULES[b.slot]?.label}
                 </div>
                 {/* Text Overlay Preview (Mini) */}
                 {b.title && (
                    <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                        <p className="text-white text-xs font-black truncate">{b.title}</p>
                    </div>
                 )}
              </div>

              {/* Data Area */}
              <div className="p-4 space-y-3">
                 <div className="flex items-center gap-2 text-xs font-mono text-blue-600 bg-blue-50 p-2 rounded-lg truncate">
                    <LinkIcon size={12} /> {b.link_url}
                 </div>

                 <div className="pt-2 flex justify-between items-center border-t border-gray-50">
                    <span className="text-[10px] text-gray-400 font-mono">ID: {b.id.slice(0,6)}</span>
                    <button onClick={() => deleteBanner(b.id)} className="text-red-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors">
                      <Trash2 size={16} />
                    </button>
                 </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-12">
      
      {/* 1. EDITOR SECTION */}
      <div className="bg-white p-6 lg:p-8 rounded-[2rem] border border-gray-200 shadow-sm flex flex-col lg:flex-row gap-10">
        
        {/* Left: Configuration Form */}
        <div className="flex-1 space-y-8">
          
          {/* A. SLOT SELECTION */}
          <div>
            <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4">1. Select Position</h2>
            <div className="flex flex-wrap gap-2">
               {Object.entries(SLOT_GROUPS).map(([groupName, slots]) => (
                 <div key={groupName} className="w-full mb-2">
                    <span className="text-xs font-bold text-slate-500 mb-2 block">{groupName}</span>
                    <div className="flex flex-wrap gap-2">
                      {slots.map(slotKey => (
                        <button
                          key={slotKey}
                          onClick={() => { setSelectedSlot(slotKey as BannerSlot); setPreviewUrl(''); setError(''); }}
                          className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all ${
                            selectedSlot === slotKey 
                            ? 'bg-slate-900 text-white border-slate-900 shadow-lg scale-105' 
                            : 'bg-white text-slate-600 border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          {BANNER_RULES[slotKey as BannerSlot].label.split(':')[1] || BANNER_RULES[slotKey as BannerSlot].label}
                        </button>
                      ))}
                    </div>
                 </div>
               ))}
            </div>
            
            <div className="mt-4 p-3 bg-blue-50 text-blue-800 text-xs rounded-xl flex items-start gap-2 border border-blue-100">
               <AlertCircle size={16} className="mt-0.5 shrink-0"/>
               <div>
                  <strong>Requirement:</strong> {rule.description} <br/>
                  Size: <strong>{rule.width} x {rule.height}px</strong> {rule.aspectRatio && `(${rule.aspectRatio})`}
               </div>
            </div>
          </div>

          {/* B. CONTENT FIELDS (Conditional based on slot) */}
          <div>
             <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4">2. Customize Content</h2>
             <div className="space-y-4">
                
                {/* Title & Desc (For Main Hero & Brand Hero) */}
                {isRichContent && (
                   <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100 space-y-4 animate-in slide-in-from-left-2">
                      <div>
                         <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Overlay Title</label>
                         <input 
                           value={formData.title} 
                           onChange={e => setFormData({...formData, title: e.target.value})}
                           placeholder="e.g. PS5 Pro" 
                           className="w-full p-3 rounded-xl border border-gray-200 font-bold focus:ring-2 ring-orange-100 outline-none"
                         />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                         <div>
                            <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Label / Tag</label>
                            <input 
                              value={formData.label} 
                              onChange={e => setFormData({...formData, label: e.target.value})}
                              placeholder="e.g. New Arrival" 
                              className="w-full p-3 rounded-xl border border-gray-200 text-sm focus:ring-2 ring-orange-100 outline-none"
                            />
                         </div>
                         <div>
                            <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Desc / Price</label>
                            <input 
                              value={formData.description} 
                              onChange={e => setFormData({...formData, description: e.target.value})}
                              placeholder="e.g. 30th Anniversary" 
                              className="w-full p-3 rounded-xl border border-gray-200 text-sm focus:ring-2 ring-orange-100 outline-none"
                            />
                         </div>
                      </div>
                      
                      {/* Background Color Picker (Only for Main Hero slots, Brand Hero uses image cover) */}
                      {!['brand_hero'].includes(selectedSlot) && (
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase mb-2 block flex items-center gap-2">
                                <Palette size={14}/> Card Background Color
                            </label>
                            <div className="flex gap-3 items-center">
                                <input 
                                type="color" 
                                value={formData.bg_color} 
                                onChange={e => setFormData({...formData, bg_color: e.target.value})}
                                className="w-10 h-10 rounded-lg cursor-pointer border-0 p-0"
                                />
                                <span className="text-xs font-mono text-gray-500 bg-white px-2 py-1 rounded border">{formData.bg_color}</span>
                            </div>
                        </div>
                      )}
                   </div>
                )}

                {/* Link (Always Required) */}
                <div>
                   <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Destination Link</label>
                   <div className="relative">
                      <LinkIcon className="absolute left-3 top-3.5 text-gray-400 w-4 h-4" />
                      <input 
                        value={formData.link_url} 
                        onChange={e => setFormData({...formData, link_url: e.target.value})}
                        placeholder="/category/gaming" 
                        className="w-full pl-9 p-3 rounded-xl border border-gray-200 font-medium focus:ring-2 ring-orange-100 outline-none"
                      />
                   </div>
                </div>
             </div>
          </div>

        </div>

        {/* Right: Upload & Preview */}
        <div className="flex-1 flex flex-col gap-6">
           <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest">3. Upload Graphic</h2>
           
           <div 
             className="flex-1 min-h-[400px] border-2 border-dashed border-gray-200 rounded-3xl bg-gray-50 relative flex flex-col items-center justify-center overflow-hidden hover:bg-white hover:border-orange-300 transition-all group"
             style={{ backgroundColor: !['brand_hero'].includes(selectedSlot) ? formData.bg_color : '#0f172a' }}
           >
              <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer z-20" onChange={handleFileSelect} />
              
              {previewUrl ? (
                 <div className="relative w-full h-full flex items-center justify-center">
                    {/* PREVIEW LOGIC: Cover for Brand Hero, Contain for others */}
                    <img 
                        src={previewUrl} 
                        className={selectedSlot === 'brand_hero' ? "w-full h-full object-cover opacity-80" : "max-w-[80%] max-h-[80%] object-contain drop-shadow-xl z-10"} 
                    />
                    
                    {/* Live Text Preview Overlay */}
                    {isRichContent && (
                       <div className="absolute top-1/2 -translate-y-1/2 left-8 z-10 pointer-events-none max-w-[60%]">
                          {formData.label && (
                            <span className="bg-white/20 backdrop-blur text-white text-xs px-2 py-1 rounded mb-2 inline-block uppercase tracking-wider">{formData.label}</span>
                          )}
                          <h3 className="text-3xl font-black text-white leading-tight drop-shadow-lg">{formData.title || 'Overlay Title'}</h3>
                          <p className="text-white/80 mt-2 font-medium">{formData.description}</p>
                       </div>
                    )}

                    <div className="absolute bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg flex items-center gap-2 z-20">
                      <CheckCircle size={16} /> Ready to Upload
                    </div>
                 </div>
              ) : (
                 <div className="text-center p-8">
                    <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center mx-auto mb-4 text-gray-400">
                       <ImagePlus size={32} />
                    </div>
                    <p className="font-bold text-slate-600">Click to Select Image</p>
                    {selectedSlot === 'brand_hero' && <p className="text-xs text-orange-600 mt-2 font-bold">Recommended: 21:9 Cinematic Image</p>}
                 </div>
              )}
           </div>

           {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-bold flex items-center gap-2 animate-in slide-in-from-bottom-2">
                 <AlertCircle size={18} /> {error}
              </div>
           )}

           <button 
             onClick={handleUpload} 
             disabled={!imageFile || uploading}
             className="w-full py-4 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-slate-900/10 flex items-center justify-center gap-2"
           >
             {uploading ? <Loader2 className="animate-spin" /> : 'Publish Asset'}
           </button>
        </div>
      </div>

      {/* 2. LIVE ASSETS */}
      <div className="space-y-2">
         <h2 className="text-2xl font-black text-slate-900 tracking-tight">Active Assets</h2>
         {renderAssetList('Homepage Hero Section', (b) => ['main_hero', 'side_top', 'side_bottom'].includes(b.slot))}
         {renderAssetList('Store & Brand Info', (b) => ['brand_hero'].includes(b.slot))}
         {renderAssetList('Product Discovery Tiles', (b) => ['tile_new', 'tile_student', 'flash'].includes(b.slot))}
         {renderAssetList('Store Info', (b) => ['branch_slider'].includes(b.slot))}
      </div>

    </div>
  );
};