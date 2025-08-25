import Stripe from 'stripe'
import { env } from '@/lib/config/env'
import { createClient } from '@/lib/supabase'
import { Payment } from '@/lib/database/schemas/payments'

export class StripeService {
  private stripe: Stripe

  constructor() {
    this.stripe = new Stripe(env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-12-18.acacia',
      typescript: true,
    })
  }

  /**
   * Create a payment intent for a specific amount
   */
  async createPaymentIntent({
    amount,
    currency = 'usd',
    customerId,
    description,
    metadata = {},
  }: {
    amount: number // Amount in cents
    currency?: string
    customerId?: string
    description: string
    metadata?: Record<string, string>
  }) {
    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount,
        currency,
        customer: customerId,
        description,
        metadata,
        automatic_payment_methods: {
          enabled: true,
        },
      })

      return paymentIntent
    } catch (error) {
      console.error('Error creating payment intent:', error)
      throw new Error('Failed to create payment intent')
    }
  }

  /**
   * Create or retrieve a Stripe customer
   */
  async createCustomer({
    email,
    name,
    userId,
  }: {
    email: string
    name?: string
    userId: string
  }) {
    try {
      const customer = await this.stripe.customers.create({
        email,
        name,
        metadata: {
          userId,
        },
      })

      return customer
    } catch (error) {
      console.error('Error creating customer:', error)
      throw new Error('Failed to create customer')
    }
  }

  /**
   * Retrieve a customer by ID
   */
  async getCustomer(customerId: string) {
    try {
      const customer = await this.stripe.customers.retrieve(customerId)
      return customer
    } catch (error) {
      console.error('Error retrieving customer:', error)
      throw new Error('Failed to retrieve customer')
    }
  }

  /**
   * Confirm a payment intent
   */
  async confirmPaymentIntent(paymentIntentId: string) {
    try {
      const paymentIntent = await this.stripe.paymentIntents.confirm(paymentIntentId)
      return paymentIntent
    } catch (error) {
      console.error('Error confirming payment intent:', error)
      throw new Error('Failed to confirm payment intent')
    }
  }

  /**
   * Retrieve a payment intent
   */
  async getPaymentIntent(paymentIntentId: string) {
    try {
      const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId)
      return paymentIntent
    } catch (error) {
      console.error('Error retrieving payment intent:', error)
      throw new Error('Failed to retrieve payment intent')
    }
  }

  /**
   * Create a refund for a payment
   */
  async createRefund({
    paymentIntentId,
    amount,
    reason,
  }: {
    paymentIntentId: string
    amount?: number // Amount in cents, if not provided, full refund
    reason?: 'duplicate' | 'fraudulent' | 'requested_by_customer'
  }) {
    try {
      const refund = await this.stripe.refunds.create({
        payment_intent: paymentIntentId,
        amount,
        reason,
      })

      return refund
    } catch (error) {
      console.error('Error creating refund:', error)
      throw new Error('Failed to create refund')
    }
  }

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(payload: string, signature: string): Stripe.Event {
    try {
      const event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        env.STRIPE_WEBHOOK_SECRET
      )
      return event
    } catch (error) {
      console.error('Error verifying webhook signature:', error)
      throw new Error('Invalid webhook signature')
    }
  }

  /**
   * Handle webhook events and update database
   */
  async handleWebhookEvent(event: Stripe.Event) {
    const supabase = createClient()

    try {
      switch (event.type) {
        case 'payment_intent.succeeded': {
          const paymentIntent = event.data.object as Stripe.PaymentIntent
          
          // Update payment record in database
          const { error } = await supabase
            .from('payments')
            .update({
              status: 'succeeded',
              updated_at: new Date().toISOString(),
            })
            .eq('external_payment_id', paymentIntent.id)

          if (error) {
            console.error('Error updating payment status:', error)
          }
          break
        }

        case 'payment_intent.payment_failed': {
          const paymentIntent = event.data.object as Stripe.PaymentIntent
          
          // Update payment record in database
          const { error } = await supabase
            .from('payments')
            .update({
              status: 'failed',
              error_message: paymentIntent.last_payment_error?.message || 'Payment failed',
              updated_at: new Date().toISOString(),
            })
            .eq('external_payment_id', paymentIntent.id)

          if (error) {
            console.error('Error updating payment status:', error)
          }
          break
        }

        case 'payment_intent.requires_action': {
          const paymentIntent = event.data.object as Stripe.PaymentIntent
          
          // Update payment record in database
          const { error } = await supabase
            .from('payments')
            .update({
              status: 'requires_action',
              updated_at: new Date().toISOString(),
            })
            .eq('external_payment_id', paymentIntent.id)

          if (error) {
            console.error('Error updating payment status:', error)
          }
          break
        }

        case 'charge.dispute.created': {
          const dispute = event.data.object as Stripe.Dispute
          console.log('Dispute created:', dispute.id)
          // Handle dispute logic here
          break
        }

        default:
          console.log(`Unhandled event type: ${event.type}`)
      }
    } catch (error) {
      console.error('Error handling webhook event:', error)
      throw error
    }
  }

  /**
   * Save payment record to database
   */
  async savePaymentRecord({
    paymentIntent,
    customerId,
    userId,
    description,
  }: {
    paymentIntent: Stripe.PaymentIntent
    customerId: string
    userId: string
    description: string
  }) {
    const supabase = createClient()

    try {
      const paymentData: Omit<Payment, 'id' | 'created_at' | 'updated_at'> = {
        amount: paymentIntent.amount,
        currency: paymentIntent.currency.toUpperCase(),
        status: paymentIntent.status as Payment['status'],
        external_payment_id: paymentIntent.id,
        external_customer_id: customerId,
        external_subscription_id: null,
        external_invoice_id: null,
        payment_method_type: 'card', // Default to card, can be updated based on payment method
        payment_provider: 'stripe',
        description,
        metadata: paymentIntent.metadata,
        error_message: null,
        refunded_at: null,
        refund_amount: null,
      }

      const { data, error } = await supabase
        .from('payments')
        .insert(paymentData)
        .select()
        .single()

      if (error) {
        console.error('Error saving payment record:', error)
        throw new Error('Failed to save payment record')
      }

      return data
    } catch (error) {
      console.error('Error saving payment record:', error)
      throw error
    }
  }
}

// Export singleton instance
export const stripeService = new StripeService()