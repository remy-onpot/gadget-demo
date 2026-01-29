export type PlanId = 'starter' | 'growth' | 'pro';

export const PLANS = {
  starter: {
    label: 'Starter',
    price: 250,
    limits: {
      products: 50,
      admins: 1,
      products_360: 5, // Teaser: 5 products with 360 views
      storage_gb: 5,
      features: []
    }
  },
  growth: {
    label: 'Growth',
    price: 450,
    limits: {
      products: 300,
      admins: 3,
      products_360: 50, // Growth tier gets 50 products with 360
      storage_gb: 25,
      features: ['inventory_sync']
    }
  },
  pro: {
    label: 'Pro',
    price: 1200,
    limits: {
      products: 2000,
      admins: 10,
      products_360: 999, // Essentially unlimited
      storage_gb: 100,
      features: ['all']
    }
  }
} as const;

export const DEFAULT_PLAN: PlanId = 'starter';