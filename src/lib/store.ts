import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Product, Banner, Variant } from './types';
import { supabase } from './supabase';

// 1. DEFINE CART ITEM
export interface CartItem {
  uniqueId: string; // usually variant.id
  product: Product; // Parent info
  variant: Variant; // Specific info
  quantity: number;
  selected: boolean; // <--- Tracks checkbox state
}

interface StoreState {
  // Data State
  products: Product[];
  banners: Banner[];
  settings: Record<string, string>;

  // Cart State
  cart: CartItem[];
  isCartOpen: boolean;

  // UI State
  isAdminMode: boolean;
  isLoading: boolean;

  // Actions
  fetchStoreData: () => Promise<void>;
  addToCart: (product: Product, variant: Variant) => void;
  removeFromCart: (variantId: string) => void;
  updateQuantity: (variantId: string, delta: number) => void;
  
  // Selection Actions (New)
  toggleItemSelection: (variantId: string) => void;
  toggleAllSelection: (isSelected: boolean) => void;
  removeSelected: () => void; // Used after checkout
  clearCart: () => void;      // Used for full reset

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
                ? { ...item, quantity: item.quantity + 1, selected: true } // Auto re-select
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
                selected: true, // Auto-select new items
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
      fetchStoreData: async () => {
        set({ isLoading: true });

        try {
          // Parallel Fetching for speed
          const [productsRes, bannersRes, settingsRes] = await Promise.all([
            supabase
              .from('products')
              .select('*, images:base_images, price:base_price') // MAP COLUMNS HERE
              .eq('is_active', true)
              .order('created_at', { ascending: false }),
            
            supabase
              .from('banners')
              .select('*')
              .eq('is_active', true),
            
            supabase
              .from('site_settings')
              .select('*')
          ]);

          // Process Settings into Object
          const settingsMap = (settingsRes.data || []).reduce((acc: any, curr: any) => {
            acc[curr.key] = curr.value;
            return acc;
          }, {});

          set({
            products: (productsRes.data as any) || [],
            banners: (bannersRes.data as any) || [],
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