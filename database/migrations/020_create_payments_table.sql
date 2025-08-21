-- Migration: 020_create_payments_table.sql
-- Version: 20
-- Description: Create payments table for handling payment transactions with provider-agnostic architecture
-- Applied: 2024-12-19

CREATE TABLE public.payments (
  -- Base schema fields
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Core payment fields
  amount DECIMAL(10,2) NOT NULL, -- Amount in cents (standard practice)
  currency TEXT NOT NULL CHECK (currency ~ '^[A-Z]{3}$'), -- ISO 4217 currency code (e.g., 'USD', 'EUR')
  status TEXT NOT NULL CHECK (status IN ('pending', 'processing', 'succeeded', 'failed', 'cancelled', 'requires_action', 'requires_confirmation')), -- Payment status
  external_payment_id TEXT NOT NULL, -- Provider's payment ID
  external_customer_id TEXT NOT NULL, -- Provider's customer ID
  external_subscription_id TEXT, -- Provider's subscription ID (if applicable)
  external_invoice_id TEXT, -- Provider's invoice ID (if applicable)
  payment_method_type TEXT NOT NULL CHECK (payment_method_type IN ('card', 'bank_transfer', 'digital_wallet', 'crypto', 'other')), -- Payment method type
  payment_provider TEXT NOT NULL CHECK (payment_provider IN ('stripe', 'paypal', 'apple_pay', 'google_pay', 'other')), -- Payment provider
  description TEXT NOT NULL, -- Human-readable description
  metadata JSONB, -- Provider-specific metadata
  error_message TEXT, -- Error message for failed payments
  refunded_at DATE, -- When payment was refunded
  refund_amount DECIMAL(10,2) -- Refund amount in cents
);

-- Create indexes for performance
CREATE INDEX idx_payments_external_payment_id ON public.payments(external_payment_id);
CREATE INDEX idx_payments_external_customer_id ON public.payments(external_customer_id);
CREATE INDEX idx_payments_status ON public.payments(status);
CREATE INDEX idx_payments_payment_provider ON public.payments(payment_provider);
CREATE INDEX idx_payments_amount ON public.payments(amount);
CREATE INDEX idx_payments_created_at ON public.payments(created_at);
CREATE INDEX idx_payments_external_subscription_id ON public.payments(external_subscription_id);
CREATE INDEX idx_payments_external_invoice_id ON public.payments(external_invoice_id);

-- Add comments for all columns
COMMENT ON COLUMN public.payments.amount IS 'Amount in cents (standard practice)';
COMMENT ON COLUMN public.payments.currency IS 'ISO 4217 currency code (e.g., USD, EUR)';
COMMENT ON COLUMN public.payments.status IS 'Payment status';
COMMENT ON COLUMN public.payments.external_payment_id IS 'Provider''s payment ID';
COMMENT ON COLUMN public.payments.external_customer_id IS 'Provider''s customer ID';
COMMENT ON COLUMN public.payments.external_subscription_id IS 'Provider''s subscription ID (if applicable)';
COMMENT ON COLUMN public.payments.external_invoice_id IS 'Provider''s invoice ID (if applicable)';
COMMENT ON COLUMN public.payments.payment_method_type IS 'Payment method type';
COMMENT ON COLUMN public.payments.payment_provider IS 'Payment provider';
COMMENT ON COLUMN public.payments.description IS 'Human-readable description';
COMMENT ON COLUMN public.payments.metadata IS 'Provider-specific metadata';
COMMENT ON COLUMN public.payments.error_message IS 'Error message for failed payments';
COMMENT ON COLUMN public.payments.refunded_at IS 'When payment was refunded';
COMMENT ON COLUMN public.payments.refund_amount IS 'Refund amount in cents';

-- Add table comment
COMMENT ON TABLE public.payments IS 'Payment transactions for subscriptions, project views, and other platform services with provider-agnostic architecture';
