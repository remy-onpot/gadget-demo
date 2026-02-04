"use client";

import React, { useState, useEffect, useTransition } from 'react';
import { useAdminData } from '@/hooks/useAdminData';
import { getStoreSettings, updateStoreSettings } from '@/app/admin/(dashboard)/actions';
import { Save, Loader2, Palette, Smartphone, Monitor, AlertTriangle, Wand2, Sparkles, LayoutGrid } from 'lucide-react';
import { CardType } from '@/lib/types';
import { toast } from 'sonner';
import { THEME_PRESETS, getContrastColor, getContrastScore, isValidHex, suggestAccessibleColor } from '@/lib/theme-generator';

export default function ThemeSettingsPage() {
  const { storeId, loading: authLoading } = useAdminData();
  
  const [theme, setTheme] = useState({
    primary_color: '#4F46E5', 
    bg_color: '#F8FAFC',       
    card_bg_color: '#FFFFFF', 
    text_color: '#0F172A', 
    border_radius: '1rem',    
    glass_mode: false,
    card_type: 'tech' as CardType, // Card style selection
  });

  const [isPending, startTransition] = useTransition();
  const [dataLoading, setDataLoading] = useState(true);
  const [activeView, setActiveView] = useState<'mobile' | 'desktop'>('mobile');

  // Load Data
  useEffect(() => {
    if (!storeId) return;
    const loadData = async () => {
      try {
        const data = await getStoreSettings();
        if (data) {
          setTheme(prev => ({
            ...prev,
            primary_color: data.primary_color || '#4F46E5',
            bg_color: data.bg_color || '#F8FAFC',
            card_bg_color: data.card_bg_color || '#FFFFFF',
            text_color: data.text_color || '#0F172A',
            border_radius: data.border_radius || '1rem',
            glass_mode: data.glass_mode || false,
            card_type: (data.card_type as CardType) || 'tech',
          }));
        }
      } finally {
        setDataLoading(false);
      }
    };
    loadData();
  }, [storeId]);

  // AUTO-GENERATION & VALIDATION (Same as before)
  useEffect(() => {
    if (isValidHex(theme.bg_color)) {
        const safeTextColor = getContrastColor(theme.bg_color);
        if (safeTextColor !== theme.text_color) {
            setTheme(prev => ({ ...prev, text_color: safeTextColor }));
        }
    }
  }, [theme.bg_color]);

  const bgContrast = isValidHex(theme.bg_color) ? getContrastScore(theme.bg_color, theme.text_color) : 'Fail';
  const btnContrast = isValidHex(theme.primary_color) ? getContrastScore(theme.primary_color, '#FFFFFF') : 'Fail';

  const fixPrimaryColor = () => {
      const saferColor = suggestAccessibleColor(theme.primary_color, 'darken');
      setTheme(prev => ({ ...prev, primary_color: saferColor }));
      toast.success("Color adjusted for better readability");
  };

  const handleHexChange = (key: keyof typeof theme, value: string) => {
      setTheme(prev => ({ ...prev, [key]: value }));
  };

  const handleBlur = (key: keyof typeof theme) => {
      // @ts-ignore
      const val = theme[key];
      if (typeof val === 'string' && !isValidHex(val)) {
          toast.error(`Invalid Hex Code: ${val}. Reverting...`);
          if (key === 'primary_color') setTheme(prev => ({ ...prev, [key]: '#4F46E5' }));
          if (key === 'bg_color') setTheme(prev => ({ ...prev, [key]: '#F8FAFC' }));
          if (key === 'card_bg_color') setTheme(prev => ({ ...prev, [key]: '#FFFFFF' }));
      }
  };

  const applyPreset = (preset: typeof THEME_PRESETS[0]) => {
      setTheme({
          primary_color: preset.colors.primary,
          bg_color: preset.colors.bg,
          card_bg_color: preset.colors.card,
          text_color: getContrastColor(preset.colors.bg),
          border_radius: preset.radius,
          glass_mode: false,
          card_type: theme.card_type, // Preserve card type on preset change
      });
      toast.success(`Applied ${preset.name} theme`);
  };

  const handleSave = () => {
    if (!isValidHex(theme.primary_color) || !isValidHex(theme.bg_color)) {
        toast.error("Please fix invalid color codes before saving.");
        return;
    }

    startTransition(async () => {
      try {
        await updateStoreSettings({ ...theme });
        toast.success("Theme published successfully!");
      } catch (e: any) {
        toast.error("Failed to save theme");
      }
    });
  };

  if (authLoading || dataLoading) return <div className="h-[60vh] flex items-center justify-center"><Loader2 className="animate-spin text-slate-300"/></div>;

  // ✨ HELPER: Preview Card Styles based on Glass Mode
  const getPreviewCardStyle = () => {
    if (theme.glass_mode) {
      return {
        backgroundColor: 'rgba(255, 255, 255, 0.6)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255, 255, 255, 0.5)',
        boxShadow: '0 4px 30px rgba(0, 0, 0, 0.05)',
        borderRadius: theme.border_radius
      };
    }
    return {
      backgroundColor: theme.card_bg_color,
      borderRadius: theme.border_radius,
      border: '1px solid rgba(0,0,0,0.05)'
    };
  };

  return (
    <div className="max-w-6xl mx-auto pb-24 animate-in fade-in duration-500">
      
      {/* HEADER */}
      <div className="mb-8 flex flex-col md:flex-row justify-between md:items-end gap-4">
        <div>
           <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
              <Palette className="text-pink-500" /> Theme Editor
           </h1>
           <p className="text-slate-500 mt-1 font-medium">Customize your store's look and feel.</p>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-lg self-start">
            <button onClick={() => setActiveView('mobile')} className={`p-2 rounded-md transition ${activeView === 'mobile' ? 'bg-white shadow text-slate-900' : 'text-slate-400'}`}><Smartphone size={18}/></button>
            <button onClick={() => setActiveView('desktop')} className={`p-2 rounded-md transition ${activeView === 'desktop' ? 'bg-white shadow text-slate-900' : 'text-slate-400'}`}><Monitor size={18}/></button>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 items-start">
        
        {/* === CONTROLS (Left) === */}
        <div className="lg:col-span-4 space-y-6">
           
           {/* PRESETS */}
           <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2 text-sm uppercase tracking-wider">
                 <Wand2 size={16} className="text-purple-500"/> Quick Presets
              </h3>
              <div className="grid grid-cols-5 gap-2">
                  {THEME_PRESETS.map(preset => (
                      <button 
                        key={preset.id}
                        onClick={() => applyPreset(preset)}
                        className="group relative w-full aspect-square rounded-lg border-2 border-slate-100 overflow-hidden hover:scale-105 transition-all focus:ring-2 ring-indigo-500 ring-offset-2"
                        title={preset.name}
                      >
                          <div className="absolute inset-0" style={{ backgroundColor: preset.colors.bg }}></div>
                          <div className="absolute top-1 left-1 right-1 bottom-4 bg-white/50 rounded-sm" style={{ backgroundColor: preset.colors.card }}></div>
                          <div className="absolute bottom-0 left-0 right-0 h-1.5" style={{ backgroundColor: preset.colors.primary }}></div>
                      </button>
                  ))}
              </div>
           </div>

           {/* ✨ NEW: GLASS MODE TOGGLE */}
           <div className="bg-gradient-to-br from-indigo-50 to-white p-6 rounded-2xl border border-indigo-100 shadow-sm relative overflow-hidden">
              <div className="flex justify-between items-center relative z-10">
                 <div>
                    <h3 className="font-bold text-slate-900 flex items-center gap-2">
                      <Sparkles className="text-indigo-500" size={18} /> Glass Mode
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 max-w-[200px]">
                       Enable a modern, translucent frosted glass effect for your product cards.
                    </p>
                 </div>
                 
                 <button 
                   onClick={() => setTheme(prev => ({ ...prev, glass_mode: !prev.glass_mode }))}
                   className={`w-14 h-8 rounded-full transition-colors flex items-center px-1 ${theme.glass_mode ? 'bg-indigo-600' : 'bg-slate-200'}`}
                 >
                    <div className={`w-6 h-6 bg-white rounded-full shadow-md transition-transform transform ${theme.glass_mode ? 'translate-x-6' : 'translate-x-0'}`} />
                 </button>
              </div>
              
              {/* Decorative background glow */}
              <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-indigo-200/50 rounded-full blur-2xl pointer-events-none" />
           </div>

           {/* 🎴 CARD TYPE SELECTOR */}
           <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2 text-sm uppercase tracking-wider">
                 <LayoutGrid size={16} className="text-orange-500"/> Card Style
              </h3>
              <div className="grid grid-cols-2 gap-3">
                 {([
                   { id: 'tech', name: 'Tech', desc: 'Clean, minimal with pill button', preview: '🔳' },
                   { id: 'gadget', name: 'Gadget', desc: 'Category icons, glow effects', preview: '✨' },
                   { id: 'bodega', name: 'Bodega', desc: 'Bold colors, tag badges', preview: '🏷️' },
                   { id: 'poster', name: 'Poster', desc: 'Cover image, editorial look', preview: '🖼️' },
                 ] as const).map(card => (
                    <button 
                       key={card.id}
                       onClick={() => setTheme(prev => ({ ...prev, card_type: card.id }))}
                       className={`p-4 rounded-xl border-2 text-left transition-all ${
                         theme.card_type === card.id 
                           ? 'border-indigo-600 bg-indigo-50 shadow-sm' 
                           : 'border-slate-100 hover:border-slate-200 bg-slate-50/50'
                       }`}
                    >
                       <div className="text-2xl mb-2">{card.preview}</div>
                       <div className="font-bold text-sm text-slate-900">{card.name}</div>
                       <div className="text-[10px] text-slate-500 mt-0.5 leading-tight">{card.desc}</div>
                    </button>
                 ))}
              </div>
           </div>

           {/* COLORS */}
           <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">Custom Colors</h3>
              
              {/* PRIMARY COLOR */}
              <div>
                 <div className="flex justify-between items-center mb-1.5 h-6">
                    <label className="text-xs font-bold text-slate-400 uppercase">Primary Brand</label>
                    {btnContrast === 'Fail' && isValidHex(theme.primary_color) && (
                        <button 
                           onClick={fixPrimaryColor}
                           className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold flex items-center gap-1 hover:bg-amber-200 transition-colors"
                        >
                           <AlertTriangle size={10}/> Fix Contrast
                        </button>
                    )}
                 </div>
                 <div className="flex items-center gap-3">
                    <input type="color" value={theme.primary_color} onChange={e => handleHexChange('primary_color', e.target.value)} className="w-10 h-10 rounded-lg cursor-pointer border-none bg-transparent p-0"/>
                    <input 
                        type="text" 
                        value={theme.primary_color} 
                        onChange={e => handleHexChange('primary_color', e.target.value)} 
                        onBlur={() => handleBlur('primary_color')}
                        className={`flex-1 bg-slate-50 border rounded-lg px-3 py-2 text-sm font-mono uppercase font-bold text-slate-600 focus:border-indigo-500 outline-none ${!isValidHex(theme.primary_color) ? 'border-red-500' : 'border-slate-200'}`}
                    />
                 </div>
              </div>

              {/* BACKGROUND COLOR */}
              <div>
                 <div className="flex justify-between items-center mb-1.5 h-6">
                    <label className="text-xs font-bold text-slate-400 uppercase">Page Background</label>
                    <div className="flex items-center gap-1">
                        <span className="text-[10px] text-slate-400">Readability:</span>
                        <span className={`text-[10px] font-bold px-1.5 rounded ${
                            bgContrast === 'AAA' ? 'bg-green-100 text-green-700' : 
                            bgContrast === 'AA' ? 'bg-blue-100 text-blue-700' : 
                            'bg-red-100 text-red-600'
                        }`}>
                            {bgContrast}
                        </span>
                    </div>
                 </div>
                 <div className="flex items-center gap-3">
                    <input type="color" value={theme.bg_color} onChange={e => handleHexChange('bg_color', e.target.value)} className="w-10 h-10 rounded-lg cursor-pointer border-none bg-transparent p-0"/>
                    <input 
                        type="text" 
                        value={theme.bg_color} 
                        onChange={e => handleHexChange('bg_color', e.target.value)}
                        onBlur={() => handleBlur('bg_color')}
                        className={`flex-1 bg-slate-50 border rounded-lg px-3 py-2 text-sm font-mono uppercase font-bold text-slate-600 focus:border-indigo-500 outline-none ${!isValidHex(theme.bg_color) ? 'border-red-500' : 'border-slate-200'}`}
                    />
                 </div>
              </div>
              
              {/* CARD SURFACE - Disabled in Glass Mode */}
              <div className={`transition-opacity ${theme.glass_mode ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                 <label className="text-xs font-bold text-slate-400 uppercase mb-1.5 block">
                    Card Surface {theme.glass_mode && '(Auto)'}
                 </label>
                 <div className="flex items-center gap-3">
                    <input type="color" value={theme.card_bg_color} onChange={e => handleHexChange('card_bg_color', e.target.value)} className="w-10 h-10 rounded-lg cursor-pointer border-none bg-transparent p-0"/>
                    <input 
                        type="text" 
                        value={theme.card_bg_color} 
                        onChange={e => handleHexChange('card_bg_color', e.target.value)} 
                        onBlur={() => handleBlur('card_bg_color')}
                        className={`flex-1 bg-slate-50 border rounded-lg px-3 py-2 text-sm font-mono uppercase font-bold text-slate-600 focus:border-indigo-500 outline-none ${!isValidHex(theme.card_bg_color) ? 'border-red-500' : 'border-slate-200'}`}
                    />
                 </div>
              </div>
           </div>

           {/* SHAPE */}
           <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="font-bold text-slate-900 mb-4">Corner Radius</h3>
              <div className="grid grid-cols-4 gap-2">
                 {['0px', '0.5rem', '1rem', '1.5rem'].map((rad) => (
                    <button 
                       key={rad}
                       onClick={() => setTheme({...theme, border_radius: rad})}
                       className={`h-10 border-2 transition-all text-xs font-bold ${theme.border_radius === rad ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-100 bg-slate-50 text-slate-400 hover:border-slate-300'}`}
                       style={{ borderRadius: rad }}
                    >
                       Aa
                    </button>
                 ))}
              </div>
           </div>
        </div>

        {/* LIVE PREVIEW */}
        <div className="lg:col-span-8 sticky top-6">
           <div className={`mx-auto transition-all duration-500 ease-in-out border-8 border-slate-900 rounded-[2.5rem] overflow-hidden shadow-2xl bg-white ${activeView === 'mobile' ? 'w-[375px] h-[700px]' : 'w-full h-[600px]'}`}>
              {/* PREVIEW CONTENT */}
              <div 
                 className="h-full w-full overflow-y-auto"
                 style={{
                   backgroundColor: theme.bg_color,
                   color: theme.text_color,
                   // @ts-ignore
                   '--primary': theme.primary_color,
                   '--radius': theme.border_radius,
                 }}
              >
                 {/* Preview Navbar */}
                 <div style={getPreviewCardStyle()} className="px-4 py-3 flex justify-between items-center sticky top-0 z-10 mb-4">
                    <div className="w-8 h-8 rounded-lg" style={{ backgroundColor: theme.primary_color }} />
                    <div className="w-8 h-8 rounded-full bg-slate-200/50" />
                 </div>
                 
                 <div className="px-4 space-y-6 pb-20">
                     {/* Banner */}
                     <div className="w-full aspect-[2/1] bg-slate-200/50 relative overflow-hidden flex items-center justify-center" style={{ borderRadius: theme.border_radius }}>
                        <h2 className="text-xl md:text-3xl font-black mix-blend-overlay opacity-50">THEME PREVIEW</h2>
                        <button className="absolute bottom-4 left-4 px-5 py-2 text-white font-bold text-xs shadow-lg" style={{ backgroundColor: theme.primary_color, borderRadius: theme.border_radius }}>Shop Now</button>
                     </div>
                     
                     {/* Categories */}
                     <div className="flex gap-2 overflow-x-auto pb-2">
                         {['All', 'Shoes', 'Shirts', 'Tech'].map((c, i) => (
                             <div key={c} className={`px-4 py-1.5 text-xs font-bold whitespace-nowrap border ${i===0 ? 'text-white border-transparent' : 'border-current opacity-60'}`} style={{ backgroundColor: i===0 ? theme.primary_color : 'transparent', borderRadius: theme.border_radius }}>{c}</div>
                         ))}
                     </div>
                     
                     {/* Product Grid */}
                     <div className={`grid gap-4 ${activeView === 'mobile' ? 'grid-cols-2' : 'grid-cols-3'}`}>
                        {[1, 2, 3, 4].map(i => (
                           <div key={i} className="p-3 transition-all" style={getPreviewCardStyle()}>
                              <div className="aspect-square bg-slate-200/50 mb-3" style={{ borderRadius: `calc(${theme.border_radius} / 1.5)` }} />
                              <div className="h-3 w-3/4 bg-current opacity-10 rounded mb-2" />
                              <div className="flex justify-between items-center">
                                 <div className="h-4 w-1/3 bg-current opacity-20 rounded" />
                                 <div className="w-8 h-8 flex items-center justify-center text-white" style={{ backgroundColor: theme.primary_color, borderRadius: `calc(${theme.border_radius} / 2)` }}>+</div>
                              </div>
                           </div>
                        ))}
                     </div>
                 </div>
              </div>
           </div>
           
           {/* Unsaved Changes */}
           <div className="mt-6 flex justify-center">
                <button 
                    onClick={handleSave} 
                    disabled={isPending}
                    className="bg-slate-900 text-white px-10 py-4 rounded-full font-bold shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-3 disabled:opacity-50"
                >
                    {isPending ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                    Publish Changes
                </button>
           </div>
        </div>

      </div>
    </div>
  );
}