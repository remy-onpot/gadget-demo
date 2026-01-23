"use client";

import React, { useState, useEffect, useTransition } from 'react';
import { supabase } from '@/lib/supabase';
import { useAdminData } from '@/hooks/useAdminData'; // Import the hook
import { createBanner, deleteBanner, toggleBannerStatus } from '@/app/admin/(dashboard)/actions';
import { Database } from '@/lib/database.types';
import { Trash2, AlertCircle, CheckCircle, Loader2, Link as LinkIcon, ImagePlus, Palette, Eye, EyeOff } from 'lucide-react';
import Image from 'next/image';
import { toast } from 'sonner';

// --- TYPES ---
type Banner = Database['public']['Tables']['banners']['Row'];
type BannerSlot = string;

// --- CONFIGURATION ---
const SLOT_GROUPS: Record<string, string[]> = {
  'Homepage Hero': ['hero', 'side_top', 'side_bottom'],
  'Featured Sections': ['grid', 'flash'], 
  'Store Info': ['sidebar']
};

const RICH_CONTENT_SLOTS = ['hero', 'side_top', 'side_bottom', 'grid'];

const BANNER_RULES: Record<string, { label: string; width: number; height: number; description: string }> = {
    hero: { label: 'Main Hero', width: 1200, height: 600, description: 'Main slider on homepage.' },
    side_top: { label: 'Sidebar Top', width: 400, height: 300, description: 'Right side of hero.' },
    side_bottom: { label: 'Sidebar Bottom', width: 400, height: 300, description: 'Right side of hero.' },
    grid: { label: 'Grid Tile', width: 600, height: 600, description: 'Square promo tiles.' },
    sidebar: { label: 'Vertical Banner', width: 300, height: 600, description: 'Tall banner for shop pages.' },
    flash: { label: 'Flash Sale', width: 1200, height: 200, description: 'Slim banner.' },
};

