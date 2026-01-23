"use client";

import { useEffect, useRef } from 'react';
import { useStore } from '@/lib/store';

interface StoreInitializerProps {
  storeId: string;
}

export function StoreInitializer({ storeId }: StoreInitializerProps) {
  // Use a ref to prevent double-fetching in React Strict Mode
  const initialized = useRef(false);
  const { fetchStoreData } = useStore();

  useEffect(() => {
    if (!initialized.current && storeId) {
      fetchStoreData(storeId);
      initialized.current = true;
    }
  }, [storeId, fetchStoreData]);

  return null;
}