"use client";

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { selectStore } from '@/actions/store-selection-actions';
import { useRouter } from 'next/navigation';
import { Store, Crown, Loader2, ArrowRight, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { PLANS } from '@/lib/plans';
import { Database } from '@/lib/database.types';

type StoreRow = Database['public']['Tables']['stores']['Row'];

export default function SelectStorePage() {
  const router = useRouter();
  const [stores, setStores] = useState<StoreRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selecting, setSelecting] = useState<string | null>(null);

  useEffect(() => {
    fetchUserStores();
  }, []);

  const fetchUserStores = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/admin/login');
        return;
      }

      const { data, error } = await supabase
        .from('stores')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setStores(data || []);
    } catch (e) {
      console.error('Failed to fetch stores:', e);
      toast.error("Failed to load stores");
    } finally {
      setLoading(false);
    }
  };

  const handleStoreSelect = async (storeId: string) => {
    setSelecting(storeId);
    
    try {
      const result = await selectStore(storeId);
      
      if (result.error) {
        toast.error(result.error);
        setSelecting(null);
        return;
      }

      toast.success("Store selected!");
      router.push('/admin');
      router.refresh();
    } catch (e) {
      console.error(e);
      toast.error("Failed to select store");
      setSelecting(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <Loader2 className="animate-spin text-orange-500" size={48} />
      </div>
    );
  }

  if (stores.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="text-center text-white">
          <Store size={64} className="mx-auto mb-4 opacity-50" />
          <h1 className="text-2xl font-bold mb-2">No Stores Found</h1>
          <p className="text-slate-400 mb-6">Create your first store to get started</p>
          <button 
            onClick={() => router.push('/admin/super')}
            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-bold transition"
          >
            Create Store
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 px-4 py-2 rounded-full mb-4">
            <Sparkles size={16} className="text-orange-500" />
            <span className="text-orange-500 font-bold text-sm">Multi-Store Owner</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
            Select Your Store
          </h1>
          <p className="text-slate-400 text-lg">
            You manage {stores.length} store{stores.length > 1 ? 's' : ''}. Choose one to continue.
          </p>
        </div>

        {/* Store Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stores.map((store) => {
            const settings = (store.settings as Record<string, string>) || {};
            const logo = settings.site_logo;
            const planId = (store.plan_id as keyof typeof PLANS) || 'starter';
            const plan = PLANS[planId];
            const isSelecting = selecting === store.id;

            return (
              <button
                key={store.id}
                onClick={() => handleStoreSelect(store.id)}
                disabled={isSelecting}
                className="bg-slate-800/50 backdrop-blur border border-slate-700 hover:border-orange-500 rounded-2xl p-6 text-left transition-all hover:scale-105 hover:shadow-xl hover:shadow-orange-500/10 disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                {/* Store Logo/Icon */}
                <div className="w-16 h-16 bg-slate-700 rounded-xl flex items-center justify-center mb-4 overflow-hidden border border-slate-600 group-hover:border-orange-500/50 transition-colors">
                  {logo ? (
                    <img src={logo} alt={store.name} className="w-full h-full object-cover" />
                  ) : (
                    <Store size={32} className="text-slate-400" />
                  )}
                </div>

                {/* Store Name */}
                <h3 className="text-xl font-bold text-white mb-2 truncate">
                  {store.name}
                </h3>

                {/* Store URL */}
                <p className="text-sm text-slate-400 mb-4 truncate">
                  {store.slug}.nimdeshop.com
                </p>

                {/* Plan Badge */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Crown size={14} className="text-orange-500" />
                    <span className="text-xs font-bold text-orange-500 uppercase">
                      {plan.label}
                    </span>
                  </div>

                  {isSelecting ? (
                    <Loader2 size={18} className="animate-spin text-orange-500" />
                  ) : (
                    <ArrowRight size={18} className="text-slate-400 group-hover:text-orange-500 group-hover:translate-x-1 transition-all" />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Create New Store CTA */}
        <div className="mt-12 text-center">
          <button
            onClick={() => router.push('/admin/super')}
            className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition font-medium"
          >
            <Store size={18} />
            <span>Create Another Store</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
