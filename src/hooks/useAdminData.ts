"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export function useAdminData() {
  const [storeId, setStoreId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkUserAndStore = async () => {
      try {
        // 1. Check User
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push('/admin/login');
          return;
        }

        // 2. Check for active store cookie (client-side read)
        const cookies = document.cookie.split(';').map(c => c.trim());
        const activeStoreCookie = cookies.find(c => c.startsWith('nimde_active_store='));
        const activeStoreId = activeStoreCookie?.split('=')[1];

        if (activeStoreId) {
          // Verify the store still exists and user owns it
          const { data: store, error } = await supabase
            .from('stores')
            .select('id')
            .eq('id', activeStoreId)
            .eq('owner_id', user.id)
            .single();

          if (store && !error) {
            setStoreId(store.id);
            setLoading(false);
            return;
          }
          // Cookie invalid, clear it and continue
          document.cookie = 'nimde_active_store=; path=/; max-age=0';
        }

        // 3. No valid cookie - fetch all stores
        const { data: stores, error } = await supabase
          .from('stores')
          .select('id')
          .eq('owner_id', user.id);

        if (error) {
          console.error("Store fetch error:", error);
          toast.error("Failed to load stores");
          return;
        }

        if (!stores || stores.length === 0) {
          toast.error("No store found. Please create one.");
          // Optional: router.push('/admin/super');
          return;
        }

        if (stores.length === 1) {
          // Auto-select single store and set cookie
          const singleStoreId = stores[0].id;
          // Set cookie client-side (server action would be better but this works for now)
          document.cookie = `nimde_active_store=${singleStoreId}; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax`;
          setStoreId(singleStoreId);
        } else {
          // Multiple stores - redirect to selector
          router.push('/admin/select-store');
          return;
        }

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    checkUserAndStore();
  }, [router]);

  return { storeId, loading };
}