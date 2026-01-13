// src/lib/db.ts

// 1. Define the Chameleon Types
export type CategoryType = 'laptop' | 'tv' | 'console' | 'audio';

export interface Product {
  id: string;
  name: string;
  category: CategoryType;
  price: number;
  originalPrice: number;
  images: string[];
  badges: string[]; // e.g. "Hot Deal", "New"
  specs: Record<string, string | number | boolean>; // JSONB equivalent
  relatedIds: string[]; // For bundling
}

export interface HeroSlide {
  id: number;
  title: string;
  subtitle: string;
  image: string;
  ctaText: string;
  ctaLink: string;
  theme: 'dark' | 'light';
}

// 2. The Data Store (Simulating DB)
export const DB = {
  heroSlides: [
    {
      id: 1,
      title: "Future Tech, Today's Price",
      subtitle: "Up to 40% off Apple Ecosystem bundles this week.",
      image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=2000",
      ctaText: "Shop Flash Deals",
      ctaLink: "/deals",
      theme: "dark"
    },
    {
      id: 2,
      title: "The Ultimate Setup",
      subtitle: "Sony 8K TVs + PS5 Slim Bundles available now.",
      image: "https://images.unsplash.com/photo-1593305841991-05c29736560e?auto=format&fit=crop&q=80&w=2000",
      ctaText: "View Bundles",
      ctaLink: "/bundles",
      theme: "light"
    }
  ] as HeroSlide[],

  products: [
    {
      id: "p1",
      name: "MacBook Pro 14",
      category: "laptop",
      price: 22500,
      originalPrice: 24000,
      images: ["https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=800"],
      badges: ["Best Seller"],
      specs: { processor: "M3 Pro", ram: "18GB", storage: "512GB SSD", cycles: 2 },
      relatedIds: ["p3"] // Suggest headphones
    },
    {
      id: "p2",
      name: "Samsung 65\" Neo QLED",
      category: "tv",
      price: 18000,
      originalPrice: 21000,
      images: ["https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&q=80&w=800"],
      badges: ["Free Install"],
      specs: { resolution: "8K", panel: "Mini-LED", refresh_rate: "144Hz", smart_os: "Tizen" },
      relatedIds: ["p3"]
    },
    {
      id: "p3",
      name: "Sony WH-1000XM5",
      category: "audio",
      price: 4200,
      originalPrice: 4800,
      images: ["https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&q=80&w=800"],
      badges: ["Deal"],
      specs: { battery: "30 Hours", noise_cancelling: true, connection: "Bluetooth 5.2" },
      relatedIds: []
    }
  ] as Product[]
};