import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Product, Banner, Variant } from '@/lib/types'; 
import { supabase } from '@/lib/supabase'; 
import { Database } from '@/lib/database.types';

// 1. DEFINE CART ITEM
export interface CartItem {
  uniqueId: string; // usually variant.id
  product: Product; // Parent info
  variant: Variant; // Specific info
  quantity: number;
  selected: boolean; 
}

// 2. HELPER TYPES (Updated)
// We treat the JSON settings as a simple record
type StoreSettings = Record<string, string>;

interface StoreState {
  // Data State
  products: Product[];
  banners: Banner[];
  settings: StoreSettings;

  // Cart State
  cart: CartItem[];
  isCartOpen: boolean;

  // UI State
  isAdminMode: boolean;
  isLoading: boolean;

  // Actions
  // ⚡ UPDATED: We now require storeId to fetch the correct data
  fetchStoreData: (storeId: string) => Promise<void>;
  addToCart: (product: Product, variant: Variant) => void;
  removeFromCart: (variantId: string) => void;
  updateQuantity: (variantId: string, delta: number) => void;
  
  // Selection Actions
  toggleItemSelection: (variantId: string) => void;
  toggleAllSelection: (isSelected: boolean) => void;
  removeSelected: () => void; 
  clearCart: () => void;       

  toggleAdmin: () => void;
  toggleCart: (isOpen?: boolean) => void;
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      products: [],
      banners: [],
      settings: {},
      cart: [],
      isCartOpen: false,
      isAdminMode: false,
      isLoading: false,

      toggleAdmin: () => set((state) => ({ isAdminMode: !state.isAdminMode })),
      toggleCart: (isOpen) => set((state) => ({ isCartOpen: isOpen ?? !state.isCartOpen })),

      // --- 🛒 CART LOGIC ---
      addToCart: (product, variant) => {
        const currentCart = get().cart;
        const existingItem = currentCart.find((item) => item.uniqueId === variant.id);

        if (existingItem) {
          // Check Stock
          if (existingItem.quantity >= variant.stock) {
             alert(`Only ${variant.stock} units available!`);
             return;
          }

          set({
            cart: currentCart.map((item) =>
              item.uniqueId === variant.id
                ? { ...item, quantity: item.quantity + 1, selected: true } 
                : item
            ),
            isCartOpen: true 
          });
        } else {
          // New Item
          set({
            cart: [
              ...currentCart,
              {
                uniqueId: variant.id,
                product,
                variant,
                quantity: 1,
                selected: true, 
              },
            ],
            isCartOpen: true
          });
        }
      },

      removeFromCart: (variantId) =>
        set((state) => ({
          cart: state.cart.filter((item) => item.uniqueId !== variantId),
        })),

      updateQuantity: (variantId, delta) =>
        set((state) => ({
          cart: state.cart
            .map((item) => {
              if (item.uniqueId === variantId) {
                const newQty = item.quantity + delta;
                return { ...item, quantity: newQty };
              }
              return item;
            })
            .filter((item) => item.quantity > 0),
        })),

      // --- ✅ SELECTION LOGIC ---
      toggleItemSelection: (id) => 
        set((state) => ({
          cart: state.cart.map(item => 
            item.uniqueId === id ? { ...item, selected: !item.selected } : item
          )
        })),

      toggleAllSelection: (isSelected) => 
        set((state) => ({
          cart: state.cart.map(item => ({ ...item, selected: isSelected }))
        })),

      removeSelected: () => 
        set((state) => ({
          cart: state.cart.filter(item => !item.selected)
        })),

      clearCart: () => set({ cart: [] }),

      // --- 🌍 DATA FETCHING ---
      fetchStoreData: async (storeId: string) => {
        if (!storeId) {
            console.error("fetchStoreData called without storeId");
            return;
        }

        set({ isLoading: true });

        try {
          // Parallel Fetching for speed
          const [productsRes, bannersRes, storeRes] = await Promise.all([
            // 1. Fetch Products (Filtered by Store)
            supabase
              .from('products')
              .select('*, images:base_images, price:base_price') 
              .eq('store_id', storeId) // ✅ Secure: Filter by Store
              .eq('is_active', true)
              .order('created_at', { ascending: false }),
            
            // 2. Fetch Banners (Filtered by Store)
            supabase
              .from('banners')
              .select('*')
              .eq('store_id', storeId) // ✅ Secure: Filter by Store
              .eq('is_active', true),
            
            // 3. Fetch Settings (From Stores table)
            supabase
              .from('stores')
              .select('settings')
              .eq('id', storeId)
              .single()
          ]);

          // Extract settings safely
          const rawSettings = storeRes.data?.settings || {};
          // Ensure it matches our expected string record type
          const settingsMap = rawSettings as Record<string, string>;

          set({
            // ✅ SAFE: Double casting to bridge DB JSON -> App Interface
            products: (productsRes.data as unknown as Product[]) || [],
            banners: (bannersRes.data as unknown as Banner[]) || [],
            settings: settingsMap,
            isLoading: false,
          });

        } catch (e) {
          console.error('Error loading store data', e);
          set({ isLoading: false });
        }
      },
    }),
    {
      name: 'payless-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ cart: state.cart, isAdminMode: state.isAdminMode }),
    }
  )
);