-- Migration: 019_create_subscriptions_table.sql
-- Version: 19
-- Description: Create subscriptions table for managing contractor access and monetization
-- Applied: 2024-12-19

CREATE TABLE public.subscriptions (
  -- Base schema fields
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Core subscription fields
  cancellation_reason TEXT,
  cancelled_at DATE,
  contractor UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  end_date DATE NOT NULL,
  features_unlocked TEXT NOT NULL,
  is_active TEXT CHECK (is_active IN ('yes', 'no')) NOT NULL,
  is_auto_renew TEXT CHECK (is_auto_renew IN ('yes', 'no')) NOT NULL,
  payment_transaction UUID,
  plan_name TEXT NOT NULL,
  start_date DATE NOT NULL,
  tier_level TEXT NOT NULL CHECK (tier_level IN ('Basic', 'Pro', 'Enterprise'))
);

-- Create indexes for performance
CREATE INDEX idx_subscriptions_contractor ON public.subscriptions(contractor);
CREATE INDEX idx_subscriptions_is_active ON public.subscriptions(is_active);
CREATE INDEX idx_subscriptions_tier_level ON public.subscriptions(tier_level);
CREATE INDEX idx_subscriptions_start_date ON public.subscriptions(start_date);
CREATE INDEX idx_subscriptions_end_date ON public.subscriptions(end_date);
CREATE INDEX idx_subscriptions_payment_transaction ON public.subscriptions(payment_transaction);

-- Add comments for all columns (exact text from image)
COMMENT ON COLUMN public.subscriptions.cancellation_reason IS 'Reason provided for cancelling the subscription';
COMMENT ON COLUMN public.subscriptions.cancelled_at IS 'Timestamp when the subscription was cancelled';
COMMENT ON COLUMN public.subscriptions.contractor IS 'The user (contractor) this subscription belongs to';
COMMENT ON COLUMN public.subscriptions.end_date IS 'The date the subscription ends or expires';
COMMENT ON COLUMN public.subscriptions.features_unlocked IS 'Text summary of features granted by this plan';
COMMENT ON COLUMN public.subscriptions.is_active IS 'Indicates whether the subscription is currently active';
COMMENT ON COLUMN public.subscriptions.is_auto_renew IS 'Indicates whether the subscription will auto-renew at the end of the current term';
COMMENT ON COLUMN public.subscriptions.payment_transaction IS 'The linked payment that funded this subscription';
COMMENT ON COLUMN public.subscriptions.plan_name IS 'Internal or public-facing name of the plan (e.g., ''Pro Tier'', ''Basic'')';
COMMENT ON COLUMN public.subscriptions.start_date IS 'Date the subscription began';
COMMENT ON COLUMN public.subscriptions.tier_level IS 'Defines the access tier level granted by the plan';

-- Add table comment
COMMENT ON TABLE public.subscriptions IS 'Represents a contractor''s active or past paid access to platform features such as unlimited project views, verified badge, proposal access, or premium placement';
