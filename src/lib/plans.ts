export type PlanId = 'starter' | 'growth' | 'pro';

export const PLANS = {
  starter: {
    label: 'Starter',
    price: 175,
    limits: {
      products: 50,
      admins: 1,
      features: []
    }
  },
  growth: {
    label: 'Growth',
    price: 450,
    limits: {
      products: 300,
      admins: 3,
      features: ['inventory_sync']
    }
  },
  pro: {
    label: 'Pro',
    price: 1200,
    limits: {
      products: 2000,
      admins: 10,
      features: ['all']
    }
  }
} as const;

export const DEFAULT_PLAN: PlanId = 'starter';