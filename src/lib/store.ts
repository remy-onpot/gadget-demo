import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { supabase } from '@/lib/supabase'; 
import { Database } from '@/lib/database.types';

// 1. DEFINE TYPES FROM DB
type ProductRow = Database['public']['Tables']['products']['Row'];
type VariantRow = Database['public']['Tables']['product_variants']['Row'];
type BannerRow = Database['public']['Tables']['banners']['Row'];

// Cart needs a mix of Product and Variant info
export interface CartItem {
  uniqueId: string; // usually variant.id
  product: ProductRow; // Parent info
  variant: VariantRow; // Specific info
  quantity: number;
  selected: boolean; 
}

type StoreSettings = Record<string, string>;

interface StoreState {
  // Data State
  products: ProductRow[];
  banners: BannerRow[];
  settings: StoreSettings;

  // Cart State
  cart: CartItem[];
  isCartOpen: boolean;

  // UI State
  isAdminMode: boolean;
  isLoading: boolean;

  // Actions
  fetchStoreData: (storeId: string) => Promise<void>;
  addToCart: (product: ProductRow, variant: VariantRow, quantity?: number) => void;
  removeFromCart: (variantId: string) => void;
  updateQuantity: (variantId: string, delta: number) => void;
  
  // Selection Actions
  toggleItemSelection: (variantId: string) => void;
  toggleAllSelection: (isSelected: boolean) => void;
  removeSelected: () => void; 
  clearCart: () => void;       

  toggleAdmin: () => void;
  toggleCart: (isOpen?: boolean) => void;
  setIsCartOpen: (isOpen: boolean) => void; // Added for compatibility
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
      setIsCartOpen: (isOpen) => set({ isCartOpen: isOpen }),

      // --- 🛒 CART LOGIC ---
      addToCart: (product, variant, qty = 1) => {
        const currentCart = get().cart;
        const existingItem = currentCart.find((item) => item.uniqueId === variant.id);
        const stock = variant.stock ?? 0;

        if (existingItem) {
          // Check Stock
          if (existingItem.quantity + qty > stock) {
             // In a real app, maybe use a toast here instead of alert
             // alert(`Only ${stock} units available!`);
             return;
          }

          set({
            cart: currentCart.map((item) =>
              item.uniqueId === variant.id
                ? { ...item, quantity: item.quantity + qty, selected: true } 
                : item
            ),
            isCartOpen: true 
          });
        } else {
          // New Item
          if (qty > stock) {
             return; // Don't add if 0 stock
          }

          set({
            cart: [
              ...currentCart,
              {
                uniqueId: variant.id,
                product,
                variant,
                quantity: qty,
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
                const stock = item.variant.stock ?? 0;
                
                // Prevent going above stock
                if (newQty > stock) return item;
                
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
          const [productsRes, bannersRes, storeRes] = await Promise.all([
            // 1. Fetch Products
            supabase
              .from('products')
              .select('*')
              .eq('store_id', storeId)
              .eq('is_active', true)
              .order('created_at', { ascending: false }),
            
            // 2. Fetch Banners
            supabase
              .from('banners')
              .select('*')
              .eq('store_id', storeId)
              .eq('is_active', true),
            
            // 3. Fetch Settings
            supabase
              .from('stores')
              .select('settings')
              .eq('id', storeId)
              .single()
          ]);

          const rawSettings = storeRes.data?.settings || {};
          const settingsMap = rawSettings as Record<string, string>;

          set({
            products: productsRes.data || [],
            banners: bannersRes.data || [],
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