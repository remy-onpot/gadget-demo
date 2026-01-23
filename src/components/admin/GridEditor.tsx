"use client";

import React, { useState, useEffect, useTransition } from 'react';
import { supabase } from '@/lib/supabase';
import { useAdminData } from '@/hooks/useAdminData'; // Import the hook
import { updateContentBlock, createContentBlock, deleteContentBlock } from '@/app/admin/(dashboard)/actions';
import { Database } from '@/lib/database.types';
import { 
  Truck, ShieldCheck, Star, GraduationCap, Zap, 
  Heart, Gift, Globe, Save, Loader2, LayoutGrid, 
  Plus, Trash2, GripVertical, User
} from 'lucide-react';
import { toast } from 'sonner';

// --- TYPES ---
type BlockRow = Database['public']['Tables']['content_blocks']['Row'];
interface BlockMeta {
  badge?: string;
  author?: string;
  role?: string;
}
interface ContentBlock extends Omit<BlockRow, 'meta_info'> {
  meta_info: BlockMeta; 
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string; size?: number }>> = {
  Truck, ShieldCheck, Star, GraduationCap, Zap, Heart, Gift, Globe
};

export const GridEditor = () => {
  // 1. Use the hook
  const { storeId, loading: authLoading } = useAdminData();
  
  const [blocks, setBlocks] = useState<ContentBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'static' | 'features' | 'testimonials'>('features');
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    // 2. WAIT for the hook to find the store
    if (!storeId) return;
    
    fetchBlocks();
  }, [storeId]); // 👈 Only run when storeId is ready

  const fetchBlocks = async () => {
    if (!storeId) return;
    
    setLoading(true);
    const { data, error } = await supabase
      .from('content_blocks')
      .select('*')
      .eq('store_id', storeId) // ✅ Use the ID from the hook
      .in('section_key', ['home_grid'])
      .order('sort_order', { ascending: true });

    if (error) { toast.error("Failed to load"); setLoading(false); return; }
    
    // Parse JSON safely
    const safeBlocks = (data || []).map(b => ({
       ...b,
       meta_info: (b.meta_info as unknown as BlockMeta) || {}
    }));
    
    setBlocks(safeBlocks);
    setLoading(false);
  };

  // --- ACTIONS ---

  const handleUpdate = (id: string, field: string, value: string) => {
    setBlocks(prev => prev.map(b => {
      if (b.id !== id) return b;
      if (field.startsWith('meta_info.')) {
         const childKey = field.split('.')[1] as keyof BlockMeta;
         return { ...b, meta_info: { ...b.meta_info, [childKey]: value } };
      }
      return { ...b, [field]: value };
    }));
  };

  const handleSave = () => {
    startTransition(async () => {
      try {
        await Promise.all(
            blocks.map(b => updateContentBlock(b.id, {
                title: b.title,
                description: b.description,
                icon_key: b.icon_key,
                meta_info: b.meta_info as unknown as any 
            }))
        );
        toast.success("All changes saved!");
      } catch (e: any) { toast.error("Failed to save"); }
    });
  };

  const handleCreate = async (type: 'main_carousel_item' | 'testimonial_item') => {
      // 1. Validation
      const count = blocks.filter(b => b.block_key === type).length;
      if (count >= 5) { toast.error("Maximum 5 items allowed"); return; }

      // 2. Prepare Data
      const tempId = `temp-${Math.random()}`;
      const baseData = {
          section_key: 'home_grid',
          block_key: type,
          title: type === 'testimonial_item' ? 'New Testimonial' : 'New Feature',
          description: '',
          icon_key: 'Star',
          meta_info: type === 'testimonial_item' ? { author: 'Name', role: 'Customer' } : { badge: 'New' }
      };

      // 3. Create Optimistic Object
      const optimisticBlock: ContentBlock = {
          id: tempId,
          ...baseData,
          sort_order: 0,
          created_at: new Date().toISOString(),
          store_id: storeId, // ✅ Use the ID from the hook
      };

      startTransition(async () => {
         // A. Optimistic Update
         setBlocks(prev => [...prev, optimisticBlock]);

         try {
             // B. Server Action
             const created = await createContentBlock(baseData);
             
             if(created) {
                 // C. Swap Temp ID with Real DB ID
                 setBlocks(prev => prev.map(b => b.id === tempId ? {
                     ...created,
                     meta_info: created.meta_info as BlockMeta
                 } : b));
                 
                 toast.success("Item added");
             }
         } catch(e) { 
             // D. Rollback on Failure
             setBlocks(prev => prev.filter(b => b.id !== tempId));
             toast.error("Failed to add item"); 
         }
      });
  };

  const handleDelete = async (id: string) => {
      if(!confirm("Are you sure?")) return;
      setBlocks(prev => prev.filter(b => b.id !== id)); // Optimistic delete
      try {
          await deleteContentBlock(id);
          toast.success("Item deleted");
      } catch(e) { 
          toast.error("Failed to delete"); 
          fetchBlocks(); // Revert on fail
      }
  };

  // --- FILTERS ---
  const staticBlocks = blocks.filter(b => ['tile_delivery', 'tile_warranty'].includes(b.block_key));
  const featureBlocks = blocks.filter(b => b.block_key === 'main_carousel_item' || b.block_key === 'tile_main');
  const testimonialBlocks = blocks.filter(b => b.block_key === 'testimonial_item' || b.block_key === 'testimonial');

  if (authLoading) return <div className="p-10 text-center"><Loader2 className="animate-spin inline"/> Loading Admin...</div>;
  if (loading) return <div className="p-10 text-center"><Loader2 className="animate-spin inline"/> Loading...</div>;

  return (
    <div className="bg-slate-50 p-4 md:p-6 rounded-3xl border border-gray-200 min-h-[600px]">
       
       {/* HEADER */}
       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <LayoutGrid className="text-blue-500" size={24} /> Homepage Grid
            </h2>
            <p className="text-sm text-slate-500">Manage the dynamic carousel and info tiles.</p>
          </div>
          <button 
            onClick={handleSave} 
            disabled={isPending}
            className="w-full md:w-auto bg-slate-900 text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition active:scale-95 disabled:opacity-50"
          >
            {isPending ? <Loader2 className="animate-spin" size={18}/> : <Save size={18}/>} Save All
          </button>
       </div>

       {/* TABS */}
       <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          <TabButton active={activeTab === 'features'} onClick={() => setActiveTab('features')} label={`Main Features (${featureBlocks.length}/5)`} />
          <TabButton active={activeTab === 'testimonials'} onClick={() => setActiveTab('testimonials')} label={`Testimonials (${testimonialBlocks.length}/5)`} />
          <TabButton active={activeTab === 'static'} onClick={() => setActiveTab('static')} label="Static Info" />
       </div>

       {/* CONTENT AREA */}
       <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          
          {/* 1. FEATURES LIST */}
          {activeTab === 'features' && (
             <div className="space-y-4">
                {featureBlocks.map((block, i) => (
                   <div key={block.id} className="bg-white p-4 rounded-xl border border-blue-100 shadow-sm relative group">
                      <div className="absolute top-4 right-4 flex gap-2">
                         <span className="text-xs font-bold text-slate-300 bg-slate-50 px-2 py-1 rounded">Slide {i + 1}</span>
                         <button onClick={() => handleDelete(block.id)} className="text-red-400 hover:text-red-600 p-1"><Trash2 size={16}/></button>
                      </div>
                      <span className="text-xs font-bold text-blue-500 uppercase mb-3 block">Main Carousel Item</span>
                      <BlockForm block={block} onChange={handleUpdate} hasBadge />
                   </div>
                ))}
                {featureBlocks.length < 5 && (
                   <button onClick={() => handleCreate('main_carousel_item')} className="w-full py-4 border-2 border-dashed border-blue-200 rounded-xl text-blue-500 font-bold hover:bg-blue-50 transition flex items-center justify-center gap-2">
                      <Plus size={20} /> Add Feature Slide
                   </button>
                )}
             </div>
          )}

          {/* 2. TESTIMONIALS LIST */}
          {activeTab === 'testimonials' && (
             <div className="space-y-4">
                {testimonialBlocks.map((block, i) => (
                   <div key={block.id} className="bg-white p-4 rounded-xl border border-purple-100 shadow-sm relative group">
                      <div className="absolute top-4 right-4 flex gap-2">
                         <span className="text-xs font-bold text-slate-300 bg-slate-50 px-2 py-1 rounded">Review {i + 1}</span>
                         <button onClick={() => handleDelete(block.id)} className="text-red-400 hover:text-red-600 p-1"><Trash2 size={16}/></button>
                      </div>
                      <span className="text-xs font-bold text-purple-500 uppercase mb-3 block">Testimonial</span>
                      <TestimonialForm block={block} onChange={handleUpdate} />
                   </div>
                ))}
                {testimonialBlocks.length < 5 && (
                   <button onClick={() => handleCreate('testimonial_item')} className="w-full py-4 border-2 border-dashed border-purple-200 rounded-xl text-purple-500 font-bold hover:bg-purple-50 transition flex items-center justify-center gap-2">
                      <Plus size={20} /> Add Testimonial
                   </button>
                )}
             </div>
          )}

          {/* 3. STATIC BLOCKS */}
          {activeTab === 'static' && (
             <div className="grid md:grid-cols-2 gap-4">
                {staticBlocks.map(block => (
                   <div key={block.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                      <span className="text-xs font-bold text-gray-400 uppercase mb-3 block">
                         {block.block_key === 'tile_delivery' ? 'Delivery Tile' : 'Warranty Tile'}
                      </span>
                      <BlockForm block={block} onChange={handleUpdate} />
                   </div>
                ))}
                {staticBlocks.length === 0 && <div className="text-slate-400">No static blocks found.</div>}
             </div>
          )}

       </div>
    </div>
  );
};

