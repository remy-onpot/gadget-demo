"use client";

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Save, Loader2, Globe, Phone, MapPin, MessageCircle, Facebook, Instagram, Linkedin, Twitter } from 'lucide-react';

export const SettingsManager = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Local state for form fields
  const [formData, setFormData] = useState<Record<string, string>>({});

  // The specific keys we want to manage
  const KNOWN_KEYS = [
    'whatsapp_phone', 'support_phone', 'support_email', 
    'address_display', 'map_link', 'opening_hours',
    'social_facebook', 'social_instagram', 'social_twitter', 'social_linkedin'
  ];

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    const { data } = await supabase.from('site_settings').select('*');
    if (data) {
      // Convert array to object: { key: value }
      const initialData: Record<string, string> = {};
      data.forEach(item => {
        initialData[item.key] = item.value;
      });
      setFormData(initialData);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Prepare upsert payload
      const updates = Object.entries(formData)
        .filter(([key]) => KNOWN_KEYS.includes(key)) // Only save known keys
        .map(([key, value]) => ({
          key,
          value,
          updated_at: new Date().toISOString()
        }));

      const { error } = await supabase.from('site_settings').upsert(updates);
      if (error) throw error;
      alert("Site settings updated successfully!");
    } catch (e: any) {
      alert("Error: " + e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (key: string, val: string) => {
    setFormData(prev => ({ ...prev, [key]: val }));
  };

  if (loading) return <div className="p-20 text-center"><Loader2 className="animate-spin inline text-slate-400"/></div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
           <Globe className="text-orange-500" size={32} /> Site Configuration
        </h1>
        <p className="text-slate-500 mt-2 text-lg">
          Manage your contact numbers, address, and social links without code.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* 1. CONTACT & LOCATION */}
        <div className="bg-white p-8 rounded-[2rem] border border-gray-200 shadow-sm space-y-8">
           <h2 className="font-bold text-slate-900 border-b border-gray-100 pb-4 flex items-center gap-2">
              <MapPin className="text-blue-500" size={20}/> Contact & Location
           </h2>

           <div className="space-y-5">
              <div>
                 <label className="text-xs font-bold text-slate-500 uppercase mb-1.5 block">WhatsApp Number (No +)</label>
                 <div className="relative">
                    <MessageCircle className="absolute left-3 top-3.5 text-green-500 w-4 h-4" />
                    <input 
                      value={formData['whatsapp_phone'] || ''}
                      onChange={e => handleChange('whatsapp_phone', e.target.value)}
                      placeholder="e.g. 233245151416"
                      className="w-full pl-10 p-3 bg-slate-50 border border-gray-200 rounded-xl font-bold text-slate-900 outline-none focus:bg-white focus:border-orange-500 transition"
                    />
                 </div>
                 <p className="text-[10px] text-slate-400 mt-1 pl-1">Used for the "Chat" button. Do not include spaces or symbols.</p>
              </div>

              <div>
                 <label className="text-xs font-bold text-slate-500 uppercase mb-1.5 block">Display Phone</label>
                 <div className="relative">
                    <Phone className="absolute left-3 top-3.5 text-gray-400 w-4 h-4" />
                    <input 
                      value={formData['support_phone'] || ''}
                      onChange={e => handleChange('support_phone', e.target.value)}
                      placeholder="+233 24 123 4567"
                      className="w-full pl-10 p-3 bg-slate-50 border border-gray-200 rounded-xl font-medium text-slate-900 outline-none focus:bg-white focus:border-orange-500 transition"
                    />
                 </div>
              </div>

              <div>
                 <label className="text-xs font-bold text-slate-500 uppercase mb-1.5 block">Display Address</label>
                 <textarea 
                    value={formData['address_display'] || ''}
                    onChange={e => handleChange('address_display', e.target.value)}
                    placeholder="Shop 42..."
                    rows={3}
                    className="w-full p-3 bg-slate-50 border border-gray-200 rounded-xl font-medium text-slate-900 outline-none focus:bg-white focus:border-orange-500 transition resize-none"
                 />
              </div>

              <div>
                 <label className="text-xs font-bold text-slate-500 uppercase mb-1.5 block">Google Maps Link</label>
                 <input 
                    value={formData['map_link'] || ''}
                    onChange={e => handleChange('map_link', e.target.value)}
                    placeholder="https://goo.gl/maps/..."
                    className="w-full p-3 bg-slate-50 border border-gray-200 rounded-xl font-mono text-sm text-blue-600 outline-none focus:bg-white focus:border-orange-500 transition"
                 />
              </div>
           </div>
        </div>

        {/* 2. SOCIAL MEDIA */}
        <div className="bg-white p-8 rounded-[2rem] border border-gray-200 shadow-sm space-y-8 h-fit">
           <h2 className="font-bold text-slate-900 border-b border-gray-100 pb-4 flex items-center gap-2">
              <Globe className="text-purple-500" size={20}/> Social Profiles
           </h2>
           
           <div className="space-y-5">
              {[
                { key: 'social_facebook', label: 'Facebook URL', icon: Facebook, color: 'text-blue-600' },
                { key: 'social_instagram', label: 'Instagram URL', icon: Instagram, color: 'text-pink-600' },
                { key: 'social_twitter', label: 'X (Twitter) URL', icon: Twitter, color: 'text-slate-900' },
                { key: 'social_linkedin', label: 'LinkedIn URL', icon: Linkedin, color: 'text-blue-700' },
              ].map((social) => (
                <div key={social.key}>
                   <label className="text-xs font-bold text-slate-500 uppercase mb-1.5 block">{social.label}</label>
                   <div className="relative">
                      <social.icon className={`absolute left-3 top-3.5 w-4 h-4 ${social.color}`} />
                      <input 
                        value={formData[social.key] || ''}
                        onChange={e => handleChange(social.key, e.target.value)}
                        placeholder="https://..."
                        className="w-full pl-10 p-3 bg-slate-50 border border-gray-200 rounded-xl font-medium text-slate-900 outline-none focus:bg-white focus:border-orange-500 transition"
                      />
                   </div>
                </div>
              ))}
           </div>
        </div>

      </div>

      {/* SAVE BAR */}
      <div className="sticky bottom-4 bg-slate-900 text-white p-4 rounded-2xl shadow-2xl shadow-slate-900/20 flex justify-between items-center animate-in slide-in-from-bottom-4">
         <div className="pl-2">
            <p className="font-bold text-sm">Unsaved changes?</p>
            <p className="text-xs text-slate-400">Click save to publish updates immediately.</p>
         </div>
         <button 
           onClick={handleSave}
           disabled={saving}
           className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-xl font-bold transition-colors flex items-center gap-2 disabled:opacity-50"
         >
           {saving ? <Loader2 className="animate-spin" /> : <><Save size={18} /> Save Settings</>}
         </button>
      </div>

    </div>
  );
};