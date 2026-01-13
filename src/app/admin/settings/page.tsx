"use client";

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Save, Loader2, Settings as SettingsIcon, MessageSquare } from 'lucide-react';

interface Setting {
  key: string;
  value: string;
  label: string;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    const { data } = await supabase.from('site_settings').select('*').order('key');
    if (data) setSettings(data);
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Upsert all settings
      const { error } = await supabase.from('site_settings').upsert(settings);
      if (error) throw error;
      alert("Settings updated successfully!");
    } catch (e: any) {
      alert("Error: " + e.message);
    } finally {
      setSaving(false);
    }
  };

  const updateValue = (key: string, newValue: string) => {
    setSettings(prev => prev.map(s => s.key === key ? { ...s, value: newValue } : s));
  };

  if (loading) return <div className="p-10 text-center"><Loader2 className="animate-spin inline"/></div>;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-900 flex items-center gap-2">
           <SettingsIcon className="text-orange-500" /> Site Configuration
        </h1>
        <p className="text-slate-500">Manage global variables and contact details.</p>
      </div>

      <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm space-y-6">
         
         {settings.map((setting) => (
           <div key={setting.key}>
              <label className="text-xs font-bold uppercase text-slate-500 mb-1.5 block">
                 {setting.label}
              </label>
              <div className="flex gap-3 items-center">
                 {setting.key === 'whatsapp_phone' && <MessageSquare className="text-green-500" size={20} />}
                 <input 
                   className="w-full p-3 bg-slate-50 border border-gray-200 rounded-xl font-bold text-slate-900 outline-none focus:border-orange-500 focus:bg-white transition"
                   value={setting.value}
                   onChange={(e) => updateValue(setting.key, e.target.value)}
                 />
              </div>
              {setting.key === 'whatsapp_phone' && (
                <p className="text-[10px] text-orange-500 mt-1 font-bold">
                   ⚠️ Important: Do not use '+' symbol. Use format 233...
                </p>
              )}
           </div>
         ))}

         <div className="pt-4 border-t border-gray-100">
            <button 
              onClick={handleSave}
              disabled={saving}
              className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-slate-800 transition flex items-center justify-center gap-2"
            >
               {saving ? <Loader2 className="animate-spin" /> : <><Save size={18} /> Save Changes</>}
            </button>
         </div>
      </div>
    </div>
  );
}