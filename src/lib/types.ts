// --- GLOBAL CATEGORIES ---
export type Category = 'laptop' | 'audio' | 'phone' | 'gaming' | 'monitor' | 'printer' | 'accessory' | 'camera' | 'tv' | 'tablet' | 'wearable';

// --- FLEXIBLE SPECS ENGINE ---
export type ProductSpecMap = Record<string, string | number | boolean>;

// --- THE CHILD (The Specific SKU) ---
export interface Variant {
  id: string;
  product_id: string;
  sku?: string;
  condition: string; // 'New', 'Open Box', 'UK Used'
  price: number;
  originalPrice?: number;
  stock: number;
  specs: ProductSpecMap; 
  images?: string[]; 
}

// --- THE PARENT (The Product Container) ---
export interface Product {
  id: string;
  name: string;
  slug: string;
  brand: string;
  category: Category;
  description?: string;
  price: number;         // Starting Price
  originalPrice?: number;
  images: string[];      // Main Gallery
  isFeatured?: boolean;
  isActive?: boolean;
  variants?: Variant[];
  specs?: ProductSpecMap; 
}

// --- BANNER & HERO SLOTS ---
// Updated to include the new "Hero Grid" slots AND your legacy slots
export type BannerSlot = 
  | 'main_hero' 
  | 'side_top' 
  | 'side_bottom' 
  | 'brand_hero' 
  | 'hero' 
  | 'flash' 
  | 'tile_new' 
  | 'tile_student' 
  | 'branch_slider';

// --- BANNER CONFIGURATION ---
// Maps slots to recommended dimensions for the Admin UI
export interface BannerConfig {
  label: string;
  width: number;
  height: number;
  aspectRatio: string;
  description: string;
}

export const BANNER_RULES: Record<BannerSlot, BannerConfig> = {
  // --- NEW HERO GRID SLOTS ---
  main_hero: {
    label: "Home: Main Hero (Left)",
    width: 1200,
    height: 1000,
    aspectRatio: "4:5",
    description: "The big main card. Needs high-res transparent PNG if possible."
  },
  side_top: {
    label: "Home: Side Top (Right)",
    width: 800,
    height: 600,
    aspectRatio: "4:3",
    description: "Top right card. Usually for Gaming or Accessories."
  },
  side_bottom: {
    label: "Home: Side Bottom (Right)",
    width: 800,
    height: 600,
    aspectRatio: "4:3",
    description: "Bottom right card. White background style."
  },
  
  // --- LEGACY / OTHER SLOTS ---
  brand_hero: {
    label: "Page Header (Top)",
    width: 1920,
    height: 822,
    aspectRatio: "21:9",
    description: "Massive top banner. Use for major site-wide announcements."
  },
  hero: {
    label: "Legacy Slider",
    width: 1920,
    height: 1080,
    aspectRatio: "16:9",
    description: "Standard slider."
  },
  flash: {
    label: "Flash Sale Card",
    width: 800,
    height: 1600,
    aspectRatio: "1:2",
    description: "Tall vertical card."
  },
  tile_new: {
    label: "New Arrivals Tile",
    width: 800,
    height: 800,
    aspectRatio: "1:1",
    description: "Square tile."
  },
  tile_student: {
    label: "Student Tile",
    width: 800,
    height: 800,
    aspectRatio: "1:1",
    description: "Square tile."
  },
  branch_slider: {
    label: "Branch Location Slider",
    width: 1200,
    height: 600,
    aspectRatio: "2:1",
    description: "Photos of the shop front."
  }
};

// --- RICH BANNER DATA ---
// Updated to match your new DB Schema
export interface Banner {
  id: string;
  slot: BannerSlot;
  image_url: string;
  link_url: string; // Matches DB column 'link_url'
  is_active: boolean;
  
  // Rich Content Fields (New)
  title: string;
  description?: string;
  label?: string;
  bg_color?: string;
  cta_text?: string;
}

// --- ORDER TYPES ---
export interface Order {
  id: string;
  created_at: string;
  customer_name: string;
  customer_phone: string;
  delivery_address: string;
  delivery_notes?: string;
  total_amount: number;
  status: 'pending' | 'confirmed' | 'delivered' | 'cancelled';
  items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  product_name: string;
  variant_name: string;
  quantity: number;
  unit_price: number;
}

// --- UTILS ---
export interface SiteSetting {
  key: string;
  value: string;
  label: string;
}

export interface FilterRule {
  field: string;      
  operator: 'eq' | 'contains' | 'gt' | 'lt' | 'gte' | 'lte'; 
  value: string | number;
}

export interface CategorySection {
  id: string;
  category_slug: string;
  title: string;
  section_type: 'product_row' | 'brand_row';
  filter_rules: FilterRule[];
  sort_order: number;
  is_active: boolean;
}