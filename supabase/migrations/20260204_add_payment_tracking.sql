-- Add payment tracking columns to onboarding_applications table
-- This migration adds secure payment verification fields

ALTER TABLE onboarding_applications
ADD COLUMN IF NOT EXISTS transaction_id TEXT,
ADD COLUMN IF NOT EXISTS payment_amount NUMERIC(10,2),
ADD COLUMN IF NOT EXISTS payment_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS payment_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS payment_verified_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS payment_verified_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS payment_notes TEXT;

-- Add index for faster payment status queries
CREATE INDEX IF NOT EXISTS idx_applications_payment_status 
ON onboarding_applications(payment_verified, status);

-- Add index for transaction ID lookups (security: prevent duplicates)
CREATE INDEX IF NOT EXISTS idx_applications_transaction_id 
ON onboarding_applications(transaction_id) 
WHERE transaction_id IS NOT NULL;

-- Update the status check constraint to include payment statuses
ALTER TABLE onboarding_applications 
DROP CONSTRAINT IF EXISTS onboarding_applications_status_check;

ALTER TABLE onboarding_applications
ADD CONSTRAINT onboarding_applications_status_check 
CHECK (status IN ('pending', 'payment_submitted', 'payment_verified', 'approved', 'rejected'));

-- Add comment for documentation
COMMENT ON COLUMN onboarding_applications.transaction_id IS 'Mobile money transaction reference provided by applicant';
COMMENT ON COLUMN onboarding_applications.payment_verified IS 'Admin has verified the payment was received';
COMMENT ON COLUMN onboarding_applications.payment_verified_by IS 'UUID of admin who verified payment';
COMMENT ON COLUMN onboarding_applications.payment_notes IS 'Admin notes about payment verification';

-- Create system_settings table for platform-wide configuration
CREATE TABLE IF NOT EXISTS system_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id)
);

-- Add RLS policies for system_settings (super admin only)
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins can view system settings"
ON system_settings FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid()
    AND auth.users.raw_app_meta_data->>'role' = 'super_admin'
  )
);

CREATE POLICY "Super admins can update system settings"
ON system_settings FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid()
    AND auth.users.raw_app_meta_data->>'role' = 'super_admin'
  )
);

-- Insert default payment settings
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

-- Add index for faster key lookups
CREATE INDEX IF NOT EXISTS idx_system_settings_key ON system_settings(key);

