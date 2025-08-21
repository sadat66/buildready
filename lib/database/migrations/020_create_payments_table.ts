import { Migration } from '../migrations'

export const migration_020_create_payments_table: Migration = {
  id: '020_create_payments_table',
  version: 20,
  name: 'Create payments table for handling payment transactions with provider-agnostic architecture',
  checksum: 'f6g7h8i9j0k1', // Hash for payments table creation
  up: async (db) => {
    // Create payments table with all fields from the schema
    await db.execute(`
      CREATE TABLE public.payments (
        -- Base schema fields
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        
        -- Core payment fields
        amount DECIMAL(10,2) NOT NULL,
        currency TEXT NOT NULL CHECK (currency ~ '^[A-Z]{3}$'),
        status TEXT NOT NULL CHECK (status IN ('pending', 'processing', 'succeeded', 'failed', 'cancelled', 'requires_action', 'requires_confirmation')),
        external_payment_id TEXT NOT NULL,
        external_customer_id TEXT NOT NULL,
        external_subscription_id TEXT,
        external_invoice_id TEXT,
        payment_method_type TEXT NOT NULL CHECK (payment_method_type IN ('card', 'bank_transfer', 'digital_wallet', 'crypto', 'other')),
        payment_provider TEXT NOT NULL CHECK (payment_provider IN ('stripe', 'paypal', 'apple_pay', 'google_pay', 'other')),
        description TEXT NOT NULL,
        metadata JSONB,
        error_message TEXT,
        refunded_at DATE,
        refund_amount DECIMAL(10,2)
      );
    `)

    // Create indexes for performance
    await db.execute(`
      CREATE INDEX idx_payments_external_payment_id ON public.payments(external_payment_id);
      CREATE INDEX idx_payments_external_customer_id ON public.payments(external_customer_id);
      CREATE INDEX idx_payments_status ON public.payments(status);
      CREATE INDEX idx_payments_payment_provider ON public.payments(payment_provider);
      CREATE INDEX idx_payments_amount ON public.payments(amount);
      CREATE INDEX idx_payments_created_at ON public.payments(created_at);
      CREATE INDEX idx_payments_external_subscription_id ON public.payments(external_subscription_id);
      CREATE INDEX idx_payments_external_invoice_id ON public.payments(external_invoice_id);
    `)

    // Add comments for all columns
    await db.execute(`
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
    `)

    // Add table comment
    await db.execute(`
      COMMENT ON TABLE public.payments IS 'Payment transactions for subscriptions, project views, and other platform services with provider-agnostic architecture';
    `)
  },
  down: async (db) => {
    // Drop the payments table
    await db.execute(`
      DROP TABLE IF EXISTS public.payments CASCADE;
    `)
  }
}
