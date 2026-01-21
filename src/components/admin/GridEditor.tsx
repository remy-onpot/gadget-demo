"use client";

import React, { useState, useEffect, useTransition } from 'react';
import { supabase } from '@/lib/supabase'; // Client SDK (Read Only)
import { updateContentBlock } from '@/app/admin/(dashboard)/actions'; // ✅ Server Action (Write)
import { Database } from '@/lib/database.types';
import { 
  Truck, ShieldCheck, Star, GraduationCap, Zap, 
  Heart, Gift, Globe, Save, Loader2 
} from 'lucide-react';
import { toast } from 'sonner';

// 1. DEFINE TYPES
type BlockRow = Database['public']['Tables']['content_blocks']['Row'];

interface BlockMeta {
  badge?: string;
  author?: string;
  role?: string;
}

// Extend the DB Row to include the typed JSON
interface ContentBlock extends Omit<BlockRow, 'meta_info'> {
  meta_info: BlockMeta; 
}

// 2. ICON MAPPER
const ICON_MAP: Record<string, React.ComponentType<{ className?: string; size?: number }>> = {
  Truck, ShieldCheck, Star, GraduationCap, Zap, Heart, Gift, Globe
};

export const GridEditor = () => {
  const [blocks, setBlocks] = useState<ContentBlock[]>([]);
  const [loading, setLoading] = useState(true);
  
  // New Transition Hook for Server Actions
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    fetchBlocks();
  }, []);

  const fetchBlocks = async () => {
    // Reads are fine on client (protected by RLS)
    const { data, error } = await supabase
      .from('content_blocks')
      .select('*')
      .eq('section_key', 'home_grid');

    if (error) {
        toast.error("Failed to load blocks");
        setLoading(false);
        return;
    }
      
    if (data) {
        const safeBlocks: ContentBlock[] = data.map(b => ({
            ...b,
            meta_info: (b.meta_info as unknown as BlockMeta) || {}
        }));
        setBlocks(safeBlocks);
    }
    setLoading(false);
  };

  const updateBlockState = (id: string, field: string, value: string) => {
    setBlocks(prev => prev.map(b => {
      if (b.id !== id) return b;

      // Handle nested meta_info (e.g. 'meta_info.author')
      if (field.startsWith('meta_info.')) {
         const childKey = field.split('.')[1] as keyof BlockMeta;
         return { 
            ...b, 
            meta_info: { 
                ...b.meta_info, 
                [childKey]: value 
            } 
         };
      }

      // Handle top-level fields
      if (field === 'title' || field === 'description' || field === 'icon_key') {
          return { ...b, [field]: value };
      }

      return b;
    }));
  };

  const handleSave = () => {
    startTransition(async () => {
      try {
        // Save all blocks in parallel using Server Actions
        await Promise.all(
            blocks.map(block => 
                updateContentBlock(block.id, {
                    title: block.title,
                    description: block.description,
                    icon_key: block.icon_key,
                    meta_info: block.meta_info as unknown as any 
                })
            )
        );
        toast.success("Grid updated & Homepage refreshed!");
      } catch (e: any) {
        toast.error(e.message || "Failed to save");
      }
    });
  };

  const getBlock = (key: string) => blocks.find(b => b.block_key === key);

  if (loading) return <div className="p-10 text-center text-slate-400">Loading Editor...</div>;

  return (
    <div className="space-y-8 bg-slate-50 p-6 rounded-3xl border border-gray-200">
       <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-black text-slate-900">Social Grid Configuration</h2>
            <p className="text-sm text-slate-500">Edit the 4 main tiles on the homepage.</p>
          </div>
          <button 
            onClick={handleSave} 
            disabled={isPending}
            className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-800 transition disabled:opacity-50"
          >
            {isPending ? <Loader2 className="animate-spin" size={18}/> : <Save size={18}/>} Save Changes
          </button>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* TILE 1: MAIN FEATURE */}
          <div className="col-span-2 bg-white p-6 rounded-2xl border border-blue-100 shadow-sm">
             <span className="text-xs font-bold text-blue-500 uppercase mb-4 block">Big Tile (Student/Feature)</span>
             <BlockForm block={getBlock('tile_main')} onChange={updateBlockState} hasBadge />
          </div>

          {/* TILE 2: DELIVERY */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
             <span className="text-xs font-bold text-green-500 uppercase mb-4 block">Small Tile 1 (Delivery)</span>
             <BlockForm block={getBlock('tile_delivery')} onChange={updateBlockState} />
          </div>

          {/* TILE 3: WARRANTY */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
             <span className="text-xs font-bold text-orange-500 uppercase mb-4 block">Small Tile 2 (Warranty)</span>
             <BlockForm block={getBlock('tile_warranty')} onChange={updateBlockState} />
          </div>

          {/* TILE 4: TESTIMONIAL */}
          <div className="col-span-2 bg-white p-6 rounded-2xl border border-purple-100 shadow-sm">
             <span className="text-xs font-bold text-purple-500 uppercase mb-4 block">Bottom Tile (Testimonial)</span>
             {(() => {
                const b = getBlock('testimonial');
                if (!b) return <div className="text-slate-400 text-sm">Block not found</div>;
                return (
                   <div className="grid md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                         <label className="text-xs font-bold text-gray-400">Quote</label>
                         <textarea 
                           className="w-full p-2 border rounded-lg font-bold outline-none focus:border-purple-500" 
                           value={b.title || ''} 
                           onChange={e => updateBlockState(b.id, 'title', e.target.value)}
                         />
                      </div>
                      <div>
                         <label className="text-xs font-bold text-gray-400">Author Name</label>
                         <input 
                           className="w-full p-2 border rounded-lg outline-none focus:border-purple-500" 
                           value={b.meta_info.author || ''} 
                           onChange={e => updateBlockState(b.id, 'meta_info.author', e.target.value)}
                         />
                      </div>
                      <div>
                         <label className="text-xs font-bold text-gray-400">Author Role</label>
                         <input 
                           className="w-full p-2 border rounded-lg outline-none focus:border-purple-500" 
                           value={b.meta_info.role || ''} 
                           onChange={e => updateBlockState(b.id, 'meta_info.role', e.target.value)}
                         />
                      </div>
                   </div>
                )
             })()}
          </div>
       </div>
    </div>
  );
};

