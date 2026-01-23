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

        // 2. Check Store Ownership
        const { data: store, error } = await supabase
          .from('stores')
          .select('id, settings')
          .eq('owner_id', user.id)
          .single();

        if (error || !store) {
          console.error("Store fetch error:", error);
          toast.error("No store found. Please create one.");
          // Optional: router.push('/admin/create-store');
          return;
        }

        setStoreId(store.id);
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