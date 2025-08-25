import { loadStripe, Stripe } from '@stripe/stripe-js'
import { env } from '~/lib/config/env'

// Singleton pattern to ensure we only load Stripe once
let stripePromise: Promise<Stripe | null>

/**
 * Get the Stripe instance for client-side operations
 * This function ensures Stripe is only loaded once and reused
 */
export const getStripe = (): Promise<Stripe | null> => {
  if (!stripePromise) {
    stripePromise = loadStripe(env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  }
  return stripePromise
}

/**
 * Stripe appearance configuration for consistent styling
 */
export const stripeAppearance = {
  theme: 'stripe' as const,
  variables: {
    colorPrimary: '#2563eb', // Blue-600
    colorBackground: '#ffffff',
    colorText: '#1f2937', // Gray-800
    colorDanger: '#dc2626', // Red-600
    fontFamily: 'system-ui, sans-serif',
    spacingUnit: '4px',
    borderRadius: '6px',
  },
  rules: {
    '.Input': {
      border: '1px solid #d1d5db', // Gray-300
      borderRadius: '6px',
      padding: '12px',
      fontSize: '14px',
    },
    '.Input:focus': {
      borderColor: '#2563eb', // Blue-600
      boxShadow: '0 0 0 3px rgba(37, 99, 235, 0.1)',
    },
    '.Label': {
      fontSize: '14px',
      fontWeight: '500',
      color: '#374151', // Gray-700
      marginBottom: '6px',
    },
  },
}

/**
 * Stripe Elements options
 */
export const elementsOptions = {
  appearance: stripeAppearance,
  loader: 'auto' as const,
}