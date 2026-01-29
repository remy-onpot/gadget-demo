-- =========================================
-- CRITICAL PERFORMANCE INDEXES
-- Add these BEFORE scaling to 100+ stores
-- =========================================

-- 1. Products by Store (MOST CRITICAL)
-- Every product query filters by store_id
CREATE INDEX IF NOT EXISTS idx_products_store_id ON products(store_id);

-- 2. Store Lookup by Slug
-- Used in every site visit: nike.nimdeshop.com -> find store
CREATE INDEX IF NOT EXISTS idx_stores_slug ON stores(slug);

-- 3. Product Variants Lookup (if not exists)
-- Used when loading product details with variants
CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON product_variants(product_id);

-- 4. Composite index for product filtering (optional but recommended)
-- Speeds up: "show active products in this category for this store"
CREATE INDEX IF NOT EXISTS idx_products_store_category_active 
  ON products(store_id, category_id, is_active);

-- =========================================
-- VERIFY INDEXES
-- Run this query to confirm they were created:
-- SELECT tablename, indexname FROM pg_indexes 
-- WHERE schemaname = 'public' 
-- AND indexname LIKE 'idx_%';
-- =========================================
