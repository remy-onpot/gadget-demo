export type Category = 'laptop' | 'tv' | 'console' | 'phone';

export interface Product {
  id: string;
  name: string;
  category: Category;
  price: number;
  image: string;
  brand: string;
  rating: number;
  // THE KEY: Dynamic JSONB style specs column
  specs: {
    [key: string]: string | number | boolean;
  };
}

export const initialProducts: Product[] = [
  {
    id: '1',
    name: 'MacBook Pro M3 Max',
    category: 'laptop',
    brand: 'Apple',
    price: 32000,
    rating: 5.0,
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=800',
    specs: {
      processor: 'M3 Max',
      ram: '36GB',
      storage: '1TB SSD',
      cycles: 4,
      screenSize: '16"'
    }
  },
  {
    id: '2',
    name: 'Samsung 65" QN900C',
    category: 'tv',
    brand: 'Samsung',
    price: 18500,
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&q=80&w=800',
    specs: {
      resolution: '8K Neo QLED',
      size: '65 inch',
      refreshRate: '144Hz',
      smartOs: 'Tizen'
    }
  },
  {
    id: '3',
    name: 'PlayStation 5 Slim',
    category: 'console',
    brand: 'Sony',
    price: 6500,
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?auto=format&fit=crop&q=80&w=800',
    specs: {
      edition: 'Disc Version',
      storage: '1TB',
      controllers: 2,
      color: 'White'
    }
  }
];