-- =====================================================
-- PAYMENT SYSTEM MIGRATION & SUPER ADMIN SETUP
-- Run this in Supabase SQL Editor
-- =====================================================

-- 1. ADD PAYMENT TRACKING COLUMNS
-- =====================================================

ALTER TABLE onboarding_applications
ADD COLUMN IF NOT EXISTS transaction_id TEXT,
ADD COLUMN IF NOT EXISTS payment_amount NUMERIC(10,2),
ADD COLUMN IF NOT EXISTS payment_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS payment_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS payment_verified_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS payment_verified_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS payment_notes TEXT;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_applications_payment_status 
ON onboarding_applications(payment_verified, status);

CREATE INDEX IF NOT EXISTS idx_applications_transaction_id 
ON onboarding_applications(transaction_id) 
WHERE transaction_id IS NOT NULL;

-- Update status constraint to include new payment statuses
ALTER TABLE onboarding_applications 
DROP CONSTRAINT IF EXISTS onboarding_applications_status_check;

ALTER TABLE onboarding_applications
ADD CONSTRAINT onboarding_applications_status_check 
CHECK (status IN ('pending', 'payment_submitted', 'payment_verified', 'approved', 'rejected'));

-- Add documentation
COMMENT ON COLUMN onboarding_applications.transaction_id IS 'Mobile money transaction reference provided by applicant';
COMMENT ON COLUMN onboarding_applications.payment_verified IS 'Admin has verified the payment was received';
COMMENT ON COLUMN onboarding_applications.payment_verified_by IS 'UUID of admin who verified payment';
COMMENT ON COLUMN onboarding_applications.payment_notes IS 'Admin notes about payment verification';


-- 2. CREATE SYSTEM SETTINGS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS system_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- Super admin can view system settings
CREATE POLICY "Super admins can view system settings"
ON system_settings FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid()
    AND auth.users.raw_app_meta_data->>'role' = 'super_admin'
  )
);

-- Super admin can update system settings
CREATE POLICY "Super admins can update system settings"
ON system_settings FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid()
    AND auth.users.raw_app_meta_data->>'role' = 'super_admin'
  )
);

-- Add index
CREATE INDEX IF NOT EXISTS idx_system_settings_key ON system_settings(key);

-- Insert default payment configuration
INSERT INTO system_settings (key, value, description) 
VALUES 
  ('payment_config', '{
    "momo_number": "0240000000",
    "account_name": "Nimde Shop",
    "network": "MTN",
    "onboarding_fee": 100.00,
    "currency": "GHS"
  }'::jsonb, 'Mobile money payment configuration for merchant onboarding')
ON CONFLICT (key) DO NOTHING;


-- 3. SET SUPER ADMIN ROLE
-- =====================================================

-- Find the user by email and set super_admin role
UPDATE auth.users 
SET raw_app_meta_data = 
  COALESCE(raw_app_meta_data, '{}'::jsonb) || '{"role": "super_admin"}'::jsonb
WHERE email = 'remywale1519@gmail.com';

-- Verify the super admin was set (should return 1 row)
SELECT 
  id,
  email,
  raw_app_meta_data->>'role' as role,
  created_at
FROM auth.users
WHERE email = 'remywale1519@gmail.com';


-- 4. VERIFY MIGRATION
-- =====================================================

-- Check onboarding_applications columns
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns
WHERE table_name = 'onboarding_applications'
  AND column_name IN (
    'transaction_id', 
    'payment_amount', 
    'payment_verified', 
    'payment_verified_by'
  )
ORDER BY column_name;

-- Check system_settings table
SELECT 
  key,
  description,
  created_at
FROM system_settings;

-- Display current payment config
SELECT 
  key,
  value->>'momo_number' as momo_number,
  value->>'account_name' as account_name,
  value->>'network' as network,
  (value->>'onboarding_fee')::numeric as fee,
  value->>'currency' as currency
FROM system_settings
WHERE key = 'payment_config';


-- =====================================================
-- MIGRATION COMPLETE ✓
-- =====================================================
-- Next steps:
-- 1. Verify super admin role is set for remywale1519@gmail.com
-- 2. Update payment settings at /admin/super/settings/payment
-- 3. Test application flow: apply → payment → admin review
-- =====================================================