export const MarketingManager = () => {
  // 1. Use the hook
  const { storeId, loading: authLoading } = useAdminData();
  
  const [banners, setBanners] = useState<Banner[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string>('hero');
  const [loading, setLoading] = useState(true);
  
  // FORM STATE
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  
  // RICH CONTENT STATE
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    label: '',
    cta_text: 'Shop Now',
    link_url: '',
    bg_color: '#0A2540'
  });

  const [isPending, startTransition] = useTransition();

  const rule = BANNER_RULES[selectedSlot] || { label: selectedSlot, width: 0, height: 0, description: '' };
  const isRichContent = RICH_CONTENT_SLOTS.includes(selectedSlot);

  // 2. FETCH BANNERS - Wait for storeId
  useEffect(() => {
    if (!storeId) return;
    
    fetchBanners();
  }, [storeId]); // 👈 Only run when storeId is ready

  const fetchBanners = async () => {
    if (!storeId) return;
    
    setLoading(true);
    const { data } = await supabase
      .from('banners')
      .select('*')
      .eq('store_id', storeId) // ✅ Use the ID from the hook
      .order('created_at', { ascending: false });
      
    if (data) setBanners(data);
    setLoading(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const objectUrl = URL.createObjectURL(file);
    setImageFile(file);
    setPreviewUrl(objectUrl);
  };

  // 3. CREATE BANNER (Upload Client -> DB Server Action)
  const handleUpload = async () => {
    if (!imageFile || !formData.link_url) return toast.error("Image and Link are required");
    
    setUploading(true);

    try {
      // A. Upload Image (Client Side - Supabase Storage)
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${selectedSlot}-${Date.now()}.${fileExt}`;
      const { error: upErr } = await supabase.storage.from('marketing').upload(fileName, imageFile);
      
      if (upErr) throw upErr;

      const { data: publicUrlData } = supabase.storage.from('marketing').getPublicUrl(fileName);
      const publicUrl = publicUrlData.publicUrl;

      // B. Create Record (Server Action)
      startTransition(async () => {
          try {
            await createBanner({
                slot: selectedSlot,
                image_url: publicUrl,
                is_active: true,
                title: formData.title,
                description: formData.description,
                label: formData.label,
                bg_color: formData.bg_color,
                cta_text: formData.cta_text,
                link_url: formData.link_url
            });

            toast.success("Asset published successfully!");
            
            // Cleanup
            setImageFile(null);
            setPreviewUrl('');
            setFormData({ title: '', description: '', label: '', cta_text: 'Shop Now', link_url: '', bg_color: '#0A2540' });
            
            // Refresh List
            fetchBanners();
          } catch (e: any) {
             toast.error(e.message);
          }
      });

    } catch (e: any) {
      toast.error(e.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  // 4. DELETE BANNER
  const handleDelete = async (id: string) => {
    if(!confirm("Remove this asset?")) return;
    startTransition(async () => {
        await deleteBanner(id);
        setBanners(prev => prev.filter(b => b.id !== id));
        toast.success("Deleted");
    });
  };

  // 5. TOGGLE STATUS
  const handleToggle = async (id: string, current: boolean) => {
      startTransition(async () => {
          await toggleBannerStatus(id, !current);
          setBanners(prev => prev.map(b => b.id === id ? { ...b, is_active: !current } : b));
          toast.success(current ? "Banner hidden" : "Banner activated");
      });
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
            <div key={b.id} className={`bg-white rounded-2xl border shadow-sm overflow-hidden group transition-all ${!b.is_active ? 'opacity-60 grayscale' : 'hover:border-orange-200'}`}>
              {/* Image Preview Area */}
              <div 
                className="h-40 relative flex items-center justify-center overflow-hidden"
                style={{ backgroundColor: b.bg_color || '#f3f4f6' }}
              >
                 <div className="relative w-full h-full">
                    <Image 
                        src={b.image_url} 
                        fill 
                        className={b.slot === 'hero' ? "object-cover" : "object-contain p-4"} 
                        alt="Banner" 
                    />
                 </div>
                 {/* Slot Badge */}
                 <div className="absolute top-2 left-2 bg-black/70 backdrop-blur text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider z-10">
                    {BANNER_RULES[b.slot]?.label || b.slot}
                 </div>
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
                    <button 
                        onClick={() => handleToggle(b.id, b.is_active || false)}
                        className={`text-xs font-bold px-2 py-1 rounded ${b.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}
                    >
                        {b.is_active ? 'Active' : 'Hidden'}
                    </button>
                    
                    <button onClick={() => handleDelete(b.id)} className="text-red-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors">
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

  if (authLoading) return <div className="p-20 text-center"><Loader2 className="animate-spin inline text-slate-300"/> Loading Admin...</div>;
  if (loading) return <div className="p-20 text-center"><Loader2 className="animate-spin inline text-slate-300"/></div>;

  return (
    <div className="space-y-12 pb-20">
      
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
                          onClick={() => { setSelectedSlot(slotKey); setPreviewUrl(''); }}
                          className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all ${
                            selectedSlot === slotKey 
                            ? 'bg-slate-900 text-white border-slate-900 shadow-lg scale-105' 
                            : 'bg-white text-slate-600 border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          {BANNER_RULES[slotKey]?.label || slotKey}
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
                  Size: <strong>{rule.width} x {rule.height}px</strong>
               </div>
            </div>
          </div>

          {/* B. CONTENT FIELDS */}
          <div>
             <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4">2. Customize Content</h2>
             <div className="space-y-4">
                
                {/* Title & Desc (Rich Content Only) */}
                {isRichContent && (
                   <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100 space-y-4 animate-in slide-in-from-left-2">
                      <div>
                          <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Overlay Title</label>
                          <input 
                            value={formData.title} 
                            onChange={e => setFormData({...formData, title: e.target.value})}
                            placeholder="e.g. Summer Sale / New Arrivals" 
                            className="w-full p-3 rounded-xl border border-gray-200 font-bold focus:ring-2 ring-orange-100 outline-none"
                          />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                          <div>
                             <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Label / Tag</label>
                             <input 
                               value={formData.label} 
                               onChange={e => setFormData({...formData, label: e.target.value})}
                               placeholder="e.g. Limited Time" 
                               className="w-full p-3 rounded-xl border border-gray-200 text-sm focus:ring-2 ring-orange-100 outline-none"
                             />
                          </div>
                          <div>
                             <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Description</label>
                             <input 
                               value={formData.description} 
                               onChange={e => setFormData({...formData, description: e.target.value})}
                               placeholder="e.g. Up to 50% Off" 
                               className="w-full p-3 rounded-xl border border-gray-200 text-sm focus:ring-2 ring-orange-100 outline-none"
                             />
                          </div>
                      </div>
                      
                      {/* Background Color Picker */}
                      <div>
                           <label className="text-xs font-bold text-slate-500 uppercase mb-2 block flex items-center gap-2">
                               <Palette size={14}/> Background Color
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
                        placeholder="/category/featured" 
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
             style={{ backgroundColor: isRichContent ? formData.bg_color : '#f8fafc' }}
           >
              <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer z-20" onChange={handleFileSelect} />
              
              {previewUrl ? (
                 <div className="relative w-full h-full flex items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                       src={previewUrl} 
                       className={selectedSlot === 'hero' ? "w-full h-full object-cover opacity-80" : "max-w-[80%] max-h-[80%] object-contain drop-shadow-xl z-10"} 
                       alt="Preview"
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
                    <p className="text-xs text-gray-400 mt-2">Supports JPG, PNG, WEBP</p>
                 </div>
              )}
           </div>

           <button 
             onClick={handleUpload} 
             disabled={!imageFile || uploading || isPending}
             className="w-full py-4 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-slate-900/10 flex items-center justify-center gap-2"
           >
             {uploading || isPending ? <Loader2 className="animate-spin" /> : 'Publish Asset'}
           </button>
        </div>
      </div>

      {/* 2. LIVE ASSETS */}
      <div className="space-y-2">
         <h2 className="text-2xl font-black text-slate-900 tracking-tight">Active Assets</h2>
         {renderAssetList('Homepage Hero Section', (b) => ['hero', 'side_top', 'side_bottom'].includes(b.slot))}
         {renderAssetList('Featured Sections', (b) => ['grid', 'flash'].includes(b.slot))}
         {renderAssetList('Store Info', (b) => ['sidebar'].includes(b.slot))}
      </div>

    </div>
  );
};