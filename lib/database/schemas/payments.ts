import { z } from 'zod'
import { baseSchema, validationPatterns } from './base'

export const paymentSchema = z.object({
  ...baseSchema,
  
  // Core payment fields
  amount: validationPatterns.positiveNumber, // Amount in cents (standard practice)
  currency: z.string().min(3).max(3), // ISO 4217 currency code (e.g., 'usd', 'eur')
  status: z.enum(['pending', 'processing', 'succeeded', 'failed', 'cancelled', 'requires_action', 'requires_confirmation']), // Payment status
  external_payment_id: validationPatterns.nonEmptyString, // Provider's payment ID
  external_customer_id: validationPatterns.nonEmptyString, // Provider's customer ID
  external_subscription_id: validationPatterns.optionalString, // Provider's subscription ID (if applicable)
  external_invoice_id: validationPatterns.optionalString, // Provider's invoice ID (if applicable)
  payment_method_type: z.enum(['card', 'bank_transfer', 'digital_wallet', 'crypto', 'other']), // Payment method type
  payment_provider: z.enum(['stripe', 'paypal', 'apple_pay', 'google_pay', 'other']), // Payment provider
  description: validationPatterns.nonEmptyString, // Human-readable description
  metadata: z.record(z.string(), z.unknown()).optional(), // Provider-specific metadata
  error_message: validationPatterns.optionalString, // Error message for failed payments
  refunded_at: validationPatterns.optionalDate, // When payment was refunded
  refund_amount: validationPatterns.positiveNumber.optional(), // Refund amount in cents
})

export type Payment = z.infer<typeof paymentSchema>