// --- SUB COMPONENTS ---

const TabButton = ({ active, onClick, label }: { active: boolean, onClick: () => void, label: string }) => (
    <button 
      onClick={onClick}
      className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${
        active ? 'bg-slate-900 text-white shadow-md' : 'bg-white text-slate-500 hover:bg-slate-100 border border-transparent'
      }`}
    >
      {label}
    </button>
);

const BlockForm = ({ block, onChange, hasBadge }: { block: ContentBlock, onChange: any, hasBadge?: boolean }) => (
    <div className="space-y-4">
       <div className="flex gap-3">
          <div className="w-1/3 md:w-1/4">
             <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Icon</label>
             <select 
               className="w-full p-2.5 border border-gray-200 rounded-lg text-sm bg-slate-50 outline-none focus:border-blue-500"
               value={block.icon_key || ''}
               onChange={e => onChange(block.id, 'icon_key', e.target.value)}
             >
               {Object.keys(ICON_MAP).map(k => <option key={k} value={k}>{k}</option>)}
             </select>
          </div>
          <div className="w-2/3 md:w-3/4">
             <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Title</label>
             <input 
               className="w-full p-2.5 border border-gray-200 rounded-lg font-bold text-slate-900 outline-none focus:border-blue-500 text-base md:text-sm" 
               value={block.title || ''} 
               onChange={e => onChange(block.id, 'title', e.target.value)}
             />
          </div>
       </div>
       <div>
          <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Description</label>
          <input 
            className="w-full p-2.5 border border-gray-200 rounded-lg text-slate-600 outline-none focus:border-blue-500 text-base md:text-sm" 
            value={block.description || ''} 
            onChange={e => onChange(block.id, 'description', e.target.value)}
          />
       </div>
       {hasBadge && (
          <div>
             <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Badge</label>
             <input 
               className="w-full p-2.5 border border-orange-200 rounded-lg text-xs font-bold text-orange-600 bg-orange-50 outline-none focus:border-orange-500" 
               value={block.meta_info.badge || ''} 
               onChange={e => onChange(block.id, 'meta_info.badge', e.target.value)}
             />
          </div>
       )}
    </div>
);

const TestimonialForm = ({ block, onChange }: { block: ContentBlock, onChange: any }) => (
    <div className="space-y-3">
        <div>
           <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Quote</label>
           <textarea 
             rows={2}
             className="w-full p-3 border border-gray-200 rounded-lg font-bold text-slate-800 outline-none focus:border-purple-500 text-base md:text-sm" 
             value={block.title || ''} 
             onChange={e => onChange(block.id, 'title', e.target.value)}
           />
        </div>
        <div className="grid grid-cols-2 gap-3">
           <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Author</label>
              <div className="relative">
                 <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={14}/>
                 <input 
                   className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg outline-none focus:border-purple-500 text-base md:text-sm" 
                   value={block.meta_info.author || ''} 
                   onChange={e => onChange(block.id, 'meta_info.author', e.target.value)}
                 />
              </div>
           </div>
           <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Role</label>
              <input 
                className="w-full p-2 border border-gray-200 rounded-lg outline-none focus:border-purple-500 text-base md:text-sm" 
                value={block.meta_info.role || ''} 
                onChange={e => onChange(block.id, 'meta_info.role', e.target.value)}
              />
           </div>
        </div>
    </div>
);