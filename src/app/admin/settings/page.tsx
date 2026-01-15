"use client";

import React, { useEffect, useState, useTransition } from 'react';
import { supabase } from '@/lib/supabase';
import { updateSiteSetting } from '@/app/admin/actions'; 
import { Database } from '@/lib/database.types'; 
import { Save, Loader2, Settings as SettingsIcon, MessageSquare, Upload, Trash2, Globe, Clock, ImageIcon, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

type Setting = Database['public']['Tables']['site_settings']['Row'];

export default function SettingsPage() {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadingKey, setUploadingKey] = useState<string | null>(null); // Track which setting is uploading
  
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    const { data } = await supabase.from('site_settings').select('*').order('key');
    if (data) setSettings(data);
    setLoading(false);
  };

  const handleSave = () => {
    startTransition(async () => {
        try {
            await Promise.all(
                settings.map(s => updateSiteSetting(s.key, s.value))
            );
            toast.success("All settings saved!");
        } catch (e: any) {
            toast.error("Error: " + e.message);
        }
    });
  };

  const updateValue = (key: string, newValue: string) => {
    setSettings(prev => prev.map(s => s.key === key ? { ...s, value: newValue } : s));
  };

  // --- SPECIAL IMAGE UPLOADER FOR LOGO ---
  const handleImageUpload = async (key: string, file: File) => {
    setUploadingKey(key);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `logo-${Date.now()}.${fileExt}`;
      const filePath = `branding/${fileName}`; // Save in 'branding' folder inside bucket

      // Upload to 'marketing' bucket
      const { error: uploadError } = await supabase.storage
        .from('marketing')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('marketing')
        .getPublicUrl(filePath);

      // Update State immediately
      updateValue(key, publicUrl);
      toast.success("Logo uploaded! Don't forget to click Save.");
    } catch (e: any) {
      toast.error("Upload failed: " + e.message);
    } finally {
      setUploadingKey(null);
    }
  };

  // Helper to pick icons based on key
  const getIcon = (key: string) => {
    if (key.includes('logo')) return <ImageIcon size={20} className="text-purple-500"/>;
    if (key.includes('url')) return <Globe size={20} className="text-blue-500"/>;
    if (key.includes('hours')) return <Clock size={20} className="text-orange-500"/>;
    if (key.includes('phone')) return <MessageSquare size={20} className="text-green-500"/>;
    if (key.includes('cta')) return <Sparkles size={20} className="text-pink-500"/>;
    return <SettingsIcon size={20} className="text-slate-400"/>;
  };

  if (loading) return <div className="p-10 text-center"><Loader2 className="animate-spin inline text-slate-300"/></div>;

  return (
    <div className="max-w-3xl mx-auto pb-20">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-900 flex items-center gap-2">
           <SettingsIcon className="text-orange-500" /> Site Configuration
        </h1>
        <p className="text-slate-500">Manage branding, SEO, and contact details.</p>
      </div>

      <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm space-y-8">
         
         {settings.map((setting) => (
           <div key={setting.key} className="p-4 bg-slate-50 rounded-2xl border border-transparent hover:border-gray-200 transition-colors">
              <label className="text-xs font-bold uppercase text-slate-500 mb-2 flex items-center gap-2">
                 {getIcon(setting.key)}
                 {setting.label || setting.key} 
              </label>

              {/* RENDER LOGIC: If it's a Logo, show Uploader. Else, show Input. */}
              {setting.key === 'site_logo' ? (
                 <div className="flex items-center gap-4 mt-3">
                    <div className="w-20 h-20 bg-white border border-dashed border-gray-300 rounded-lg flex items-center justify-center overflow-hidden relative">
                       {setting.value ? (
                          <img src={setting.value} alt="Logo" className="w-full h-full object-contain p-1" />
                       ) : (
                          <ImageIcon className="text-gray-300" />
                       )}
                    </div>
                    
                    <div className="flex-1">
                       <input 
                         type="text" 
                         value={setting.value} 
                         readOnly
                         placeholder="Image URL will appear here..."
                         className="w-full p-2 text-xs bg-gray-100 border-none rounded mb-2 text-gray-500 font-mono"
                       />
                       <div className="flex gap-2">
                          <label className="cursor-pointer bg-slate-900 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 hover:bg-slate-800 transition">
                             {uploadingKey === setting.key ? <Loader2 className="animate-spin" size={14}/> : <Upload size={14}/>}
                             Upload New Logo
                             <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleImageUpload(setting.key, e.target.files[0])} />
                          </label>
                          {setting.value && (
                             <button onClick={() => updateValue(setting.key, '')} className="px-3 py-2 text-red-500 bg-red-50 rounded-lg hover:bg-red-100 transition">
                                <Trash2 size={14} />
                             </button>
                          )}
                       </div>
                    </div>
                 </div>
              ) : (
                 <div className="relative">
                    <input 
                      className="w-full p-3 bg-white border border-gray-200 rounded-xl font-bold text-slate-900 outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition"
                      value={setting.value}
                      onChange={(e) => updateValue(setting.key, e.target.value)}
                    />
                    {setting.key === 'whatsapp_phone' && (
                        <p className="text-[10px] text-orange-500 mt-1.5 font-bold flex items-center gap-1">
                            ⚠️ Format: 233... (No '+')
                        </p>
                    )}
                 </div>
              )}
           </div>
         ))}

      </div>
      
      {/* FLOATING SAVE BUTTON */}
      <div className="fixed bottom-6 right-6 z-50">
        <button 
          onClick={handleSave}
          disabled={isPending}
          className="bg-[#0A2540] text-white px-8 py-4 rounded-full font-bold shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
        >
            {isPending ? <Loader2 className="animate-spin" /> : <Save size={20} />}
            Save Changes
        </button>
      </div>
    </div>
  );
}