// 3. TYPED SUB-COMPONENT
interface BlockFormProps {
  block: ContentBlock | undefined;
  onChange: (id: string, field: string, value: string) => void;
  hasBadge?: boolean;
}

const BlockForm = ({ block, onChange, hasBadge }: BlockFormProps) => {
   if (!block) return <div className="text-red-400 text-xs font-bold">Block not found in DB</div>;
   
   return (
      <div className="space-y-3">
         <div className="flex gap-3">
            <div className="w-1/3">
               <label className="text-xs font-bold text-gray-400 block mb-1">Icon</label>
               <select 
                 className="w-full p-2 border rounded-lg text-sm bg-white outline-none focus:border-blue-500"
                 value={block.icon_key || ''}
                 onChange={e => onChange(block.id, 'icon_key', e.target.value)}
               >
                  {Object.keys(ICON_MAP).map(k => <option key={k} value={k}>{k}</option>)}
               </select>
            </div>
            <div className="w-2/3">
               <label className="text-xs font-bold text-gray-400 block mb-1">Title</label>
               <input 
                 className="w-full p-2 border rounded-lg font-bold text-slate-900 outline-none focus:border-blue-500" 
                 value={block.title || ''} 
                 onChange={e => onChange(block.id, 'title', e.target.value)}
               />
            </div>
         </div>
         
         <div>
            <label className="text-xs font-bold text-gray-400 block mb-1">Description</label>
            <input 
              className="w-full p-2 border rounded-lg text-sm text-slate-600 outline-none focus:border-blue-500" 
              value={block.description || ''} 
              onChange={e => onChange(block.id, 'description', e.target.value)}
            />
         </div>

         {hasBadge && (
            <div>
               <label className="text-xs font-bold text-gray-400 block mb-1">Badge Text</label>
               <input 
                 className="w-full p-2 border rounded-lg text-xs font-bold text-orange-600 bg-orange-50 outline-none focus:border-orange-500" 
                 value={block.meta_info.badge || ''} 
                 onChange={e => onChange(block.id, 'meta_info.badge', e.target.value)}
               />
            </div>
         )}
      </div>
   );
};