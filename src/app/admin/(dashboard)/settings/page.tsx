"use client";

import React, { useEffect, useState, useTransition } from 'react';
import { supabase } from '@/lib/supabase'; 
import { getStoreSettings, updateStoreSettings } from '@/app/admin/(dashboard)/actions'; 
import { Save, Loader2, Settings as SettingsIcon, MessageSquare, Upload, Trash2, Globe, Clock, ImageIcon, MapPin, Facebook, Instagram } from 'lucide-react';
import { toast } from 'sonner';

// Define the shape of our settings
type SettingsData = Record<string, string>;

// 1. DEFINE THE FIELDS (The Schema)
const CONFIG_FIELDS = [
  { section: 'Branding', key: 'site_name', label: 'Store Name', icon: <SettingsIcon />, type: 'text' },
  { section: 'Branding', key: 'site_description', label: 'SEO Description', icon: <Globe />, type: 'textarea' },
  { section: 'Branding', key: 'site_logo', label: 'Store Logo', icon: <ImageIcon />, type: 'image' },
  { section: 'Branding', key: 'theme_color', label: 'Theme Color', icon: <SparklesIcon />, type: 'color' },
  
  { section: 'Contact', key: 'support_email', label: 'Support Email', icon: <MessageSquare />, type: 'text' },
  { section: 'Contact', key: 'support_phone', label: 'Support Phone', icon: <MessageSquare />, type: 'text' },
  { section: 'Contact', key: 'business_hours', label: 'Business Hours', icon: <Clock />, type: 'text' },
  { section: 'Contact', key: 'address_display', label: 'Store Address', icon: <MapPin />, type: 'text' },
  
  { section: 'Social', key: 'social_facebook', label: 'Facebook URL', icon: <Facebook />, type: 'text' },
  { section: 'Social', key: 'social_instagram', label: 'Instagram URL', icon: <Instagram />, type: 'text' },
];

function SparklesIcon(props: any) { return <SettingsIcon {...props} className="text-purple-500" />; }

export default function SettingsPage() {
  const [settings, setSettings] = useState<SettingsData>({});
  const [loading, setLoading] = useState(true);
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // 2. LOAD DATA
  useEffect(() => {
    const load = async () => {
      try {
        const data = await getStoreSettings();
        setSettings(data);
      } catch (e) {
        toast.error("Failed to load settings");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // 3. SAVE DATA
  const handleSave = () => {
    startTransition(async () => {
      try {
        await updateStoreSettings(settings);
        toast.success("Settings saved successfully!");
      } catch (e: any) {
        toast.error(e.message || "Failed to save");
      }
    });
  };

  const updateValue = (key: string, val: string) => {
    setSettings(prev => ({ ...prev, [key]: val }));
  };

  // 4. IMAGE UPLOAD LOGIC
  const handleImageUpload = async (key: string, file: File) => {
    setUploadingKey(key);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `brand-${Date.now()}.${fileExt}`;
      const filePath = `branding/${fileName}`;

      // Upload to 'marketing' bucket
      const { error: uploadError } = await supabase.storage
        .from('marketing')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('marketing')
        .getPublicUrl(filePath);

      updateValue(key, publicUrl);
      toast.success("Image uploaded!");
    } catch (e: any) {
      toast.error("Upload failed: " + e.message);
    } finally {
      setUploadingKey(null);
    }
  };

  if (loading) return <div className="p-10 text-center"><Loader2 className="animate-spin inline text-slate-300"/></div>;

  return (
    <div className="max-w-3xl mx-auto pb-20">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-900 flex items-center gap-2">
           <SettingsIcon className="text-orange-500" /> Store Configuration
        </h1>
        <p className="text-slate-500">Manage your branding and contact details.</p>
      </div>

      <div className="space-y-8">
         {CONFIG_FIELDS.map((field) => (
            <div key={field.key} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
               <label className="text-xs font-bold uppercase text-slate-500 mb-2 flex items-center gap-2">
                  <span className="text-slate-400">{field.icon}</span>
                  {field.label}
               </label>

               {/* A. IMAGE INPUT */}
               {field.type === 'image' ? (
                  <div className="flex items-center gap-4 mt-3">
                    <div className="w-20 h-20 bg-slate-50 border border-dashed border-gray-300 rounded-lg flex items-center justify-center overflow-hidden relative">
                       {settings[field.key] ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={settings[field.key]} alt="Logo" className="w-full h-full object-contain p-1" />
                       ) : (
                          <ImageIcon className="text-gray-300" />
                       )}
                    </div>
                    
                    <div className="flex-1">
                       <div className="flex gap-2">
                          <label className="cursor-pointer bg-slate-900 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 hover:bg-slate-800 transition">
                             {uploadingKey === field.key ? <Loader2 className="animate-spin" size={14}/> : <Upload size={14}/>}
                             Upload Image
                             <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleImageUpload(field.key, e.target.files[0])} />
                          </label>
                          {settings[field.key] && (
                             <button onClick={() => updateValue(field.key, '')} className="px-3 py-2 text-red-500 bg-red-50 rounded-lg hover:bg-red-100 transition">
                                <Trash2 size={14} />
                             </button>
                          )}
                       </div>
                    </div>
                  </div>
               ) : field.type === 'textarea' ? (
                  /* B. TEXTAREA INPUT */
                  <textarea
                    rows={3}
                    className="w-full p-3 bg-slate-50 border border-transparent rounded-xl font-medium text-slate-900 outline-none focus:bg-white focus:border-orange-500 transition"
                    value={settings[field.key] || ''}
                    onChange={(e) => updateValue(field.key, e.target.value)}
                    placeholder={`Enter ${field.label}...`}
                  />
               ) : field.type === 'color' ? (
                  /* C. COLOR PICKER */
                  <div className="flex items-center gap-4">
                    <input 
                      type="color" 
                      className="w-12 h-12 rounded-lg cursor-pointer border-none bg-transparent"
                      value={settings[field.key] || '#f97316'}
                      onChange={(e) => updateValue(field.key, e.target.value)}
                    />
                    <input 
                      type="text" 
                      className="flex-1 p-3 bg-slate-50 border border-transparent rounded-xl font-mono text-sm"
                      value={settings[field.key] || '#f97316'}
                      onChange={(e) => updateValue(field.key, e.target.value)}
                    />
                  </div>
               ) : (
                  /* D. STANDARD TEXT INPUT */
                  <input 
                    type="text"
                    className="w-full p-3 bg-slate-50 border border-transparent rounded-xl font-bold text-slate-900 outline-none focus:bg-white focus:border-orange-500 transition"
                    value={settings[field.key] || ''}
                    onChange={(e) => updateValue(field.key, e.target.value)}
                    placeholder={`Enter ${field.label}...`}
                  />
               )}
            </div>
         ))}
      </div>
      
      {/* FLOATING SAVE BUTTON */}
      <div className="fixed bottom-6 right-6 z-50">
        <button 
          onClick={handleSave}
          disabled={isPending}
          className="bg-[#0A2540] text-white px-8 py-4 rounded-full font-bold shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-3 disabled:opacity-70"
        >
            {isPending ? <Loader2 className="animate-spin" /> : <Save size={20} />}
            Save Changes
        </button>
      </div>
    </div>
  );
}